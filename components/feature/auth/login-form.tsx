'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AlertCircle, Loader2, ArrowRight, Lock } from 'lucide-react'

export function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    // Clear legacy auth tokens on mount to ensure clean slate
    useEffect(() => {
        // Clear any potential Supabase keys generically
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith('sb-') || k.includes('auth-token') || k.includes('supabase.auth.token')) {
                localStorage.removeItem(k)
            }
        })
        console.log('Login: Cleared stale local sessions')
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Check for admin role
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.user_metadata?._isadmin) {
                router.push('/admin/dashboard')
            } else {
                router.push('/dashboard')
            }
            router.refresh()
        }
    }

    const handleSocialLogin = async (provider: 'google' | 'azure') => {
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                    // Microsoft often requires explicit scope for email to be returned in the ID token
                    scopes: provider === 'azure' ? 'openid profile email User.Read offline_access' : 'openid profile email',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })
            if (error) throw error
        } catch (error: any) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                <p className="text-slate-400">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300 font-medium ml-1">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="username@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base rounded-xl transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-slate-300 font-medium ml-1">Password</Label>
                        <a href="/auth/reset-password" className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</a>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base rounded-xl transition-all"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-200 bg-red-900/20 rounded-lg border border-red-500/30 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{error}</span>
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-900/20 text-white rounded-full transition-all transform active:scale-95 mt-4"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign In <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                    )}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0B0F19] px-2 text-slate-500">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                    Google
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleSocialLogin('azure')}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="microsoft" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M0 32h214.6v214.6H0V32zm233.4 0H448v214.6H233.4V32zM0 265.4h214.6V480H0V265.4zm233.4 0H448V480H233.4V265.4z"></path></svg>
                    Microsoft
                </Button>
            </div>

            <div className="text-center pt-2">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Secure 256-bit Encryption
                </p>
            </div>
        </div>
    )
}
