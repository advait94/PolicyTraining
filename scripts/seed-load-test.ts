/**
 * Load test seed: creates a 500-member "Load Test Corp" org with realistic
 * progress data spread across modules and departments, then benchmarks the
 * three most expensive server actions before and after the optimizations.
 *
 * Run with:
 *   npx tsx scripts/seed-load-test.ts
 *
 * Flags:
 *   --skip-seed   Skip user creation (re-use existing load-test org)
 *   --bench-only  Only run benchmarks, no seeding
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) return
    fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
        const t = line.trim()
        if (!t || t.startsWith('#')) return
        const [key, ...vals] = t.split('=')
        if (key && vals.length > 0)
            process.env[key.trim()] = vals.join('=').trim().replace(/^['"](.*)['"]$/, '$1')
    })
}
loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY)

const LOAD_ORG_CODE  = 'load-test-corp'
const LOAD_ORG_NAME  = 'Load Test Corp'
const TOTAL_USERS    = 500
const DEPARTMENTS    = ['Engineering', 'Sales', 'HR', 'Finance', 'Legal', 'Operations', 'Marketing', 'Board']
const PASS_THRESHOLD = 80
const DEMO_PASSWORD  = 'LoadTest@2024!'

const args = process.argv.slice(2)
const skipSeed  = args.includes('--skip-seed')
const benchOnly = args.includes('--bench-only')

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

async function time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const ms = (performance.now() - start).toFixed(0)
    console.log(`  ⏱  ${label}: ${ms} ms`)
    return result
}

// ─── Org setup ───────────────────────────────────────────────────────────────

async function getOrCreateOrg() {
    const { data: existing } = await supabase
        .from('organizations')
        .select()
        .eq('code', LOAD_ORG_CODE)
        .single()
    if (existing) { console.log(`Org exists: ${existing.id}`); return existing }

    const { data, error } = await supabase
        .from('organizations')
        .insert({ code: LOAD_ORG_CODE, name: LOAD_ORG_NAME, display_name: LOAD_ORG_NAME, support_email: 'admin@loadtest.com', plan_tier: 'enterprise' })
        .select()
        .single()
    if (error) throw new Error(`Org create: ${error.message}`)
    console.log(`Created org: ${data.id}`)
    return data
}

async function getOrCreateDepts(orgId: string) {
    const map: Record<string, string> = {}
    for (const name of DEPARTMENTS) {
        const { data: existing } = await supabase.from('departments').select('id').eq('organization_id', orgId).eq('name', name).single()
        if (existing) { map[name] = existing.id; continue }
        const { data } = await supabase.from('departments').insert({ organization_id: orgId, name }).select('id').single()
        if (data) map[name] = data.id
    }
    return map
}

async function getAllModuleIds() {
    const { data } = await supabase.from('modules').select('id').order('sequence_order')
    return (data || []).map((m: any) => m.id as string)
}

// ─── User seeding ─────────────────────────────────────────────────────────────

async function ensureAuthUsersExist(emails: string[], names: string[]) {
    console.log('  Fetching existing auth users...')
    const existingMap = new Map<string, string>() // email → id
    let page = 1
    while (true) {
        const { data: { users } } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
        if (!users || users.length === 0) break
        users.forEach(u => { if (u.email) existingMap.set(u.email.toLowerCase(), u.id) })
        if (users.length < 1000) break
        page++
    }

    const toCreate = emails.filter(e => !existingMap.has(e.toLowerCase()))
    console.log(`  ${existingMap.size} existing, ${toCreate.length} to create`)

    // Create in batches of 50 to avoid rate limits
    const BATCH = 50
    for (let i = 0; i < toCreate.length; i += BATCH) {
        const batch = toCreate.slice(i, i + BATCH)
        await Promise.all(batch.map(async (email, j) => {
            const name = names[emails.indexOf(email)]
            const { data: { user }, error } = await supabase.auth.admin.createUser({
                email, password: DEMO_PASSWORD, email_confirm: true,
                user_metadata: { full_name: name }
            })
            if (error) console.error(`    Create ${email}: ${error.message}`)
            else existingMap.set(email.toLowerCase(), user!.id)
        }))
        process.stdout.write(`    Created batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(toCreate.length / BATCH)}\r`)
    }
    console.log()
    return existingMap
}

async function upsertPublicUsers(users: { id: string, email: string, name: string, role: string, orgId: string, deptId: string | null }[]) {
    const BATCH = 100
    for (let i = 0; i < users.length; i += BATCH) {
        const batch = users.slice(i, i + BATCH).map(u => ({
            id: u.id, organization_id: u.orgId, display_name: u.name,
            email: u.email, role: u.role,
            ...(u.deptId ? { department_id: u.deptId } : {})
        }))
        const { error } = await supabase.from('users').upsert(batch, { onConflict: 'id' })
        if (error) console.error(`  public.users batch ${i / BATCH + 1} error: ${error.message}`)
    }
    console.log(`  Upserted ${users.length} public.users`)
}

async function upsertMembers(orgId: string, userIds: string[], roles: string[]) {
    const BATCH = 100
    const rows = userIds.map((uid, i) => ({ organization_id: orgId, user_id: uid, role: roles[i] }))
    for (let i = 0; i < rows.length; i += BATCH) {
        const { error } = await supabase.from('organization_members')
            .upsert(rows.slice(i, i + BATCH), { onConflict: 'organization_id,user_id' })
        if (error) console.error(`  members batch error: ${error.message}`)
    }
    console.log(`  Upserted ${rows.length} organization_members`)
}

async function assignModulesToOrg(orgId: string, moduleIds: string[]) {
    const rows = moduleIds.map(mid => ({ organization_id: orgId, module_id: mid, all_employees: true }))
    const { error } = await supabase.from('organization_modules')
        .upsert(rows, { onConflict: 'organization_id,module_id', ignoreDuplicates: true })
    if (error) console.error(`  org_modules error: ${error.message}`)
    else console.log(`  Assigned ${moduleIds.length} modules to org`)
}

async function seedProgress(orgId: string, userIds: string[], moduleIds: string[]) {
    console.log('  Seeding progress records (realistic distribution)...')
    const rows: any[] = []

    const completionChance = 0.65  // 65% complete a given module on average
    const passChance = 0.75        // 75% of completions pass (score ≥ 80)

    userIds.forEach(uid => {
        moduleIds.forEach(mid => {
            if (Math.random() > completionChance) return   // user hasn't attempted this module
            const attempts = randomInt(1, 3)
            const passed   = Math.random() < passChance
            const score    = passed ? randomInt(80, 100) : randomInt(40, 79)
            const daysAgo  = randomInt(0, 365)
            const completedAt = new Date(Date.now() - daysAgo * 86400000).toISOString()

            rows.push({
                user_id: uid, module_id: mid,
                quiz_score: score, is_completed: passed,
                completed_at: passed ? completedAt : null,
                attempts,
                certificate_id: passed ? crypto.randomUUID() : null,
            })
        })
    })

    console.log(`  Inserting ${rows.length} progress rows...`)
    const BATCH = 500
    for (let i = 0; i < rows.length; i += BATCH) {
        const { error } = await supabase.from('user_progress')
            .upsert(rows.slice(i, i + BATCH), { onConflict: 'user_id,module_id', ignoreDuplicates: true })
        if (error) console.error(`  progress batch ${Math.floor(i / BATCH) + 1} error: ${error.message}`)
        process.stdout.write(`    ${Math.min(i + BATCH, rows.length)}/${rows.length}\r`)
    }
    console.log()
}

// ─── Benchmarks ───────────────────────────────────────────────────────────────

async function benchmarkCompanyUsers(orgId: string) {
    console.log('\n── getCompanyUsers equivalent ──')
    const { data: members } = await supabase
        .from('organization_members').select('user_id, role').eq('organization_id', orgId)
    const { data: profiles } = await supabase
        .from('users').select('id, display_name, email, role, department_id').eq('organization_id', orgId)

    // OLD: no org filter (scans all rows, then JS filter)
    await time('user_progress query OLD (no org filter)', async () => {
        const { data } = await supabase
            .from('user_progress').select('user_id, is_completed').eq('is_completed', true)
        return data
    })

    // NEW: filtered via users!inner join
    await time('user_progress query NEW (org-scoped join)', async () => {
        const { data } = await supabase
            .from('user_progress')
            .select('user_id, is_completed, users!inner(organization_id)')
            .eq('is_completed', true)
            .eq('users.organization_id', orgId)
        return data
    })

    console.log(`  Member count: ${members?.length}, Profile count: ${profiles?.length}`)
}

async function benchmarkAdminStats(orgId: string) {
    console.log('\n── getAdminStats equivalent ──')

    await time('organization_members count', async () => {
        return supabase.from('organization_members')
            .select('*', { count: 'exact', head: true }).eq('organization_id', orgId)
    })

    await time('user_progress with modules join (org-filtered)', async () => {
        return supabase.from('user_progress')
            .select('module_id, modules(title), users!inner(organization_id)')
            .eq('is_completed', true)
            .eq('users.organization_id', orgId)
    })

    await time('expired certs query', async () => {
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        return supabase.from('user_progress')
            .select('users!inner(display_name, email, organization_id), completed_at, modules(title)')
            .eq('users.organization_id', orgId)
            .eq('is_completed', true)
            .lt('completed_at', oneYearAgo)
    })
}

async function benchmarkReportData(orgId: string) {
    console.log('\n── getReportChartData parallel fetches ──')

    await time('5 parallel report queries', async () => {
        return Promise.all([
            supabase.from('users').select('id, display_name, email, department_id, departments(name)').eq('organization_id', orgId),
            supabase.from('user_progress').select('user_id, module_id, is_completed, quiz_score, completed_at, attempts, modules(title), users!inner(organization_id)').eq('users.organization_id', orgId),
            supabase.from('organization_modules').select('module_id, modules(title, sequence_order)').eq('organization_id', orgId),
            supabase.from('departments').select('id, name').eq('organization_id', orgId),
            supabase.from('organization_module_deadlines').select('module_id, due_date').eq('organization_id', orgId),
        ])
    })
}

async function benchmarkProgressLookup(orgId: string) {
    console.log('\n── Employee matrix lookup: O(n²) find vs O(1) Map ──')

    const [{ data: members }, { data: progress }, { data: mods }] = await Promise.all([
        supabase.from('users').select('id').eq('organization_id', orgId),
        supabase.from('user_progress').select('user_id, module_id, is_completed, quiz_score').eq('users.organization_id', orgId).select('user_id, module_id, is_completed, quiz_score, users!inner(organization_id)').eq('users.organization_id', orgId),
        supabase.from('organization_modules').select('module_id').eq('organization_id', orgId),
    ])

    if (!members || !progress || !mods) { console.log('  No data to benchmark'); return }

    const ms = members as any[], pr = progress as any[], ml = mods as any[]

    await time(`O(n²) progress.find() — ${ms.length} users × ${ml.length} modules`, async () => {
        ms.forEach(m => {
            ml.forEach(mod => {
                pr.find((p: any) => p.user_id === m.id && p.module_id === mod.module_id)
            })
        })
    })

    await time(`O(1) Map lookup — same data`, async () => {
        const lookup = new Map<string, any>()
        pr.forEach((p: any) => lookup.set(`${p.user_id}:${p.module_id}`, p))
        ms.forEach(m => {
            ml.forEach(mod => {
                lookup.get(`${m.id}:${mod.module_id}`)
            })
        })
    })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('=== Load Test Seed + Benchmark ===\n')

    const org = await getOrCreateOrg()
    const orgId = org.id

    if (!skipSeed && !benchOnly) {
        console.log('\n── Seeding 500 users ──')
        const deptMap = await getOrCreateDepts(orgId)
        const moduleIds = await getAllModuleIds()

        const emails: string[] = [{ email: `loadadmin@loadtest.com`, name: 'Load Admin', role: 'admin', dept: null } as any]
            .concat(Array.from({ length: TOTAL_USERS - 1 }, (_, i) => ({
                email: `user${i + 1}@loadtest.com`,
                name: `Test User ${i + 1}`,
                role: 'learner',
                dept: DEPARTMENTS[i % DEPARTMENTS.length],
            }))).map((u: any) => u.email)

        const specs = [{ email: 'loadadmin@loadtest.com', name: 'Load Admin', role: 'admin', dept: null as string | null }]
            .concat(Array.from({ length: TOTAL_USERS - 1 }, (_, i) => ({
                email: `user${i + 1}@loadtest.com`,
                name: `Test User ${i + 1}`,
                role: 'learner',
                dept: DEPARTMENTS[i % DEPARTMENTS.length],
            })))

        const names = specs.map(s => s.name)
        const authMap = await ensureAuthUsersExist(emails, names)

        const publicUsers = specs.map(s => ({
            id: authMap.get(s.email.toLowerCase())!,
            email: s.email,
            name: s.name,
            role: s.role,
            orgId,
            deptId: s.dept ? (deptMap[s.dept] || null) : null,
        })).filter(u => u.id)

        await upsertPublicUsers(publicUsers)
        await upsertMembers(orgId, publicUsers.map(u => u.id), publicUsers.map(u => u.role === 'admin' ? 'admin' : 'member'))
        await assignModulesToOrg(orgId, moduleIds)
        await seedProgress(orgId, publicUsers.map(u => u.id), moduleIds)
        console.log('\nSeeding complete.')
    }

    // ── Benchmarks ────────────────────────────────────────────────────────────
    console.log('\n=== Benchmarks against load-test org ===')
    console.log(`Org ID: ${orgId}\n`)

    await benchmarkCompanyUsers(orgId)
    await benchmarkAdminStats(orgId)
    await benchmarkReportData(orgId)
    await benchmarkProgressLookup(orgId)

    console.log('\n=== Done ===')
    console.log('\nTo log in as the load test admin:')
    console.log('  Email:    loadadmin@loadtest.com')
    console.log('  Password: ' + DEMO_PASSWORD)
}

main().catch(err => { console.error(err); process.exit(1) })
