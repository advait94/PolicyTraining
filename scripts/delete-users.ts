
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const usersToDelete = [
    'gautam.advait@ishantechnologies.com',
    'sharma.praveen@ishantechnologies.com'
]

async function deleteUsers() {
    console.log('Starting cleanup process...')

    // 1. Fetch all auth users to find IDs
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error fetching users:', error)
        return
    }

    for (const email of usersToDelete) {
        console.log(`\nProcessing ${email}...`)

        // Find auth user
        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (user) {
            console.log(`Found Auth User ID: ${user.id}`)

            // 2. Delete from dependent tables (Public Schema)

            // Organization Members
            const { error: memberError } = await supabase
                .from('organization_members')
                .delete()
                .eq('user_id', user.id)

            if (memberError) console.error(`Error deleting org members for ${email}:`, memberError.message)
            else console.log(`Deleted organization_members`)

            // User Progress
            const { error: progressError } = await supabase
                .from('user_progress')
                .delete()
                .eq('user_id', user.id)

            if (progressError) console.error(`Error deleting progress for ${email}:`, progressError.message)
            else console.log(`Deleted user_progress`)

            // Public Profile (public.users)
            const { error: profileError } = await supabase
                .from('users')
                .delete()
                .eq('id', user.id)

            if (profileError) console.error(`Error deleting profile for ${email}:`, profileError.message)
            else console.log(`Deleted public.users profile`)

            // Invitations (by email - received)
            const { error: inviteError } = await supabase
                .from('invitations')
                .delete()
                .eq('email', email)

            if (inviteError) console.error(`Error deleting invitations for ${email}:`, inviteError.message)
            else console.log(`Deleted invitations (received)`)

            // Invitations (by invited_by - sent)
            try {
                // We attempt this blindly. passing a filter on a column that doesn't exist *might* error, 
                // but supabase-js usually handles it by returning an error object.
                const { error: sentInviteError } = await supabase
                    .from('invitations')
                    .delete()
                    .eq('invited_by', user.id)

                if (sentInviteError) {
                    console.error(`Error deleting sent invitations (or column missing):`, sentInviteError.message)
                } else {
                    console.log(`Deleted invitations (sent by user)`)
                }
            } catch (e) {
                console.log('Exception checking sent invitations:', e)
            }

            // Super Admins
            const { error: superAdminError } = await supabase
                .from('super_admins')
                .delete()
                .eq('user_id', user.id)

            if (superAdminError) console.error(`Error deleting super_admins:`, superAdminError.message)
            else console.log(`Deleted super_admins record`)


            // 3. Delete Auth User (Supabase Auth)
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

            if (deleteError) {
                console.error(`Failed to delete auth user ${email}:`, deleteError.message)
            } else {
                console.log(`Successfully deleted auth user ${email}`)
            }

        } else {
            console.log(`Auth user for ${email} not found.`)
            // Try to delete invitation anyway
            const { error: inviteError } = await supabase
                .from('invitations')
                .delete()
                .eq('email', email)

            if (!inviteError) console.log(`Deleted invitations (if any)`)
        }
    }
}

deleteUsers()
