'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Trophy, BookOpen, RefreshCw, Loader2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { saveAttestation } from '@/app/actions/progress'
import { logActivity } from '@/app/actions/audit'
import { toast } from 'sonner'

type Question = {
    id: string
    text: string
    explanation?: string | null
    answers: {
        id: string
        text: string
        is_correct: boolean
    }[]
}

export function QuizPlayer({
    questions,
    moduleId,
    moduleTitle,
    onComplete,
    initialShowResult,
    initialScore,
}: {
    questions: Question[]
    moduleId: string
    moduleTitle?: string
    onComplete: (score: number, passed: boolean) => void
    initialShowResult?: boolean
    initialScore?: number
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(!!initialShowResult)
    const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isCorrect: boolean } | null>(null)
    // Snapshot the totals at the moment the quiz finishes so a React prop update
    // (e.g. after saveModuleProgress triggers a rerender with fresh questions) cannot
    // overwrite the displayed score with a mismatched questions.length.
    const initCorrect = (initialShowResult && initialScore != null)
        ? Math.round(initialScore * questions.length / 100)
        : null
    const [finalTotals, setFinalTotals] = useState<{ correct: number; total: number } | null>(
        initCorrect != null ? { correct: initCorrect, total: questions.length } : null
    )

    // Attestation state
    const [attestationChecked, setAttestationChecked] = useState(false)
    const [attestationSaved, setAttestationSaved] = useState(false)
    const [isSavingAttestation, setIsSavingAttestation] = useState(false)

    const router = useRouter()

    useEffect(() => {
        if (showResult) return

        const blockShortcuts = (e: KeyboardEvent) => {
            const blocked =
                (e.ctrlKey && ['c', 'a', 'p', 'u', 's'].includes(e.key.toLowerCase())) ||
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
            if (blocked) e.preventDefault()
        }

        // Can't block the OS screenshot, but we can wipe the clipboard immediately after
        const clearOnPrintScreen = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen') {
                navigator.clipboard?.writeText('').catch(() => {})
            }
        }

        const blockContextMenu = (e: MouseEvent) => e.preventDefault()

        document.addEventListener('keydown', blockShortcuts)
        document.addEventListener('keyup', clearOnPrintScreen)
        document.addEventListener('contextmenu', blockContextMenu)

        return () => {
            document.removeEventListener('keydown', blockShortcuts)
            document.removeEventListener('keyup', clearOnPrintScreen)
            document.removeEventListener('contextmenu', blockContextMenu)
        }
    }, [showResult])

    const currentQuestion = questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === questions.length - 1
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100
    const letters = ['A', 'B', 'C', 'D']

    const handleSelectAnswer = (answerId: string) => {
        if (isSubmitted) return
        setSelectedAnswerId(answerId)
    }

    const handleSubmitAnswer = () => {
        if (!selectedAnswerId) return

        const selectedAnswer = currentQuestion.answers.find(a => a.id === selectedAnswerId)
        const isCorrect = selectedAnswer?.is_correct || false

        const explanation = currentQuestion.explanation
        if (isCorrect) {
            setScore(s => s + 1)
            setFeedbackMessage({
                text: explanation ? `Correct! ${explanation}` : 'Correct! Well done.',
                isCorrect: true
            })
        } else {
            const correctAnswer = currentQuestion.answers.find(a => a.is_correct)
            setFeedbackMessage({
                text: explanation
                    ? `Incorrect. Correct answer: "${correctAnswer?.text}". ${explanation}`
                    : `Incorrect. The correct answer was: "${correctAnswer?.text}".`,
                isCorrect: false
            })
        }

        setIsSubmitted(true)
    }

    const handleNext = async () => {
        if (isLastQuestion) {
            // Don't clear state — stay on the submitted Q view while saving,
            // then showResult=true takes over once finishQuiz completes.
            await finishQuiz()
        } else {
            setIsSubmitted(false)
            setSelectedAnswerId(null)
            setFeedbackMessage(null)
            setCurrentQuestionIndex(i => i + 1)
        }
    }

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(i => i - 1)
            setIsSubmitted(false)
            setSelectedAnswerId(null)
            setFeedbackMessage(null)
        }
    }

    const [isSaving, setIsSaving] = useState(false)

    const finishQuiz = async () => {
        // Snapshot correct/total NOW so the results screen is immune to any
        // prop change (e.g. a rerender with fresh questions after saveModuleProgress).
        const correct = score
        const total = questions.length
        const percentage = Math.round((correct / total) * 100)
        const passed = percentage >= 80

        setFinalTotals({ correct, total })
        setIsSaving(true)
        try {
            await logActivity(moduleId, 'quiz_completed', { score: percentage, passed })
            await onComplete(percentage, passed)
        } catch (error) {
            console.error('Failed to save progress:', error)
        } finally {
            setIsSaving(false)
            setShowResult(true)
        }
    }

    const handleAttestation = async () => {
        if (!attestationChecked) return
        setIsSavingAttestation(true)
        try {
            await saveAttestation(moduleId)
            setAttestationSaved(true)
            toast.success('Attestation recorded.')
        } catch {
            toast.error('Failed to save attestation. Please try again.')
        } finally {
            setIsSavingAttestation(false)
        }
    }

    // Results Screen
    if (showResult) {
        const correct = finalTotals?.correct ?? score
        const total = finalTotals?.total ?? questions.length
        const percentage = Math.round((correct / Math.max(total, 1)) * 100)
        const passed = percentage >= 80
        const incorrect = total - correct

        return (
            <div className="quiz-page">
                {/* Header Bar */}
                <div className="quiz-header-bar">
                    <Image
                        src="/aaplus_logo_colored.png"
                        alt="Logo"
                        width={120}
                        height={50}
                        className="h-[50px] w-auto object-contain"
                    />
                    <div className="text-center">
                        <div className="font-semibold">{moduleTitle || 'Training Module'}</div>
                        <div className="text-sm opacity-80">Assessment Results</div>
                    </div>
                    <Link href="/dashboard" className="text-white text-sm hover:underline">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                {/* Results Content */}
                <div className="quiz-main">
                    <div className="result-card">
                        <div className="result-icon flex items-center justify-center">
                            {passed ? (
                                <Trophy className="w-24 h-24 text-green-500" />
                            ) : (
                                <BookOpen className="w-24 h-24 text-red-500" />
                            )}
                        </div>
                        <h1 className={`result-title ${passed ? 'pass' : 'fail'}`}>
                            {passed ? 'Congratulations!' : 'Not Passed'}
                        </h1>
                        <p className="result-subtitle">
                            {passed
                                ? 'You have PASSED the assessment'
                                : 'You need 80% or higher to pass'}
                        </p>

                        <div className="score-display">
                            <div className="score-item">
                                <div className="score-number correct">{correct}</div>
                                <div className="score-label">Correct</div>
                            </div>
                            <div className="score-item">
                                <div className="score-number incorrect">{incorrect}</div>
                                <div className="score-label">Incorrect</div>
                            </div>
                            <div className="score-item">
                                <div className="score-number total">{total}</div>
                                <div className="score-label">Total</div>
                            </div>
                        </div>

                        <p className="result-message">
                            {passed
                                ? 'You have demonstrated a strong understanding of the training material. Your certificate is now available.'
                                : 'Please review the training material and try again. You need at least 80% to pass the assessment and receive your certificate.'}
                        </p>

                        {/* ── Attestation (pass only) ── */}
                        {passed && (
                            <div
                                style={{
                                    margin: '24px 0',
                                    padding: '20px 24px',
                                    borderRadius: 12,
                                    border: attestationSaved
                                        ? '1px solid rgba(34,197,94,0.4)'
                                        : '1px solid rgba(168,85,247,0.3)',
                                    background: attestationSaved
                                        ? 'rgba(34,197,94,0.08)'
                                        : 'rgba(168,85,247,0.08)',
                                    textAlign: 'left',
                                }}
                            >
                                {attestationSaved ? (
                                    <div className="flex items-center gap-3 text-green-400">
                                        <ShieldCheck className="w-5 h-5 shrink-0" />
                                        <span className="text-sm font-medium">
                                            Attestation recorded on {new Date().toLocaleDateString()}
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <label
                                            htmlFor="attestation-checkbox"
                                            className="flex items-start gap-3 cursor-pointer"
                                        >
                                            <input
                                                id="attestation-checkbox"
                                                type="checkbox"
                                                checked={attestationChecked}
                                                onChange={e => setAttestationChecked(e.target.checked)}
                                                className="mt-0.5 w-4 h-4 accent-purple-500 shrink-0"
                                            />
                                            <span style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                                I confirm that I have read, understood, and will comply with the policies and
                                                guidelines covered in <strong style={{ color: '#e2e8f0' }}>{moduleTitle || 'this module'}</strong>.
                                            </span>
                                        </label>
                                        <button
                                            onClick={handleAttestation}
                                            disabled={!attestationChecked || isSavingAttestation}
                                            style={{
                                                marginTop: 14,
                                                padding: '8px 20px',
                                                borderRadius: 8,
                                                border: 'none',
                                                background: attestationChecked ? '#9333ea' : '#374151',
                                                color: attestationChecked ? '#fff' : '#6b7280',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                cursor: attestationChecked ? 'pointer' : 'not-allowed',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                transition: 'background 0.2s',
                                            }}
                                        >
                                            {isSavingAttestation && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Confirm &amp; Sign Attestation
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="action-buttons">
                            {passed ? (
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="action-btn secondary cursor-pointer"
                                >
                                    Return to Dashboard
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="action-btn primary cursor-pointer"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        Retry Quiz
                                    </button>
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="action-btn secondary cursor-pointer"
                                    >
                                        Return to Dashboard
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Quiz Screen
    return (
        <div
            className="quiz-page"
            style={{ userSelect: 'none' }}
            onCopy={e => e.preventDefault()}
        >
            {/* Header Bar */}
            <div className="quiz-header-bar">
                <Image
                    src="/aaplus_logo_colored.png"
                    alt="Logo"
                    width={120}
                    height={50}
                    className="h-[50px] w-auto object-contain"
                />
                <div className="text-center">
                    <div className="font-semibold">{moduleTitle || 'Training Module'}</div>
                    <div className="text-sm opacity-80">Assessment Quiz</div>
                </div>
                <div>
                    <div className="text-sm mb-1">Progress</div>
                    <div className="quiz-progress-bar">
                        <div
                            className="quiz-progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Quiz Content */}
            <div className="quiz-main">
                <div className="quiz-card">
                    <div className="question-number-badge">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                    <div className="question-text">
                        {currentQuestion.text}
                    </div>

                    <div className="options-container">
                        {currentQuestion.answers.map((answer, idx) => {
                            const isSelected = selectedAnswerId === answer.id
                            const isCorrectAnswer = answer.is_correct

                            let cardClass = 'option-card'
                            if (isSubmitted) {
                                cardClass += ' answered'
                                if (isCorrectAnswer) cardClass += ' correct'
                                else if (isSelected && !isCorrectAnswer) cardClass += ' incorrect'
                            } else if (isSelected) {
                                cardClass += ' selected'
                            }

                            return (
                                <div
                                    key={answer.id}
                                    className={cardClass}
                                    onClick={() => handleSelectAnswer(answer.id)}
                                >
                                    <div className="option-letter">{letters[idx] || idx + 1}</div>
                                    <div className="option-text">{answer.text}</div>
                                </div>
                            )
                        })}
                    </div>

                    {feedbackMessage && (
                        <div className={`feedback-message ${feedbackMessage.isCorrect ? 'correct' : 'incorrect'}`}>
                            {feedbackMessage.text}
                        </div>
                    )}

                    <div className="quiz-navigation">
                        <button
                            className="quiz-nav-btn secondary"
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>

                        {!isSubmitted ? (
                            <button
                                className="quiz-nav-btn primary"
                                onClick={handleSubmitAnswer}
                                disabled={!selectedAnswerId}
                            >
                                Submit Answer
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                className="quiz-nav-btn primary"
                                onClick={handleNext}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : isLastQuestion ? (
                                    <>
                                        View Results
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
