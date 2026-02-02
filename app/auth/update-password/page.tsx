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
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Check if user has valid recovery session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setError('Invalid or expired reset link. Please request a new password reset.')
            }
        })
    }, [])

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
            setError(error.message)
            toast.error(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            toast.success('Password updated successfully!')
            setLoading(false)
            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login')
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
                            <div className="space-y-2 mb-8">
                                <h2 className="text-3xl font-bold text-white tracking-tight">Set New Password</h2>
                                <p className="text-slate-400">Enter your new password below.</p>
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
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
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
