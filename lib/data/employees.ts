import { createClient } from '@/lib/supabase/server'

export type EmployeeData = {
    id: string
    name: string
    email: string
    role: string
    organization_id: string
    organization_name?: string // For Superadmin view
    modules_completed: number
}

export async function getCompanyEmployees(targetOrgId?: string): Promise<EmployeeData[] | null> {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 2. Check Roles
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')

    let orgIdFilter: string | null = null

    if (isSuperAdmin) {
        // Superadmin can see all, OR filter by specific org if provided
        if (targetOrgId) {
            orgIdFilter = targetOrgId
        }
    } else {
        // If not Superadmin, MUST be Org Admin
        const { data: userData } = await supabase
            .from('users')
            .select('organization_id, role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin' || !userData?.organization_id) {
            console.error('Unauthorized: User is restricted')
            return null
        }
        orgIdFilter = userData.organization_id
    }

    // 3. Build Query
    // We want: User Profile + Role (from org_members) + Org Name + Progress

    let query = supabase
        .from('users')
        .select(`
        id,
        display_name,
        email,
        organization_id,
        organization:organizations(name),
        members:organization_members(role),
        progress:user_progress(is_completed)
    `)

    if (orgIdFilter) {
        query = query.eq('organization_id', orgIdFilter)
    }

    const { data: users, error } = await query

    if (error) {
        console.error('Fetch Employees Error:', error)
        return []
    }

    // 4. Transform Data
    return users.map((u: any) => {
        // Calculate completed modules
        const completedCount = u.progress?.filter((p: any) => p.is_completed).length || 0

        // Determine role (handle multiple memberships potentially? For now assume 1:1 or primary org)
        // organization_members might be an array
        const role = u.members?.[0]?.role || 'learner'

        return {
            id: u.id,
            name: u.display_name || 'Unknown',
            email: u.email || 'No Email',
            role: role,
            organization_id: u.organization_id,
            organization_name: u.organization?.name,
            modules_completed: completedCount
        }
    })
}
