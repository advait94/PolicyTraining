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

    // Upsert all sections from 1 to sectionNum so that reaching section N
    // counts as having read all prior sections (handles skipped/direct navigation).
    const rows = Array.from({ length: sectionNum }, (_, i) => ({
        user_id:     user.id,
        module_slug: moduleSlug,
        section_num: i + 1,
    }))

    const { error } = await supabase
        .from('section_progress')
        .upsert(rows, { onConflict: 'user_id,module_slug,section_num', ignoreDuplicates: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
