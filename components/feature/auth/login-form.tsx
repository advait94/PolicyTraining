'use client'

import { useState } from 'react'
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

            <div className="text-center pt-2">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Secure 256-bit Encryption
                </p>
            </div>
        </div>
    )
}
