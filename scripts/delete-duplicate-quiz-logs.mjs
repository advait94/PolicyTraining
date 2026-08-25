/**
 * One-off cleanup for duplicated quiz_completed rows in the audit trail.
 *
 * Until the double-counting fix, finishing a quiz wrote the completion twice:
 * once from the browser (raw score) and once from saveModuleProgress (sanitized
 * score). Both rows describe the same attempt, so completion counts in the audit
 * view and the .xlsx export were doubled for every quiz taken before
 * 2026-08-24 13:05 UTC, when the last stale session drained.
 *
 * PAIRING. Rows are grouped by user + module and split on elapsed time. The data
 * separates cleanly: 157 consecutive pairs land within 7.7 seconds of each other,
 * and the next gap is 128 seconds — a person genuinely retaking the quiz. The
 * 60-second window sits in that empty space, comfortably clear of both. Grouping
 * by timestamp-to-the-second (the first thing one reaches for) silently misses
 * pairs that straddle a second boundary, of which there are six here.
 *
 * WHICH ROW SURVIVES. A row carrying `correction` metadata wins, because that is
 * the one recording that the attempt was originally logged above 100% — deleting
 * it would erase the evidence the repair deliberately preserved. Otherwise the
 * later row survives: that is the server-written one, produced by the code path
 * that still exists today, so the retained history matches what new rows look
 * like.
 *
 * This deletes audit records and cannot be undone, so every row removed is first
 * written to backups/ as JSON. Restoring is a plain insert of that file.
 *
 * Usage:
 *   node scripts/delete-duplicate-quiz-logs.mjs           # dry run, writes nothing
 *   node scripts/delete-duplicate-quiz-logs.mjs --apply   # back up, then delete
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { createServiceRoleClient } from './_supabase-admin.mjs'

const APPLY = process.argv.includes('--apply')
const WINDOW_MS = 60_000

const supabase = createServiceRoleClient()

const { data: logs, error } = await supabase
    .from('activity_log')
    .select('id, user_id, module_id, slide_id, event_type, metadata, created_at')
    .eq('event_type', 'quiz_completed')
    .order('created_at', { ascending: true })

if (error) {
    console.error('Could not read activity_log:', error.message)
    process.exit(1)
}

// Group by user + module, then cluster consecutive rows inside the window.
const byPair = new Map()
for (const row of logs ?? []) {
    const key = `${row.user_id}|${row.module_id}`
    if (!byPair.has(key)) byPair.set(key, [])
    byPair.get(key).push(row)
}

const clusters = []
for (const rows of byPair.values()) {
    rows.sort((a, b) => a.created_at.localeCompare(b.created_at))
    let current = [rows[0]]
    for (let i = 1; i < rows.length; i++) {
        const gap = new Date(rows[i].created_at) - new Date(rows[i - 1].created_at)
        if (gap <= WINDOW_MS) {
            current.push(rows[i])
        } else {
            clusters.push(current)
            current = [rows[i]]
        }
    }
    clusters.push(current)
}

const duplicated = clusters.filter(c => c.length > 1)

// Keeper: a corrected row first, then the latest.
const rank = (a, b) => {
    const aFixed = a.metadata?.correction != null ? 1 : 0
    const bFixed = b.metadata?.correction != null ? 1 : 0
    if (aFixed !== bFixed) return bFixed - aFixed
    return b.created_at.localeCompare(a.created_at)
}

const doomed = []
for (const cluster of duplicated) {
    const [, ...rest] = [...cluster].sort(rank)
    doomed.push(...rest)
}

console.log(`quiz_completed rows          : ${logs?.length ?? 0}`)
console.log(`attempts with duplicate rows : ${duplicated.length}`)
console.log(`rows to delete               : ${doomed.length}`)
console.log(`rows remaining afterwards    : ${(logs?.length ?? 0) - doomed.length}\n`)

if (doomed.length === 0) {
    console.log('Nothing to do.')
    process.exit(0)
}

// Anything unexpected in a cluster is worth seeing before it is destroyed.
const odd = duplicated.filter(c => c.length > 2)
if (odd.length) {
    console.log(`NOTE: ${odd.length} attempt(s) have more than 2 rows:`)
    for (const c of odd.slice(0, 10)) {
        console.log(`  ${c.length} rows, scores ${c.map(r => r.metadata?.score).join('/')}, ${c[0].created_at}`)
    }
    console.log()
}

const mixed = duplicated.filter(c => new Set(c.map(r => Number(r.metadata?.score))).size > 1)
if (mixed.length) {
    console.log(`NOTE: ${mixed.length} attempt(s) have differing scores within the pair:`)
    for (const c of mixed.slice(0, 10)) {
        console.log(`  scores ${c.map(r => r.metadata?.score).join('/')}, ${c[0].created_at}`)
    }
    console.log()
}

if (!APPLY) {
    console.log('DRY RUN — nothing written. Re-run with --apply to delete.')
    console.log('\nFirst 10 rows that would be deleted:')
    for (const r of doomed.slice(0, 10)) {
        console.log(`  ${r.created_at}  score=${r.metadata?.score}  id=${r.id}`)
    }
    process.exit(0)
}

// Back up before destroying. The kept row of each cluster goes in too, so the
// file records what the pair looked like, not just the half that was removed.
mkdirSync('backups', { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupPath = `backups/activity_log_duplicates_${stamp}.json`
writeFileSync(backupPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    window_ms: WINDOW_MS,
    note: 'Duplicate quiz_completed rows removed after the client/server double-write fix. deleted[] were removed; kept[] survived.',
    deleted: doomed,
    kept: duplicated.map(c => [...c].sort(rank)[0]),
}, null, 2))
console.log(`Backed up ${doomed.length} row(s) to ${backupPath}\n`)

let removed = 0
let failed = 0
for (let i = 0; i < doomed.length; i += 50) {
    const batch = doomed.slice(i, i + 50)
    const { error: delErr } = await supabase
        .from('activity_log')
        .delete()
        .in('id', batch.map(r => r.id))

    if (delErr) {
        console.error(`  batch ${i / 50 + 1} FAILED: ${delErr.message}`)
        failed += batch.length
    } else {
        removed += batch.length
        console.log(`  deleted ${removed}/${doomed.length}`)
    }
}

console.log(`\nDeleted ${removed} row(s), ${failed} failure(s).`)
console.log(`Backup retained at ${backupPath}`)
