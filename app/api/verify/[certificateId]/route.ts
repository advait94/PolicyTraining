import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ certificateId: string }> }
) {
    const { certificateId } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('user_progress')
        .select(`
            quiz_score,
            completed_at,
            is_completed,
            users ( display_name ),
            modules ( title )
        `)
        .eq('certificate_id', certificateId)
        .maybeSingle()

    if (error || !data || !data.is_completed) {
        return NextResponse.json({ status: 'invalid' }, { headers: corsHeaders })
    }

    const completedAt = new Date(data.completed_at)
    const validUntil = new Date(completedAt)
    validUntil.setFullYear(validUntil.getFullYear() + 1)

    const expired = new Date() > validUntil
    const users = Array.isArray(data.users) ? data.users[0] : data.users
    const modules = Array.isArray(data.modules) ? data.modules[0] : data.modules

    return NextResponse.json({
        status: expired ? 'expired' : 'valid',
        holderName: users?.display_name ?? 'Unknown',
        moduleName: modules?.title ?? 'Unknown',
        completedAt: completedAt.toISOString(),
        validUntil: validUntil.toISOString(),
        quizScore: data.quiz_score,
        issuedBy: 'AA Plus Consultants',
    }, { headers: corsHeaders })
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
    })
}
