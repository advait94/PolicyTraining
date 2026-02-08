'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createOrganization(prevState: any, formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string

    if (!name || !email) {
        return { success: false, message: '', error: 'Name and Email are required' }
    }

    try {
        // 1. Check Superadmin permission
        const supabase = await createServerClient()
        const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
        if (!isSuperAdmin) {
            return { success: false, message: '', error: 'Unauthorized' }
        }

        // 2. Initialize Admin Client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 3. Create Organization
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const { data: org, error: orgError } = await supabaseAdmin
            .from('organizations')
            .insert({ name, code: slug })
            .select()
            .single()

        if (orgError) throw new Error('Failed to create org: ' + orgError.message)

        // 4. Create Invitation Record (Critical for the Trigger logic)
        const { error: inviteError } = await supabaseAdmin
            .from('invitations')
            .insert({
                email,
                organization_id: org.id,
                role: 'admin',
                status: 'pending'
            })

        if (inviteError) throw new Error('Failed to create invitation: ' + inviteError.message)

        // 5. Send Invite via Auth Service (for consistent handling)
        try {
            const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/update-password&email=${encodeURIComponent(email)}`;
            const response = await fetch('http://localhost:4006/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    redirectTo: redirectUrl,
                    data: {
                        full_name: email.split('@')[0], // Basic name from email
                        organization_id: org.id,
                        role: 'admin'
                    }
                })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Auth service invite failed:', result.error);
                throw new Error(result.error || 'Failed to send invitation');
            }

            console.log('Invitation sent successfully via auth-service');
        } catch (inviteError: any) {
            console.error('Failed to send invitation:', inviteError);
            // Don't fail the whole operation - org and invitation record are created
            // Admin can manually resend if needed
        }

        revalidatePath('/superadmin')
        return { success: true, message: `Organization "${name}" created. Admin invite sent to ${email}.`, error: '' }

    } catch (error: any) {
        console.error('Create Org Error:', error)
        return { success: false, message: '', error: error.message }
    }
}
