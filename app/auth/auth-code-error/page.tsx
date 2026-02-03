'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense, useEffect, useState } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')

    const [isRecovering, setIsRecovering] = useState(false)
    const [errorMessage, setErrorMessage] = useState(errorDescription || error || 'An unexpected authentication error occurred.')

    useEffect(() => {
        // Check if we have a hash fragment with access_token (Implicit Flow / Magic Link workaround)
        if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
            setIsRecovering(true)
            // Redirect to update-password preserving the hash so Supabase auth listener can pick it up
            const target = '/auth/update-password' + window.location.hash
            window.location.href = target
        }
    }, [])

    if (isRecovering) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-white space-y-4">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p>Completing authentication...</p>
            </div>
        )
    }

    const getErrorMessage = () => {
        switch (errorCode) {
            case 'otp_expired':
                return 'The invitation link has expired. Please ask your administrator for a new one.'
            case 'access_denied':
                return 'You do not have permission to access this resource.'
            default:
                return errorMessage || 'An unexpected authentication error occurred.'
        }
    }

    return (
        <Card className="max-w-md w-full bg-[#151A29] border-white/10 text-white">
            <CardHeader>
                <div className="flex items-center gap-3 text-red-400 mb-2">
                    <AlertCircle className="w-6 h-6" />
                    <span className="font-semibold">Authentication Error</span>
                </div>
                <CardTitle className="text-xl">Something went wrong</CardTitle>
                <CardDescription className="text-slate-400">
                    {error || 'Unknown Error'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-slate-300">
                    {getErrorMessage()}
                </p>
                {/* Helper text for common errors */}
                {(errorCode === 'otp_expired' || error === 'missing_code') && (
                    <div className="mt-4 text-sm text-slate-500 space-y-2">
                        <p>Tip: Email security scanners can sometimes expire these links.</p>
                        {error === 'missing_code' && <p>If you see a URL with #access_token, wait a moment as we try to recover your session.</p>}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline" className="w-full border-white/10 hover:bg-white/5 text-slate-300">
                    <Link href="/login" className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function AuthCodeError() {
    return (
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    )
}
