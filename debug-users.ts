
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
    console.log('--- Auth Users ---')
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    if (error) {
        console.error('Auth Error:', error)
    } else {
        console.log(`Found ${users.length} auth users`)
        users.forEach(u => console.log(`${u.id}: ${u.email}`))
    }

    console.log('\n--- Public Users ---')
    const { data: publicUsers, error: publicError } = await supabase.from('users').select('*')
    if (publicError) {
        console.error('Public Error:', publicError)
    } else {
        publicUsers.forEach((u: any) => console.log(`${u.id}: ${u.display_name} (${u.role})`))
    }
}

main()
