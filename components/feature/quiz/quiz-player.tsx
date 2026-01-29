'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Trophy, BookOpen, Award, RefreshCw, Loader2 } from 'lucide-react'

type Question = {
    id: string
    text: string
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
    onComplete
}: {
    questions: Question[]
    moduleId: string
    moduleTitle?: string
    onComplete: (score: number, passed: boolean) => void
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isCorrect: boolean } | null>(null)
    const router = useRouter()

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

        if (isCorrect) {
            setScore(s => s + 1)
            setFeedbackMessage({ text: 'Correct! Well done.', isCorrect: true })
        } else {
            const correctAnswer = currentQuestion.answers.find(a => a.is_correct)
            setFeedbackMessage({
                text: `Incorrect. The correct answer was: ${correctAnswer?.text}`,
                isCorrect: false
            })
        }

        setIsSubmitted(true)
    }

    const handleNext = async () => {
        setIsSubmitted(false)
        setSelectedAnswerId(null)
        setFeedbackMessage(null)

        if (isLastQuestion) {
            await finishQuiz()
        } else {
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
        const percentage = Math.round((score / questions.length) * 100)
        const passed = percentage >= 80

        // Save progress FIRST, then show results
        setIsSaving(true)
        try {
            await onComplete(percentage, passed)
        } catch (error) {
            console.error('Failed to save progress:', error)
        } finally {
            setIsSaving(false)
            setShowResult(true)
        }
    }

    // Results Screen
    if (showResult) {
        const percentage = Math.round((score / questions.length) * 100)
        const passed = percentage >= 80
        const incorrect = questions.length - score

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
                    <Link
                        href="/dashboard"
                        className="text-white text-sm hover:underline"
                    >
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
                                <div className="score-number correct">{score}</div>
                                <div className="score-label">Correct</div>
                            </div>
                            <div className="score-item">
                                <div className="score-number incorrect">{incorrect}</div>
                                <div className="score-label">Incorrect</div>
                            </div>
                            <div className="score-item">
                                <div className="score-number total">{questions.length}</div>
                                <div className="score-label">Total</div>
                            </div>
                        </div>

                        <p className="result-message">
                            {passed
                                ? 'You have demonstrated a strong understanding of the training material. Your certificate is now available.'
                                : 'Please review the training material and try again. You need at least 80% to pass the assessment and receive your certificate.'}
                        </p>

                        <div className="action-buttons">
                            {passed ? (
                                <>
                                    <button
                                        onClick={() => router.push(`/certificate/${moduleId}`)}
                                        className="action-btn success cursor-pointer"
                                    >
                                        <Award className="w-5 h-5" />
                                        View Certificate
                                    </button>
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="action-btn secondary cursor-pointer"
                                    >
                                        Return to Dashboard
                                    </button>
                                </>
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
                    {/* Question Header */}
                    <div className="question-number-badge">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                    <div className="question-text">
                        {currentQuestion.text}
                    </div>

                    {/* Options */}
                    <div className="options-container">
                        {currentQuestion.answers.map((answer, idx) => {
                            const isSelected = selectedAnswerId === answer.id
                            const isCorrectAnswer = answer.is_correct

                            let cardClass = 'option-card'
                            if (isSubmitted) {
                                cardClass += ' answered'
                                if (isCorrectAnswer) {
                                    cardClass += ' correct'
                                } else if (isSelected && !isCorrectAnswer) {
                                    cardClass += ' incorrect'
                                }
                            } else if (isSelected) {
                                cardClass += ' selected'
                            }

                            return (
                                <div
                                    key={answer.id}
                                    className={cardClass}
                                    onClick={() => handleSelectAnswer(answer.id)}
                                >
                                    <div className="option-letter">
                                        {letters[idx] || idx + 1}
                                    </div>
                                    <div className="option-text">
                                        {answer.text}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Feedback Message */}
                    {feedbackMessage && (
                        <div className={`feedback-message ${feedbackMessage.isCorrect ? 'correct' : 'incorrect'}`}>
                            {feedbackMessage.text}
                        </div>
                    )}

                    {/* Navigation */}
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
