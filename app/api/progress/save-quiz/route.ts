import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { moduleId, score, passed, completionDate } = await req.json()

    if (!moduleId) return NextResponse.json({ error: 'Missing moduleId' }, { status: 400 })

    const { data: current } = await supabase
        .from('user_progress')
        .select('attempts, certificate_id')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .maybeSingle()

    const newAttempts   = (current?.attempts ?? 0) + 1
    const certificateId = passed ? (current?.certificate_id ?? crypto.randomUUID()) : undefined

    const payload: Record<string, unknown> = {
        user_id:      user.id,
        module_id:    moduleId,
        quiz_score:   score,
        is_completed: passed,
        completed_at: completionDate ?? new Date().toISOString(),
        attempts:     newAttempts,
    }
    if (certificateId) payload.certificate_id = certificateId

    const { error } = await supabase
        .from('user_progress')
        .upsert(payload, { onConflict: 'user_id,module_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, certificateId: certificateId ?? null, attempts: newAttempts })
}
