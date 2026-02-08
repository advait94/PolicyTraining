import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const { searchParams, origin } = requestUrl
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    // If there is an error parameter, forward it to the error/implicit page
    if (error) {
        return NextResponse.redirect(`${origin}/auth/implicit?error=${error}&error_description=${encodeURIComponent(error_description || '')}`)
    }

    if (code) {
        // 1. PKCE Flow (Azure, Standard Magic Link)
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

        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && session) {
            // Forward email param if present (critical for session crossover detection)
            let destination = `${origin}${next}`
            const emailParam = searchParams.get('email') || session.user.email

            // Check if this is an invite flow (from metadata)
            if (session.user.user_metadata?.is_invite) {
                destination = `${origin}/auth/update-password`
            }

            // Check if destination path is absolute or relative
            // Actually, 'next' usually is relative e.g. /dashboard

            if (emailParam) {
                const separator = destination.includes('?') ? '&' : '?'
                // Prevent duplicate email params if next already has it
                if (!destination.includes('email=')) {
                    destination = `${destination}${separator}email=${encodeURIComponent(emailParam || '')}`
                }
            }

            return NextResponse.redirect(destination)
        } else {
            // Exchange failed
            return NextResponse.redirect(`${origin}/auth/implicit?error=exchange_failed&error_description=${encodeURIComponent(error?.message || 'Unknown error')}`)
        }
    }

    // 2. Implicit Flow (No Code) / Fallback
    // If no code, we assume it's an Implicit flow (Hash Fragment).
    // The Hash is NOT sent to the server, so we redirect to the client page.
    // The browser will preserve the hash fragment across the redirect.
    // We forward all search params (like next, email) to the implicit handler.

    // Construct the new URL maintaining query params
    const explicitUrl = new URL(`${origin}/auth/implicit`)
    searchParams.forEach((value, key) => {
        explicitUrl.searchParams.set(key, value)
    })

    return NextResponse.redirect(explicitUrl)
}
