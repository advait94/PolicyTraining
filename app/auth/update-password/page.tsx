'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [isInitializing, setIsInitializing] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        let mounted = true

        const initialize = async () => {
            // 1. Surgical check for crossover session
            const searchParams = new URLSearchParams(window.location.search)
            const intendedEmail = searchParams.get('email')

            const { data: { session: initialSession } } = await supabase.auth.getSession()

            // 1. Validate session integrity (Check if user actually exists on server)
            if (initialSession) {
                const { error: verifyError } = await supabase.auth.getUser()
                // If Supabase says "User not found" or "Token invalid", purge immediately
                if (verifyError) {
                    console.error('UpdatePassword: Stale session detected (User invalid)! Purging...', verifyError)
                    await supabase.auth.signOut({ scope: 'local' })
                    localStorage.clear()
                    if (mounted) window.location.reload()
                    return
                }
            }

            // 2. Surgical check for crossover session (Email mismatch)
            if (initialSession && intendedEmail && initialSession.user.email !== intendedEmail) {
                console.error('UpdatePassword: Crossover session detected! Purging...')
                await supabase.auth.signOut({ scope: 'local' })
                Object.keys(localStorage).forEach(key => {
                    if (key.includes('auth-token') || key.startsWith('sb-')) localStorage.removeItem(key)
                })
                if (mounted) window.location.reload()
                return
            }

            // 2. Clear junk
            const progressKeys = [
                'anticorruption_score', 'anticorruption_passed', 'anticorruption_date',
                'dataprivacy_score', 'dataprivacy_passed', 'dataprivacy_date',
                'posh_score', 'posh_passed', 'posh_date',
                'hse_score', 'hse_passed', 'hse_date',
                'cybersecurity_score', 'cybersecurity_passed', 'cybersecurity_date'
            ]
            progressKeys.forEach((key) => {
                if (typeof window !== 'undefined') localStorage.removeItem(key)
            })

            // 3. Check if we have a valid session immediately
            if (initialSession) {
                if (mounted) {
                    setUserEmail(initialSession.user.email ?? null)
                    setIsInitializing(false)
                }
                return
            }

            // 4. If no session, but we have a hash, we wait for the listener
            // FALLBACK: Manually parse hash if supabase-js doesn't pick it up (Implicit vs PKCE)
            if (window.location.hash && window.location.hash.includes('access_token')) {
                console.log('UpdatePassword: Hash detected, verifying...')

                // Give the auto-detector a moment, then force it
                setTimeout(async () => {
                    if (!mounted) return

                    // Check if session appeared
                    const { data: { session: check } } = await supabase.auth.getSession()
                    if (check) return // It worked!

                    // Manual Parse
                    console.log('UpdatePassword: Auto-detect failed, manually parsing hash...')
                    const hashParams = new URLSearchParams(window.location.hash.substring(1)) // remove #
                    const accessToken = hashParams.get('access_token')
                    const refreshToken = hashParams.get('refresh_token')
                    const type = hashParams.get('type')

                    if (accessToken && refreshToken) {
                        const { data, error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        })
                        if (error) {
                            console.error('UpdatePassword: Manual setSession failed', error)
                            if (mounted) {
                                setIsInitializing(false)
                                setError('Failed to verify link. Please try again.')
                            }
                        } else {
                            console.log('UpdatePassword: Manual setSession success', data.user?.email)
                            // The onAuthStateChange will fire and update state
                        }
                    }
                }, 1000)

                return
            }

            // 5. No session, no hash -> Error state (unless we are just loading, but usually this means invalid link)
            // Giving it a small grace period just in case
            setTimeout(() => {
                if (mounted) {
                    setIsInitializing(false)
                    // If still no user email, we might be in trouble, but let the form show (it will fail update but might show error then)
                }
            }, 2000)
        }

        initialize()

        // Listen for auth changes (e.g. if hash fragment updates session)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user.email) {
                    console.log('Auth state changed:', event, session.user.email)
                    if (mounted) {
                        setUserEmail(session.user.email)
                        setIsInitializing(false)

                        // Re-run safety check
                        const searchParams = new URLSearchParams(window.location.search)
                        const intendedEmail = searchParams.get('email')
                        if (intendedEmail && session.user.email !== intendedEmail) {
                            console.error('Crossover detected on auth change!')
                            await supabase.auth.signOut()
                            localStorage.clear()
                            window.location.reload()
                        }
                    }
                }
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [supabase])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            toast.error('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            toast.error('Password must be at least 8 characters long')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            // Improve error message for "Same as old password"
            let msg = error.message
            if (msg.includes("different from the old password")) {
                msg = "You entered your current password. Please choose a new one."
            }

            setError(msg)
            toast.error(msg)
            setLoading(false)
        } else {
            setSuccess(true)
            toast.success('Password updated successfully!')
            setLoading(false)
            // Redirect directly to dashboard (User is already authenticated)
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#151A29] to-[#0B0F19] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-[#151A29]/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/5">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <img src="/aaplus_logo_colored.png" alt="AA Plus" className="h-16" />
                    </div>

                    {success ? (
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white">Password Updated!</h2>
                                <p className="text-slate-400">
                                    Your password has been successfully updated.
                                </p>
                                <p className="text-sm text-slate-500">
                                    Redirecting to login...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2 mb-8 text-center sm:text-left">
                                <h1 className="text-3xl font-bold text-white tracking-tight">Set New Password</h1>
                                <div className="space-y-1">
                                    <p className="text-slate-400">Enter your new password below.</p>
                                    {isInitializing ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full animate-pulse">
                                            <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
                                            <span className="text-xs font-semibold text-yellow-200">Verifying link...</span>
                                        </div>
                                    ) : userEmail ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                            <span className="text-xs font-medium text-purple-400">Updating for:</span>
                                            <span className="text-xs font-semibold text-white">{userEmail}</span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                                            <span className="text-xs font-semibold text-red-200">Session not established. Please retry.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-300 font-medium ml-1">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="At least 8 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={8}
                                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base rounded-xl pl-12 pr-12 transition-all"
                                            disabled={isInitializing}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                            disabled={isInitializing}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-slate-300 font-medium ml-1">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-enter your password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base rounded-xl pl-12 pr-12 transition-all"
                                            disabled={isInitializing}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                            disabled={isInitializing}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex flex-col gap-2 p-3 text-sm text-red-200 bg-red-900/20 rounded-lg border border-red-500/30 animate-in fade-in">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                                            <span>{error}</span>
                                        </div>
                                        {error.includes("Auth session missing") && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.location.reload()}
                                                className="self-start text-xs border-white/10 hover:bg-white/10"
                                            >
                                                Retry Connection
                                            </Button>
                                        )}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-900/20 text-white rounded-full transition-all transform active:scale-95 mt-4"
                                    disabled={loading || isInitializing || !userEmail}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="mr-2 w-5 h-5" />
                                            Update Password
                                        </>
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
