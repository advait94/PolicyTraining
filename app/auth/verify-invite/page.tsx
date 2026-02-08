'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'

import { Suspense } from 'react'

function VerifyInviteContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [targetUrl, setTargetUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        const target = searchParams.get('target')
        if (target) {
            // Next.js searchParams already decodes the value once.
            // We should NOT decode again, as it might corrupt the inner URL params (e.g. token signatures)
            setTargetUrl(target)
        }
        setChecking(false)
    }, [searchParams])

    const handleAccept = () => {
        if (!targetUrl) return
        setLoading(true)
        // Redirect to the actual Supabase action link
        // This is the moment the token is consumed
        window.location.href = targetUrl
    }

    if (checking) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        )
    }

    if (!targetUrl) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
                <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-red-400 flex items-center gap-2">
                            Invalid Link
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-400">
                            This invitation link appears to be invalid or incomplete. Please check your email and try again.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#151A29] to-[#0B0F19] flex items-center justify-center p-4">
            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md max-w-md w-full shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8 text-purple-400" />
                    </div>
                    <CardTitle className="text-2xl text-white">Accept Invitation</CardTitle>
                    <CardDescription className="text-slate-400">
                        Please confirm you want to join the Policy Training Platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="p-4 bg-purple-900/10 rounded-lg border border-purple-500/10 text-center">
                        <p className="text-sm text-purple-200">
                            Clicking the button below will verify your email and set up your account.
                        </p>
                    </div>

                    <Button
                        onClick={handleAccept}
                        className="w-full h-12 text-base bg-purple-600 hover:bg-purple-500 text-white font-medium"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Accept Invitation
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-center text-slate-500">
                        This step protects your one-time link from security scanners.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default function VerifyInvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        }>
            <VerifyInviteContent />
        </Suspense>
    )
}
