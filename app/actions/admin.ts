'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { inviteUser as inviteUserInternal } from '@/lib/auth/invite'

// Bulk Invite Action
export async function bulkInviteUsers(users: { name: string, email: string, department_id?: string }[], targetOrganizationId?: string) {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, message: 'Unauthorized' }
    }

    // Role Check: Superadmin vs Org Admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')

    let targetOrgId = targetOrganizationId || ''

    if (!isSuperAdmin) {
        // Admin: Must use own organization
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

    if (!targetOrgId) {
        return { success: false, message: 'Organization ID is required' }
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
                    organization_id: targetOrgId,
                    role: 'learner',
                    invited_by: user.id,
                    ...(u.department_id ? { department_id: u.department_id } : {})
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
    const departmentId = (formData.get('departmentId') as string) || null

    if (!email || !fullName) {
        return { success: false, message: 'Email and Name are required' }
    }

    try {
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/update-password&email=${encodeURIComponent(email)}`;
        await inviteUserInternal({
            email,
            redirectTo: redirectUrl,
            data: {
                full_name: fullName,
                organization_id: targetOrgId,
                role: role,
                invited_by: invitedBy,
                department_id: departmentId || undefined
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
            .select('id, display_name, email, role, department_id, departments(id, name)')
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
            role: m.role,
            modules_completed: progressMap.get(m.user_id) || 0,
            department_id: profile?.department_id || null,
            department_name: (profile?.departments as any)?.name || null
        }
    })

    return users
}

export async function getOrgModules(targetOrgId?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')

    let orgId = targetOrgId
    if (!orgId) {
        const { data: userData } = await supabase
            .from('users')
            .select('organization_id, role')
            .eq('id', user.id)
            .single()
        if (!isSuperAdmin && userData?.role !== 'admin') return null
        if (!userData?.organization_id) return null
        orgId = userData.organization_id
    }

    const [modulesResult, assignedResult, deptModulesResult, deptsResult] = await Promise.all([
        supabase
            .from('modules')
            .select('id, title, description, sequence_order')
            .order('sequence_order', { ascending: true }),
        supabase
            .from('organization_modules')
            .select('module_id, all_employees')
            .eq('organization_id', orgId),
        supabase
            .from('department_module_assignments')
            .select('module_id, department_id')
            .eq('organization_id', orgId),
        supabase
            .from('departments')
            .select('id, name')
            .eq('organization_id', orgId)
            .order('name', { ascending: true })
    ])

    const assignedSet = new Set(assignedResult.data?.map((a: any) => a.module_id) || [])
    const allEmployeesSet = new Set(
        (assignedResult.data || []).filter((a: any) => a.all_employees).map((a: any) => a.module_id)
    )

    const deptAssignmentsMap = new Map<string, string[]>()
    for (const row of (deptModulesResult.data || [])) {
        const existing = deptAssignmentsMap.get(row.module_id) || []
        existing.push(row.department_id)
        deptAssignmentsMap.set(row.module_id, existing)
    }

    return {
        modules: (modulesResult.data || []).map((m: any) => ({
            ...m,
            isAssigned: assignedSet.has(m.id),
            allEmployees: allEmployeesSet.has(m.id),
            deptIds: deptAssignmentsMap.get(m.id) || []
        })),
        departments: deptsResult.data || []
    }
}

export async function setModuleAssignment(moduleId: string, assign: boolean, targetOrgId?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')

    let orgId = targetOrgId
    if (!orgId) {
        const { data: userData } = await supabase
            .from('users')
            .select('organization_id, role')
            .eq('id', user.id)
            .single()
        if (!isSuperAdmin && userData?.role !== 'admin') {
            return { success: false, message: 'Unauthorized' }
        }
        if (!userData?.organization_id) return { success: false, message: 'Organization ID required' }
        orgId = userData.organization_id
    }

    if (assign) {
        const { error } = await supabase
            .from('organization_modules')
            .upsert({ organization_id: orgId, module_id: moduleId, assigned_by: user.id })
        if (error) return { success: false, message: error.message }
    } else {
        const { error } = await supabase
            .from('organization_modules')
            .delete()
            .eq('organization_id', orgId)
            .eq('module_id', moduleId)
        if (error) return { success: false, message: error.message }
    }

    return { success: true }
}

export async function setModuleAllEmployees(moduleId: string, allEmployees: boolean, targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    let orgId = targetOrgId
    if (!orgId) {
        const { data: userData } = await supabase.from('users').select('organization_id, role').eq('id', user.id).single()
        if (!isSuperAdmin && userData?.role !== 'admin') return { success: false, message: 'Unauthorized' }
        if (!userData?.organization_id) return { success: false, message: 'Organization ID required' }
        orgId = userData.organization_id
    }

    const { error } = await supabase
        .from('organization_modules')
        .update({ all_employees: allEmployees })
        .eq('organization_id', orgId)
        .eq('module_id', moduleId)
    if (error) return { success: false, message: error.message }
    return { success: true }
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

export async function getReportChartData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const { data: userData } = await supabase.from('users').select('organization_id, role').eq('id', user.id).single()
    if (!isSuperAdmin && (userData?.role !== 'admin' || !userData?.organization_id)) return null
    const orgId = userData?.organization_id
    if (!orgId) return null

    const [membersResult, progressResult, modulesResult, deptsResult] = await Promise.all([
        // All org members with department
        supabase.from('users')
            .select('id, display_name, email, department_id, departments(name)')
            .eq('organization_id', orgId),
        // All progress records for org
        supabase.from('user_progress')
            .select('user_id, module_id, is_completed, quiz_score, completed_at, modules(title), users!inner(organization_id)')
            .eq('users.organization_id', orgId),
        // All org-enabled modules
        supabase.from('organization_modules')
            .select('module_id, modules(title, sequence_order)')
            .eq('organization_id', orgId),
        // Departments
        supabase.from('departments')
            .select('id, name')
            .eq('organization_id', orgId)
            .order('name'),
    ])

    const members: any[] = membersResult.data || []
    const progress: any[] = progressResult.data || []
    const enabledModules: any[] = (modulesResult.data || [])
        .sort((a: any, b: any) => (a.modules?.sequence_order || 0) - (b.modules?.sequence_order || 0))
    const depts: any[] = deptsResult.data || []
    const totalMembers = members.length || 1

    // ── 1. Module Breakdown ────────────────────────────────────────────────
    const moduleBreakdown = enabledModules.map((om: any) => {
        const mid = om.module_id
        const title = om.modules?.title || 'Unknown'
        const shortTitle = title.length > 30 ? title.substring(0, 28) + '…' : title

        const moduleProgress = progress.filter((p: any) => p.module_id === mid)
        const completedUsers = new Set(moduleProgress.filter((p: any) => p.is_completed).map((p: any) => p.user_id))
        const inProgressUsers = new Set(moduleProgress.filter((p: any) => !p.is_completed).map((p: any) => p.user_id))
        // in-progress should exclude those already completed
        const inProgressOnly = new Set([...inProgressUsers].filter(id => !completedUsers.has(id)))
        const notStarted = totalMembers - completedUsers.size - inProgressOnly.size
        const scores = moduleProgress.filter((p: any) => p.is_completed && p.quiz_score != null).map((p: any) => p.quiz_score)
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0

        return {
            moduleId: mid,
            title,
            shortTitle,
            completed: completedUsers.size,
            inProgress: inProgressOnly.size,
            notStarted: Math.max(0, notStarted),
            completionRate: Math.round((completedUsers.size / totalMembers) * 100),
            avgScore,
            totalAttempts: moduleProgress.length,
        }
    })

    // ── 2. Department Completion Rates ─────────────────────────────────────
    const deptBreakdown = depts.map((dept: any) => {
        const deptMembers = members.filter((m: any) => m.department_id === dept.id)
        const deptMemberIds = new Set(deptMembers.map((m: any) => m.id))
        const deptTotal = deptMembers.length || 1

        const row: any = { dept: dept.name, total: deptMembers.length }
        let overallCompleted = 0
        enabledModules.forEach((om: any) => {
            const completed = progress.filter((p: any) =>
                p.module_id === om.module_id && p.is_completed && deptMemberIds.has(p.user_id)
            ).length
            row[om.modules?.title || om.module_id] = Math.round((completed / deptTotal) * 100)
            overallCompleted += completed
        })
        row.overallRate = enabledModules.length > 0
            ? Math.round((overallCompleted / (deptTotal * enabledModules.length)) * 100)
            : 0
        return row
    })

    // Add "No Department" row
    const noDeptMembers = members.filter((m: any) => !m.department_id)
    if (noDeptMembers.length > 0) {
        const noDeptIds = new Set(noDeptMembers.map((m: any) => m.id))
        const row: any = { dept: 'No Department', total: noDeptMembers.length }
        let overallCompleted = 0
        enabledModules.forEach((om: any) => {
            const completed = progress.filter((p: any) =>
                p.module_id === om.module_id && p.is_completed && noDeptIds.has(p.user_id)
            ).length
            row[om.modules?.title || om.module_id] = Math.round((completed / (noDeptMembers.length || 1)) * 100)
            overallCompleted += completed
        })
        row.overallRate = enabledModules.length > 0
            ? Math.round((overallCompleted / ((noDeptMembers.length || 1) * enabledModules.length)) * 100)
            : 0
        deptBreakdown.push(row)
    }

    // ── 3. Score Distribution per Module ──────────────────────────────────
    const scoreDistribution = enabledModules.map((om: any) => {
        const scores = progress
            .filter((p: any) => p.module_id === om.module_id && p.is_completed && p.quiz_score != null)
            .map((p: any) => p.quiz_score)
        return {
            title: om.modules?.title || 'Unknown',
            shortTitle: (om.modules?.title || '').length > 25
                ? (om.modules?.title || '').substring(0, 23) + '…'
                : (om.modules?.title || ''),
            '0–39 (Fail)': scores.filter((s: number) => s < 40).length,
            '40–59': scores.filter((s: number) => s >= 40 && s < 60).length,
            '60–69': scores.filter((s: number) => s >= 60 && s < 70).length,
            '70–79 (Pass)': scores.filter((s: number) => s >= 70 && s < 80).length,
            '80–100 (Distinction)': scores.filter((s: number) => s >= 80).length,
        }
    })

    // ── 4. Completion Timeline (last 12 weeks) ────────────────────────────
    const now = new Date()
    const weeks: { label: string, start: Date, end: Date }[] = []
    for (let i = 11; i >= 0; i--) {
        const end = new Date(now)
        end.setDate(end.getDate() - i * 7)
        const start = new Date(end)
        start.setDate(start.getDate() - 6)
        weeks.push({
            label: `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
            start,
            end,
        })
    }

    const timeline = weeks.map(w => {
        const count = progress.filter((p: any) => {
            if (!p.is_completed || !p.completed_at) return false
            const d = new Date(p.completed_at)
            return d >= w.start && d <= w.end
        }).length
        return { week: w.label, completions: count }
    })

    // ── 5. Employee Matrix (for the table / CSV) ───────────────────────────
    const moduleList = enabledModules.map((om: any) => ({
        id: om.module_id,
        title: om.modules?.title || 'Unknown',
    }))

    const employeeMatrix = members.map((m: any) => {
        const row: any = {
            name: m.display_name || 'Unknown',
            email: m.email || '',
            department: (m.departments as any)?.name || '—',
        }
        let completedCount = 0
        moduleList.forEach(mod => {
            const p = progress.find((pr: any) => pr.user_id === m.id && pr.module_id === mod.id)
            if (p?.is_completed) {
                row[mod.title] = `✓ ${p.quiz_score ?? '—'}%`
                completedCount++
            } else if (p) {
                row[mod.title] = 'In Progress'
            } else {
                row[mod.title] = 'Not Started'
            }
        })
        row['Modules Completed'] = `${completedCount}/${moduleList.length}`
        row['Overall Rate'] = `${Math.round((completedCount / (moduleList.length || 1)) * 100)}%`
        return row
    })

    // ── 6. Summary KPIs ───────────────────────────────────────────────────
    const totalCompletions = progress.filter((p: any) => p.is_completed).length
    const uniqueCompleted = new Set(progress.filter((p: any) => p.is_completed).map((p: any) => p.user_id)).size
    const allScores = progress.filter((p: any) => p.is_completed && p.quiz_score != null).map((p: any) => p.quiz_score)
    const overallAvgScore = allScores.length > 0
        ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length)
        : 0
    const fullyCompliant = members.filter(m => {
        const completedForMember = new Set(progress.filter((p: any) => p.user_id === m.id && p.is_completed).map((p: any) => p.module_id))
        return enabledModules.every(om => completedForMember.has(om.module_id))
    }).length

    return {
        summary: {
            totalMembers,
            totalModules: enabledModules.length,
            totalCompletions,
            uniqueStarted: new Set(progress.map((p: any) => p.user_id)).size,
            uniqueCompleted,
            overallAvgScore,
            fullyCompliant,
            fullyCompliantRate: Math.round((fullyCompliant / (totalMembers || 1)) * 100),
        },
        moduleBreakdown,
        deptBreakdown,
        scoreDistribution,
        timeline,
        moduleList,
        employeeMatrix,
    }
}

// ─── Department Management ───────────────────────────────────────────────────

async function resolveOrgId(supabase: any, userId: string, isSuperAdmin: boolean, targetOrgId?: string): Promise<string | null> {
    if (targetOrgId) return targetOrgId
    const { data } = await supabase.from('users').select('organization_id, role').eq('id', userId).single()
    if (!isSuperAdmin && data?.role !== 'admin') return null
    return data?.organization_id || null
}

export async function getDepartments(targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return null

    const { data } = await supabase
        .from('departments')
        .select('id, name')
        .eq('organization_id', orgId)
        .order('name', { ascending: true })
    return data || []
}

export async function createDepartment(name: string, targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return { success: false, message: 'Unauthorized' }

    const { error } = await supabase
        .from('departments')
        .insert({ organization_id: orgId, name: name.trim() })
    if (error) return { success: false, message: error.message }
    return { success: true }
}

export async function deleteDepartment(departmentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (!isSuperAdmin) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (userData?.role !== 'admin') return { success: false, message: 'Unauthorized' }
    }

    const { error } = await supabase.from('departments').delete().eq('id', departmentId)
    if (error) return { success: false, message: error.message }
    return { success: true }
}

export async function updateUserDepartment(userId: string, departmentId: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (!isSuperAdmin) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (userData?.role !== 'admin') return { success: false, message: 'Unauthorized' }
    }

    // Use service role client to bypass RLS — authorization is already verified above
    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('users')
        .update({ department_id: departmentId })
        .eq('id', userId)
    if (error) return { success: false, message: error.message }
    return { success: true }
}

export async function setDeptModuleAssignment(moduleId: string, departmentId: string, assign: boolean, targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return { success: false, message: 'Unauthorized' }

    if (assign) {
        const { error } = await supabase
            .from('department_module_assignments')
            .upsert({ department_id: departmentId, module_id: moduleId, organization_id: orgId })
        if (error) return { success: false, message: error.message }
    } else {
        const { error } = await supabase
            .from('department_module_assignments')
            .delete()
            .eq('department_id', departmentId)
            .eq('module_id', moduleId)
        if (error) return { success: false, message: error.message }
    }
    return { success: true }
}

export async function bulkAssignDepartment(departmentId: string, targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return { success: false, message: 'Unauthorized' }

    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('users')
        .update({ department_id: departmentId })
        .eq('organization_id', orgId)
        .is('department_id', null)
    if (error) return { success: false, message: error.message }
    return { success: true }
}

export async function setModuleDeadline(moduleId: string, dueDate: string | null, targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return { success: false, message: 'Unauthorized' }

    if (!dueDate) {
        const { error } = await supabase
            .from('organization_module_deadlines')
            .delete()
            .eq('organization_id', orgId)
            .eq('module_id', moduleId)
        if (error) return { success: false, message: error.message }
    } else {
        const { error } = await supabase
            .from('organization_module_deadlines')
            .upsert({ organization_id: orgId, module_id: moduleId, due_date: dueDate }, { onConflict: 'organization_id,module_id' })
        if (error) return { success: false, message: error.message }
    }
    return { success: true }
}

export async function getModuleDeadlines(targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return []
    const { data } = await supabase
        .from('organization_module_deadlines')
        .select('module_id, due_date')
        .eq('organization_id', orgId)
    return data || []
}

export async function updateUserRole(userId: string, role: string, targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (!isSuperAdmin) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (userData?.role !== 'admin') return { success: false, message: 'Unauthorized' }
    }
    const adminClient = createAdminClient()
    const { error } = await adminClient.from('users').update({ role }).eq('id', userId)
    if (error) return { success: false, message: error.message }
    return { success: true }
}
