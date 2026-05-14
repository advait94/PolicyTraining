'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Download, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { markGuideAsSeen } from '@/app/actions/admin'

interface WelcomeGuideModalProps {
    role: 'admin' | 'learner' | 'manager' | string
    hasSeenGuide: boolean
}

const GUIDE_URLS: Record<string, string> = {
    admin: '/guides/AA_Plus_Admin_How-To_Guide.pptx',
    learner: '/guides/AA_Plus_Learner_How-To_Guide.pptx',
    manager: '/guides/AA_Plus_Learner_How-To_Guide.pptx',
}

export function WelcomeGuideModal({ role, hasSeenGuide }: WelcomeGuideModalProps) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!hasSeenGuide) setOpen(true)
    }, [hasSeenGuide])

    const dismiss = async () => {
        setOpen(false)
        await markGuideAsSeen()
    }

    const openGuide = async () => {
        setOpen(false)
        await markGuideAsSeen()
        const url = GUIDE_URLS[role] ?? GUIDE_URLS.learner
        const a = document.createElement('a')
        a.href = url
        a.download = url.split('/').pop() ?? 'guide.pptx'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss() }}>
            <DialogContent className="max-w-md border-0 p-0 overflow-hidden"
                style={{ background: 'transparent' }}>
                {/* Card */}
                <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #111827 0%, #0d1524 100%)',
                        border: '1px solid rgba(139,92,246,0.35)',
                        boxShadow: '0 0 60px rgba(139,92,246,0.18), 0 25px 60px rgba(0,0,0,0.6)',
                    }}
                >
                    {/* Top accent bar */}
                    <div
                        className="h-1 w-full"
                        style={{
                            background: 'linear-gradient(90deg, #8B5CF6, #22D3EE, #EC4899)',
                        }}
                    />

                    <div className="p-8">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(34,211,238,0.15))',
                                    border: '1px solid rgba(139,92,246,0.4)',
                                }}
                            >
                                <BookOpen className="w-8 h-8 text-violet-400" />
                            </div>
                        </div>

                        <DialogHeader className="text-center mb-2">
                            <DialogTitle className="text-2xl font-bold text-white mb-3">
                                Welcome to AA Plus Training!
                            </DialogTitle>
                            <DialogDescription className="text-slate-300 text-base leading-relaxed">
                                Would you like a quick guide on how to use the platform?
                                <span className="block mt-1 text-slate-400 text-sm">
                                    {role === 'admin'
                                        ? 'The Admin Guide covers inviting users, assigning modules, reports, and settings.'
                                        : 'The Learner Guide covers completing modules, quizzes, certificates, and more.'}
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        {/* Guide preview pill */}
                        <div
                            className="flex items-center gap-3 rounded-xl px-4 py-3 mt-6 mb-7"
                            style={{
                                background: 'rgba(139,92,246,0.1)',
                                border: '1px solid rgba(139,92,246,0.25)',
                            }}
                        >
                            <Download className="w-4 h-4 text-violet-400 shrink-0" />
                            <span className="text-sm text-slate-300">
                                {role === 'admin'
                                    ? 'AA Plus Admin How-To Guide.pptx'
                                    : 'AA Plus Learner How-To Guide.pptx'}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={openGuide}
                                className="w-full h-11 font-semibold text-white rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                                    border: '1px solid rgba(139,92,246,0.5)',
                                }}
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Yes, open the guide
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={dismiss}
                                className="w-full h-11 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                            >
                                Maybe later
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
