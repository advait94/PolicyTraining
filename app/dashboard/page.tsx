import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthSync } from '@/components/feature/auth/auth-sync'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen, CheckCircle, Lock, PlayCircle, Star, Trophy, Shield, HeartPulse, Scale, FileText, Globe, ArrowRight } from 'lucide-react'
import Image from 'next/image'

// Helper to determine module styling based on title/keywords - Mapped to Neon Palette
const getModuleTheme = (title: string) => {
    const t = title.toLowerCase()

    // Default Neo-Glass Style
    let theme = {
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-900/30',
        borderColor: 'border-cyan-500/30',
        glow: 'shadow-cyan-500/20'
    }

    if (t.includes('corruption') || t.includes('bribery')) theme = {
        iconColor: 'text-orange-400',
        iconBg: 'bg-orange-900/30',
        borderColor: 'border-orange-500/30',
        glow: 'shadow-orange-500/20'
    }
    if (t.includes('posh') || t.includes('harassment')) theme = {
        iconColor: 'text-pink-400',
        iconBg: 'bg-pink-900/30',
        borderColor: 'border-pink-500/30',
        glow: 'shadow-pink-500/20'
    }
    if (t.includes('privacy') || t.includes('data')) theme = {
        iconColor: 'text-blue-400',
        iconBg: 'bg-blue-900/30',
        borderColor: 'border-blue-500/30',
        glow: 'shadow-blue-500/20'
    }
    if (t.includes('security') || t.includes('cyber')) theme = {
        iconColor: 'text-purple-400',
        iconBg: 'bg-purple-900/30',
        borderColor: 'border-purple-500/30',
        glow: 'shadow-purple-500/20'
    }

    return theme
}

// Icon mapping (same as before)
const getIcon = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes('corruption') || t.includes('bribery')) return Scale
    if (t.includes('posh') || t.includes('harassment')) return HeartPulse
    if (t.includes('privacy') || t.includes('data')) return FileText
    if (t.includes('health') || t.includes('safety')) return Globe
    if (t.includes('security') || t.includes('cyber')) return Shield
    return BookOpen
}

const MODULE_SLUGS: Record<string, string> = {
    '510e88a4-f501-4ba7-acc4-4f687fff65cc': 'posh',
    '89fa7f59-1df4-4d03-99f6-c302afc0618b': 'DataPrivacy',
    '1875f87e-8e89-4bab-80da-72a1925af152': 'hse',
    'a0c3c3d3-c9a1-447d-87ac-440c14484c87': 'CyberSecurity',
    'b91198d4-8edc-40fc-b30e-3f5ddaeecd66': 'AntiCorruption'
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Role Check & Redirect
    const { data: userRole } = await supabase
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (userRole?.role === 'admin') {
        redirect('/admin/dashboard')
    }

    // Fetch modules
    const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select(`
            id,
            title,
            description,
            sequence_order,
            slides (id)
        `)
        .order('sequence_order', { ascending: true })

    // Fetch user progress explicitly to avoid RLS/nested relation ambiguities
    const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user?.id)

    if (modulesError) {
        return <div className="p-8 text-center text-red-400">Error loading modules.</div>
    }

    // Merge progress into modules
    const modules = modulesData?.map((m: any) => ({
        ...m,
        user_progress: progressData?.filter((p: any) => p.module_id === m.id) || []
    }))

    // Calculate overall progress
    const totalModules = modules?.length || 0
    const completedModules = modules?.filter((m: any) => (m.user_progress?.[0]?.quiz_score || 0) >= 70).length || 0
    const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

    return (
        <div className="space-y-12 pb-24 relative">
            <AuthSync />
            {/* Background Glows for Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* Hero Section - Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-2xl isolate p-8 md:p-12">

                {/* Inner Glow */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-sm font-medium text-green-400 tracking-wide uppercase">Compliance Portal Active</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
                                Welcome back, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse">
                                    Learner
                                </span>
                            </h1>
                        </div>
                        <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                            Your personalized hub for policy mastery. Track your progress, complete certifications, and stay compliant with industry standards.
                        </p>
                    </div>

                    {/* Progress Ring - Neon Style */}
                    <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-full border border-white/5 shadow-inner">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351.8} strokeDashoffset={351.8 - (351.8 * progressPercentage / 100)} className="text-cyan-400 transition-all duration-1000 ease-out" strokeLinecap="round" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-bold text-white tracking-widest">{progressPercentage}%</span>
                            </div>
                        </div>
                        <span className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-[0.2em]">Completion</span>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                    <h2 className="text-2xl font-bold text-white tracking-wide">Assigned Modules</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {modules?.map((mod: any, index: number) => {
                        const progress = mod.user_progress?.[0]
                        const slideCount = mod.slides?.length || 0
                        const isCompleted = (progress?.quiz_score || 0) >= 70
                        const score = progress?.quiz_score
                        const theme = getModuleTheme(mod.title)
                        const ThemeIcon = getIcon(mod.title)

                        return (
                            <div key={mod.id} className="group h-full relative">
                                {/* Hover Glow Effect */}
                                <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${theme.iconColor.replace('text-', 'from-')} to-transparent opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />

                                <Card className={`relative h-full flex flex-col border ${theme.borderColor} rounded-2xl bg-[#151A29]/60 backdrop-blur-md shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-[#151A29]/80 overflow-hidden`}>

                                    <CardHeader className="pt-8 pb-4 px-8 relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`p-3 rounded-xl ${theme.iconBg} ${theme.iconColor} border border-white/5`}>
                                                <ThemeIcon className="w-6 h-6" />
                                            </div>
                                            {isCompleted ? (
                                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Complete
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-500 border-slate-700 bg-black/20">
                                                    Pending
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-white leading-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                                            {mod.title}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="flex-1 px-8 relative z-10">
                                        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed mb-6">
                                            {mod.description || "Master the key concepts and policies in this comprehensive training module."}
                                        </p>

                                        <div className="flex items-center justify-between text-xs font-medium text-slate-500 border-t border-white/5 pt-4">
                                            <span>{slideCount} Slides</span>
                                            {score !== null && score !== undefined && (
                                                <div className="text-right">
                                                    <span className={`${score >= 80 ? 'text-green-400' : 'text-orange-400'} font-bold block`}>
                                                        Score: {score}%
                                                    </span>
                                                    {isCompleted && (
                                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mt-1">
                                                            Valid Till: {new Date(new Date(progress.completed_at || Date.now()).setFullYear(new Date(progress.completed_at || Date.now()).getFullYear() + 1)).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-4 pb-8 px-8 relative z-10">
                                        {isCompleted ? (
                                            <a href={`/certificate/${mod.id}`} className="w-full">
                                                <Button className="w-full h-12 text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white border border-white/10">
                                                    <span className="flex items-center">
                                                        <Trophy className="mr-2 w-4 h-4" /> View Certificate
                                                    </span>
                                                </Button>
                                            </a>
                                        ) : (
                                            <a href={`/${MODULE_SLUGS[mod.id] || 'AntiCorruption'}/index.html`} className="w-full">
                                                <Button className="w-full h-12 text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white border border-white/10">
                                                    <span className="flex items-center">
                                                        Start Training <ArrowRight className="ml-2 w-4 h-4" />
                                                    </span>
                                                </Button>
                                            </a>
                                        )}
                                    </CardFooter>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
