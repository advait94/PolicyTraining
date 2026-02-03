import { SupabaseClient } from '@supabase/supabase-js'

export async function getUserOrganization(supabase: SupabaseClient) {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    // Optimized query: utilizing the RLS policy that already filters to my memberships
    const { data: memberRecord, error } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations(name)')
        .eq('user_id', user.id)
        .single()

    if (error || !memberRecord) {
        return null
    }

    return {
        organization_id: memberRecord.organization_id,
        role: memberRecord.role,
        organization_name: Array.isArray(memberRecord.organizations) ? memberRecord.organizations[0]?.name : (memberRecord.organizations as any)?.name
    }
}
