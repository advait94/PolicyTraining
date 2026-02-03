import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected Routes Logic
    if (user) {
        // Skip check for auth-related paths and public assets
        const path = request.nextUrl.pathname
        if (
            path.startsWith('/auth') ||
            path.startsWith('/login') ||
            path === '/unauthorized' ||
            path.startsWith('/_next') ||
            // Only skip specific static assets, NOT all files (so .html pages are protected)
            path.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
        ) {
            return response
        }

        // Check organization membership
        // We use a lightweight check. effectively caching could be better but this is safe default.
        const { data: membership } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .single()

        if (!membership) {
            // User is "Homeless"
            console.warn('Middleware: User has no organization, redirecting to unauthorized', user.email)
            return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
    } else {
        // Optional: Redirect unauthenticated users trying to access protected routes to login
        // For now, we leave existing behavior (pages likely handle it or we add it here)
        const path = request.nextUrl.pathname
        if (path.startsWith('/admin') || path.startsWith('/dashboard') || path.startsWith('/modules')) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return response
}
