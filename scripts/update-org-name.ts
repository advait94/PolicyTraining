import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateOrganizationName(currentName: string, newName: string) {
    console.log(`Updating organization "${currentName}" to "${newName}"...`)

    const { data, error } = await supabase
        .from('organizations')
        .update({ name: newName })
        .eq('name', currentName)
        .select()

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('✅ Updated successfully:', data)
}

// Get command line arguments
const args = process.argv.slice(2)
const currentName = args[0]
const newName = args[1]

if (!currentName || !newName) {
    console.log('Usage: npx tsx scripts/update-org-name.ts "Current Name" "New Name"')
    console.log('Example: npx tsx scripts/update-org-name.ts "AA Plus" "Ishan Technologies"')
    process.exit(1)
}

updateOrganizationName(currentName, newName).then(() => process.exit(0))
