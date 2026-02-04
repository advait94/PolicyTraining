'use client'

import { useEffect, useState } from 'react'
import { inviteUser, getAdminStats, getCompanyUsers, getComplianceReport, bulkInviteUsers } from '@/app/actions/admin'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts'
import { Loader2, UserPlus, FileBarChart, Users, AlertTriangle, GraduationCap, Download, Search, CheckCircle, Clock, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
    const router = useRouter()
    const supabase = createClient()

    // Stats State
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false)
    const [stats, setStats] = useState<any>(null)
    const [users, setUsers] = useState<any[]>([])
    const [loadingStats, setLoadingStats] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Bulk Invite State
    const [bulkPreview, setBulkPreview] = useState<{ name: string, email: string }[]>([])
    const [isBulkUploading, setIsBulkUploading] = useState(false)

    // Handle File Upload & Parse
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json(ws) as any[]

            // Normalize map keys to lowercase
            const normalized = data.map(row => {
                const newRow: any = {}
                Object.keys(row).forEach(key => {
                    newRow[key.toLowerCase().trim()] = row[key]
                })
                return newRow
            })

            // Extract Name/Email
            const validUsers = normalized
                .filter(r => (r.email || r['email address']) && (r.name || r.fullname || r['full name']))
                .map(r => ({
                    name: r.name || r.fullname || r['full name'],
                    email: r.email || r['email address']
                }))

            if (validUsers.length === 0) {
                toast.error('No valid rows found. Ensure columns are "Name" and "Email".')
                return
            }

            setBulkPreview(validUsers)
            toast.success(`Loaded ${validUsers.length} users`)
        }
        reader.readAsBinaryString(file)
    }

    // Handle Bulk Submit
    const handleBulkSubmit = async () => {
        if (bulkPreview.length === 0) return
        setIsBulkUploading(true)
        try {
            const result = await bulkInviteUsers(bulkPreview)
            if (result.success) {
                toast.success(result.message)
                if (result.details && result.details.failed > 0) {
                    toast.warning(`${result.details.failed} invites failed. Check console.`)
                    console.error('Bulk Failures:', result.details.errors)
                }
                setBulkPreview([])
                // Refresh list
                const newUsers = await getCompanyUsers()
                setUsers(newUsers || [])
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error('Bulk upload failed')
        } finally {
            setIsBulkUploading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    useEffect(() => {
        async function checkAuthAndLoadData() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            // Check Superadmin status
            const { data: superAdminCheck } = await supabase.rpc('is_super_admin')
            setIsSuperAdmin(!!superAdminCheck)

            // Verify admin role in public table
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (userData?.role !== 'admin') {
                setIsAdmin(false)
                toast.error('Unauthorized access. Redirecting...')
                setTimeout(() => router.push('/dashboard'), 2000)
                return
            }

            setIsAdmin(true)
            setLoadingStats(true)
            const [statsData, usersData] = await Promise.all([
                getAdminStats(),
                getCompanyUsers()
            ])
            setStats(statsData)
            setUsers(usersData || [])
            setLoadingStats(false)
        }
        checkAuthAndLoadData()
    }, [])

    if (isAdmin === false) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-8">
                <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md max-w-md w-full text-center p-8">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Unauthorized Access</h2>
                    <p className="text-slate-400">Redirecting you to the learner dashboard...</p>
                </Card>
            </div>
        )
    }

    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        )
    }

    // Invite Form Handler
    async function handleInvite(formData: FormData) {
        const result = await inviteUser(null, formData)
        if (result.success) {
            toast.success(result.message)
            // Ideally refresh users list here
            const newUsers = await getCompanyUsers()
            setUsers(newUsers || [])
        } else {
            toast.error(result.message)
        }
    }

    // CSV Download
    async function handleDownloadReport() {
        try {
            toast.info('Generating report...')
            const reportData = await getComplianceReport()
            if (!reportData) throw new Error("No data received")

            // Convert to CSV
            const headers = Object.keys(reportData[0]).join(',')
            const rows = reportData.map((row: any) => Object.values(row).map(v => `"${v}"`).join(',')).join('\n')
            const csvContent = "data:text/csv;charset=utf-8," + headers + '\n' + rows

            const encodedUri = encodeURI(csvContent)
            const link = document.createElement("a")
            link.setAttribute("href", encodedUri)
            link.setAttribute("download", `compliance_report_${new Date().toISOString().slice(0, 10)}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success('Report downloaded successfully')
        } catch (e) {
            toast.error('Failed to download report')
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#0B0F19] p-8 md:p-12 space-y-8">

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-slate-400">Manage users and monitor training compliance.</p>
                </div>
                <div className="flex gap-4">
                    {isSuperAdmin && (
                        <Button
                            variant="outline"
                            onClick={() => router.push('/superadmin')}
                            className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10 rounded-lg"
                        >
                            <span className="mr-2">🛡️</span>
                            Switch to Superadmin
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/admin/settings')}
                        className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                        <span className="mr-2">⚙️</span>
                        Settings
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-[#151A29] border border-white/10 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">Overview</TabsTrigger>
                    <TabsTrigger value="people" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">People</TabsTrigger>
                    <TabsTrigger value="reports" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">Reports</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Invite & Stats */}
                        <div className="lg:col-span-1 space-y-8">
                            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-white">
                                            <UserPlus className="w-5 h-5 text-purple-400" />
                                            Invite Users
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-slate-400">Add new members to your organization.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="single" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 bg-black/20 mb-4">
                                            <TabsTrigger value="single">Single Invite</TabsTrigger>
                                            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="single">
                                            <form action={handleInvite} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
                                                    <Input id="fullName" name="fullName" placeholder="John Doe" required className="bg-black/20 border-white/10 text-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                                                    <Input id="email" name="email" type="email" placeholder="john@company.com" required className="bg-black/20 border-white/10 text-white" />
                                                </div>
                                                <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">Send Invitation</Button>
                                            </form>
                                        </TabsContent>

                                        <TabsContent value="bulk" className="space-y-4">
                                            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                                                <Input
                                                    type="file"
                                                    accept=".csv, .xlsx, .xls"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={handleFileUpload}
                                                />
                                                <div className="space-y-2 pointer-events-none">
                                                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto text-purple-400">
                                                        <FileBarChart className="w-5 h-5" />
                                                    </div>
                                                    <p className="text-sm text-slate-300 font-medium">Click or drag file to upload</p>
                                                    <p className="text-xs text-slate-500">CSV or Excel (Name, Email columns)</p>
                                                </div>
                                            </div>

                                            {bulkPreview.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-400 flex justify-between">
                                                        <span>Preview ({bulkPreview.length} users)</span>
                                                        <button onClick={() => setBulkPreview([])} className="text-red-400 hover:text-red-300">Clear</button>
                                                    </div>
                                                    <div className="max-h-32 overflow-y-auto rounded-md border border-white/10 text-xs">
                                                        <table className="w-full text-left text-slate-300">
                                                            <thead className="bg-white/5 sticky top-0">
                                                                <tr>
                                                                    <th className="p-2">Name</th>
                                                                    <th className="p-2">Email</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {bulkPreview.slice(0, 10).map((u, i) => (
                                                                    <tr key={i} className="border-t border-white/5">
                                                                        <td className="p-2 truncate max-w-[100px]">{u.name}</td>
                                                                        <td className="p-2 truncate max-w-[150px]">{u.email}</td>
                                                                    </tr>
                                                                ))}
                                                                {bulkPreview.length > 10 && (
                                                                    <tr><td colSpan={2} className="p-2 text-center text-slate-500">...and {bulkPreview.length - 10} more</td></tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <Button onClick={handleBulkSubmit} disabled={isBulkUploading} className="w-full bg-green-600 hover:bg-green-500 text-white">
                                                        {isBulkUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                                        {isBulkUploading ? 'Processing...' : `Invite ${bulkPreview.length} Users`}
                                                    </Button>
                                                </div>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>

                            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white"><Users className="w-5 h-5 text-blue-400" /> Organization Size</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingStats ? <Loader2 className="animate-spin text-slate-500" /> : (
                                        <div className="text-4xl font-bold text-white">{stats?.totalEmployees || 0}<span className="text-lg text-slate-400 font-normal ml-2">Employees</span></div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Analytics */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white"><FileBarChart className="w-5 h-5 text-cyan-400" /> Training Completion</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingStats ? <div className="h-[300px] flex items-center justify-center"><Loader2 className="animate-spin" /></div> : (
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats?.moduleStats || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} cursor={{ fill: '#ffffff05' }} formatter={(value: any) => [`${value}%`, 'Completion']} />
                                                    <Bar dataKey="percentage" name="Completion %" radius={[4, 4, 0, 0]}>
                                                        {stats?.moduleStats?.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={['#c084fc', '#22d3ee', '#fb7185', '#fb923c'][index % 4]} />)}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white"><AlertTriangle className="w-5 h-5 text-red-400" /> At Risk Certifications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingStats ? <Loader2 className="animate-spin" /> : (
                                        <div className="space-y-4">
                                            {stats?.expiredCertifications?.length === 0 ? <div className="text-slate-500">No expired certifications.</div> : stats?.expiredCertifications?.map((user: any, idx: number) => (
                                                <div key={idx} className="flex justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                                    <div className="flex gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"><GraduationCap className="w-5 h-5" /></div>
                                                        <div><div className="text-white font-medium">{user.display_name}</div><div className="text-sm text-slate-400">{user.email}</div></div>
                                                    </div>
                                                    <div className="text-right"><div className="text-sm text-slate-300">{user.module_title}</div><div className="text-xs text-red-400">Expired: {new Date(user.completed_at).toLocaleDateString()}</div></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* PEOPLE TAB */}
                <TabsContent value="people">
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white">People</CardTitle>
                                <CardDescription className="text-slate-400">All employees in your organization.</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    placeholder="Search people..."
                                    className="pl-9 bg-black/20 border-white/10 text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-white/10 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-slate-300 font-medium">
                                        <tr>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4">Modules Completed</th>
                                            <th className="p-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-white font-medium">{user.name}</td>
                                                <td className="p-4 text-slate-400">{user.email}</td>
                                                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>{user.role}</span></td>
                                                <td className="p-4 text-slate-300">{user.modules_completed}</td>
                                                <td className="p-4">
                                                    {user.modules_completed > 0 ? (
                                                        <span className="flex items-center text-green-400 gap-1"><CheckCircle className="w-3 h-3" /> Active</span>
                                                    ) : (
                                                        <span className="flex items-center text-slate-500 gap-1"><Clock className="w-3 h-3" /> Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* REPORTS TAB */}
                <TabsContent value="reports">
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white">Compliance Reports</CardTitle>
                            <CardDescription className="text-slate-400">Download detailed training records for auditing.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
                                <div>
                                    <h3 className="text-lg font-medium text-white">Full Organization Compliance Report</h3>
                                    <p className="text-slate-400 mt-1">Includes detailed progress for every employee and module.</p>
                                </div>
                                <Button onClick={handleDownloadReport} className="bg-green-600 hover:bg-green-500 text-white flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Download CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    )
}
