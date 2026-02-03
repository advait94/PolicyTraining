
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function debugProgress() {
    console.log('--- Recent Progress Entries ---')
    // Get last 10 progress entries with user details
    const { data: progress, error } = await supabase
        .from('user_progress')
        .select(`
            id,
            user_id,
            module_id,
            is_completed,
            quiz_score,
            completed_at,
            users ( display_name, email, role )
        `)
        .order('completed_at', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Error fetching progress:', error)
        return
    }

    if (!progress || progress.length === 0) {
        console.log('No progress records found.')
        return
    }

    progress.forEach((p: any) => {
        const user = p.users || { display_name: 'Unknown', email: 'Unknown' }
        console.log(`[${new Date(p.completed_at).toLocaleString()}] User: ${user.email} (${user.display_name}) - Module: ${p.module_id} - Score: ${p.quiz_score} - Completed: ${p.is_completed}`)
    })
}

debugProgress()
