import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
    const email = 'test@example.com';
    const password = 'password123';

    // 1. Create Auth User
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (authError) {
        console.log('User might already exist:', authError.message);
        // Try to get the user if they exist
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existing = users.find(u => u.email === email);
        if (existing) {
            console.log(`Using existing user: ${existing.id}`);
            await ensurePublicUser(existing.id, email);
        }
        return;
    }

    if (authUser.user) {
        console.log(`Created Auth User: ${authUser.user.id}`);
        await ensurePublicUser(authUser.user.id, email);
    }
}

async function ensurePublicUser(userId: string, email: string) {
    // 2. Create Tenant (if none)
    let tenantId;
    const { data: tenants } = await supabase.from('tenants').select('id').limit(1);

    if (!tenants || tenants.length === 0) {
        const { data: newTenant } = await supabase.from('tenants').insert({
            name: 'Demo Corp',
            code: 'DEMO'
        }).select().single();
        tenantId = newTenant?.id;
        console.log('Created Demo Tenant');
    } else {
        tenantId = tenants[0].id;
    }

    // 3. Create Public Profile
    const { error } = await supabase.from('users').upsert({
        id: userId,
        tenant_id: tenantId,
        display_name: 'Test Learner',
        role: 'learner'
    });

    if (error) console.error('Error creating profile:', error);
    else console.log('Public profile created/updated.');
}

createTestUser().catch(console.error);
