'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CheckCircle, Lock, Menu, X } from 'lucide-react'
import { QuizPlayer } from '@/components/feature/quiz/quiz-player'
import { saveModuleProgress } from '@/app/actions/progress'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Types
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

export function ModulePlayer({
    moduleId,
    moduleTitle,
    slides,
    questions,
    initialProgress
}: ModulePlayerProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [showQuiz, setShowQuiz] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Mobile toggle if needed

    const currentSlide = slides[currentSlideIndex]
    const isLastSlide = currentSlideIndex === slides.length - 1
    const progressPercent = ((currentSlideIndex + 1) / slides.length) * 100

    const handleNext = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        if (isLastSlide) {
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

    const handleJumpToSlide = (index: number) => {
        setCurrentSlideIndex(index)
        setShowQuiz(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        // On mobile, close sidebar after content selection
        if (window.innerWidth < 1024) setIsSidebarOpen(false)
    }

    const handleQuizComplete = async (score: number, passed: boolean) => {
        try {
            await saveModuleProgress(moduleId, score, passed)
            if (passed) {
                toast.success('Module Completed! Certificate Unlocked.')
            } else {
                toast.error('Module Failed. Please try again.')
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
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar - Reference Style matched to AntiCorruption */}
            <aside className={cn(
                "bg-gradient-to-b from-[#01356f] to-[#012a58] text-white flex-col transition-all duration-300 absolute inset-y-0 left-0 z-30 lg:relative lg:translate-x-0 w-80 shadow-2xl flex",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Sidebar Header */}
                <div className="p-8 text-center border-b border-white/10">
                    <div className="w-32 h-auto relative bg-white rounded-lg p-2 mx-auto mb-6 shadow-lg">
                        <Image src="/aaplus_logo_colored.png" alt="Logo" width={100} height={50} className="object-contain" />
                    </div>
                    {/* Back Link */}
                    <Link href="/dashboard" className="inline-block text-blue-200 hover:text-[#009ee2] text-sm font-medium transition-colors mb-2">
                        &larr; Back to Dashboard
                    </Link>
                    <h2 className="font-bold text-lg leading-snug font-sans tracking-wide">{moduleTitle}</h2>
                </div>

                {/* Navigation List */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                    {slides.map((slide, idx) => {
                        const isActive = idx === currentSlideIndex
                        const isCompleted = idx < currentSlideIndex

                        return (
                            <button
                                key={slide.id}
                                onClick={() => handleJumpToSlide(idx)}
                                className={cn(
                                    "w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all rounded-xl",
                                    isActive
                                        ? "bg-[#009ee2] text-white font-semibold shadow-md"
                                        : "text-blue-100/70 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-7 h-7 rounded-lg text-xs shrink-0 font-bold",
                                    isActive ? "bg-white/20" : "bg-white/10"
                                )}>
                                    {isCompleted ? "✓" : idx + 1}
                                </div>
                                <span className="line-clamp-2">{slide.title}</span>
                            </button>
                        )
                    })}

                    <button
                        onClick={() => setShowQuiz(true)}
                        className={cn(
                            "w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all rounded-xl mt-4",
                            "text-blue-100/70 hover:bg-white/10 hover:text-white border border-white/10 ring-1 ring-white/5"
                        )}
                    >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/20 text-green-400 text-xs shrink-0 font-bold">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">Final Assessment</span>
                    </button>
                </div>

                {/* Sidebar Progress */}
                <div className="p-6 border-t border-white/10 mt-auto">
                    <div className="flex justify-between text-xs text-blue-300 mb-2 uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#009ee2] to-cyan-400 transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full bg-white relative">

                {/* Mobile Toggle */}
                <div className="lg:hidden p-4 border-b flex items-center justify-between bg-white text-gray-900 sticky top-0 z-20">
                    <span className="font-bold truncate">{currentSlide.title}</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-8 md:p-12 lg:p-16">
                        {/* Slide Header */}
                        <div className="mb-8 pb-6 border-b border-gray-100">
                            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
                                Section {currentSlideIndex + 1} of {slides.length}
                            </p>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                                {currentSlide.title}
                            </h1>
                        </div>

                        {/* Rich Content Rendering */}
                        <div className="module-content prose prose-sm max-w-none prose-p:text-slate-600 prose-headings:text-slate-800">
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    h1: ({ node, ...props }) => <h2 className="text-2xl font-bold text-[#003366] mt-8 mb-6 pb-2 border-b border-gray-100" {...props} />,
                                    h2: ({ node, ...props }) => <h3 className="text-xl font-bold text-[#003366] mt-8 mb-4" {...props} />,
                                    h3: ({ node, ...props }) => <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3" {...props} />,
                                    p: ({ node, ...props }) => <p className="leading-relaxed mb-6 text-gray-600" {...props} />,

                                    // Default Grid for ul if no specific class is present? 
                                    // Actually, let's trust the HTML classes if present, otherwise default to list
                                    ul: ({ node, className, ...props }: any) => {
                                        if (className?.includes('key-points-grid')) return <div className={className} {...props} />;
                                        return <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 list-none pl-0 my-8" {...props} />
                                    },

                                    // Styled Boxes
                                    blockquote: ({ node, ...props }: any) => (
                                        <div className="bg-white border text-left border-l-4 border-l-red-500 rounded-xl p-6 my-8 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-red-700 font-bold">
                                                <Lock className="w-5 h-5" />
                                                <span>Critical Concept</span>
                                            </div>
                                            <div className="text-gray-700 italic" {...props} />
                                        </div>
                                    ),
                                    strong: ({ node, ...props }) => <span className="font-bold text-[#003366]" {...props} />,
                                }}
                            >
                                {currentSlide.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation Bar */}
                <div className="bg-white border-t border-gray-200 p-4 lg:p-6 flex justify-between items-center sticky bottom-0 z-10 shrink-0">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentSlideIndex === 0}
                        className="gap-2 rounded-xl h-11 px-6 border-gray-200 text-gray-600 hover:text-[#003366] hover:border-blue-200"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>

                    <Button
                        onClick={handleNext}
                        className={cn(
                            "gap-2 rounded-xl h-11 px-8 shadow-lg transition-transform active:scale-95",
                            isLastSlide ? "bg-green-600 hover:bg-green-700 text-white" : "bg-[#003366] hover:bg-[#002244] text-white"
                        )}
                    >
                        {isLastSlide ? (
                            <>Start Assessment <CheckCircle className="w-4 h-4" /></>
                        ) : (
                            <>Next Section <ChevronRight className="w-4 h-4" /></>
                        )}
                    </Button>
                </div>
            </main>
        </div>
    )
}
