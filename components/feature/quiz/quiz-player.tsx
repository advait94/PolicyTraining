'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Trophy, BookOpen, RefreshCw, Loader2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { saveAttestation } from '@/app/actions/progress'
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
    // One entry per question id, written once and never incremented. Revisiting a
    // question via Previous therefore cannot bank the same credit twice — the old
    // running counter let a learner re-answer a correct question for +1 each time,
    // pushing totals past questions.length (scores of 120%/130% in the audit trail)
    // and letting a 70% attempt walk itself over the 80% pass line.
    const [responses, setResponses] = useState<Record<string, { answerId: string; isCorrect: boolean }>>({})
    const [pendingAnswerId, setPendingAnswerId] = useState<string | null>(null)
    const [showResult, setShowResult] = useState(!!initialShowResult)
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

    // A question that already has a response stays locked and keeps showing the
    // answer the learner actually gave, however many times they navigate back to it.
    const currentResponse = currentQuestion ? responses[currentQuestion.id] : undefined
    const isSubmitted = !!currentResponse
    const selectedAnswerId = currentResponse?.answerId ?? pendingAnswerId

    const feedbackMessage = (() => {
        if (!currentQuestion || !currentResponse) return null
        const explanation = currentQuestion.explanation
        if (currentResponse.isCorrect) {
            return {
                text: explanation ? `Correct! ${explanation}` : 'Correct! Well done.',
                isCorrect: true,
            }
        }
        const correctAnswer = currentQuestion.answers.find(a => a.is_correct)
        return {
            text: explanation
                ? `Incorrect. Correct answer: "${correctAnswer?.text}". ${explanation}`
                : `Incorrect. The correct answer was: "${correctAnswer?.text}".`,
            isCorrect: false,
        }
    })()

    const handleSelectAnswer = (answerId: string) => {
        if (isSubmitted) return
        setPendingAnswerId(answerId)
    }

    const handleSubmitAnswer = () => {
        if (!selectedAnswerId || isSubmitted) return

        const selectedAnswer = currentQuestion.answers.find(a => a.id === selectedAnswerId)
        const isCorrect = selectedAnswer?.is_correct || false

        setResponses(prev => (
            prev[currentQuestion.id]
                ? prev
                : { ...prev, [currentQuestion.id]: { answerId: selectedAnswerId, isCorrect } }
        ))
        setPendingAnswerId(null)
    }

    const handleNext = async () => {
        if (isLastQuestion) {
            // Don't clear state — stay on the submitted Q view while saving,
            // then showResult=true takes over once finishQuiz completes.
            await finishQuiz()
        } else {
            setPendingAnswerId(null)
            setCurrentQuestionIndex(i => i + 1)
        }
    }

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setPendingAnswerId(null)
            setCurrentQuestionIndex(i => i - 1)
        }
    }

    const [isSaving, setIsSaving] = useState(false)
    const hasFinished = useRef(false)

    const finishQuiz = async () => {
        // Reaching the last question twice (answer everything, go back, come forward)
        // must not submit the attempt twice.
        if (hasFinished.current) return
        hasFinished.current = true

        // Snapshot correct/total NOW so the results screen is immune to any
        // prop change (e.g. a rerender with fresh questions after saveModuleProgress).
        // Credits are keyed by question id, so correct can never exceed total.
        const correct = questions.reduce((n, q) => n + (responses[q.id]?.isCorrect ? 1 : 0), 0)
        const total = questions.length
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
        const passed = percentage >= 80

        setFinalTotals({ correct, total })
        setIsSaving(true)
        try {
            // saveModuleProgress writes the quiz_completed audit row server-side from
            // the sanitized score; logging it here as well double-counted every attempt.
            await onComplete(percentage, passed)
        } catch (error) {
            console.error('Failed to save progress:', error)
            hasFinished.current = false
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
        const correct = finalTotals?.correct
            ?? questions.reduce((n, q) => n + (responses[q.id]?.isCorrect ? 1 : 0), 0)
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
