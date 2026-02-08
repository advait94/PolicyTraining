
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env from parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateLogo() {
    console.log('Updating Test Organization logo...');
    const { error, data } = await supabase
        .from('organizations')
        .update({ logo_url: 'https://cdn-icons-png.flaticon.com/512/3522/3522596.png' })
        .eq('id', '9e32b9a5-2af2-4c99-bc0b-31c36422368e')
        .select();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success:', data);
    }
}

updateLogo();
