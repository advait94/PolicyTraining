'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

function CallbackContent() {
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
            if (code) {
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
                if (exchangeError) {
                    setError(exchangeError.message)
                    return
                }
            } else {
                // 2. Handle Implicit Flow (Hash Fragment)
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    setError(sessionError.message)
                    return
                }

                if (!session) {
                    // Optimization: check if there's a hash
                    if (window.location.hash && window.location.hash.includes('access_token')) {
                        // Let Supabase process it (it does on init)
                    } else {
                        setError('No authorization code or token found.')
                        return
                    }
                }
            }

            // 3. Successful Exchange/Session
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

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        }>
            <CallbackContent />
        </Suspense>
    )
}
