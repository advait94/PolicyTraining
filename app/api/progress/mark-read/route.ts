import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { moduleSlug, sectionNum } = await req.json()

    if (!moduleSlug || !sectionNum) {
        return NextResponse.json({ error: 'Missing moduleSlug or sectionNum' }, { status: 400 })
    }

    const { error } = await supabase
        .from('section_progress')
        .upsert(
            { user_id: user.id, module_slug: moduleSlug, section_num: sectionNum },
            { onConflict: 'user_id,module_slug,section_num', ignoreDuplicates: true }
        )

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
