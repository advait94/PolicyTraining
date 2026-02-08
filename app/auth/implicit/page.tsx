'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

function ImplicitCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleAuth = async () => {
            const next = searchParams.get('next') ?? '/dashboard'
            const errorParam = searchParams.get('error')
            const errorDesc = searchParams.get('error_description')

            if (errorParam) {
                setError(errorDesc || errorParam)
                return
            }

            // Check hash for error (Critical for unexpected server redirects preserving hash)
            if (window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.substring(1))
                const hashError = hashParams.get('error')
                const hashErrorDesc = hashParams.get('error_description')
                if (hashError) {
                    setError(hashErrorDesc || hashError)
                    return
                }
            }

            const supabase = createBrowserClient()

            // 1. Handle Implicit Flow (Hash Fragment)
            // The server route redirects here if no code is present.
            // We expect a hash fragment containing the session.
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()

            if (sessionError) {
                setError(sessionError.message)
                return
            }

            if (!session) {
                // Optimization: check if there's a hash
                if (window.location.hash && window.location.hash.includes('access_token')) {
                    // Let Supabase process it. It fires events when it parses the hash.
                    let processed = false

                    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                        if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
                            if (!processed) {
                                processed = true
                                proceed(session)
                                subscription.unsubscribe()
                            }
                        }
                    })

                    // Fallback: If event doesn't fire (e.g. race condition), check manually after delay
                    setTimeout(async () => {
                        if (processed) return

                        const { data: { session: retrySession } } = await supabase.auth.getSession()
                        if (retrySession) {
                            processed = true
                            proceed(retrySession)
                            subscription.unsubscribe()
                        } else {
                            // If still nothing after 4 seconds and we have a hash, likely an error occurred that update the UI
                            // But let's check if the hash is still there.
                            // Sometimes supabase clears the hash on error.
                        }
                    }, 4000)
                } else {
                    setError('No authorization token found. Please try again.')
                    return
                }
            } else {
                proceed(session)
            }

            function proceed(session: any) {
                // 3. Successful Exchange/Session
                let destination = next
                // Ensure we carry over the email param if it was passed to callback but dropped from 'next'
                // This is critical for UpdatePasswordPage to detect session crossovers
                const intendedEmail = searchParams.get('email') || session.user.email

                // Check invite flow via metadata
                if (session.user.user_metadata?.is_invite) {
                    destination = '/auth/update-password'
                }

                if (intendedEmail && !destination.includes('email=')) {
                    const separator = destination.includes('?') ? '&' : '?'
                    destination = `${destination}${separator}email=${encodeURIComponent(intendedEmail)}`
                }

                router.push(destination)
                router.refresh()
            }
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

export default function ImplicitCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        }>
            <ImplicitCallbackContent />
        </Suspense>
    )
}
