import { createClient } from '@/lib/supabase/server'
import { getCompanyEmployees } from '@/lib/data/employees'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Building, ShieldCheck, Mail, BookOpen } from 'lucide-react'

export default async function OrganizationDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = createClient()

    // 1. Auth Check (Superadmin only)
    const { data: isSuperAdmin } = await (await supabase).rpc('is_super_admin')
    if (!isSuperAdmin) {
        redirect('/404')
    }

    // 2. Fetch Organization Details
    const { data: org, error } = await (await supabase)
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !org) {
        return <div className="p-8 text-center text-red-400">Organization not found.</div>
    }

    // 3. Fetch Employees for this Org
    const employees = await getCompanyEmployees(id)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link href="/superadmin" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                        <Building className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{org.name}</h1>
                        <p className="text-slate-400 font-mono text-sm mt-1">{org.id}</p>
                    </div>
                    <div className="ml-auto">
                        <span className="px-3 py-1 bg-white/10 border border-white/5 rounded-full text-xs text-slate-300 font-mono">
                            {org.slug}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-slate-300">Total Users</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{employees?.length || 0}</div>
                </div>

                <div className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-medium text-slate-300">Admins</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {employees?.filter(e => e.role === 'admin').length || 0}
                    </div>
                </div>

                <div className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-5 h-5 text-orange-400" />
                        <span className="text-sm font-medium text-slate-300">Avg. Completion</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {/* Placeholder for real average calc if we had module count */}
                        {employees && employees.length > 0
                            ? Math.round(employees.reduce((acc, curr) => acc + curr.modules_completed, 0) / employees.length)
                            : 0}
                        <span className="text-sm font-normal text-slate-500 ml-2">modules/user</span>
                    </div>
                </div>
            </div>

            {/* Employee List */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">Organization Members</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-400">
                            <tr>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">User</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Role</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Progress</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {employees?.map((emp) => (
                                <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{emp.name}</div>
                                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                                            <Mail className="w-3 h-3" /> {emp.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${emp.role === 'admin'
                                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                : 'bg-slate-700/30 text-slate-300 border border-slate-600/30'
                                            }`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        {emp.modules_completed} Modules Completed
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!employees || employees.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No members found in this organization.
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
