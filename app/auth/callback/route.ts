import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

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
            // --- USER SYNC ---
            // Ensure user exists in public.users (handles SSO users who bypass invite trigger)
            try {
                const adminClient = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                )

                // Check if user exists in public.users
                const { data: existingUser } = await adminClient
                    .from('users')
                    .select('id, organization_id')
                    .eq('id', session.user.id)
                    .single()

                if (!existingUser) {
                    // User not in public.users - check for pending invitation
                    const { data: invite } = await adminClient
                        .from('invitations')
                        .select('*')
                        .eq('email', session.user.email?.toLowerCase())
                        .eq('status', 'pending')
                        .limit(1)
                        .single()

                    if (invite) {
                        // Complete the invitation handshake
                        const displayName = session.user.user_metadata?.full_name ||
                            session.user.user_metadata?.name ||
                            session.user.email?.split('@')[0] || 'User'

                        await adminClient.from('users').upsert({
                            id: session.user.id,
                            email: session.user.email,
                            display_name: displayName,
                            role: invite.role || 'learner',
                            organization_id: invite.organization_id
                        }, { onConflict: 'id' })

                        await adminClient.from('organization_members').upsert({
                            organization_id: invite.organization_id,
                            user_id: session.user.id,
                            role: invite.role || 'member'
                        }, { onConflict: 'organization_id,user_id' })

                        await adminClient.from('invitations')
                            .update({ status: 'accepted' })
                            .eq('id', invite.id)

                        console.log(`[callback] Synced SSO user ${session.user.email} to org ${invite.organization_id}`)
                    } else {
                        console.log(`[callback] No invitation found for SSO user ${session.user.email}`)
                    }
                }
            } catch (syncError) {
                console.error('[callback] User sync error:', syncError)
                // Non-fatal, continue to redirect
            }
            // --- END USER SYNC ---

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
