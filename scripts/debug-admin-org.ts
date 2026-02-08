
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugOrgAlignment() {
    console.log('--- DEBUGGING ORG ALIGNMENT ---');

    // 1. Fetch Test Admin
    const { data: admins } = await supabase.from('users').select('id, email, organization_id').eq('email', 'test-admin@test.com').single();
    // 2. Fetch Test Learner
    const { data: learners } = await supabase.from('users').select('id, email, organization_id').ilike('display_name', '%Test Learner%').single();

    if (!admins) { console.error('Admin not found'); return; }
    if (!learners) { console.error('Learner not found'); return; }

    console.log('Admin:', admins.email, 'OrgID:', admins.organization_id);
    console.log('Learner:', learners.email, 'OrgID:', learners.organization_id);

    if (admins.organization_id !== learners.organization_id) {
        console.error('MISMATCH! Admin is editing a different Org than Learner belongs to.');
    } else {
        console.log('MATCH: Both are in the same Org.');

        // Check Fetch Current Logo
        const { data: org } = await supabase.from('organizations').select('*').eq('id', admins.organization_id).single();
        console.log('Current DB Logo URL:', org.logo_url);
    }
}

debugOrgAlignment();
