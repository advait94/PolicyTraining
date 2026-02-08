import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        // Next.js 15: cookies() must be awaited
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )

        // 1. DO NOT Sign out here. It clears the cookies needed for PKCE exchange!
        // await supabase.auth.signOut()

        // 2. Exchange code for session on THIS response
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && session) {
            console.log('Auth Callback: Session established for', session.user.email)
            const email = session.user.email ? encodeURIComponent(session.user.email) : ''
            const finalRedirect = `${origin}${next}${next.includes('?') ? '&' : '?'}email=${email}`
            console.log('Auth Callback: Redirecting to', finalRedirect)
            return NextResponse.redirect(finalRedirect)
        } else if (error) {
            console.error('Auth Callback: Exchange failed', error)
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed&error_description=${encodeURIComponent(error.message)}`)
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=missing_code&${searchParams.toString()}`)
}
