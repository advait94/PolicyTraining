import { createServiceRoleClient } from './_supabase-admin.mjs'

const TEST_EMAIL = 'test@testuser.com'
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'qwerty1234'
const DEPT_NAME = 'CS/Legal Team'

const supabase = createServiceRoleClient()

async function main() {
    // 1. Find the AA Plus organization
    console.log('Finding AA Plus organization...')
    const { data: orgs, error: orgErr } = await supabase
        .from('organizations')
        .select('id, name, code')
        .ilike('name', '%AA Plus%')

    if (orgErr) throw new Error('Org fetch error: ' + orgErr.message)
    if (!orgs || orgs.length === 0) throw new Error('No AA Plus organization found')

    const org = orgs[0]
    console.log(`Found org: "${org.name}" (${org.id})`)

    // 2. Find or create the CS/Legal Team department
    console.log(`Finding department "${DEPT_NAME}"...`)
    const { data: existingDept } = await supabase
        .from('departments')
        .select('id, name')
        .eq('organization_id', org.id)
        .eq('name', DEPT_NAME)
        .maybeSingle()

    let deptId
    if (existingDept) {
        deptId = existingDept.id
        console.log(`Department exists: ${deptId}`)
    } else {
        const { data: newDept, error: deptErr } = await supabase
            .from('departments')
            .insert({ organization_id: org.id, name: DEPT_NAME })
            .select()
            .single()
        if (deptErr) throw new Error('Dept create error: ' + deptErr.message)
        deptId = newDept.id
        console.log(`Created department: ${deptId}`)
    }

    // 3. Check if auth user already exists
    console.log(`Checking if user ${TEST_EMAIL} already exists...`)
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users?.find(u => u.email === TEST_EMAIL)

    let authUserId
    if (existingAuthUser) {
        authUserId = existingAuthUser.id
        console.log(`Auth user already exists: ${authUserId} — updating password...`)
        const { error: pwErr } = await supabase.auth.admin.updateUserById(authUserId, {
            password: TEST_PASSWORD,
            email_confirm: true,
        })
        if (pwErr) throw new Error('Password update error: ' + pwErr.message)
        console.log('Password updated.')
    } else {
        // 4. Create auth user with password
        console.log('Creating auth user...')
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            email_confirm: true,
            user_metadata: {
                full_name: 'Test User',
                organization_id: org.id,
                role: 'learner',
            }
        })
        if (authErr) throw new Error('Auth create error: ' + authErr.message)
        authUserId = authUser.user.id
        console.log(`Auth user created: ${authUserId}`)
    }

    // 5. Upsert into public.users
    console.log('Upserting into public.users...')
    const { error: userErr } = await supabase
        .from('users')
        .upsert({
            id: authUserId,
            email: TEST_EMAIL,
            display_name: 'Test User',
            role: 'learner',
            organization_id: org.id,
            department_id: deptId,
        }, { onConflict: 'id' })
    if (userErr) throw new Error('Public user upsert error: ' + userErr.message)
    console.log('public.users upserted.')

    // 6. Upsert into organization_members
    console.log('Upserting into organization_members...')
    const { error: memberErr } = await supabase
        .from('organization_members')
        .upsert({
            user_id: authUserId,
            organization_id: org.id,
            role: 'learner',
        }, { onConflict: 'user_id,organization_id' })
    if (memberErr) throw new Error('Member upsert error: ' + memberErr.message)
    console.log('organization_members upserted.')

    console.log('\n✅ Done! Test user created:')
    console.log(`   Email:      ${TEST_EMAIL}`)
    console.log(`   Password:   ${TEST_PASSWORD}`)
    console.log(`   Org:        ${org.name}`)
    console.log(`   Department: ${DEPT_NAME}`)
    console.log(`   Role:       learner`)
}

main().catch(err => {
    console.error('❌ Error:', err.message)
    process.exit(1)
})
