import { SupabaseClient, Session } from '@supabase/supabase-js'

/**
 * Syncs a user's Supabase Auth session with the public.users table.
 * 
 * This handles the case where:
 * - A user authenticated via SSO (Azure, Google) but the database trigger missed them
 * - A user's invitation wasn't consumed by the trigger (expired, used direct SSO before email)
 * 
 * @returns { synced: boolean, organizationId?: string } - Whether sync was successful and org ID if found
 */
export async function syncUser(
    supabaseClient: SupabaseClient,
    session: Session
): Promise<{ synced: boolean; organizationId?: string; error?: string }> {
    const userId = session.user.id
    const userEmail = session.user.email

    if (!userEmail) {
        return { synced: false, error: 'No email in session' }
    }

    try {
        // 1. Check if user already exists in public.users
        const { data: existingUser, error: existingError } = await supabaseClient
            .from('users')
            .select('id, organization_id')
            .eq('id', userId)
            .single()

        if (existingUser) {
            // User already synced
            return { synced: true, organizationId: existingUser.organization_id }
        }

        // User not found in public.users - try to find their invitation
        console.log(`[syncUser] User ${userEmail} not in public.users, checking for invitation...`)

        // 2. Find pending invitation for this email
        const { data: invite, error: inviteError } = await supabaseClient
            .from('invitations')
            .select('*')
            .eq('email', userEmail.toLowerCase())
            .eq('status', 'pending')
            .limit(1)
            .single()

        if (inviteError || !invite) {
            // No invitation found - user is "homeless"
            console.log(`[syncUser] No pending invitation found for ${userEmail}`)
            return { synced: false, error: 'No invitation found. Please contact your administrator.' }
        }

        console.log(`[syncUser] Found invitation for ${userEmail} to org ${invite.organization_id}`)

        // 3. Create user profile in public.users
        const displayName = session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            userEmail.split('@')[0]

        const { error: upsertError } = await supabaseClient
            .from('users')
            .upsert({
                id: userId,
                email: userEmail,
                display_name: displayName,
                role: invite.role || 'learner',
                organization_id: invite.organization_id
            }, { onConflict: 'id' })

        if (upsertError) {
            console.error('[syncUser] Failed to upsert user:', upsertError)
            return { synced: false, error: `Failed to create profile: ${upsertError.message}` }
        }

        // 4. Add to organization_members
        const { error: memberError } = await supabaseClient
            .from('organization_members')
            .upsert({
                organization_id: invite.organization_id,
                user_id: userId,
                role: invite.role || 'member'
            }, { onConflict: 'organization_id,user_id' })

        if (memberError) {
            console.error('[syncUser] Failed to add to organization_members:', memberError)
            // Non-fatal, continue
        }

        // 5. Mark invitation as accepted
        const { error: updateError } = await supabaseClient
            .from('invitations')
            .update({ status: 'accepted' })
            .eq('id', invite.id)

        if (updateError) {
            console.error('[syncUser] Failed to update invitation status:', updateError)
            // Non-fatal, continue
        }

        console.log(`[syncUser] Successfully synced user ${userEmail} to org ${invite.organization_id}`)
        return { synced: true, organizationId: invite.organization_id }

    } catch (error: any) {
        console.error('[syncUser] Unexpected error:', error)
        return { synced: false, error: error.message }
    }
}
