'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AuthSync() {
    const supabase = createClient()

    useEffect(() => {
        // Listen for auth state changes - this is the primary mechanism
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('AuthSync: Auth state changed:', event)

            // Function to find the dynamic auth token key
            const getAuthKey = () => {
                return Object.keys(localStorage).find(key => key.includes('auth-token') || key.startsWith('sb-'))
            }

            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
                // Sync session to localStorage for static pages
                // We try to find existing key or use a reasonable default if not found
                const key = getAuthKey() || `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0]}-auth-token`
                localStorage.setItem(key, JSON.stringify(session))
                console.log('AuthSync: Session synced to LocalStorage')
            } else if (event === 'SIGNED_OUT') {
                // Clear all potential auth keys from localStorage
                Object.keys(localStorage).forEach(key => {
                    if (key.includes('auth-token') || key.startsWith('sb-')) {
                        localStorage.removeItem(key)
                    }
                })
                console.log('AuthSync: Session cleared from LocalStorage on signout')
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase])

    return null
}
