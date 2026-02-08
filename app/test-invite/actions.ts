
'use server'

import { inviteUser } from '@/lib/auth/invite';
import { createClient } from '@supabase/supabase-js';

// Re-use logic to ensure environment is same
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function testInvite(formData: FormData) {
    const email = formData.get('email') as string;

    console.log('[Debug] Testing invite for:', email);
    console.log('[Debug] Env Vars Check:', {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        resendKey: !!process.env.RESEND_API_KEY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL
    });

    try {
        const result = await inviteUser({
            email,
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
            data: {
                organization_id: 'd500364f-8455-452b-9dad-bfaef19717bed', // AA Plus Demo Org ID
                role: 'learner'
                // invited_by: 'debug-tool' // Removing to avoid UUID error since we don't have auth context here easily
            }
        });

        console.log('[Debug] Invite Result:', result);
        return { success: true, result };
    } catch (error: any) {
        console.error('[Debug] Invite Failed:', error);
        // THROW it so Vercel logs show the full stack trace and UI sees it if we were client-side
        // But for form action, console.error is key.
        throw new Error(`Invite Failed: ${error.message} - Stack: ${error.stack}`);
    }
}

export async function deleteTestUser(formData: FormData) {
    const email = formData.get('email') as string;

    // Quick cleanup tool
    try {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const user = users.find(u => u.email === email);

        if (user) {
            await supabaseAdmin.auth.admin.deleteUser(user.id);
            console.log('[Debug] Deleted user:', email);
        } else {
            console.log('[Debug] User not found:', email);
        }
    } catch (e) {
        console.error('[Debug] Delete failed:', e);
    }
}
