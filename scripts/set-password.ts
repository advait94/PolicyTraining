import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function setUserPassword(email: string, password: string) {
    console.log(`Setting password for ${email}...`)

    // First, find the user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
        console.error('Error listing users:', userError)
        return
    }

    const user = userData.users.find(u => u.email === email)

    if (!user) {
        console.error(`User with email ${email} not found`)
        return
    }

    console.log(`Found user: ${user.id}`)

    // Update the user's password
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        password: password
    })

    if (error) {
        console.error('Error setting password:', error)
        return
    }

    console.log('✅ Password set successfully!')
    console.log(`You can now login with: ${email} / ${password}`)
}

// Get command line arguments
const args = process.argv.slice(2)
const email = args[0]
const password = args[1]

if (!email || !password) {
    console.log('Usage: npx tsx scripts/set-password.ts "email@example.com" "your-password"')
    console.log('Example: npx tsx scripts/set-password.ts "gautam.advait@ishantechnologies.com" "MyPassword123"')
    process.exit(1)
}

setUserPassword(email, password).then(() => process.exit(0))
