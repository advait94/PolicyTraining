
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function checkProgressCounts() {
    console.log('--- User Progress Summary ---')

    // Direct query to check progress counts per user
    const { data, error } = await supabase.rpc('get_user_progress_counts')

    if (error) {
        console.log('RPC not available, using direct query...')

        // Fallback: manual join
        const { data: users } = await supabase
            .from('users')
            .select('id, display_name')

        const { data: progress } = await supabase
            .from('user_progress')
            .select('user_id, is_completed, module_id')

        console.log('Total progress records:', progress?.length || 0)

        if (users && progress) {
            users.forEach(u => {
                const userProgress = progress.filter(p => p.user_id === u.id)
                const completed = userProgress.filter(p => p.is_completed).length
                console.log(`${u.display_name || u.id}: ${userProgress.length} records, ${completed} completed`)
            })
        }
        return
    }

    console.log(data)
}

checkProgressCounts()
