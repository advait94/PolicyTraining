import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthSync } from '@/components/feature/auth/auth-sync'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen, CheckCircle, Lock, PlayCircle, Star, Trophy, Shield, HeartPulse, Scale, FileText, Globe, ArrowRight, RefreshCw } from 'lucide-react'
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


export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Role Check & Redirect
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')
    if (isSuperAdmin) {
        redirect('/superadmin')
    }

    const { data: userRole } = await supabase
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (userRole?.role === 'admin') {
        redirect('/admin/dashboard')
    }

    // Fetch user's org + department + name
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, department_id, display_name')
        .eq('id', user?.id)
        .single()

    // If the user has no department assigned, show the contact-admin screen
    if (!userData?.department_id) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-8">
                <div className="text-center max-w-md space-y-4">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">No Department Assigned</h2>
                    <p className="text-slate-400">
                        Your account has not been assigned to a department yet. Please contact your administrator to get access to your training modules.
                    </p>
                </div>
            </div>
        )
    }

    // Get modules visible to this user:
    // - Must be org-enabled (in organization_modules)
    // - AND either: all_employees=true OR user's dept is in department_module_assignments
    let moduleIdFilter: string[] | null = null
    if (userData?.organization_id) {
        const [orgModuleData, deptModuleData] = await Promise.all([
            supabase
                .from('organization_modules')
                .select('module_id, all_employees')
                .eq('organization_id', userData.organization_id),
            supabase
                .from('department_module_assignments')
                .select('module_id')
                .eq('department_id', userData.department_id)
        ])

        const deptModuleIds = new Set((deptModuleData.data || []).map((m: any) => m.module_id))

        moduleIdFilter = (orgModuleData.data || [])
            .filter((om: any) => om.all_employees || deptModuleIds.has(om.module_id))
            .map((om: any) => om.module_id)
    }

    // If no modules are assigned to this department yet, show info screen
    if (moduleIdFilter !== null && moduleIdFilter.length === 0) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-8">
                <div className="text-center max-w-md space-y-4">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">No Modules Available Yet</h2>
                    <p className="text-slate-400">
                        No training modules have been assigned to your department yet. Please contact your administrator.
                    </p>
                </div>
            </div>
        )
    }

    // Fetch deadlines for this org
    const { data: deadlinesData } = userData?.organization_id
        ? await supabase
            .from('organization_module_deadlines')
            .select('module_id, due_date')
            .eq('organization_id', userData.organization_id)
        : { data: [] }
    const deadlineMap = new Map((deadlinesData || []).map((d: any) => [d.module_id, d.due_date]))

    // Fetch modules scoped to the intersection filter
    let modulesQuery = supabase
        .from('modules')
        .select(`
            id,
            title,
            description,
            sequence_order,
            slides (id)
        `)
        .order('sequence_order', { ascending: true })

    if (moduleIdFilter) {
        modulesQuery = modulesQuery.in('id', moduleIdFilter)
    }

    const { data: modulesData, error: modulesError } = await modulesQuery

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

    // Detect expired certifications (completed > 1 year ago)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const expiredModules = modules?.filter((m: any) => {
        const p = m.user_progress?.[0]
        return p?.completed_at && (p.quiz_score || 0) >= 70 && new Date(p.completed_at) < oneYearAgo
    }) || []

    return (
        <div className="space-y-12 pb-24 relative">
            <AuthSync />
            {/* Background Glows for Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* Recertification Warning */}
            {expiredModules.length > 0 && (
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Star className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-amber-300 font-semibold text-sm">
                            {expiredModules.length === 1
                                ? '1 certification has expired and requires renewal'
                                : `${expiredModules.length} certifications have expired and require renewal`}
                        </p>
                        <p className="text-amber-400/70 text-xs mt-1">
                            {expiredModules.map((m: any) => m.title).join(', ')} — certifications are valid for one year. Retake the assessment to renew.
                        </p>
                    </div>
                </div>
            )}

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
                                    {userData?.display_name?.split(' ')[0] || 'Learner'}
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
                        const deadline = deadlineMap.get(mod.id) as string | undefined
                        const now = new Date()
                        const deadlineDate = deadline ? new Date(deadline) : null
                        const isOverdue = deadlineDate && deadlineDate < now && !isCompleted
                        const isDueSoon = deadlineDate && !isOverdue && !isCompleted

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

                                        {(isOverdue || isDueSoon) && (
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-4 ${isOverdue ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-red-400' : 'bg-amber-400'}`} />
                                                {isOverdue
                                                    ? `Overdue — ${deadlineDate!.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                                                    : `Due ${deadlineDate!.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                            </div>
                                        )}
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
                                            <div className="w-full flex gap-3">
                                                <a href={`/certificate/${mod.id}`} className="flex-1">
                                                    <Button className="w-full h-12 text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white border border-white/10">
                                                        <Trophy className="mr-2 w-4 h-4" /> Certificate
                                                    </Button>
                                                </a>
                                                <a href={`/modules/${mod.id}`}>
                                                    <Button variant="outline" className="h-12 px-4 rounded-xl border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300 cursor-pointer">
                                                        <RefreshCw className="w-4 h-4" />
                                                    </Button>
                                                </a>
                                            </div>
                                        ) : (
                                            <a href={`/modules/${mod.id}`} className="w-full">
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
