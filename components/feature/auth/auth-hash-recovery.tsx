'use client'

import { useEffect } from 'react'

/**
 * Defensive catch-all for magic-link sessions that land on /login (or /).
 *
 * A Supabase magic link puts the session in the URL hash (#access_token=...).
 * If its redirect_to ever falls back to the Site URL root — e.g. because
 * NEXT_PUBLIC_APP_URL / the Redirect-URL allow-list is misconfigured — the
 * tokens end up on /login, where the form would otherwise ignore them and the
 * user appears "stuck at login". Here we detect that hash and forward it to
 * /auth/implicit, which owns session establishment and the invite /
 * force_password_setup routing. Harmless when there's no auth hash.
 */
export function AuthHashRecovery() {
    useEffect(() => {
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
            const target = `/auth/implicit${window.location.search}${hash}`
            window.location.replace(target)
        }
    }, [])

    return null
}
