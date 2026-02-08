
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugData() {
    console.log('--- DEBUGGING CERTIFICATE DATA ---');

    // 1. Find the Test Learner
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email, display_name, organization_id')
        .ilike('display_name', '%Test Learner%')

    if (userError) { console.error('User Error:', userError); return; }
    if (!users || users.length === 0) { console.log('No "Test Learner" found'); return; }

    const learner = users[0];
    console.log('Learner Found:', learner.email, `(${learner.id})`);
    console.log('Linked Org ID:', learner.organization_id);

    // 2. Fetch the Organization directly
    if (learner.organization_id) {
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', learner.organization_id)
            .single();

        if (orgError) { console.error('Org Error:', orgError); }
        else {
            console.log('Organization:', org.name);
            console.log('Logo URL:', org.logo_url); // CRITICAL CHECK
        }
    } else {
        console.log('WARNING: Learner has NO organization_id linked!');
    }
}

debugData();
