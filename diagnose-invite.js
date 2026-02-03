const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function diagnose() {
    console.log('--- Diagnosis Start ---');

    // 1. Check Advait's Role
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'advait@aaplusconsultants.com')
        .single();

    if (userError) {
        console.error('Error fetching Advait:', userError.message);
    } else {
        console.log('Advait User Data:', {
            id: user.id,
            role: user.role,
            organization_id: user.organization_id
        });
    }

    // 2. Check Auth Service Health
    try {
        const authHealth = await fetch('http://localhost:4001/health');
        const authData = await authHealth.json();
        console.log('Auth Service Health:', authData);
    } catch (e) {
        console.error('Auth Service Unreachable:', e.message);
    }

    // 3. Check Email Service Health
    try {
        const emailHealth = await fetch('http://localhost:4002/health');
        const emailData = await emailHealth.json();
        console.log('Email Service Health:', emailData);
    } catch (e) {
        console.error('Email Service Unreachable:', e.message);
    }

    console.log('--- Diagnosis End ---');
}

diagnose();
