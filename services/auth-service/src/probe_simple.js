
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(process.cwd(), '../../.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('--- PROBE SIMPLE START ---');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function runProbe() {
    // HARDCODED ID from SQL Step
    const userId = '11462057-a859-455b-abbb-923cbca54b2d'; // REPLACEMENT_TARGET
    const email = 'praveen@aaplusconsultants.com';
    const organization_id = 'd580364f-8455-452b-9dad-bfaf1971fbed';

    console.log('Upserting public.users...');
    const { data: uData, error: uError } = await supabase
        .from('users')
        .upsert({
            id: userId,
            email: email,
            display_name: 'Praveen Probe',
            role: 'learner',
            organization_id: organization_id
        })
        .select();

    if (uError) console.error('Users Upsert Error:', uError);
    else console.log('Users Upsert Success:', uData);

    console.log('Upserting organization_members...');
    const { data: mData, error: mError } = await supabase
        .from('organization_members')
        .upsert({
            organization_id: organization_id,
            user_id: userId,
            role: 'learner'
        }, { onConflict: 'organization_id,user_id' })
        .select();

    if (mError) console.error('Members Upsert Error:', mError);
    else console.log('Members Upsert Success:', mData);
}

// Ensure ID matches whatever SQL returns
module.exports = { runProbe };
if (require.main === module) {
    runProbe();
}
