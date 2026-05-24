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

    // getUser() validates the token server-side (one network call) and calls setAll
    // if a refresh happened — updating request.cookies with the new token.
    const { data: { user } } = await supabase.auth.getUser()

    // Protected Routes Logic
    if (user) {
        // Skip check for auth-related paths and public assets
        const path = request.nextUrl.pathname
        if (
            path.startsWith('/auth') ||
            path.startsWith('/login') ||
            path === '/unauthorized' ||
            path === '/inactive' ||
            path.startsWith('/_next') ||
            path.startsWith('/api') ||   // API routes handle their own auth; skip org/plan DB checks
            // Only skip specific static assets, NOT all files (so .html pages are protected)
            path.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
        ) {
            return response
        }

        // ── Fast path: read JWT claims directly from cookies (synchronous, zero network calls) ──
        // getUser() above already refreshed the token if needed — request.cookies now has
        // the up-to-date JWT. readJWTClaimsFromCookies() parses it synchronously;
        // no getSession() call needed (which would trigger another Auth API round-trip).
        const jwtClaims = readJWTClaimsFromCookies(request.cookies.getAll())

        const claimedOrgId    = jwtClaims?.app_metadata?.org_id    as string | undefined
        const claimedPlanTier = jwtClaims?.app_metadata?.plan_tier  as string | undefined
        const claimedExpiry   = jwtClaims?.app_metadata?.plan_expires_at as string | undefined

        if (claimedOrgId) {
            // Zero DB queries — org and plan data came from the JWT
            const hasActivePlan =
                claimedPlanTier != null &&
                (!claimedExpiry || new Date(claimedExpiry) > new Date())

            if (!hasActivePlan) {
                const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
                if (!isSuperAdmin) {
                    return NextResponse.redirect(new URL('/inactive', request.url))
                }
            }
        } else {
            // ── Slow path: DB fallback for sessions issued before the hook was enabled ──
            const { data: membership } = await supabase
                .from('organization_members')
                .select('organization_id')
                .eq('user_id', user.id)
                .single()

            if (!membership) {
                console.warn('Middleware: User has no organization, redirecting to unauthorized', user.email)
                return NextResponse.redirect(new URL('/unauthorized', request.url))
            }

            const { data: org } = await supabase
                .from('organizations')
                .select('plan_tier, plan_expires_at')
                .eq('id', membership.organization_id)
                .single()

            const hasActivePlan =
                org?.plan_tier != null &&
                (!org.plan_expires_at || new Date(org.plan_expires_at) > new Date())

            if (!hasActivePlan) {
                const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
                if (!isSuperAdmin) {
                    return NextResponse.redirect(new URL('/inactive', request.url))
                }
            }
        }
    } else {
        // Optional: Redirect unauthenticated users trying to access protected routes to login
        // For now, we leave existing behavior (pages likely handle it or we add it here)
        const path = request.nextUrl.pathname

        // DEBUG LOGGING
        if (path.startsWith('/auth/update-password')) {
            console.log('Middleware: Unauthenticated access to update-password. User is null. Cookies:', request.cookies.getAll().map(c => c.name))
        }

        if (path.startsWith('/admin') || path.startsWith('/dashboard') || path.startsWith('/modules')) {
            console.log('Middleware: Redirecting unauthenticated user to login from:', path)
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return response
}

// Reads the Supabase auth cookie from request cookies and decodes the JWT payload.
// Handles both chunked (sb-xxx-auth-token.0/.1) and non-chunked cookie formats.
// Called after getUser() so the cookie reflects any token refresh that occurred.
function readJWTClaimsFromCookies(cookies: { name: string; value: string }[]): Record<string, any> | null {
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL
        ?.replace(/^https?:\/\//, '')
        ?.replace(/\.supabase\.co.*$/, '')
    if (!projectRef) return null

    const cookieName = `sb-${projectRef}-auth-token`
    let accessToken: string | null = null

    // Non-chunked cookie
    const direct = cookies.find(c => c.name === cookieName)
    if (direct?.value) {
        try {
            const session = JSON.parse(direct.value)
            accessToken = session.access_token ?? null
        } catch { /* malformed cookie */ }
    }

    // Chunked cookies (.0, .1, …) — reassemble then parse
    if (!accessToken) {
        const chunks: string[] = []
        for (let i = 0; ; i++) {
            const chunk = cookies.find(c => c.name === `${cookieName}.${i}`)
            if (!chunk) break
            chunks.push(chunk.value)
        }
        if (chunks.length > 0) {
            try {
                const session = JSON.parse(chunks.join(''))
                accessToken = session.access_token ?? null
            } catch { /* malformed chunks */ }
        }
    }

    if (!accessToken) return null

    // Decode JWT payload (base64url → JSON)
    try {
        const payload = accessToken.split('.')[1]
        if (!payload) return null
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(normalized))
    } catch {
        return null
    }
}
