'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AuthSync() {
    const supabase = createClient()

    useEffect(() => {
        const syncSession = async () => {
            // Get current session from the Cookie-based client
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                // Manually write to LocalStorage where static pages expect it
                // Key format: sb-<project-ref>-auth-token
                // Project Ref: iamactvdegcjfwtmjvaj (from public/supabase-config.js)
                const key = 'sb-iamactvdegcjfwtmjvaj-auth-token'
                localStorage.setItem(key, JSON.stringify(session))
                console.log('Session synced to LocalStorage for legacy modules')
            }
        }

        syncSession()
    }, [supabase])

    return null
}
