/**
 * One-off repair for quiz scores above 100% in the audit trail.
 *
 * Until the double-counting fix, QuizPlayer kept a running score counter that
 * "Previous" never rolled back, so re-answering a question you had already got
 * right added another point. Totals could exceed the number of questions, which
 * is why the admin audit trail showed completions at 110%, 120% and 130%.
 *
 * user_progress was already protected — saveModuleProgress clamps to 100 before
 * writing — so certificates and stored scores were never inflated. Only the
 * activity_log metadata carries the raw number.
 *
 * WHAT THIS DOES NOT DO: recover the real score. Nothing in the schema stores
 * per-question responses, so a 130% row cannot be resolved back to "8 of 10" or
 * "10 of 10". The score is therefore clamped to 100 and the original is kept in
 * `score_original`, with `correction` marking the row as repaired. Deleting the
 * original would leave a compliance record that quietly disagrees with what the
 * system actually recorded at the time.
 *
 * Because the true score is unknown, every affected attempt should be treated as
 * unverified — see the summary this prints at the end.
 *
 * Usage:
 *   node scripts/fix-inflated-quiz-scores.mjs           # dry run, writes nothing
 *   node scripts/fix-inflated-quiz-scores.mjs --apply   # perform the update
 *
 * Safe to re-run: rows already carrying `score_original` are skipped.
 */
import { createServiceRoleClient } from './_supabase-admin.mjs'

const APPLY = process.argv.includes('--apply')
const CORRECTION_TAG = 'quiz-score-double-counting'

const supabase = createServiceRoleClient()

const { data: rows, error } = await supabase
    .from('activity_log')
    .select('id, user_id, module_id, metadata, created_at')
    .eq('event_type', 'quiz_completed')
    .order('created_at', { ascending: true })

if (error) {
    console.error('Could not read activity_log:', error.message)
    process.exit(1)
}

const inflated = (rows ?? []).filter(r => Number(r.metadata?.score) > 100)
const alreadyFixed = inflated.filter(r => r.metadata?.score_original != null)
const todo = inflated.filter(r => r.metadata?.score_original == null)

console.log(`quiz_completed rows scanned : ${rows?.length ?? 0}`)
console.log(`inflated (> 100)            : ${inflated.length}`)
console.log(`already corrected           : ${alreadyFixed.length}`)
console.log(`to correct                  : ${todo.length}\n`)

if (todo.length === 0) {
    console.log('Nothing to do.')
    process.exit(0)
}

// Names for the report only; the update itself is keyed by activity_log id.
const userIds = [...new Set(todo.map(r => r.user_id))]
const moduleIds = [...new Set(todo.map(r => r.module_id))]
const { data: users } = await supabase.from('users').select('id, display_name, email').in('id', userIds)
const { data: mods } = await supabase.from('modules').select('id, title').in('id', moduleIds)
const uMap = new Map((users ?? []).map(u => [u.id, u]))
const mMap = new Map((mods ?? []).map(m => [m.id, m.title]))

console.log(APPLY ? 'Applying corrections:\n' : 'DRY RUN — no writes. Re-run with --apply to commit.\n')

let updated = 0
let failed = 0

for (const row of todo) {
    const raw = Number(row.metadata.score)
    const user = uMap.get(row.user_id)
    const label = `${user?.display_name ?? row.user_id} (${user?.email ?? '—'}) · ${mMap.get(row.module_id) ?? row.module_id}`

    const metadata = {
        ...row.metadata,
        score: 100,
        score_original: raw,
        correction: CORRECTION_TAG,
        corrected_at: new Date().toISOString(),
    }

    if (!APPLY) {
        console.log(`  would fix  ${raw}% -> 100%  ${label}`)
        continue
    }

    const { error: upErr } = await supabase
        .from('activity_log')
        .update({ metadata })
        .eq('id', row.id)

    if (upErr) {
        console.error(`  FAILED     ${raw}%  ${label}: ${upErr.message}`)
        failed++
    } else {
        console.log(`  fixed      ${raw}% -> 100%  ${label}`)
        updated++
    }
}

if (APPLY) {
    console.log(`\nUpdated ${updated} row(s), ${failed} failure(s).`)
}

// The people whose real score is now unknowable, for the compliance follow-up.
const pairs = new Map()
for (const r of inflated) {
    const u = uMap.get(r.user_id)
    pairs.set(`${r.user_id}|${r.module_id}`, {
        name: u?.display_name ?? r.user_id,
        email: u?.email ?? '—',
        module: mMap.get(r.module_id) ?? r.module_id,
        raw: r.metadata?.score_original ?? r.metadata?.score,
    })
}

console.log(`\nAttempts with an unrecoverable true score (${pairs.size}):`)
for (const p of pairs.values()) {
    console.log(`  ${p.raw}%  ${p.name} <${p.email}>  — ${p.module}`)
}
console.log(
    '\nThese people passed on an inflated total. Their real score cannot be\n' +
    'reconstructed, so if the certificates need to be defensible, they should retake.\n' +
    'scripts/reset-user-progress.mjs can clear a specific user/module attempt.'
)
