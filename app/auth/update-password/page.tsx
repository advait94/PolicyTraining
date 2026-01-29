'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            toast.error(error.message)
            setLoading(false)
        } else {
            toast.success('Password updated successfully!')
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-4">
            <div className="max-w-md w-full space-y-8 bg-[#151A29]/80 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                <div>
                    <h2 className="text-3xl font-bold text-white text-center">Set Your Password</h2>
                    <p className="mt-2 text-center text-slate-400">
                        Welcome! Please set a secure password to access your account.
                    </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="bg-black/20 border-white/10 text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium h-10 rounded-lg"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Set Password & Continue
                    </Button>
                </form>
            </div>
        </div>
    )
}
