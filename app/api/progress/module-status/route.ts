import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ sectionsRead: [], quizCompleted: false, attempts: 0, certificateId: null, completedAt: null })
    }

    const moduleSlug = req.nextUrl.searchParams.get('module')
    const moduleId   = req.nextUrl.searchParams.get('moduleId')

    if (!moduleSlug) return NextResponse.json({ error: 'Missing module parameter' }, { status: 400 })

    const [sectionsRes, quizRes] = await Promise.all([
        supabase
            .from('section_progress')
            .select('section_num')
            .eq('user_id', user.id)
            .eq('module_slug', moduleSlug),
        moduleId
            ? supabase
                .from('user_progress')
                .select('is_completed, attempts, certificate_id, completed_at')
                .eq('user_id', user.id)
                .eq('module_id', moduleId)
                .maybeSingle()
            : Promise.resolve({ data: null }),
    ])

    const quiz = quizRes.data

    return NextResponse.json({
        sectionsRead:  sectionsRes.data?.map(r => r.section_num) ?? [],
        quizCompleted: quiz?.is_completed  ?? false,
        attempts:      quiz?.attempts      ?? 0,
        certificateId: quiz?.certificate_id ?? null,
        completedAt:   quiz?.completed_at  ?? null,
    })
}
