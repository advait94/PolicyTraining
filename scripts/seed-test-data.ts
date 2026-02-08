import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Simple .env.local parser
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local')
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8')
            envConfig.split('\n').forEach(line => {
                const lineTrim = line.trim();
                // Skip comments and empty lines
                if (!lineTrim || lineTrim.startsWith('#')) return;

                const [key, ...values] = lineTrim.split('=')
                if (key && values.length > 0) {
                    const value = values.join('=').trim()
                    // Remove quotes if present
                    const cleanValue = value.replace(/^['"](.*)['"]$/, '$1')
                    process.env[key.trim()] = cleanValue
                }
            })
            console.log('.env.local loaded')
        } else {
            console.log('.env.local not found')
        }
    } catch (e) {
        console.error('Error loading env:', e)
    }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Debug print (masking key)
console.log(`URL: ${supabaseUrl}`)
console.log(`Key Present: ${!!serviceRoleKey}`)

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars. Make sure .env.local exists and contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
    const orgName = 'Test Organization'
    const orgCode = 'test-org' // DB column is 'code'
    const adminEmail = 'test-admin@test.com'
    const adminPassword = 'password123'
    const learnerEmail = 'test-learner@test.com'
    const learnerPassword = 'password123'

    console.log(`\n--- Creating Organization: ${orgName} ---`)

    // 1. Create Organization
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
            name: orgName,
            code: orgCode,
            display_name: 'Test Org Display',
            support_email: 'support@test.com'
        })
        .select()
        .single()

    let targetOrg = org;

    if (orgError) {
        if (orgError.code === '23505') { // Unique violation
            console.log('Organization already exists, fetching...')
            const { data: existingOrg } = await supabase.from('organizations').select().eq('code', orgCode).single()
            if (!existingOrg) throw new Error('Could not fetch existing org')
            targetOrg = existingOrg
        } else {
            throw new Error(`Failed to create org: ${orgError.message}`)
        }
    }

    console.log(`Target Organization ID: ${targetOrg.id}`)

    await createUsers(targetOrg)
}

async function createUsers(org: any) {
    console.log('\n--- Creating Users ---')
    await createUser('Test Admin', 'test-admin@test.com', 'password123', 'admin', org.id)
    await createUser('Test Learner', 'test-learner@test.com', 'password123', 'learner', org.id)
}

async function createUser(name: string, email: string, password: string, role: 'admin' | 'learner', orgId: string) {
    console.log(`\nProcessing user: ${email} (${role})...`)

    // 1. Create Auth User
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name }
    })

    let targetUserId = user?.id;

    if (authError) {
        console.log(`Auth user creation msg: ${authError.message}`)
        // If user exists, find them
        const { data: { users } } = await supabase.auth.admin.listUsers()
        // Basic filter
        const existingUser = users.find(u => u.email === email)
        if (existingUser) {
            console.log(`Found existing auth user: ${existingUser.id}`)
            targetUserId = existingUser.id
        } else {
            // If we can't find them but creation failed, that's an issue
            console.error('Could not create or find user.')
            return
        }
    }

    if (!targetUserId) {
        console.error('No target user ID available')
        return;
    }

    // 2. Upsert public.users
    // public.users requires organization_id
    console.log(`Upserting public.users for ${targetUserId}...`)
    const { error: publicError } = await supabase.from('users').upsert({
        id: targetUserId,
        organization_id: orgId,
        display_name: name,
        role: role // 'admin' or 'learner'
    })
    if (publicError) console.error(`Failed to upsert public.users: ${publicError.message}`)
    else console.log('public.users updated.')

    // 3. Upsert organization_members
    // Member role mapping: admin -> admin, learner -> member
    const memberRole = role === 'admin' ? 'admin' : 'member'

    console.log(`Upserting organization_members...`)
    const { error: memberError } = await supabase.from('organization_members').upsert({
        organization_id: orgId,
        user_id: targetUserId,
        role: memberRole
    }, { onConflict: 'organization_id, user_id' }) // Just to be safe with syntax

    if (memberError) console.error(`Failed to upsert organization_members: ${memberError.message}`)
    else console.log('organization_members updated.')
}

main().catch(console.error)
