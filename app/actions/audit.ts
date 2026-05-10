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

export async function getAuditLog(targetUserId?: string, targetModuleId?: string) {
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

    // For non-superadmins, get org member IDs first then filter
    let orgUserIds: string[] | null = null
    if (!isSuperAdmin && userData?.organization_id) {
        const { data: members } = await supabase
            .from('users')
            .select('id')
            .eq('organization_id', userData.organization_id)
        orgUserIds = members?.map((m: any) => m.id) ?? []
    }

    let query = supabase
        .from('activity_log')
        .select(`
            id,
            user_id,
            event_type,
            metadata,
            created_at,
            users ( display_name, email ),
            modules ( title ),
            slides ( title )
        `)
        .order('created_at', { ascending: false })
        .limit(500)

    if (targetUserId) query = query.eq('user_id', targetUserId)
    if (targetModuleId) query = query.eq('module_id', targetModuleId)
    if (orgUserIds) query = query.in('user_id', orgUserIds.length > 0 ? orgUserIds : [''])

    const { data, error } = await query
    if (error) {
        console.error('getAuditLog error:', error)
        return null
    }

    return data?.map((row: any) => ({
        id: row.id,
        eventType: row.event_type,
        metadata: row.metadata,
        createdAt: row.created_at,
        userName: row.users?.display_name || 'Unknown',
        userEmail: row.users?.email || '',
        moduleTitle: row.modules?.title || '',
        slideTitle: row.slides?.title || null,
    })) ?? []
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
