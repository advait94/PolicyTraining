'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { inviteUser as inviteUserInternal, resolveExistingUserIds } from '@/lib/auth/invite'
import { unstable_cache } from 'next/cache'
import { MAX_ADMINS_PER_ORG, isAssignableRole } from '@/lib/org-limits'
import type { PlanTier } from '@/lib/plan-utils'

const ADMIN_CAP_MESSAGE = `This organization already has the maximum of ${MAX_ADMINS_PER_ORG} admins. Change an existing admin to another role first.`

/**
 * Counts the admins in an organization. `excludeUserId` leaves one user out of
 * the tally, which is what you want when that user's own role is being changed
 * (their current role shouldn't count against the seat they're moving into).
 *
 * Uses the service-role client so the count is complete regardless of RLS —
 * callers must verify the caller's authority over `orgId` themselves.
 */
async function countOrgAdmins(orgId: string, excludeUserId?: string) {
    let query = createAdminClient()
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('role', 'admin')

    if (excludeUserId) query = query.neq('id', excludeUserId)

    const { count, error } = await query
    if (error) throw new Error(`Could not verify the organization's admin count: ${error.message}`)
    return count ?? 0
}

/**
 * How many invites are in flight at once.
 *
 * Each invite is several sequential round trips (auth lookup, createUser,
 * generateLink, token write) plus an email send, and every one lands on either
 * GoTrue or the Postgres pooler. This used to be an unbounded Promise.all over
 * the whole CSV, which buries both on any file of real size. 8 keeps the pool
 * healthy while still clearing a few hundred rows well inside one request.
 */
const INVITE_CONCURRENCY = 8

/** Attempts per row, including the first. Only retryable failures re-run. */
const INVITE_MAX_ATTEMPTS = 3

export type BulkInviteRowResult = {
    email: string
    status: 'invited' | 'skipped' | 'failed'
    error?: string
}

/**
 * Transient transport/throttle failures, worth another attempt. Anything else
 * (bad address, constraint violation) fails the row immediately — retrying it
 * would just burn time on a result that cannot change.
 */
function isRetryableInviteError(message: string): boolean {
    const m = message.toLowerCase()
    return m.includes('rate limit')
        || m.includes('too many requests')
        || m.includes('429')
        || m.includes('timeout')
        || m.includes('timed out')
        || m.includes('fetch failed')
        || m.includes('econnreset')
        || m.includes('socket hang up')
        || m.includes('502')
        || m.includes('503')
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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

    // One query resolves every address in the batch against auth.users. Doing
    // this per row is what made large uploads crawl, and doing it with
    // listUsers({page:1}) made it wrong past 1000 accounts.
    let existingIds: Map<string, string>
    try {
        existingIds = await resolveExistingUserIds(users.map(u => u.email))
    } catch (err: any) {
        return { success: false, message: `Could not check existing accounts: ${err.message}` }
    }

    // Captured outside the worker: the null-check narrowing above doesn't reach
    // into the closure.
    const invitedBy = user.id

    const rows: BulkInviteRowResult[] = new Array(users.length)
    let cursor = 0

    async function runWorker() {
        while (true) {
            const index = cursor++
            if (index >= users.length) return

            const u = users[index]
            const email = (u.email || '').trim()

            if (!email || !u.name) {
                rows[index] = {
                    email: email || `(row ${index + 1})`,
                    status: 'skipped',
                    error: 'Missing name or email'
                }
                continue
            }

            for (let attempt = 1; attempt <= INVITE_MAX_ATTEMPTS; attempt++) {
                try {
                    await inviteUserInternal({
                        email,
                        data: {
                            full_name: u.name,
                            organization_id: targetOrgId,
                            role: 'learner',
                            invited_by: invitedBy,
                            ...(u.department_id ? { department_id: u.department_id } : {})
                        },
                        existingUserId: existingIds.get(email.toLowerCase()) ?? null
                    })
                    rows[index] = { email, status: 'invited' }
                    break
                } catch (err: any) {
                    const message = err?.message ?? String(err)
                    if (attempt < INVITE_MAX_ATTEMPTS && isRetryableInviteError(message)) {
                        await sleep(500 * 2 ** (attempt - 1))
                        continue
                    }
                    rows[index] = { email, status: 'failed', error: message }
                    break
                }
            }
        }
    }

    await Promise.all(
        Array.from({ length: Math.min(INVITE_CONCURRENCY, users.length) }, runWorker)
    )

    const invited = rows.filter(r => r.status === 'invited').length
    const failed = rows.filter(r => r.status === 'failed').length
    const skipped = rows.filter(r => r.status === 'skipped').length

    return {
        success: true,
        message: `Processed ${users.length}. Invited ${invited}, failed ${failed}, skipped ${skipped}.`,
        details: {
            success: invited,
            failed,
            skipped,
            rows,
            errors: rows.filter(r => r.status !== 'invited').map(r => `${r.email}: ${r.error}`)
        }
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

    // The role now comes from a form any org admin can submit, so don't trust it.
    if (!isAssignableRole(role)) {
        return { success: false, message: 'Invalid role' }
    }

    try {
        if (role === 'admin' && await countOrgAdmins(targetOrgId) >= MAX_ADMINS_PER_ORG) {
            return { success: false, message: ADMIN_CAP_MESSAGE }
        }

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

const _getAdminStatsCached = unstable_cache(
    async (orgId: string) => {
        const supabase = createAdminClient()

        const { count: totalEmployees, error: countError } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)

        if (countError) return null

        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('module_id, modules(title), users!inner(organization_id)')
            .eq('is_completed', true)
            .eq('users.organization_id', orgId)

        if (progressError) return null

        const moduleCounts = new Map<string, number>()
        progressData?.forEach((p: any) => {
            const title = p.modules?.title || 'Unknown Module'
            moduleCounts.set(title, (moduleCounts.get(title) || 0) + 1)
        })

        const total = totalEmployees || 1
        const moduleStats = Array.from(moduleCounts.entries()).map(([name, count]) => ({
            name,
            percentage: Math.round((count / total) * 100)
        }))
        const avgCompletion = moduleStats.length > 0
            ? Math.round(moduleStats.reduce((acc, curr) => acc + curr.percentage, 0) / moduleStats.length)
            : 0

        const { data: expired } = await supabase
            .from('user_progress')
            .select('users!inner(display_name, email, organization_id), completed_at, modules(title)')
            .eq('users.organization_id', orgId)
            .eq('is_completed', true)
            .lt('completed_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

        return {
            totalEmployees: totalEmployees || 0,
            avgCompletion,
            certifiedUsers: 0,
            moduleStats: moduleStats.length > 0 ? moduleStats : [{ name: 'No Data', percentage: 0 }],
            expiredCertifications: expired?.map((r: any) => ({
                display_name: r.users?.display_name,
                email: r.users?.email,
                module_title: r.modules?.title || 'Unknown Module',
                completed_at: r.completed_at
            })) || []
        }
    },
    ['admin-stats'],
    { revalidate: 300 }
)

export async function getAdminStats() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return null

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin' || !userData?.organization_id) return null

    return _getAdminStatsCached(userData.organization_id)
}

// Core fetch — assumes the caller has already verified admin access to `orgId`.
// Split out so getAdminBootstrap can reuse it without repeating the auth preamble.
async function _fetchCompanyUsers(supabase: any, orgId: string) {
    // Fetch Members + Profiles + Progress in Parallel
    const [membersResult, profilesResult, progressResult] = await Promise.all([
        // A. Get Members IDs & Roles
        supabase
            .from('organization_members')
            .select('user_id, role')
            .eq('organization_id', orgId),

        // B. Get Public Profiles
        supabase
            .from('users')
            .select('id, display_name, email, role, department_id, departments(id, name)')
            .eq('organization_id', orgId),

        // C. Get Progress Counts — use admin client to bypass RLS (admin already verified above)
        createAdminClient()
            .from('user_progress')
            .select('user_id, users!inner(organization_id)')
            .eq('is_completed', true)
            .eq('users.organization_id', orgId)
    ])

    if (membersResult.error) {
        console.error('Members Fetch Error:', membersResult.error)
        return []
    }
    if (progressResult.error) {
        console.error('Progress Fetch Error:', progressResult.error)
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

export async function getCompanyUsers() {
    const supabase = await createClient()

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

    return _fetchCompanyUsers(supabase, userData.organization_id)
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
    if (!orgId) return null

    return _fetchOrgModules(supabase, orgId)
}

export type OrgModuleRow = {
    id: string
    title: string
    description: string | null
    sequence_order: number
    isAssigned: boolean
    allEmployees: boolean
    deptIds: string[]
    isLocked: boolean
    isAIPolicyModule: boolean
}

// Core fetch — assumes the caller has already verified admin access to `orgId`.
async function _fetchOrgModules(supabase: any, orgId: string): Promise<{
    modules: OrgModuleRow[]
    departments: { id: string; name: string }[]
}> {
    const allAITierIds = new Set(Object.values(AI_TIER_MODULE_IDS))

    const [modulesResult, assignedResult, deptModulesResult, deptsResult, locksResult, aiPolicyResult] = await Promise.all([
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
            .order('name', { ascending: true }),
        supabase
            .from('organization_module_locks')
            .select('module_id')
            .eq('organization_id', orgId),
        supabase
            .from('organization_ai_policy')
            .select('assigned_module_id')
            .eq('organization_id', orgId)
            .maybeSingle()
    ])

    const assignedAIModuleId: string | null = aiPolicyResult.data?.assigned_module_id ?? null

    const assignedSet = new Set(assignedResult.data?.map((a: any) => a.module_id) || [])
    const allEmployeesSet = new Set(
        (assignedResult.data || []).filter((a: any) => a.all_employees).map((a: any) => a.module_id)
    )
    const lockedSet = new Set(locksResult.data?.map((l: any) => l.module_id) || [])

    const deptAssignmentsMap = new Map<string, string[]>()
    for (const row of (deptModulesResult.data || [])) {
        const existing = deptAssignmentsMap.get(row.module_id) || []
        existing.push(row.department_id)
        deptAssignmentsMap.set(row.module_id, existing)
    }

    const modules = (modulesResult.data || [])
        .filter((m: any) => {
            // Hide AI tier modules that are not the one assigned by the current AI policy
            if (allAITierIds.has(m.id)) return m.id === assignedAIModuleId
            return true
        })
        .map((m: any) => ({
            ...m,
            isAssigned: assignedSet.has(m.id),
            allEmployees: allEmployeesSet.has(m.id),
            deptIds: deptAssignmentsMap.get(m.id) || [],
            isLocked: lockedSet.has(m.id),
            isAIPolicyModule: allAITierIds.has(m.id),
        }))

    return {
        modules,
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

    // Org admins cannot change the assignment state of a superadmin-locked module
    if (!isSuperAdmin) {
        const { data: lockRow } = await supabase
            .from('organization_module_locks')
            .select('module_id')
            .eq('organization_id', orgId!)
            .eq('module_id', moduleId)
            .maybeSingle()
        if (lockRow) {
            return { success: false, message: 'This module has been locked by a superadmin and cannot be changed.' }
        }
    }

    if (assign) {
        const { error } = await supabase
            .from('organization_modules')
            .upsert(
                { organization_id: orgId, module_id: moduleId, assigned_by: user.id },
                { onConflict: 'organization_id,module_id' }
            )
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

export async function toggleModuleLock(moduleId: string, lock: boolean, orgId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (!isSuperAdmin) return { success: false, message: 'Unauthorized: Superadmin only' }

    if (lock) {
        const { error } = await supabase
            .from('organization_module_locks')
            .upsert({ organization_id: orgId, module_id: moduleId, locked_by: user.id })
        if (error) return { success: false, message: error.message }
    } else {
        const { error } = await supabase
            .from('organization_module_locks')
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

    const orgId = userData.organization_id

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
        .eq('organization_id', orgId)

    if (progError) throw new Error(progError.message)

    // 3. Fetch Emails (Using Service Role for Auth Admin access if needed, assuming public.users has email)
    const { data: publicUsers } = await supabase.from('users').select('id, email').eq('organization_id', orgId)
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

const _getReportDataCached = unstable_cache(
    async (orgId: string, startDate?: string, endDate?: string) => {
        const supabase = createAdminClient()

        const [membersResult, progressResult, modulesResult, deptsResult, deadlinesResult] = await Promise.all([
            supabase.from('users')
                .select('id, display_name, email, department_id, departments(name)')
                .eq('organization_id', orgId),
            supabase.from('user_progress')
                .select('user_id, module_id, is_completed, quiz_score, completed_at, attempts, modules(title), users!inner(organization_id)')
                .eq('users.organization_id', orgId),
            supabase.from('organization_modules')
                .select('module_id, modules(title, sequence_order)')
                .eq('organization_id', orgId),
            supabase.from('departments')
                .select('id, name')
                .eq('organization_id', orgId)
                .order('name'),
            supabase.from('organization_module_deadlines')
                .select('module_id, due_date')
                .eq('organization_id', orgId),
        ])

        const members: any[] = membersResult.data || []
        const progress: any[] = progressResult.data || []
        const enabledModules: any[] = (modulesResult.data || [])
            .sort((a: any, b: any) => (a.modules?.sequence_order || 0) - (b.modules?.sequence_order || 0))
        const depts: any[] = deptsResult.data || []
        const deadlines: any[] = deadlinesResult.data || []
        const totalMembers = members.length || 1

        // Build O(1) lookup map: "userId:moduleId" → progress row
        const progressLookup = new Map<string, any>()
        progress.forEach((pr: any) => progressLookup.set(`${pr.user_id}:${pr.module_id}`, pr))

        // ── 1. Module Breakdown ──────────────────────────────────────────────
        const moduleBreakdown = enabledModules.map((om: any) => {
            const mid = om.module_id
            const title = om.modules?.title || 'Unknown'
            const shortTitle = title.length > 30 ? title.substring(0, 28) + '…' : title

            const moduleProgress = progress.filter((p: any) => p.module_id === mid)
            const completedUsers = new Set(moduleProgress.filter((p: any) => p.is_completed).map((p: any) => p.user_id))
            const inProgressUsers = new Set(moduleProgress.filter((p: any) => !p.is_completed).map((p: any) => p.user_id))
            const inProgressOnly = new Set([...inProgressUsers].filter(id => !completedUsers.has(id)))
            const notStarted = totalMembers - completedUsers.size - inProgressOnly.size
            const scores = moduleProgress.filter((p: any) => p.is_completed && p.quiz_score != null).map((p: any) => p.quiz_score)
            const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0

            const completedProgress = moduleProgress.filter((p: any) => p.is_completed)
            const totalAttemptSum = completedProgress.reduce((sum: number, p: any) => sum + (p.attempts || 1), 0)
            const avgAttempts = completedProgress.length > 0
                ? parseFloat((totalAttemptSum / completedProgress.length).toFixed(1))
                : null

            return {
                moduleId: mid, title, shortTitle,
                completed: completedUsers.size, inProgress: inProgressOnly.size,
                notStarted: Math.max(0, notStarted),
                completionRate: Math.round((completedUsers.size / totalMembers) * 100),
                avgScore, totalAttempts: moduleProgress.length, avgAttempts,
            }
        })

        // ── 2. Department Completion Rates ───────────────────────────────────
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

        // ── 3. Score Distribution per Module ────────────────────────────────
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

        // ── 4. Completion Timeline ───────────────────────────────────────────
        const now = new Date()
        const rangeStart = startDate ? new Date(startDate) : null
        const rangeEnd = endDate ? new Date(endDate + 'T23:59:59') : null
        const timelineEnd = rangeEnd ?? now
        const timelineStart = rangeStart ?? new Date(now.getTime() - 83 * 24 * 60 * 60 * 1000)
        const msDiff = timelineEnd.getTime() - timelineStart.getTime()
        const totalWeeks = Math.max(1, Math.ceil(msDiff / (7 * 24 * 60 * 60 * 1000)))
        const weeksToShow = Math.min(totalWeeks, 52)

        const weeks: { label: string, start: Date, end: Date }[] = []
        for (let i = weeksToShow - 1; i >= 0; i--) {
            const end = new Date(timelineEnd)
            end.setDate(end.getDate() - i * 7)
            const start = new Date(end)
            start.setDate(start.getDate() - 6)
            weeks.push({ label: `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`, start, end })
        }

        const timeline = weeks.map(w => ({
            week: w.label,
            completions: progress.filter((p: any) => {
                if (!p.is_completed || !p.completed_at) return false
                const d = new Date(p.completed_at)
                return d >= w.start && d <= w.end
            }).length
        }))

        // ── 5. Employee Matrix ───────────────────────────────────────────────
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
                const p = progressLookup.get(`${m.id}:${mod.id}`)  // O(1) lookup
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

        // ── 6. Summary KPIs ─────────────────────────────────────────────────
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

        const today = new Date()
        const overdueSet = new Set<string>()
        deadlines.forEach((dl: any) => {
            if (new Date(dl.due_date) < today) {
                members.forEach((m: any) => {
                    const done = progress.some((p: any) =>
                        p.user_id === m.id && p.module_id === dl.module_id && p.is_completed
                    )
                    if (!done) overdueSet.add(m.id)
                })
            }
        })

        return {
            summary: {
                totalMembers, totalModules: enabledModules.length, totalCompletions,
                uniqueStarted: new Set(progress.map((p: any) => p.user_id)).size,
                uniqueCompleted, overallAvgScore, fullyCompliant,
                fullyCompliantRate: Math.round((fullyCompliant / (totalMembers || 1)) * 100),
                overdueCount: overdueSet.size, hasDeadlines: deadlines.length > 0,
            },
            moduleBreakdown, deptBreakdown, scoreDistribution, timeline, moduleList, employeeMatrix,
        }
    },
    ['report-chart-data'],
    { revalidate: 300 }
)

export async function getReportChartData(opts?: { startDate?: string; endDate?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const { data: userData } = await supabase.from('users').select('organization_id, role').eq('id', user.id).single()
    if (!isSuperAdmin && (userData?.role !== 'admin' || !userData?.organization_id)) return null
    const orgId = userData?.organization_id
    if (!orgId) return null

    return _getReportDataCached(orgId, opts?.startDate, opts?.endDate)
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

export async function bulkAssignSelectedUsers(userIds: string[], departmentId: string) {
    if (!userIds.length) return { success: false, message: 'No users selected' }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (!isSuperAdmin) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (userData?.role !== 'admin') return { success: false, message: 'Unauthorized' }
    }
    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('users')
        .update({ department_id: departmentId })
        .in('id', userIds)
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
    return _fetchModuleDeadlines(supabase, orgId)
}

// Core fetch — assumes the caller has already verified admin access to `orgId`.
async function _fetchModuleDeadlines(supabase: any, orgId: string) {
    const { data } = await supabase
        .from('organization_module_deadlines')
        .select('module_id, due_date')
        .eq('organization_id', orgId)
    return (data || []) as { module_id: string; due_date: string }[]
}

export async function updateUserRole(userId: string, role: string, targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    if (!isAssignableRole(role)) return { success: false, message: 'Invalid role' }

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const adminClient = createAdminClient()

    const { data: targetUser } = await adminClient
        .from('users')
        .select('role, organization_id')
        .eq('id', userId)
        .single()

    if (!targetUser) return { success: false, message: 'User not found' }

    let orgId = targetUser.organization_id

    if (!isSuperAdmin) {
        const { data: callerData } = await supabase
            .from('users')
            .select('role, organization_id')
            .eq('id', user.id)
            .single()

        if (callerData?.role !== 'admin') return { success: false, message: 'Unauthorized' }

        // An org admin may only change roles for members of their own organization.
        // Without this the target is addressable by id alone, across tenants.
        if (!callerData.organization_id || callerData.organization_id !== targetUser.organization_id) {
            return { success: false, message: 'Unauthorized' }
        }
        orgId = callerData.organization_id

        if (userId === user.id) {
            return { success: false, message: 'You cannot change your own role. Ask another admin to do it.' }
        }
    } else if (targetOrgId && targetOrgId !== targetUser.organization_id) {
        return { success: false, message: 'User is not a member of that organization' }
    }

    if (!orgId) return { success: false, message: 'Could not determine organization' }

    try {
        // Promoting into a new admin seat — only if one is free.
        if (role === 'admin' && targetUser.role !== 'admin') {
            if (await countOrgAdmins(orgId, userId) >= MAX_ADMINS_PER_ORG) {
                return { success: false, message: ADMIN_CAP_MESSAGE }
            }
        }

        // Demoting the last admin would leave the org with nobody who can manage it.
        if (targetUser.role === 'admin' && role !== 'admin') {
            if (await countOrgAdmins(orgId, userId) === 0) {
                return { success: false, message: 'This is the only admin in the organization. Promote another user to admin first.' }
            }
        }
    } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : 'Could not verify the admin count' }
    }

    const { error } = await adminClient.from('users').update({ role }).eq('id', userId)
    if (error) return { success: false, message: error.message }
    // Keep organization_members.role in sync so RLS policies that check it stay consistent
    await adminClient
        .from('organization_members')
        .update({ role })
        .eq('user_id', userId)
        .eq('organization_id', orgId)
    return { success: true }
}

export async function revokeUserAccess(userId: string, targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    let orgId = targetOrgId

    if (!isSuperAdmin) {
        const { data: userData } = await supabase.from('users').select('role, organization_id').eq('id', user.id).single()
        if (userData?.role !== 'admin') return { success: false, message: 'Unauthorized' }
        orgId = userData.organization_id
    }

    const adminClient = createAdminClient()

    if (!orgId) {
        const { data: targetUser } = await adminClient.from('users').select('organization_id').eq('id', userId).single()
        orgId = targetUser?.organization_id
    }

    if (!orgId) return { success: false, message: 'Could not determine organization' }

    const { error: memberError } = await adminClient
        .from('organization_members')
        .delete()
        .eq('user_id', userId)
        .eq('organization_id', orgId)

    if (memberError) return { success: false, message: memberError.message }

    const { error: userError } = await adminClient
        .from('users')
        .update({ organization_id: null, department_id: null })
        .eq('id', userId)

    if (userError) return { success: false, message: userError.message }

    return { success: true }
}

// All four simulator flags live on the same `departments` row, so one query serves
// every per-department access list. Callers that need more than one must use this
// rather than issuing a query per flag.
type DeptAccessRow = {
    id: string
    name: string
    rpt_simulator_enabled: boolean
    posh_simulator_enabled: boolean
    breach_simulator_enabled: boolean
    board_checker_enabled: boolean
}

async function _fetchDeptAccess(supabase: any, orgId: string): Promise<DeptAccessRow[]> {
    const { data } = await supabase
        .from('departments')
        .select('id, name, rpt_simulator_enabled, posh_simulator_enabled, breach_simulator_enabled, board_checker_enabled')
        .eq('organization_id', orgId)
        .order('name', { ascending: true })
    return (data || []) as DeptAccessRow[]
}

// Departments plus every simulator access list, in a single round trip.
// Replaces the getDepartments + 4×getDept*Access fan-out on refresh paths.
export async function getDepartmentsWithAccess(targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return null

    const rows = await _fetchDeptAccess(supabase, orgId)
    return {
        departments: rows.map(d => ({ id: d.id, name: d.name })),
        rpt: rows,
        posh: rows,
        breach: rows,
        board: rows,
    }
}

export async function getDeptRptAccess(targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return []

    return _fetchDeptAccess(supabase, orgId)
}

export async function setDeptRptAccess(departmentId: string, enabled: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (!isSuperAdmin) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (userData?.role !== 'admin') return { success: false, message: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('departments')
        .update({ rpt_simulator_enabled: enabled })
        .eq('id', departmentId)
    if (error) return { success: false, message: error.message }
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// POSH SIMULATOR ACCESS
// ─────────────────────────────────────────────────────────────────────────────

export async function getDeptPoshSimulatorAccess(targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return []

    return _fetchDeptAccess(supabase, orgId)
}

export async function setDeptPoshSimulatorAccess(departmentId: string, enabled: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (!isSuperAdmin) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (userData?.role !== 'admin') return { success: false, message: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('departments')
        .update({ posh_simulator_enabled: enabled })
        .eq('id', departmentId)
    if (error) return { success: false, message: error.message }
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// BREACH SIMULATOR ACCESS
// ─────────────────────────────────────────────────────────────────────────────

export async function getDeptBreachSimulatorAccess(targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return []

    return _fetchDeptAccess(supabase, orgId)
}

export async function setDeptBreachSimulatorAccess(departmentId: string, enabled: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (!isSuperAdmin) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (userData?.role !== 'admin') return { success: false, message: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('departments')
        .update({ breach_simulator_enabled: enabled })
        .eq('id', departmentId)
    if (error) return { success: false, message: error.message }
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// BOARD CHECKER ACCESS
// ─────────────────────────────────────────────────────────────────────────────

export async function getDeptBoardCheckerAccess(targetOrgId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return []

    return _fetchDeptAccess(supabase, orgId)
}

export async function setDeptBoardCheckerAccess(departmentId: string, enabled: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (!isSuperAdmin) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (userData?.role !== 'admin') return { success: false, message: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('departments')
        .update({ board_checker_enabled: enabled })
        .eq('id', departmentId)
    if (error) return { success: false, message: error.message }
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI POLICY QUIZ
// ─────────────────────────────────────────────────────────────────────────────

type AIPolicyAnswers = {
    allow_invoices: boolean
    allow_specs: boolean
    allow_legal_docs: boolean
    allow_situational: boolean
}

const AI_TIER_MODULE_IDS = {
    tier1: '0000000a-0001-0000-0000-000000000001',
    tier2: '0000000b-0001-0000-0000-000000000001',
    tier3: '0000000c-0001-0000-0000-000000000001',
} as const

function determineAITier(a: AIPolicyAnswers): 1 | 2 | 3 {
    if (a.allow_legal_docs) return 3
    if (a.allow_invoices || a.allow_specs) return 2
    return 1
}

export async function getAIModuleTierIds() {
    return AI_TIER_MODULE_IDS
}

export async function saveAIPolicyQuiz(
    answers: AIPolicyAnswers,
    targetOrgId?: string
): Promise<{ success: boolean; message?: string; tier?: 1 | 2 | 3; moduleId?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return { success: false, message: 'Unauthorized' }

    const tier = determineAITier(answers)
    const moduleId = AI_TIER_MODULE_IDS[`tier${tier}` as keyof typeof AI_TIER_MODULE_IDS]

    const { error: policyError } = await supabase
        .from('organization_ai_policy')
        .upsert({
            organization_id: orgId,
            completed_by: user.id,
            ...answers,
            assigned_tier: tier,
            assigned_module_id: moduleId,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'organization_id' })

    if (policyError) return { success: false, message: policyError.message }

    // Remove the other two AI tier modules if previously assigned
    const otherModuleIds = Object.values(AI_TIER_MODULE_IDS).filter(id => id !== moduleId)
    for (const otherId of otherModuleIds) {
        await supabase
            .from('organization_modules')
            .delete()
            .eq('organization_id', orgId)
            .eq('module_id', otherId)
    }

    const assignResult = await setModuleAssignment(moduleId, true, orgId)
    if (!assignResult.success) return { success: false, message: assignResult.message }

    return { success: true, tier, moduleId }
}

export async function getAIPolicyStatus(targetOrgId?: string): Promise<{
    completed: boolean
    tier?: 1 | 2 | 3
    moduleId?: string
    moduleName?: string
    answers?: AIPolicyAnswers
} | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const orgId = await resolveOrgId(supabase, user.id, !!isSuperAdmin, targetOrgId)
    if (!orgId) return null

    return _fetchAIPolicyStatus(supabase, orgId)
}

// Core fetch — assumes the caller has already verified admin access to `orgId`.
async function _fetchAIPolicyStatus(supabase: any, orgId: string) {
    const { data, error } = await supabase
        .from('organization_ai_policy')
        .select(`
            assigned_tier,
            assigned_module_id,
            allow_invoices,
            allow_specs,
            allow_legal_docs,
            allow_situational,
            modules ( title )
        `)
        .eq('organization_id', orgId)
        .maybeSingle()

    if (error || !data) return { completed: false }

    return {
        completed: true,
        tier: data.assigned_tier as 1 | 2 | 3,
        moduleId: data.assigned_module_id,
        moduleName: (data as any).modules?.title,
        answers: {
            allow_invoices: data.allow_invoices,
            allow_specs: data.allow_specs,
            allow_legal_docs: data.allow_legal_docs,
            allow_situational: data.allow_situational,
        }
    }
}

export async function markGuideAsSeen() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Use service-role client to bypass RLS — no UPDATE policy exists for the users table
    const admin = createAdminClient()
    await admin.from('users').update({ has_seen_guide: true }).eq('id', user.id)
}

export async function getHasSeenGuide(): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return true
    const { data } = await supabase
        .from('users')
        .select('has_seen_guide')
        .eq('id', user.id)
        .single()
    return data?.has_seen_guide ?? false
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD BOOTSTRAP
// ─────────────────────────────────────────────────────────────────────────────

// Everything the admin dashboard needs on mount, in ONE server action.
//
// Why this exists: Next.js serializes Server Action requests from a client — they
// go through a single router action queue (see dispatchAppRouterAction), so a
// `Promise.all([...])` over N actions is N sequential HTTP round trips, not N
// parallel ones. The dashboard used to issue 10 of them plus 4 direct Supabase
// calls before it could paint. Everything below runs in one request, where
// Promise.all genuinely parallelizes, and auth is resolved exactly once.
export type AdminBootstrap =
    | { status: 'unauthenticated' }
    | { status: 'not-admin' }
    | { status: 'needs-settings' }
    | {
        status: 'ok'
        userId: string
        isSuperAdmin: boolean
        hasSeenGuide: boolean
        planTier: PlanTier
        planExpired: boolean
        orgs: { id: string; name: string }[]
        stats: any
        users: any[]
        modules: any[]
        departments: { id: string; name: string }[]
        deptAccess: DeptAccessRow[]
        deadlines: { module_id: string; due_date: string }[]
        aiPolicy: any
    }

export async function getAdminBootstrap(targetOrgId?: string): Promise<AdminBootstrap> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { status: 'unauthenticated' }

    // Caller identity, superadmin flag and guide flag — resolved once, reused throughout.
    const [{ data: isSuperAdminRaw }, { data: callerData }] = await Promise.all([
        supabase.rpc('is_super_admin'),
        supabase
            .from('users')
            .select('organization_id, role, has_seen_guide')
            .eq('id', user.id)
            .single(),
    ])

    const isSuperAdmin = !!isSuperAdminRaw

    // Matches the pre-existing gate: the admin dashboard requires users.role === 'admin'
    // for everyone, superadmins included. Superadmin status only widens what is shown
    // (plan tier, the org switcher, skipping the first-run settings redirect).
    if (callerData?.role !== 'admin') return { status: 'not-admin' }

    const orgId = targetOrgId || callerData?.organization_id
    if (!orgId) return { status: 'not-admin' }

    // Org-level gating. Superadmins bypass the first-run settings redirect and
    // always get full feature access in the admin view.
    const { data: orgCheck } = await supabase
        .from('organizations')
        .select('settings_completed, plan_tier, plan_expires_at')
        .eq('id', orgId)
        .single()

    if (!isSuperAdmin && orgCheck && !orgCheck.settings_completed) {
        return { status: 'needs-settings' }
    }

    const planTier: PlanTier = isSuperAdmin
        ? 'enterprise'
        : ((orgCheck?.plan_tier as PlanTier) ?? 'essentials')
    const planExpired = !isSuperAdmin && !!orgCheck?.plan_expires_at
        && new Date(orgCheck.plan_expires_at) < new Date()

    // The real payload. These are independent queries inside a single request,
    // so Promise.all actually runs them concurrently here.
    const [stats, users, orgModules, deadlines, deptAccess, aiPolicy, orgs] = await Promise.all([
        _getAdminStatsCached(orgId),
        _fetchCompanyUsers(supabase, orgId),
        _fetchOrgModules(supabase, orgId),
        _fetchModuleDeadlines(supabase, orgId),
        _fetchDeptAccess(supabase, orgId),
        _fetchAIPolicyStatus(supabase, orgId),
        isSuperAdmin
            ? supabase.from('organizations').select('id, name').order('name').then((r: any) => r.data || [])
            : Promise.resolve([]),
    ])

    return {
        status: 'ok',
        userId: user.id,
        isSuperAdmin,
        hasSeenGuide: callerData?.has_seen_guide ?? false,
        planTier,
        planExpired,
        orgs,
        stats,
        users: users || [],
        modules: orgModules?.modules || [],
        departments: orgModules?.departments || [],
        deptAccess,
        deadlines,
        aiPolicy,
    }
}

export async function getAdminModuleQuestions(moduleId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (!isSuperAdmin) {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
        if (userData?.role !== 'admin') return []
    }

    const admin = createAdminClient()
    const { data } = await admin
        .from('questions')
        .select('id, text, slide_group, answers(id)')
        .eq('module_id', moduleId)
        .order('created_at', { ascending: true })

    return (data ?? []).map((q: any) => ({
        id: q.id,
        text: q.text,
        slide_group: q.slide_group ?? null,
        answer_count: q.answers?.length ?? 0,
    }))
}

export async function updateQuestionSlideGroup(questionId: string, slideGroup: number | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false }

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (!isSuperAdmin) {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
        if (userData?.role !== 'admin') return { success: false }
    }

    const admin = createAdminClient()
    const { error } = await admin
        .from('questions')
        .update({ slide_group: slideGroup })
        .eq('id', questionId)

    return { success: !error }
}
