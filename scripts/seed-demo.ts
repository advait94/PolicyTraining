import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env.local
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local')
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8')
            envConfig.split('\n').forEach(line => {
                const lineTrim = line.trim()
                if (!lineTrim || lineTrim.startsWith('#')) return
                const [key, ...values] = lineTrim.split('=')
                if (key && values.length > 0) {
                    const value = values.join('=').trim()
                    process.env[key.trim()] = value.replace(/^['"](.*)['"]$/, '$1')
                }
            })
            console.log('.env.local loaded')
        }
    } catch (e) {
        console.error('Error loading env:', e)
    }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const DEMO_ORG = {
    name: 'Demo Company',
    code: 'demo',
    display_name: 'Demo Company',
    support_email: 'admin@demo.com',
}

const DEMO_PASSWORD = 'Demo@2024!'

const DEPARTMENTS = ['Customer Service', 'HR', 'Legal', 'Finance', 'Board']

const DEMO_USERS = [
    { email: 'admin@demo.com',   name: 'Demo Admin',    role: 'admin'   as const, dept: null },
    { email: 'cs@demo.com',      name: 'CS Employee',   role: 'learner' as const, dept: 'Customer Service' },
    { email: 'hr@demo.com',      name: 'HR Employee',   role: 'learner' as const, dept: 'HR' },
    { email: 'legal@demo.com',   name: 'Legal Counsel', role: 'learner' as const, dept: 'Legal' },
    { email: 'board@demo.com',   name: 'Board Member',  role: 'learner' as const, dept: 'Board' },
    { email: 'finance@demo.com', name: 'Finance Lead',  role: 'learner' as const, dept: 'Finance' },
]

async function getOrCreateOrg() {
    const { data: existing } = await supabase
        .from('organizations')
        .select()
        .eq('code', DEMO_ORG.code)
        .single()

    if (existing) {
        console.log(`Organization already exists: ${existing.id}`)
        return existing
    }

    const { data, error } = await supabase
        .from('organizations')
        .insert(DEMO_ORG)
        .select()
        .single()

    if (error) throw new Error(`Failed to create org: ${error.message}`)
    console.log(`Created organization: ${data.id}`)
    return data
}

async function getOrCreateDepartments(orgId: string): Promise<Record<string, string>> {
    const deptMap: Record<string, string> = {}

    for (const name of DEPARTMENTS) {
        const { data: existing } = await supabase
            .from('departments')
            .select('id, name')
            .eq('organization_id', orgId)
            .eq('name', name)
            .single()

        if (existing) {
            deptMap[name] = existing.id
            console.log(`  Dept exists: ${name} → ${existing.id}`)
            continue
        }

        const { data, error } = await supabase
            .from('departments')
            .insert({ organization_id: orgId, name })
            .select('id')
            .single()

        if (error) {
            console.error(`  Failed to create dept "${name}": ${error.message}`)
        } else {
            deptMap[name] = data.id
            console.log(`  Created dept: ${name} → ${data.id}`)
        }
    }

    return deptMap
}

async function getOrCreateAuthUser(email: string, name: string) {
    const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const existing = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existing) {
        console.log(`  Auth user exists: ${email} (${existing.id})`)
        return existing
    }

    const { data: { user }, error } = await supabase.auth.admin.createUser({
        email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: name }
    })

    if (error) throw new Error(`Failed to create auth user ${email}: ${error.message}`)
    console.log(`  Created auth user: ${email} (${user!.id})`)
    return user!
}

async function seedUser(
    user: typeof DEMO_USERS[number],
    orgId: string,
    deptMap: Record<string, string>
) {
    console.log(`\nProcessing: ${user.email} (${user.role})`)

    const authUser = await getOrCreateAuthUser(user.email, user.name)
    const userId = authUser.id
    const deptId = user.dept ? deptMap[user.dept] : null

    const { error: publicError } = await supabase.from('users').upsert({
        id: userId,
        organization_id: orgId,
        display_name: user.name,
        role: user.role,
        ...(deptId ? { department_id: deptId } : {})
    })
    if (publicError) console.error(`  public.users upsert failed: ${publicError.message}`)
    else console.log(`  public.users: ok`)

    const memberRole = user.role === 'admin' ? 'admin' : 'member'
    const { error: memberError } = await supabase.from('organization_members').upsert({
        organization_id: orgId,
        user_id: userId,
        role: memberRole
    }, { onConflict: 'organization_id,user_id' })
    if (memberError) console.error(`  organization_members upsert failed: ${memberError.message}`)
    else console.log(`  organization_members: ok (role: ${memberRole})`)
}

async function main() {
    console.log('=== Demo Org Seed ===\n')

    const org = await getOrCreateOrg()

    console.log('\n--- Departments ---')
    const deptMap = await getOrCreateDepartments(org.id)

    console.log('\n--- Users ---')
    for (const user of DEMO_USERS) {
        await seedUser(user, org.id, deptMap)
    }

    console.log('\n=== Done ===')
    console.log('\nDemo credentials (password for all): ' + DEMO_PASSWORD)
    console.log('  admin@demo.com   — Org Admin')
    console.log('  cs@demo.com      — Customer Service (learner)')
    console.log('  hr@demo.com      — HR (learner)')
    console.log('  legal@demo.com   — Legal (learner)')
    console.log('  board@demo.com   — Board (learner)')
    console.log('  finance@demo.com — Finance (learner)')
}

main().catch(console.error)
