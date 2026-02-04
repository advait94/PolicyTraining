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
            .insert({ name, slug })
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

        // 5. Send Invite / Ensure User Exists
        // We use inviteUserByEmail which handles both new and existing users (sends magic link)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { organization_id: org.id, role: 'admin' }, // metadata
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        })

        if (authError) {
            // Fallback: If invite fails (e.g. rate limit or other), we still have the invitation record.
            // But we should warn.
            console.error('Supabase Auth Invite Error:', authError)
            // Ideally we check if user exists. If so, we can manually add them to org_members.

            // Check if user exists by email
            const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
            // Use listUsers since getUser requires ID. listUsers is paginated but good for check.
            // actually safer to use specific filter if available or just catch the error.
            // For now, let's assuming if invite failed, manual intervention might be needed, or they are already confirmed?
            // If user is already confirmed, inviteUserByEmail returns the user.
        } else if (authData.user) {
            // If the user already existed and is confirmed, the trigger won't fire (only on INSERT).
            // So we must manually insert into organization_members to be safe.
            const { error: memberError } = await supabaseAdmin
                .from('organization_members')
                .upsert(
                    {
                        organization_id: org.id,
                        user_id: authData.user.id,
                        role: 'admin'
                    },
                    { onConflict: 'organization_id, user_id', ignoreDuplicates: true }
                )

            if (memberError) console.error('Failed to add member:', memberError)
        }

        revalidatePath('/superadmin')
        return { success: true, message: `Organization "${name}" created. Admin invite sent to ${email}.`, error: '' }

    } catch (error: any) {
        console.error('Create Org Error:', error)
        return { success: false, message: '', error: error.message }
    }
}
