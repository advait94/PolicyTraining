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

async function getOrgUserIds(supabase: any, isSuperAdmin: boolean, userData: any): Promise<string[] | null> {
    if (isSuperAdmin || !userData?.organization_id) return null
    const { data: members } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', userData.organization_id)
    return members?.map((m: any) => m.id) ?? []
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

    const orgUserIds = await getOrgUserIds(supabase, !!isSuperAdmin, userData)

    const page = opts.page ?? 0
    const pageSize = opts.pageSize ?? 100

    // Fetch one extra row to detect if there's a next page
    let query = supabase
        .from('activity_log')
        .select(`
            id, user_id, event_type, metadata, created_at,
            users ( display_name, email ),
            modules ( title ),
            slides ( title )
        `)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize) // +1 to detect hasMore

    if (opts.targetUserId) query = query.eq('user_id', opts.targetUserId)
    if (opts.targetModuleId) query = query.eq('module_id', opts.targetModuleId)
    if (opts.eventType) query = query.eq('event_type', opts.eventType)
    if (opts.startDate) query = query.gte('created_at', opts.startDate)
    if (opts.endDate) query = query.lte('created_at', opts.endDate + 'T23:59:59')
    if (orgUserIds) query = query.in('user_id', orgUserIds.length > 0 ? orgUserIds : ['__none__'])

    const { data, error } = await query
    if (error) {
        console.error('getAuditLog error:', error)
        return null
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

    const orgUserIds = await getOrgUserIds(supabase, !!isSuperAdmin, userData)

    let query = supabase
        .from('activity_log')
        .select(`
            id, user_id, event_type, metadata, created_at,
            users ( display_name, email ),
            modules ( title ),
            slides ( title )
        `)
        .order('created_at', { ascending: false })
        .limit(5000)

    if (opts.eventType) query = query.eq('event_type', opts.eventType)
    if (opts.startDate) query = query.gte('created_at', opts.startDate)
    if (opts.endDate) query = query.lte('created_at', opts.endDate + 'T23:59:59')
    if (orgUserIds) query = query.in('user_id', orgUserIds.length > 0 ? orgUserIds : ['__none__'])

    const { data, error } = await query
    if (error) return null

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
