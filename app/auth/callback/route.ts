import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Check if this was a recovery or invite flow that requires password reset
            // We can check if the user has a "recovery" event type, but broadly:
            // If we want to force password set on strict invite, redirect to update-password
            // For now, let's redirect to update-password if it's an invite flow essentially

            return NextResponse.redirect(`${origin}/auth/update-password`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
