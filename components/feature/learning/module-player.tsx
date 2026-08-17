'use client'

import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { QuizPlayer } from '@/components/feature/quiz/quiz-player'
import { saveModuleProgress } from '@/app/actions/progress'
import { logActivity } from '@/app/actions/audit'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Slide = {
    id: string
    title: string
    content: string
    sequence_order: number
}

type Question = {
    id: string
    text: string
    explanation?: string | null
    slide_group?: number | null
    answers: {
        id: string
        text: string
        is_correct: boolean
    }[]
}

interface ModulePlayerProps {
    moduleId: string
    moduleTitle: string
    slides: Slide[]
    questions: Question[]
    refreshersByGroup?: Record<number, Question[]>
    initialProgress?: {
        is_completed: boolean
        quiz_score: number
        attestation_accepted?: boolean | null
    }
}

function extractText(node: React.ReactNode): string {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(extractText).join('')
    if (React.isValidElement(node)) return extractText((node.props as any).children)
    return ''
}

function getCardVariant(children: React.ReactNode): { variant: string; icon: string } {
    const text = extractText(children).toLowerCase()
    if (/never|prohibited|must not|violation|retaliat|warning|caution|alert/i.test(text))
        return { variant: 'danger', icon: '⚠️' }
    if (/penalty|imprisonment|fine|consequence|illegal|severe|prosecution/i.test(text))
        return { variant: 'warning', icon: '🚨' }
    if (/protect|defense|safe|benefit|advantage|correct|success|well done/i.test(text))
        return { variant: 'success', icon: '✅' }
    if (/objective|goal|training|learn|key statistic|important note/i.test(text))
        return { variant: 'primary', icon: '🎯' }
    return { variant: 'primary', icon: 'ℹ️' }
}

const ANSWER_LETTERS = ['A', 'B', 'C', 'D']

export function ModulePlayer({
    moduleId,
    moduleTitle,
    slides,
    questions,
    refreshersByGroup = {},
    initialProgress,
}: ModulePlayerProps) {
    // User passed the quiz but navigated away before signing — jump straight to the attestation screen
    const pendingAttestation = !!initialProgress?.is_completed && !initialProgress?.attestation_accepted

    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [showQuiz, setShowQuiz] = useState(pendingAttestation)

    // Refresher state
    const [showRefresher, setShowRefresher] = useState(false)
    const [refresherQuestions, setRefresherQuestions] = useState<Question[]>([])
    const [refresherStep, setRefresherStep] = useState(0)
    const [refresherSelectedId, setRefresherSelectedId] = useState<string | null>(null)
    const [refresherSubmitted, setRefresherSubmitted] = useState(false)
    const [refresherFeedback, setRefresherFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null)
    const completedRefresherSlides = useRef<Set<number>>(new Set())

    const loggedSlides = useRef<Set<string>>(new Set())
    const supabase = createClient()

    // Resolved once for the lifetime of the player. Previously every slide advance
    // paid a getUser() round trip to the Auth API just to stamp an activity row.
    const userIdRef = useRef<string | null>(null)

    const currentSlide = slides[currentSlideIndex]
    const isLastSlide = currentSlideIndex === slides.length - 1
    const progressPercent = ((currentSlideIndex + 1) / slides.length) * 100

    // checkpoint group = 1 after slide index 2, 2 after index 5, etc.
    const checkpointGroup = (slideIndex: number) => Math.ceil((slideIndex + 1) / 3)

    // Log slide_viewed for each unique slide visit
    useEffect(() => {
        if (!currentSlide?.id || loggedSlides.current.has(currentSlide.id)) return
        loggedSlides.current.add(currentSlide.id)

        const slideId = currentSlide.id
        const slideIndex = currentSlideIndex
        const slideTitle = currentSlide.title

        const log = (userId: string) => {
            void Promise.resolve(supabase.from('activity_log').insert({
                user_id: userId,
                module_id: moduleId,
                slide_id: slideId,
                event_type: 'slide_viewed',
                metadata: { slide_index: slideIndex, slide_title: slideTitle },
            })).catch(() => {})
        }

        if (userIdRef.current) {
            log(userIdRef.current)
            return
        }

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return
            userIdRef.current = user.id
            log(user.id)
        }).catch(() => {})
    }, [currentSlide?.id])

    const handleNext = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        if (isLastSlide) {
            logActivity(moduleId, 'quiz_started').catch(() => {})
            setShowQuiz(true)
            return
        }

        const isCheckpoint = (currentSlideIndex + 1) % 3 === 0
        const alreadyShown = completedRefresherSlides.current.has(currentSlideIndex)
        // Skip the refresher if advancing would land on the last slide — a check-in
        // right before the quiz feels redundant and jarring.
        const nextWouldBeLastSlide = currentSlideIndex + 1 === slides.length - 1

        if (isCheckpoint && !alreadyShown && !nextWouldBeLastSlide) {
            const groupNum = checkpointGroup(currentSlideIndex)
            // Prefer precisely mapped slide_group questions; fall back to quiz pool
            let toShow = (refreshersByGroup[groupNum] ?? []).slice(0, 2)
            if (toShow.length === 0 && questions.length > 0) {
                // Pick 2 from the quiz pool offset by checkpoint so each checkpoint
                // gets a different pair (questions are already shuffled at page load)
                const offset = (groupNum - 1) * 2
                toShow = questions.slice(offset, offset + 2)
                if (toShow.length === 0) toShow = questions.slice(0, 2)
            }

            if (toShow.length > 0) {
                setRefresherQuestions(toShow)
                setRefresherStep(0)
                setRefresherSelectedId(null)
                setRefresherSubmitted(false)
                setRefresherFeedback(null)
                setShowRefresher(true)
                return
            }
        }

        setCurrentSlideIndex(prev => prev + 1)
    }

    const handlePrev = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1)
        }
    }

    // Refresher handlers
    const handleRefresherSubmit = () => {
        if (!refresherSelectedId) return
        const q = refresherQuestions[refresherStep]
        const selected = q.answers.find(a => a.id === refresherSelectedId)
        const isCorrect = selected?.is_correct ?? false
        const correct = q.answers.find(a => a.is_correct)
        if (isCorrect) {
            setRefresherFeedback({
                text: q.explanation ? `Correct! ${q.explanation}` : 'Correct! Well done.',
                isCorrect: true,
            })
        } else {
            setRefresherFeedback({
                text: q.explanation
                    ? `Incorrect. Correct answer: "${correct?.text}". ${q.explanation}`
                    : `Incorrect. The correct answer was: "${correct?.text}".`,
                isCorrect: false,
            })
        }
        setRefresherSubmitted(true)
    }

    const handleRefresherNext = () => {
        // Advance to second question in the slot
        setRefresherStep(1)
        setRefresherSelectedId(null)
        setRefresherSubmitted(false)
        setRefresherFeedback(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleRefresherContinue = () => {
        completedRefresherSlides.current.add(currentSlideIndex)
        setShowRefresher(false)
        setCurrentSlideIndex(prev => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleQuizComplete = async (score: number, passed: boolean) => {
        try {
            await saveModuleProgress(moduleId, score, passed)
            if (passed) {
                toast.success('Module Completed!')
            } else {
                toast.error('Not passed. Please review and try again.')
            }
        } catch (error) {
            toast.error('Failed to save progress.')
            console.error(error)
        }
    }

    if (showQuiz) {
        return (
            <QuizPlayer
                questions={questions}
                moduleId={moduleId}
                moduleTitle={moduleTitle}
                onComplete={handleQuizComplete}
                initialShowResult={pendingAttestation}
                initialScore={pendingAttestation ? (initialProgress?.quiz_score ?? 0) : undefined}
            />
        )
    }

    // ── Refresher overlay ──────────────────────────────────────────────────────
    if (showRefresher) {
        const q = refresherQuestions[refresherStep]
        const totalSteps = refresherQuestions.length
        const isLastStep = refresherStep === totalSteps - 1

        return (
            <>
                {/* Progress bar (slide progress stays frozen during check-in) */}
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 100,
                    background: 'rgba(255,255,255,0.05)'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: 'linear-gradient(90deg, #a855f7, #22d3ee)',
                        transition: 'width 0.4s ease',
                        borderRadius: '0 2px 2px 0',
                        boxShadow: '0 0 8px rgba(168,85,247,0.6)'
                    }} />
                </div>

                {/* Top nav */}
                <header className="module-topbar">
                    <div className="module-topbar-left">
                        <div style={{ position: 'relative', width: 72, height: 32, flexShrink: 0 }}>
                            <Image
                                src="/aaplus_logo_colored.png"
                                alt="AA Plus"
                                fill
                                style={{ objectFit: 'contain', filter: 'invert(1)' }}
                            />
                        </div>
                        <div className="module-topbar-divider" />
                        <Link href="/dashboard" className="module-back-link">
                            ← Training Hub
                        </Link>
                    </div>
                    <div className="module-topbar-center">
                        <span className="module-topbar-title">{moduleTitle}</span>
                    </div>
                    <div className="module-topbar-right">
                        <span className="module-slide-counter">
                            {currentSlideIndex + 1} / {slides.length}
                        </span>
                    </div>
                </header>

                <main className="module-main">
                    <div className="module-content-wrapper">
                        {/* Badge + intro */}
                        <div style={{ marginBottom: 8 }}>
                            <span className="refresher-badge">Knowledge Check</span>
                        </div>
                        <p className="refresher-intro">
                            Before continuing, answer a quick question about what you've just covered.
                            {totalSteps > 1 && ` (${refresherStep + 1} of ${totalSteps})`}
                        </p>

                        {/* Question */}
                        <div style={{
                            background: 'var(--glass-card)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 16,
                            border: '1px solid var(--border-glass)',
                            padding: '32px',
                            marginBottom: 24,
                        }}>
                            <div className="question-text" style={{ marginBottom: 24 }}>
                                {q.text}
                            </div>

                            <div className="options-container">
                                {q.answers.map((answer, idx) => {
                                    const isSelected = refresherSelectedId === answer.id
                                    const isCorrectAnswer = answer.is_correct
                                    let cardClass = 'option-card'
                                    if (refresherSubmitted) {
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
                                            onClick={() => { if (!refresherSubmitted) setRefresherSelectedId(answer.id) }}
                                        >
                                            <div className="option-letter">{ANSWER_LETTERS[idx] ?? idx + 1}</div>
                                            <div className="option-text">{answer.text}</div>
                                        </div>
                                    )
                                })}
                            </div>

                            {refresherFeedback && (
                                <div className={`feedback-message ${refresherFeedback.isCorrect ? 'correct' : 'incorrect'}`}>
                                    {refresherFeedback.text}
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="navigation-footer">
                            <div />
                            {!refresherSubmitted ? (
                                <button
                                    onClick={handleRefresherSubmit}
                                    disabled={!refresherSelectedId}
                                    className="nav-btn next-btn"
                                    style={{
                                        opacity: refresherSelectedId ? 1 : 0.4,
                                        cursor: refresherSelectedId ? 'pointer' : 'not-allowed',
                                    }}
                                >
                                    Submit Answer
                                </button>
                            ) : isLastStep ? (
                                <button
                                    onClick={handleRefresherContinue}
                                    className="nav-btn next-btn"
                                    style={{ cursor: 'pointer' }}
                                >
                                    Continue Learning →
                                </button>
                            ) : (
                                <button
                                    onClick={handleRefresherNext}
                                    className="nav-btn next-btn"
                                    style={{ cursor: 'pointer' }}
                                >
                                    Next Question <ChevronRight className="inline w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </>
        )
    }

    // ── Normal slide view ──────────────────────────────────────────────────────
    return (
        <>
            {/* 3px progress line at very top */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 100,
                background: 'rgba(255,255,255,0.05)'
            }}>
                <div style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #a855f7, #22d3ee)',
                    transition: 'width 0.4s ease',
                    borderRadius: '0 2px 2px 0',
                    boxShadow: '0 0 8px rgba(168,85,247,0.6)'
                }} />
            </div>

            {/* Top navigation bar */}
            <header className="module-topbar">
                <div className="module-topbar-left">
                    <div style={{ position: 'relative', width: 72, height: 32, flexShrink: 0 }}>
                        <Image
                            src="/aaplus_logo_colored.png"
                            alt="AA Plus"
                            fill
                            style={{ objectFit: 'contain', filter: 'invert(1)' }}
                        />
                    </div>
                    <div className="module-topbar-divider" />
                    <Link href="/dashboard" className="module-back-link">
                        ← Training Hub
                    </Link>
                </div>
                <div className="module-topbar-center">
                    <span className="module-topbar-title">{moduleTitle}</span>
                </div>
                <div className="module-topbar-right">
                    <span className="module-slide-counter">
                        {currentSlideIndex + 1} / {slides.length}
                    </span>
                </div>
            </header>

            {/* Full-width main content */}
            <main className="module-main">
                <div className="module-content-wrapper">

                    <div className="content-header">
                        <div className="breadcrumb">Section {currentSlideIndex + 1} of {slides.length}</div>
                        <h1>{currentSlide.title}</h1>
                    </div>

                    <div key={`slide-${currentSlideIndex}`} className="module-slide-content">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                h1: ({ node, ...props }) => <h2 {...props} />,
                                h2: ({ node, ...props }) => <h2 {...props} />,
                                h3: ({ node, ...props }) => <h3 {...props} />,
                                ul: ({ node, ...props }) => (
                                    <ul className="learning-list" style={{ marginBottom: '20px' }} {...props} />
                                ),
                                ol: ({ node, ...props }) => (
                                    <ol className="module-steps" {...props} />
                                ),
                                blockquote: ({ children }) => {
                                    const { variant, icon } = getCardVariant(children)
                                    return (
                                        <div className={`info-card ${variant}`} style={{ marginBottom: 20 }}>
                                            <div className="info-icon">{icon}</div>
                                            <div>{children}</div>
                                        </div>
                                    )
                                },
                                hr: () => (
                                    <div style={{
                                        height: 1,
                                        background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.4), rgba(34,211,238,0.4), transparent)',
                                        margin: '30px 0'
                                    }} />
                                ),
                                strong: ({ node, ...props }) => <strong {...props} />,
                                p: ({ node, ...props }) => <p {...props} />,
                                table: ({ node, ...props }) => (
                                    <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }} {...props} />
                                    </div>
                                ),
                                thead: ({ node, ...props }) => (
                                    <thead style={{ background: 'rgba(99,102,241,0.15)' }} {...props} />
                                ),
                                tbody: ({ node, ...props }) => <tbody {...props} />,
                                tr: ({ node, ...props }) => (
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }} {...props} />
                                ),
                                th: ({ node, ...props }) => (
                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap', color: '#a5b4fc' }} {...props} />
                                ),
                                td: ({ node, ...props }) => (
                                    <td style={{ padding: '9px 14px', borderRight: '1px solid rgba(255,255,255,0.08)', verticalAlign: 'top', color: 'var(--text-light)' }} {...props} />
                                ),
                            }}
                        >
                            {currentSlide.content}
                        </ReactMarkdown>
                    </div>

                    <div className="navigation-footer">
                        <button
                            onClick={handlePrev}
                            disabled={currentSlideIndex === 0}
                            className="nav-btn prev-btn"
                            style={{ opacity: currentSlideIndex === 0 ? 0.4 : 1, cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer' }}
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={handleNext}
                            className="nav-btn next-btn"
                            style={{ cursor: 'pointer' }}
                        >
                            {isLastSlide ? 'Start Assessment 📝' : 'Next Section →'}
                        </button>
                    </div>

                </div>
            </main>
        </>
    )
}
