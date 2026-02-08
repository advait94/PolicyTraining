import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOrganizations() {
    console.log('Fetching all organizations...\n')

    const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching organizations:', error)
        return
    }

    console.log(`Found ${orgs?.length || 0} organizations:\n`)

    orgs?.forEach((org, index) => {
        console.log(`${index + 1}. ${org.name}`)
        console.log(`   ID: ${org.id}`)
        console.log(`   Code: ${org.code}`)
        console.log(`   Created: ${new Date(org.created_at).toLocaleString()}`)
        console.log()
    })
}

checkOrganizations().then(() => process.exit(0))
