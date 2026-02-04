import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Get all orgs
    const { data: orgs } = await supabase.from('organizations').select('*')

    // 2. Update the first one or the one with empty name
    if (orgs && orgs.length > 0) {
        const targetOrg = orgs[0] // Assuming there's only one as user said

        const { data, error } = await supabase
            .from('organizations')
            .update({ name: 'AA Plus' })
            .eq('id', targetOrg.id)
            .select()

        return NextResponse.json({
            success: true,
            message: 'Updated organization',
            old: targetOrg,
            new: data,
            error
        })
    }

    return NextResponse.json({ success: false, message: 'No organizations found' })
}
