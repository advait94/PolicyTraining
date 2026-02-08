
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
    console.log('Fetching users...')

    // pagination might be needed if there are many users, but for now listUsers defaults to 50
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error fetching users:', error)
        return
    }

    for (const email of usersToDelete) {
        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (user) {
            console.log(`Found user ${email} (ID: ${user.id}). Deleting...`)
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

            if (deleteError) {
                console.error(`Failed to delete user ${email}:`, deleteError)
            } else {
                console.log(`Successfully deleted user ${email}`)
            }
        } else {
            console.log(`User ${email} not found.`)
        }
    }
}

deleteUsers()
