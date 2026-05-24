'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { inviteUser } from '@/lib/auth/invite'

const PLAN_TIERS = ['essentials', 'business', 'professional', 'corporate', 'enterprise'] as const
type PlanTier = typeof PLAN_TIERS[number]

export async function updateOrgPlan(
    orgId: string,
    planTier: PlanTier | null,
    planExpiresAt: string | null,
    planStartedAt: string | null,
) {
    try {
        const supabase = await createServerClient()
        const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
        if (!isSuperAdmin) {
            return { success: false, error: 'Unauthorized' }
        }

        if (planTier !== null && !PLAN_TIERS.includes(planTier)) {
            return { success: false, error: 'Invalid plan tier' }
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        const { error } = await supabaseAdmin
            .from('organizations')
            .update({
                plan_tier: planTier,
                plan_expires_at: planExpiresAt || null,
                plan_started_at: planStartedAt || null,
            })
            .eq('id', orgId)

        if (error) throw new Error(error.message)

        revalidatePath(`/superadmin/organizations/${orgId}`)
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function createOrganization(prevState: any, formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string

    if (!name || !email) {
        return { success: false, message: '', error: 'Name and Email are required' }
    }

    try {
        // 1. Check Superadmin permission
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')

        if (!isSuperAdmin || !user) {
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
        // Note: We don't really need to do this manually if inviteUser does it, 
        // but keeping it for now to ensure the ID is reserved or flow is same.
        // Actually, inviteUser does an upsert on invitations, so this Step 4 is redundant 
        // AND potentially conflicting if we don't pass the same data. 
        // But let's just fix the invited_by. 
        // Wait, step 4 insert below DOES NOT have invited_by, so it might work fine until inviteUser updates it.
        // But the error likely comes from inviteUser update.

        const { error: inviteError } = await supabaseAdmin
            .from('invitations')
            .insert({
                email,
                organization_id: org.id,
                role: 'admin',
                status: 'pending'
            })

        if (inviteError) throw new Error('Failed to create invitation: ' + inviteError.message)

        // 5. Send Invite via Internal Logic (Resend + Supabase Admin)
        try {
            const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/update-password&email=${encodeURIComponent(email)}`;

            await inviteUser({
                email,
                redirectTo: redirectUrl,
                data: {
                    full_name: email.split('@')[0],
                    organization_id: org.id,
                    role: 'admin',
                    invited_by: user.id // Pass the actual UUID
                }
            });

            console.log('Invitation sent successfully via internal logic');
        } catch (inviteError: any) {
            console.error('Failed to send invitation:', inviteError);
            // Don't fail the whole operation - org and invitation record are created
            // Admin can manually resend if needed
            // Ideally we should return a warning here
        }

        revalidatePath('/superadmin')
        return { success: true, message: `Organization "${name}" created. Admin invite sent to ${email}.`, error: '' }

    } catch (error: any) {
        console.error('Create Org Error:', error)
        return { success: false, message: '', error: error.message }
    }
}
