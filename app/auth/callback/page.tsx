'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleAuth = async () => {
            const next = searchParams.get('next') ?? '/dashboard'
            const code = searchParams.get('code')
            const error = searchParams.get('error')
            const error_description = searchParams.get('error_description')

            if (error) {
                setError(error_description || error)
                return
            }

            const supabase = createBrowserClient()

            // 1. Handle PKCE Code exchange (if code exists)
            // Note: client-side exchange sets the cookies via fetch to middleware/server??
            // Actually, newer supabase-ssr client handles cookie syncing automatically?
            // Wait, createBrowserClient uses cookies-next or similar logic?
            // Usually, client exchange sets cookies visible to server.

            if (code) {
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
                if (exchangeError) {
                    setError(exchangeError.message)
                    return
                }
            } else {
                // 2. Handle Implicit Flow (Hash Fragment)
                // supabase.auth.getSession() usually parses the hash automatically on load in client components
                // and sets the session.
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    setError(sessionError.message)
                    return
                }

                if (!session) {
                    // If no code and no session, and no error, maybe just wait or fail?
                    // It might be that getSession is async and hash parsing happens.
                    // But typically, if we land here without code, we rely on supabase-js handling hash.

                    // Optimization: check if there's a hash
                    if (window.location.hash && window.location.hash.includes('access_token')) {
                        // Let Supabase process it (it does on init)
                        // We might need to wait for onAuthStateChange
                    } else {
                        // No code, no hash?
                        setError('No authorization code or token found.')
                        return
                    }
                }
            }

            // 3. Successful Exchange/Session
            // Force a hard refresh or router push to the next page to ensure cookies are sent
            router.push(next)
            router.refresh()
        }

        handleAuth()
    }, [router, searchParams])

    if (error) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#151A29]/80 border border-red-500/20 rounded-lg p-6 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Authentication Error</h2>
                    <p className="text-slate-300">{error}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                <p className="text-slate-400 animate-pulse">Completing sign in...</p>
            </div>
        </div>
    )
}
