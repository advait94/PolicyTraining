import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function listUsers() {
    console.log('Fetching all users...\n')

    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error listing users:', error)
        return
    }

    console.log(`Found ${data.users.length} users:\n`)

    data.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
        console.log(`   Provider: ${user.app_metadata.provider}`)
        console.log()
    })
}

listUsers().then(() => process.exit(0))
