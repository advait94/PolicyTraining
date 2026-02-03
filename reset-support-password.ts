
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function resetPassword() {
    const userId = '5b8f9a1b-7083-4de4-a953-152b6025a25b' // support@aaplusconsultants.com
    const newPassword = 'password123'

    console.log(`Resetting password for User ID: ${userId}...`)

    const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
    )

    if (error) {
        console.error('Error resetting password:', error)
    } else {
        console.log('Password reset successfully for:', data.user.email)
        console.log('New Password:', newPassword)
    }
}

resetPassword()
