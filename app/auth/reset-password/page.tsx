'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
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
                                <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
                                <p className="text-slate-400">
                                    We've sent a password reset link to <span className="text-white font-medium">{email}</span>
                                </p>
                                <p className="text-sm text-slate-500">
                                    Click the link in the email to reset your password. The link will expire in 1 hour.
                                </p>
                            </div>
                            <Link href="/login">
                                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-full h-12">
                                    <ArrowLeft className="mr-2 w-4 h-4" />
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2 mb-8">
                                <h2 className="text-3xl font-bold text-white tracking-tight">Reset Password</h2>
                                <p className="text-slate-400">Enter your email to receive a password reset link.</p>
                            </div>

                            <form onSubmit={handleResetRequest} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300 font-medium ml-1">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="username@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base rounded-xl pl-12 transition-all"
                                        />
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
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 w-5 h-5" />
                                            Send Reset Link
                                        </>
                                    )}
                                </Button>

                                <div className="text-center pt-4">
                                    <Link href="/login" className="text-sm text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
