'use server'

import { createClient } from '@/lib/supabase/server'

export async function logActivity(
    moduleId: string,
    eventType: 'quiz_started' | 'quiz_completed' | 'attestation_signed',
    metadata?: Record<string, unknown>
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('activity_log').insert({
            user_id: user.id,
            module_id: moduleId,
            event_type: eventType,
            metadata: metadata ?? null,
        })
    } catch {
        // Audit logging is non-critical — never throw to caller
    }
}

export interface AuditLogOpts {
    page?: number
    pageSize?: number
    startDate?: string
    endDate?: string
    eventType?: string
    targetUserId?: string
    targetModuleId?: string
}

function mapAuditRow(row: any) {
    return {
        id: row.id,
        eventType: row.event_type,
        metadata: row.metadata,
        createdAt: row.created_at,
        userName: row.users?.display_name || 'Unknown',
        userEmail: row.users?.email || '',
        moduleTitle: row.modules?.title || '',
        slideTitle: row.slides?.title || null,
    }
}

/**
 * Builds the base activity_log select, scoped to a single organization.
 *
 * Scoping happens through an inner join on `users` rather than by fetching the
 * org's user ids and passing them to `.in('user_id', …)`. PostgREST selects go
 * over GET, so an org with a couple of thousand people turned that filter into
 * a ~72KB query string and the request was rejected before it reached the
 * database — the audit trail read as empty for exactly the large orgs that
 * needed it most. RLS enforces the same boundary; this filter is belt-and-braces.
 */
function auditQuery(supabase: any, orgId: string | null) {
    const usersEmbed = orgId ? 'users!inner ( display_name, email )' : 'users ( display_name, email )'

    const query = supabase
        .from('activity_log')
        .select(`
            id, user_id, event_type, metadata, created_at,
            ${usersEmbed},
            modules ( title ),
            slides ( title )
        `)
        .order('created_at', { ascending: false })

    return orgId ? query.eq('users.organization_id', orgId) : query
}

export async function getAuditLog(opts: AuditLogOpts = {}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!isSuperAdmin && userData?.role !== 'admin') return null

    const page = opts.page ?? 0
    const pageSize = opts.pageSize ?? 100

    // A non-super-admin with no org has nobody to audit; don't fall through unscoped.
    if (!isSuperAdmin && !userData?.organization_id) {
        return { data: [], hasMore: false, page }
    }

    let query = auditQuery(supabase, isSuperAdmin ? null : userData!.organization_id)
        .range(page * pageSize, (page + 1) * pageSize) // +1 to detect hasMore

    if (opts.targetUserId) query = query.eq('user_id', opts.targetUserId)
    if (opts.targetModuleId) query = query.eq('module_id', opts.targetModuleId)
    if (opts.eventType) query = query.eq('event_type', opts.eventType)
    if (opts.startDate) query = query.gte('created_at', opts.startDate)
    if (opts.endDate) query = query.lte('created_at', opts.endDate + 'T23:59:59')

    const { data, error } = await query
    if (error) {
        console.error('getAuditLog error:', error)
        return { data: [], hasMore: false, page, error: error.message || 'Could not load the audit trail' }
    }

    const hasMore = (data?.length ?? 0) > pageSize
    return {
        data: (data?.slice(0, pageSize) ?? []).map(mapAuditRow),
        hasMore,
        page,
    }
}

export async function exportAuditLog(opts: Pick<AuditLogOpts, 'startDate' | 'endDate' | 'eventType'> = {}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!isSuperAdmin && userData?.role !== 'admin') return null

    if (!isSuperAdmin && !userData?.organization_id) return []

    let query = auditQuery(supabase, isSuperAdmin ? null : userData!.organization_id)
        .limit(5000)

    if (opts.eventType) query = query.eq('event_type', opts.eventType)
    if (opts.startDate) query = query.gte('created_at', opts.startDate)
    if (opts.endDate) query = query.lte('created_at', opts.endDate + 'T23:59:59')

    const { data, error } = await query
    if (error) {
        console.error('exportAuditLog error:', error)
        return null
    }

    return (data ?? []).map(mapAuditRow)
}

export async function getBulkCertificates(moduleId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin' || !userData?.organization_id) return null

    const { data, error } = await supabase
        .from('user_progress')
        .select(`
            certificate_id,
            completed_at,
            quiz_score,
            attestation_accepted,
            users!inner ( id, display_name, email, organization_id ),
            modules ( title )
        `)
        .eq('module_id', moduleId)
        .eq('is_completed', true)
        .eq('users.organization_id', userData.organization_id)

    if (error) return null

    return data?.map((row: any) => ({
        userId: row.users?.id,
        userName: row.users?.display_name || 'Unknown',
        userEmail: row.users?.email || '',
        moduleId,
        moduleTitle: row.modules?.title || '',
        certificateId: row.certificate_id,
        completedAt: row.completed_at,
        quizScore: row.quiz_score,
        attestationAccepted: row.attestation_accepted,
    })) ?? []
}
