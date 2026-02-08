'use server'

import { createClient } from '@/lib/supabase/server'
import { inviteUser as inviteUserInternal } from '@/lib/auth/invite'

// Bulk Invite Action
export async function bulkInviteUsers(users: { name: string, email: string }[]) {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, message: 'Unauthorized' }
    }

    // Get Admin's Organization
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (userError || !userData || userData.role !== 'admin') {
        return { success: false, message: 'Unauthorized or not an admin' }
    }

    const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
    }

    // Process in batches or parallel
    await Promise.all(users.map(async (u) => {
        try {
            // Basic validation
            if (!u.email || !u.name) return

            const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/update-password&email=${encodeURIComponent(u.email)}`;

            // Direct call to internal invite logic
            await inviteUserInternal({
                email: u.email,
                redirectTo: redirectUrl,
                data: {
                    full_name: u.name,
                    organization_id: userData.organization_id,
                    role: 'learner',
                    invited_by: user.id
                }
            })

            results.success++
        } catch (err: any) {
            results.failed++
            results.errors.push(`${u.email}: ${err.message}`)
        }
    }))

    return {
        success: true,
        message: `Processed ${users.length} users. Success: ${results.success}, Failed: ${results.failed}`,
        details: results
    }
}

export async function inviteUser(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, message: 'Unauthorized' }
    }

    // Role Check: Superadmin vs Org Admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')

    let targetOrgId = ''
    let invitedBy = user.id

    if (isSuperAdmin) {
        // Superadmin: Can specify Org ID
        targetOrgId = formData.get('organizationId') as string
        if (!targetOrgId) {
            // Optional: If not provided, maybe they are inviting another Superadmin? 
            // For now, require it for normal user invites.
            // Or fetch from form if the UI provides it.
        }
    } else {
        // Org Admin: MUST use own Org ID
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('organization_id, role')
            .eq('id', user.id)
            .single()

        if (userError || !userData || userData.role !== 'admin') {
            return { success: false, message: 'Unauthorized or not an admin' }
        }
        targetOrgId = userData.organization_id
    }

    if (!isSuperAdmin && !targetOrgId) {
        return { success: false, message: 'Organization ID missing' }
    }

    // If Superadmin and no orgId provided, we can't invite a "learner" without an org context usually.
    // Assuming UI handles it. For now, if missing, we return error if superadmin.
    if (isSuperAdmin && !targetOrgId) {
        // Unless inviting a Superadmin? 
        return { success: false, message: 'Organization ID required' }
    }

    const email = formData.get('email') as string
    const fullName = formData.get('fullName') as string
    const role = (formData.get('role') as string) || 'learner'

    if (!email || !fullName) {
        return { success: false, message: 'Email and Name are required' }
    }

    try {
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/update-password&email=${encodeURIComponent(email)}`;
        // Call Internal Invite Logic
        await inviteUserInternal({
            email,
            redirectTo: redirectUrl,
            data: {
                full_name: fullName,
                organization_id: targetOrgId,
                role: role,
                invited_by: invitedBy
            }
        });

        return { success: true, message: `Invitation sent to ${email}` }
    } catch (error: any) {
        console.error('Invite Action Error:', error)
        // Check for specific fetch connection errors
        const msg = error.cause ? `${error.message} (Cause: ${error.cause.code || error.cause})` : error.message;
        return { success: false, message: msg || 'Failed to invite user' }
    }
}

export async function getAdminStats() {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        console.error('Auth Error:', authError)
        return null
    }

    // Get Admin's Organization ID and Role Check
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin' || !userData?.organization_id) {
        console.error('Unauthorized: User is not an admin or missing org')
        return null
    }

    // 1. Get Total Employees in Org
    const { count: totalEmployees, error: countError } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', userData.organization_id)

    if (countError) {
        console.error('Count Error:', countError)
        return null
    }

    // 2. Get Completed Progress for Org Users
    // We join users!inner to filter by organization_id efficiently
    const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select(`
            module_id,
            modules ( title ),
            users!inner ( organization_id )
        `)
        .eq('is_completed', true)
        .eq('users.organization_id', userData.organization_id)

    if (progressError) {
        console.error('Progress Error:', progressError)
        return null
    }

    // 3. Aggregate by Module
    const moduleCounts = new Map<string, number>()
    progressData?.forEach((p: any) => {
        const title = p.modules?.title || 'Unknown Module'
        const current = moduleCounts.get(title) || 0
        moduleCounts.set(title, current + 1)
    })

    // 4. Calculate Stats
    const total = totalEmployees || 1 // Avoid dbz
    const moduleStats = Array.from(moduleCounts.entries()).map(([name, count]) => ({
        name,
        percentage: Math.round((count / total) * 100)
    }))

    // Calculate Overall Avg
    const avgCompletion = moduleStats.length > 0
        ? Math.round(moduleStats.reduce((acc, curr) => acc + curr.percentage, 0) / moduleStats.length)
        : 0

    // 5. Expired Certs (Same as before)
    const { data: expired } = await supabase
        .from('user_progress')
        .select('users!inner(display_name, email, organization_id), completed_at, modules(title)')
        .eq('users.organization_id', userData.organization_id) // Ensure org filter
        .eq('is_completed', true)
        .lt('completed_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

    return {
        totalEmployees: totalEmployees || 0,
        avgCompletion,
        certifiedUsers: 0, // Deprecated or calculate if needed
        moduleStats: moduleStats.length > 0 ? moduleStats : [{ name: 'No Data', percentage: 0 }],
        expiredCertifications: expired?.map((r: any) => ({
            display_name: r.users?.display_name,
            email: r.users?.email,
            module_title: r.modules?.title || 'Unknown Module',
            completed_at: r.completed_at
        })) || []
    }
}

export async function getCompanyUsers() {
    const supabase = await createClient()

    // 1. Auth & Org Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin' || !userData?.organization_id) {
        console.error('Unauthorized: User is not an admin or missing org')
        return null
    }

    // 2. Fetch Members + Profiles + Progress in Parallel
    const [membersResult, profilesResult, progressResult] = await Promise.all([
        // A. Get Members IDs & Roles
        supabase
            .from('organization_members')
            .select('user_id, role')
            .eq('organization_id', userData.organization_id),

        // B. Get Public Profiles
        supabase
            .from('users')
            .select('id, display_name, email, role')
            .eq('organization_id', userData.organization_id),

        // C. Get Progress Counts
        supabase
            .from('user_progress')
            .select('user_id, is_completed')
            .eq('is_completed', true)
    ])

    if (membersResult.error) {
        console.error('Members Fetch Error:', membersResult.error)
        return []
    }

    // 3. Merge Data
    // Create Profile Map
    const profileMap = new Map<string, any>()
    profilesResult.data?.forEach((p: any) => profileMap.set(p.id, p))

    // Create Progress Map
    const progressMap = new Map<string, number>()
    progressResult.data?.forEach((p: any) => {
        const current = progressMap.get(p.user_id) || 0
        progressMap.set(p.user_id, current + 1)
    })

    // Combine
    const users = membersResult.data.map((m: any) => {
        const profile = profileMap.get(m.user_id)
        return {
            id: m.user_id,
            name: profile?.display_name || 'Unknown',
            email: profile?.email || 'No Email',
            role: m.role, // Membership role rules
            modules_completed: progressMap.get(m.user_id) || 0
        }
    })

    return users
}

export async function getComplianceReport() {
    const supabase = await createClient()

    // 1. Auth Check (Same as above)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin' || !userData?.organization_id) {
        console.error('Unauthorized: User is not an admin or missing org')
        return null
    }

    // 2. Fetch Nested Data
    const { data: orgProgress, error: progError } = await supabase
        .from('users')
        .select(`
            id,
            display_name,
            user_progress (
                is_completed,
                quiz_score,
                completed_at,
                modules ( title )
            )
        `)
        .eq('organization_id', userData.organization_id)

    if (progError) throw new Error(progError.message)

    // 3. Fetch Emails (Using Service Role for Auth Admin access if needed, assuming public.users has email)
    const { data: publicUsers } = await supabase.from('users').select('id, email').eq('organization_id', userData.organization_id)
    const emailMap = new Map(publicUsers?.map(u => [u.id, u.email]) || [])

    // 4. Flatten for CSV
    const reportRows: any[] = []

    orgProgress?.forEach((user: any) => {
        const email = emailMap.get(user.id) || 'N/A'

        if (user.user_progress && user.user_progress.length > 0) {
            user.user_progress.forEach((p: any) => {
                reportRows.push({
                    EmployeeName: user.display_name,
                    Email: email,
                    Module: p.modules?.title || 'Unknown',
                    Status: p.is_completed ? 'Completed' : 'In Progress',
                    Score: p.quiz_score || 0,
                    CompletedDate: p.completed_at ? new Date(p.completed_at).toLocaleDateString() : '-'
                })
            })
        } else {
            reportRows.push({
                EmployeeName: user.display_name,
                Email: email,
                Module: '-',
                Status: 'Not Started',
                Score: '-',
                CompletedDate: '-'
            })
        }
    })

    return reportRows
}
