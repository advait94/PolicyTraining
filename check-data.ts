
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function checkData() {
    console.log('=== Database State Check ===\n')

    // 1. List all users from public.users
    console.log('--- Public Users ---')
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, display_name, role, organization_id')

    if (userError) console.error('Error:', userError)
    console.log(users)

    // 2. List all auth users (for email mapping)
    console.log('\n--- Auth Users ---')
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) console.error('Error:', authError)
    authUsers?.forEach(u => console.log(`${u.id}: ${u.email}`))

    // 3. List all user_progress
    console.log('\n--- User Progress ---')
    const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('id, user_id, module_id, is_completed, quiz_score')

    if (progressError) console.error('Error:', progressError)
    console.log(progress)

    // 4. Summary per user
    console.log('\n--- Summary ---')
    if (users && progress) {
        users.forEach(u => {
            const userProgress = progress.filter(p => p.user_id === u.id)
            const completed = userProgress.filter(p => p.is_completed).length
            const authUser = authUsers?.find(au => au.id === u.id)
            console.log(`${u.display_name || 'Unknown'} (${authUser?.email || 'no email'}): ${completed}/${userProgress.length} completed`)
        })
    }
}

checkData()
