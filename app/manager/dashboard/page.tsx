import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock, Users, BookOpen, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ManagerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: me } = await supabase
        .from('users')
        .select('display_name, role, department_id, organization_id, departments(name)')
        .eq('id', user.id)
        .single()

    if (me?.role !== 'manager') redirect('/dashboard')

    const deptName = (me.departments as any)?.name || 'Your Department'

    // All users in same department (excluding self)
    const { data: teammates } = await supabase
        .from('users')
        .select('id, display_name, email')
        .eq('department_id', me.department_id)
        .neq('id', user.id)
        .order('display_name')

    const teammateIds = (teammates || []).map((t: any) => t.id)

    // Modules visible to this org
    const { data: orgModules } = await supabase
        .from('organization_modules')
        .select('module_id, modules(id, title)')
        .eq('organization_id', me.organization_id)

    const modules = (orgModules || [])
        .map((om: any) => om.modules)
        .filter(Boolean)

    // Progress for all teammates
    const { data: allProgress } = teammateIds.length > 0
        ? await supabase
            .from('user_progress')
            .select('user_id, module_id, quiz_score, completed_at, is_completed')
            .in('user_id', teammateIds)
        : { data: [] }

    // Build lookup: userId → { moduleId → progress }
    const progressMap = new Map<string, Map<string, any>>()
    ;(allProgress || []).forEach((p: any) => {
        if (!progressMap.has(p.user_id)) progressMap.set(p.user_id, new Map())
        progressMap.get(p.user_id)!.set(p.module_id, p)
    })

    // Summary stats
    const totalMembers = teammates?.length || 0
    const fullyCompliant = (teammates || []).filter((t: any) => {
        const userProg = progressMap.get(t.id)
        return modules.every((m: any) => (userProg?.get(m.id)?.quiz_score || 0) >= 70)
    }).length

    return (
        <div className="space-y-10 pb-24 relative">
            {/* Bg glows */}
            <div className="fixed top-20 right-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-2xl p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <p className="text-sm text-blue-400 font-semibold uppercase tracking-wide mb-2">Team Overview</p>
                        <h1 className="text-3xl font-extrabold text-white">{deptName}</h1>
                        <p className="text-slate-400 mt-1">Compliance status for your team</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{totalMembers}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Members</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">{fullyCompliant}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Fully Compliant</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-amber-400">{totalMembers - fullyCompliant}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Pending</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team table */}
            <div className="rounded-2xl bg-[#151A29]/60 border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-white">Team Members</span>
                    <span className="text-xs text-slate-500 ml-auto">{modules.length} module{modules.length !== 1 ? 's' : ''} assigned</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3 font-medium">Employee</th>
                                {modules.map((m: any) => (
                                    <th key={m.id} className="px-4 py-3 font-medium max-w-[120px]">
                                        <span className="block truncate max-w-[110px]" title={m.title}>{m.title}</span>
                                    </th>
                                ))}
                                <th className="px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(teammates || []).map((member: any) => {
                                const userProg = progressMap.get(member.id)
                                const allDone = modules.every((m: any) => (userProg?.get(m.id)?.quiz_score || 0) >= 70)
                                return (
                                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{member.display_name}</div>
                                            <div className="text-xs text-slate-500">{member.email}</div>
                                        </td>
                                        {modules.map((m: any) => {
                                            const p = userProg?.get(m.id)
                                            const passed = (p?.quiz_score || 0) >= 70
                                            return (
                                                <td key={m.id} className="px-4 py-4 text-center">
                                                    {passed ? (
                                                        <span title={`${p.quiz_score}%`}>
                                                            <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                                                        </span>
                                                    ) : (
                                                        <Clock className="w-4 h-4 text-slate-600 mx-auto" />
                                                    )}
                                                </td>
                                            )
                                        })}
                                        <td className="px-4 py-4">
                                            {allDone ? (
                                                <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                                                    <Trophy className="w-3 h-3" /> Compliant
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {(!teammates || teammates.length === 0) && (
                                <tr>
                                    <td colSpan={modules.length + 2} className="px-6 py-10 text-center text-slate-500">
                                        No other members in your department yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
