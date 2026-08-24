/**
 * Diffs a bulk-upload file against what actually landed in the database.
 *
 * Usage:
 *   node scripts/reconcile-bulk-upload.mjs <file.csv|file.xlsx> <organization_id>
 *
 * Reports, for every row in the file:
 *   - present   : in the org, visible to the admin
 *   - stranded  : account exists but no organization (run repair-homeless-invites)
 *   - other org : the account sits in a different organization
 *   - MISSING   : no account at all — never created
 * plus the rows the parser would drop (missing name/email, duplicate address).
 *
 * Read-only.
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

try { process.loadEnvFile('.env.local') } catch { }

const [file, orgId] = process.argv.slice(2)
if (!file || !orgId) {
    console.error('Usage: node scripts/reconcile-bulk-upload.mjs <file.csv|file.xlsx> <organization_id>')
    process.exit(1)
}

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

const norm = e => (e || '').toString().toLowerCase().trim()

async function fetchAll(table, columns) {
    const out = []
    const PAGE = 1000
    for (let from = 0; ; from += PAGE) {
        // order() is required: range paging without a stable sort can repeat or
        // skip rows between pages, which is how a reconciliation quietly lies.
        const { data, error } = await supabase.from(table).select(columns).order('id').range(from, from + PAGE - 1)
        if (error) throw new Error(`${table}: ${error.message}`)
        out.push(...data)
        if (data.length < PAGE) break
    }
    return out
}

async function main() {
    // The ESM build of xlsx ships without its fs binding, so readFile() is absent.
    const wb = XLSX.read(readFileSync(file), { type: 'buffer' })
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])

    const parsed = []
    const incomplete = []
    const duplicates = []
    const seen = new Set()

    rows.forEach((raw, i) => {
        const r = {}
        Object.keys(raw).forEach(k => { r[k.toLowerCase().trim()] = raw[k] })

        const email = norm(r.email ?? r['email address'])
        const name = (r.name ?? r.fullname ?? r['full name'] ?? '').toString().trim()
        const line = i + 2

        if (!email || !name) { incomplete.push({ line, email, name }); return }
        if (seen.has(email)) { duplicates.push({ line, email }); return }
        seen.add(email)
        parsed.push({ line, email, name })
    })

    console.log(`File rows            : ${rows.length}`)
    console.log(`  unique invitable   : ${parsed.length}`)
    console.log(`  missing name/email : ${incomplete.length}`)
    console.log(`  duplicate address  : ${duplicates.length}`)

    const users = await fetchAll('users', 'id, email, display_name, organization_id')
    const byEmail = new Map(users.map(u => [norm(u.email), u]))

    const buckets = { present: [], stranded: [], otherOrg: [], missing: [] }
    for (const row of parsed) {
        const u = byEmail.get(row.email)
        if (!u) buckets.missing.push(row)
        else if (u.organization_id === orgId) buckets.present.push(row)
        else if (!u.organization_id) buckets.stranded.push(row)
        else buckets.otherOrg.push({ ...row, org: u.organization_id })
    }

    console.log(`\nIn the org (visible) : ${buckets.present.length}`)
    console.log(`Stranded, no org     : ${buckets.stranded.length}`)
    console.log(`In a different org   : ${buckets.otherOrg.length}`)
    console.log(`No account at all    : ${buckets.missing.length}`)

    const dump = (label, list, fmt = r => `${r.email}  (${r.name})`) => {
        if (list.length === 0) return
        console.log(`\n--- ${label} ---`)
        for (const r of list) console.log(`  line ${r.line}: ${fmt(r)}`)
    }

    dump('NO ACCOUNT — these people were never created', buckets.missing)
    dump('STRANDED — account exists but not in the org', buckets.stranded)
    dump('IN A DIFFERENT ORGANIZATION', buckets.otherOrg, r => `${r.email}  (${r.name})  org=${r.org}`)
    dump('SKIPPED BY THE PARSER — missing name or email', incomplete, r => `email="${r.email}" name="${r.name}"`)
    dump('DUPLICATE ADDRESS IN FILE', duplicates, r => r.email)
}

main().catch(e => { console.error(e); process.exit(1) })
