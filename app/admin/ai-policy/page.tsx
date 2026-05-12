'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, ArrowLeft, Brain, Shield, ShieldCheck, ShieldAlert, ChevronRight, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { saveAIPolicyQuiz, getAIPolicyStatus } from '@/app/actions/admin'

const QUIZ_QUESTIONS = [
    {
        id: 'allow_invoices' as const,
        text: 'Is it okay for an employee to share an invoice or Bill of Materials (BoM) with an AI tool?',
        context: 'This covers operational financial documents such as supplier invoices, purchase orders, and Bills of Materials.',
    },
    {
        id: 'allow_specs' as const,
        text: 'Could an employee share a technical requirement or specification sheet with an AI tool?',
        context: 'This includes product specs, engineering requirement documents, and technical specification sheets.',
    },
    {
        id: 'allow_legal_docs' as const,
        text: 'Can employees share legal or contractual documents (NDAs, agreements, contracts) with an AI tool?',
        context: 'This covers all legally binding documents, whether signed or in draft, including NDAs, vendor agreements, and employment contracts.',
    },
    {
        id: 'allow_situational' as const,
        text: 'Are employees allowed to ask AI situation-based questions without sharing the actual documents — describing the scenario in anonymized terms?',
        context: 'For example, asking "how should I handle an invoice dispute?" without sharing the actual invoice. This approach keeps all real data private.',
    },
] as const

type QuestionId = typeof QUIZ_QUESTIONS[number]['id']

const TIER_CONFIG = {
    1: {
        name: 'Restricted Use',
        moduleName: 'AI in the Workplace – Restricted Use',
        color: 'amber',
        icon: ShieldAlert,
        description: 'Employees may use AI for general knowledge, learning, and drafting — but must not share any company documents. The anonymization technique is the recommended approach.',
        reasoning: 'Because document sharing is restricted across all categories, this module focuses on getting full value from AI without sharing any files or data.',
    },
    2: {
        name: 'Standard Use',
        moduleName: 'AI in the Workplace – Standard Use',
        color: 'blue',
        icon: Shield,
        description: 'Employees may share operational documents (invoices, BoMs, specs) with approved AI tools, applying data minimization. Legal and personal documents remain off-limits.',
        reasoning: 'Because operational documents are permitted but legal documents are not, this module covers safe handling of invoices and specs while clearly drawing the line at legal content.',
    },
    3: {
        name: 'Responsible Use',
        moduleName: 'AI in the Workplace – Responsible Use',
        color: 'emerald',
        icon: ShieldCheck,
        description: 'Employees may use AI across all document types including legal and contractual documents, with appropriate governance, confidentiality awareness, and output validation.',
        reasoning: 'Because legal documents are permitted, this module covers the full governance framework — confidentiality obligations in contracts, output validation, and accountability principles.',
    },
} as const

export default function AIPolicyPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [step, setStep] = useState(0) // 0=intro, 1-4=questions, 5=results
    const [answers, setAnswers] = useState<Partial<Record<QuestionId, boolean>>>({})
    const [result, setResult] = useState<{ tier: 1 | 2 | 3; moduleId: string } | null>(null)
    const [existingStatus, setExistingStatus] = useState<{ completed: boolean; tier?: 1 | 2 | 3; moduleName?: string } | null>(null)

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const { data: userData } = await supabase
                .from('users')
                .select('role, organization_id')
                .eq('id', user.id)
                .single()

            if (!userData || (userData.role !== 'admin' && userData.role !== 'superadmin')) {
                router.push('/dashboard')
                return
            }

            const status = await getAIPolicyStatus()
            setExistingStatus(status)
            setLoading(false)
        }
        load()
    }, [])

    function setAnswer(id: QuestionId, value: boolean) {
        setAnswers(prev => ({ ...prev, [id]: value }))
    }

    function goNext() {
        if (step < 4) {
            setStep(s => s + 1)
        } else {
            handleComplete()
        }
    }

    async function handleComplete() {
        setSaving(true)
        const finalAnswers = {
            allow_invoices: answers.allow_invoices ?? false,
            allow_specs: answers.allow_specs ?? false,
            allow_legal_docs: answers.allow_legal_docs ?? false,
            allow_situational: answers.allow_situational ?? false,
        }
        const res = await saveAIPolicyQuiz(finalAnswers)
        if (!res.success) {
            toast.error(res.message || 'Failed to save policy')
            setSaving(false)
            return
        }
        setResult({ tier: res.tier!, moduleId: res.moduleId! })
        setStep(5)
        setSaving(false)
    }

    function retake() {
        setAnswers({})
        setResult(null)
        setStep(1)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
        )
    }

    const currentQuestion = step >= 1 && step <= 4 ? QUIZ_QUESTIONS[step - 1] : null
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined
    const tierInfo = result ? TIER_CONFIG[result.tier] : null
    const TierIcon = tierInfo?.icon

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/admin/dashboard')}
                        className="text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Dashboard
                    </Button>
                </div>

                {/* Step 0: Intro */}
                {step === 0 && (
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader className="pb-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
                                <Brain className="w-6 h-6 text-indigo-400" />
                            </div>
                            <CardTitle className="text-2xl text-white">Set Up Your AI Usage Policy</CardTitle>
                            <CardDescription className="text-slate-400 text-base mt-2">
                                Answer 4 quick questions about your organization's stance on AI tool usage. Based on your answers, we'll automatically assign the right <strong className="text-slate-200">AI Best Practices</strong> training module to your employees.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-[#0B0F19]/60 rounded-lg p-4 space-y-3">
                                <p className="text-sm text-slate-300 font-medium">The 4 questions cover:</p>
                                <ul className="space-y-2 text-sm text-slate-400">
                                    <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span>Whether employees can share invoices or Bills of Materials with AI</li>
                                    <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span>Whether employees can share technical specification sheets with AI</li>
                                    <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span>Whether employees can share legal or contractual documents with AI</li>
                                    <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span>Whether employees may ask AI situation-based questions without sharing actual documents</li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {([1, 2, 3] as const).map(tier => {
                                    const t = TIER_CONFIG[tier]
                                    const Icon = t.icon
                                    const colors = {
                                        amber: 'border-amber-500/30 bg-amber-500/5',
                                        blue: 'border-blue-500/30 bg-blue-500/5',
                                        emerald: 'border-emerald-500/30 bg-emerald-500/5',
                                    }
                                    const iconColors = {
                                        amber: 'text-amber-400',
                                        blue: 'text-blue-400',
                                        emerald: 'text-emerald-400',
                                    }
                                    const textColors = {
                                        amber: 'text-amber-300',
                                        blue: 'text-blue-300',
                                        emerald: 'text-emerald-300',
                                    }
                                    return (
                                        <div key={tier} className={`rounded-lg border p-3 ${colors[t.color]}`}>
                                            <Icon className={`w-5 h-5 mb-2 ${iconColors[t.color]}`} />
                                            <p className={`text-xs font-semibold ${textColors[t.color]}`}>{t.name}</p>
                                        </div>
                                    )
                                })}
                            </div>

                            {existingStatus?.completed && (
                                <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <p className="text-sm text-slate-300">
                                        Your organization is currently on the <strong className="text-white">{existingStatus.tier ? TIER_CONFIG[existingStatus.tier].name : ''}</strong> policy.
                                        You can retake the quiz to update it.
                                    </p>
                                </div>
                            )}

                            <Button
                                onClick={() => setStep(1)}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                            >
                                {existingStatus?.completed ? 'Retake Quiz' : 'Start Quiz'}
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Steps 1–4: Questions */}
                {step >= 1 && step <= 4 && currentQuestion && (
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader className="pb-4">
                            {/* Progress bar */}
                            <div className="flex items-center gap-2 mb-6">
                                {[1, 2, 3, 4].map(n => (
                                    <div
                                        key={n}
                                        className={`h-1.5 flex-1 rounded-full transition-all ${n <= step ? 'bg-indigo-500' : 'bg-white/10'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Question {step} of 4</p>
                            <CardTitle className="text-xl text-white leading-snug">{currentQuestion.text}</CardTitle>
                            <p className="text-sm text-slate-400 mt-2">{currentQuestion.context}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setAnswer(currentQuestion.id, true)}
                                    className={`rounded-xl border-2 p-5 text-left transition-all ${
                                        currentAnswer === true
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-white/10 bg-[#0B0F19]/60 hover:border-white/30'
                                    }`}
                                >
                                    <CheckCircle2 className={`w-6 h-6 mb-2 ${currentAnswer === true ? 'text-emerald-400' : 'text-slate-500'}`} />
                                    <p className={`text-lg font-semibold ${currentAnswer === true ? 'text-emerald-300' : 'text-slate-300'}`}>Yes</p>
                                    <p className="text-xs text-slate-500 mt-1">This is permitted in our organization</p>
                                </button>
                                <button
                                    onClick={() => setAnswer(currentQuestion.id, false)}
                                    className={`rounded-xl border-2 p-5 text-left transition-all ${
                                        currentAnswer === false
                                            ? 'border-red-500 bg-red-500/10'
                                            : 'border-white/10 bg-[#0B0F19]/60 hover:border-white/30'
                                    }`}
                                >
                                    <XCircle className={`w-6 h-6 mb-2 ${currentAnswer === false ? 'text-red-400' : 'text-slate-500'}`} />
                                    <p className={`text-lg font-semibold ${currentAnswer === false ? 'text-red-300' : 'text-slate-300'}`}>No</p>
                                    <p className="text-xs text-slate-500 mt-1">This is not permitted in our organization</p>
                                </button>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep(s => s - 1)}
                                    className="text-slate-400 hover:text-white flex-1"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Button>
                                <Button
                                    onClick={goNext}
                                    disabled={currentAnswer === undefined || saving}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white flex-2 flex-grow"
                                >
                                    {saving ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                                    ) : step === 4 ? (
                                        <>See Results <ChevronRight className="w-4 h-4 ml-1" /></>
                                    ) : (
                                        <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 5: Results */}
                {step === 5 && result && tierInfo && TierIcon && (
                    <div className="space-y-4">
                        {/* Tier badge card */}
                        <Card className={`border backdrop-blur-md ${
                            tierInfo.color === 'amber' ? 'border-amber-500/30 bg-amber-500/5' :
                            tierInfo.color === 'blue' ? 'border-blue-500/30 bg-blue-500/5' :
                            'border-emerald-500/30 bg-emerald-500/5'
                        }`}>
                            <CardContent className="pt-6 pb-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                        tierInfo.color === 'amber' ? 'bg-amber-500/20' :
                                        tierInfo.color === 'blue' ? 'bg-blue-500/20' :
                                        'bg-emerald-500/20'
                                    }`}>
                                        <TierIcon className={`w-6 h-6 ${
                                            tierInfo.color === 'amber' ? 'text-amber-400' :
                                            tierInfo.color === 'blue' ? 'text-blue-400' :
                                            'text-emerald-400'
                                        }`} />
                                    </div>
                                    <div>
                                        <span className={`text-xs font-semibold uppercase tracking-widest ${
                                            tierInfo.color === 'amber' ? 'text-amber-400' :
                                            tierInfo.color === 'blue' ? 'text-blue-400' :
                                            'text-emerald-400'
                                        }`}>
                                            Policy Tier {result.tier}
                                        </span>
                                        <h2 className="text-xl font-bold text-white mt-0.5">{tierInfo.name}</h2>
                                        <p className="text-sm text-slate-300 mt-2">{tierInfo.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Module assigned */}
                        <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <p className="text-sm font-semibold text-white">Module assigned to your organization</p>
                                </div>
                                <div className="bg-[#0B0F19]/60 rounded-lg px-4 py-3">
                                    <p className="text-sm text-slate-300 font-medium">{tierInfo.moduleName}</p>
                                    <p className="text-xs text-slate-500 mt-1">Visible to all employees assigned to this organization</p>
                                </div>
                                <p className="text-xs text-slate-500 mt-3 leading-relaxed">{tierInfo.reasoning}</p>
                            </CardContent>
                        </Card>

                        {/* Answers summary */}
                        <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                            <CardContent className="pt-5 pb-5">
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Your answers</p>
                                <div className="space-y-2">
                                    {QUIZ_QUESTIONS.map(q => {
                                        const val = answers[q.id]
                                        return (
                                            <div key={q.id} className="flex items-start gap-3">
                                                {val ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                                )}
                                                <p className="text-xs text-slate-400 leading-relaxed">{q.text}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* CTAs */}
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={retake}
                                className="text-slate-400 hover:text-white"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Retake Quiz
                            </Button>
                            <Button
                                onClick={() => router.push('/admin/dashboard')}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white flex-grow"
                            >
                                Go to Dashboard
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
