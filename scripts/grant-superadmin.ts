import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function grantSuperadminAccess(email: string) {
    try {
        console.log(`\nGranting superadmin access to: ${email}`)

        // Find the user by email
        const { data: users, error: userError } = await supabase.auth.admin.listUsers()

        if (userError) {
            console.error('Error listing users:', userError)
            return
        }

        const user = users.users.find(u => u.email === email)

        if (!user) {
            console.error(`❌ User not found: ${email}`)
            console.log('\nAvailable users:')
            users.users.forEach(u => console.log(`  - ${u.email} (${u.id})`))
            return
        }

        console.log(`✓ Found user: ${user.email} (ID: ${user.id})`)

        // Check if already a superadmin
        const { data: existingSuperAdmin } = await supabase
            .from('super_admins')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (existingSuperAdmin) {
            console.log(`✓ User is already a superadmin!`)
            return
        }

        // Insert into super_admins table
        const { error: insertError } = await supabase
            .from('super_admins')
            .insert({ user_id: user.id })

        if (insertError) {
            console.error('❌ Error granting superadmin access:', insertError)
            return
        }

        console.log(`✅ Successfully granted superadmin access to ${email}`)

    } catch (error) {
        console.error('❌ Unexpected error:', error)
    }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
    console.error('Usage: ts-node grant-superadmin.ts \u003cemail\u003e')
    console.log('Example: ts-node grant-superadmin.ts user@example.com')
    process.exit(1)
}

grantSuperadminAccess(email)
