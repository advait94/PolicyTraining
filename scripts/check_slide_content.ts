
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role to bypass RLS if needed, or just anon if public

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkContent() {
    console.log('Checking slide content...')
    const { data, error } = await supabase
        .from('slides')
        .select('id, title, content')
        .ilike('title', '%Defining Bribery%')
        .maybeSingle()

    if (error) {
        console.error('Error fetching slide:', error)
        return
    }

    if (!data) {
        console.log('No slide found matching title.')
        return
    }

    console.log('--- Slide Found ---')
    console.log('ID:', data.id)
    console.log('Title:', data.title)
    console.log('Content Start:', data.content.substring(0, 100))
    console.log('Content text?', !data.content.includes('<div'))
    console.log('Full Content Sample:', data.content.substring(0, 500))
}

checkContent()
