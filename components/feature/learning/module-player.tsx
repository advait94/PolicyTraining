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

type Slide = {
    id: string
    title: string
    content: string
    sequence_order: number
}

type Question = {
    id: string
    text: string
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
    initialProgress?: {
        is_completed: boolean
        quiz_score: number
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

export function ModulePlayer({
    moduleId,
    moduleTitle,
    slides,
    questions,
    initialProgress
}: ModulePlayerProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [showQuiz, setShowQuiz] = useState(false)
    const loggedSlides = useRef<Set<string>>(new Set())
    const supabase = createClient()

    const currentSlide = slides[currentSlideIndex]
    const isLastSlide = currentSlideIndex === slides.length - 1
    const progressPercent = ((currentSlideIndex + 1) / slides.length) * 100

    // Log slide_viewed for each unique slide visit
    useEffect(() => {
        if (!currentSlide?.id || loggedSlides.current.has(currentSlide.id)) return
        loggedSlides.current.add(currentSlide.id)

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return
            void Promise.resolve(supabase.from('activity_log').insert({
                user_id: user.id,
                module_id: moduleId,
                slide_id: currentSlide.id,
                event_type: 'slide_viewed',
                metadata: { slide_index: currentSlideIndex, slide_title: currentSlide.title },
            })).catch(() => {})
        }).catch(() => {})
    }, [currentSlide?.id])

    const handleNext = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        if (isLastSlide) {
            // Log quiz_started before switching to quiz view
            logActivity(moduleId, 'quiz_started').catch(() => {})
            setShowQuiz(true)
        } else {
            setCurrentSlideIndex(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1)
        }
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
            />
        )
    }

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
                                blockquote: ({ node, children }) => {
                                    const { variant, icon } = getCardVariant(children)
                                    return (
                                        <div className={`info-card ${variant}`} style={{ marginBottom: 20 }}>
                                            <div className="info-icon">{icon}</div>
                                            <div>{children}</div>
                                        </div>
                                    )
                                },
                                hr: ({ node, ...props }) => (
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
