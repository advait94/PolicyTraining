
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
    const { data: modules, error } = await supabase
        .from('modules')
        .select('id, title, slides(id, title, content)')
        .ilike('title', '%Anti-Corruption%')

    if (error) {
        console.error('Error fetching modules:', error)
        return
    }

    console.log(JSON.stringify(modules, null, 2))
}

main()
