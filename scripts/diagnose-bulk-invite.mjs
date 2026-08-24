// READ-ONLY diagnostic for the bulk-invite shortfall.
// Compares auth.users, public.users, organization_members and invitations.
import { createClient } from '@supabase/supabase-js'

try { process.loadEnvFile('.env.local') } catch { /* rely on ambient env */ }

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — run from the project root.')
    process.exit(1)
}

const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
})

/** Pull every row of a table, paging past PostgREST's 1000-row ceiling. */
async function fetchAll(table, columns, filter = q => q) {
    const out = []
    const PAGE = 1000
    for (let from = 0; ; from += PAGE) {
        // order() is not optional: PostgREST range paging without a stable sort
        // can repeat or skip rows between pages, which silently corrupts counts.
        const { data, error } = await filter(
            supabase.from(table).select(columns).order('id')
        ).range(from, from + PAGE - 1)
        if (error) throw new Error(`${table}: ${error.message}`)
        out.push(...data)
        if (data.length < PAGE) break
    }
    return out
}

/** Every auth account, paged. */
async function fetchAllAuthUsers() {
    const out = []
    for (let page = 1; ; page++) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
        if (error) throw new Error(`listUsers: ${error.message}`)
        out.push(...data.users)
        if (data.users.length < 1000) break
    }
    return out
}

const norm = e => (e || '').toLowerCase().trim()

async function main() {
    const orgs = await fetchAll('organizations', 'id, display_name')
    console.log('=== ORGANIZATIONS ===')

    const publicUsers = await fetchAll('users', 'id, email, display_name, organization_id, role, created_at')
    const byOrg = new Map()
    for (const u of publicUsers) {
        const k = u.organization_id ?? '(none)'
        byOrg.set(k, (byOrg.get(k) ?? 0) + 1)
    }
    for (const o of orgs) {
        console.log(`  ${o.display_name}  [${o.id}]  public.users = ${byOrg.get(o.id) ?? 0}`)
    }
    if (byOrg.has('(none)')) console.log(`  (no organization_id)  public.users = ${byOrg.get('(none)')}`)

    const authUsers = await fetchAllAuthUsers()
    console.log(`\n=== TOTALS ===`)
    console.log(`  auth.users   : ${authUsers.length}`)
    console.log(`  public.users : ${publicUsers.length}`)

    const members = await fetchAll('organization_members', 'user_id, organization_id, role')
    console.log(`  org_members  : ${members.length}`)

    const invites = await fetchAll('invitations', 'email, organization_id, status, created_at')
    const inviteByStatus = new Map()
    for (const i of invites) inviteByStatus.set(i.status, (inviteByStatus.get(i.status) ?? 0) + 1)
    console.log(`  invitations  : ${invites.length}  (${[...inviteByStatus].map(([s, n]) => `${s}=${n}`).join(', ')})`)

    // --- auth vs public drift -------------------------------------------------
    const authByEmail = new Map(authUsers.map(u => [norm(u.email), u]))
    const publicById = new Map(publicUsers.map(u => [u.id, u]))
    const publicByEmail = new Map(publicUsers.map(u => [norm(u.email), u]))

    const authOnly = authUsers.filter(a => !publicById.has(a.id))
    const publicOnly = publicUsers.filter(p => !authByEmail.has(norm(p.email)))

    console.log(`\n=== DRIFT ===`)
    console.log(`  in auth.users but NOT in public.users : ${authOnly.length}`)
    for (const a of authOnly.slice(0, 40)) {
        console.log(`      ${a.email}   created=${a.created_at}  id=${a.id}`)
    }
    if (authOnly.length > 40) console.log(`      ... and ${authOnly.length - 40} more`)

    console.log(`  in public.users but NOT in auth      : ${publicOnly.length}`)
    for (const p of publicOnly.slice(0, 40)) console.log(`      ${p.email}  id=${p.id}`)

    // members pointing at a user row that does not exist
    const memberOrphans = members.filter(m => !publicById.has(m.user_id))
    console.log(`  org_members with no public.users row : ${memberOrphans.length}`)

    // users with no org_members row
    const memberUserIds = new Set(members.map(m => m.user_id))
    const noMembership = publicUsers.filter(u => !memberUserIds.has(u.id))
    console.log(`  public.users with no org_members row : ${noMembership.length}`)
    for (const u of noMembership.slice(0, 40)) console.log(`      ${u.email}  org=${u.organization_id}`)

    // --- invitations never converted -----------------------------------------
    const inviteNoAuth = invites.filter(i => !authByEmail.has(norm(i.email)))
    console.log(`  invitations with NO auth account     : ${inviteNoAuth.length}`)
    for (const i of inviteNoAuth.slice(0, 60)) {
        console.log(`      ${i.email}  status=${i.status}  created=${i.created_at}`)
    }

    // --- duplicate / case-variant emails -------------------------------------
    const caseGroups = new Map()
    for (const u of publicUsers) {
        const k = norm(u.email)
        if (!caseGroups.has(k)) caseGroups.set(k, [])
        caseGroups.get(k).push(u)
    }
    const dupes = [...caseGroups.entries()].filter(([, v]) => v.length > 1)
    console.log(`\n=== DUPLICATES ===`)
    console.log(`  emails with >1 public.users row : ${dupes.length}`)
    for (const [email, rows] of dupes.slice(0, 40)) {
        console.log(`      ${email} -> ${rows.map(r => `${r.id}(${r.email})`).join(', ')}`)
    }

    // --- what landed today, by creation time ---------------------------------
    console.log(`\n=== AUTH ACCOUNTS BY CREATION DATE (last 10 days present) ===`)
    const byDay = new Map()
    for (const a of authUsers) {
        const d = (a.created_at || '').slice(0, 10)
        byDay.set(d, (byDay.get(d) ?? 0) + 1)
    }
    for (const [d, n] of [...byDay].sort().slice(-10)) console.log(`      ${d} : ${n}`)

    // --- safe_link_tokens ----------------------------------------------------
    const { count: tokenCount, error: tokenErr } = await supabase
        .from('safe_link_tokens')
        .select('*', { count: 'exact', head: true })
    console.log(`\n  safe_link_tokens rows : ${tokenErr ? tokenErr.message : tokenCount}`)

    // Dump the full public.users email list so it can be diffed against the CSV.
    const fs = await import('node:fs')
    const outPath = process.argv[2]
    if (outPath) {
        fs.writeFileSync(
            outPath,
            'email,display_name,organization_id,created_at\n' +
            publicUsers.map(u => [u.email, u.display_name, u.organization_id, u.created_at]
                .map(v => JSON.stringify(v ?? '')).join(',')).join('\n')
        )
        console.log(`\nWrote ${publicUsers.length} user rows to ${outPath}`)
    }
}

main().catch(e => { console.error(e); process.exit(1) })
