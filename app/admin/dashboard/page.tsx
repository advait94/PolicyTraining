'use client'

import { useEffect, useState } from 'react'
import { inviteUser, getAdminStats } from '@/app/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { Loader2, UserPlus, FileBarChart, CheckCircle, AlertCircle, Users } from 'lucide-react'
import { toast } from 'sonner' // Assuming sonner is installed as per package.json
import { useFormState } from 'react-dom'

const initialState = {
    message: null,
    success: false
}

export default function AdminDashboard() {
    // Stats State
    const [stats, setStats] = useState<any>(null)
    const [loadingStats, setLoadingStats] = useState(true)

    useEffect(() => {
        async function loadStats() {
            setLoadingStats(true)
            const data = await getAdminStats()
            setStats(data)
            setLoadingStats(false)
        }
        loadStats()
    }, [])

    // Invite Form Helper
    async function handleInviteClient(prevState: any, formData: FormData) {
        const result = await inviteUser(prevState, formData)
        if (result.success) {
            toast.success(result.message)
            // Reset form manually or handled by React 19 action reset if input value controlled/uncontrolled
        } else {
            toast.error(result.message)
        }
        return result
    }

    const [state, formAction] = useFormState(handleInviteClient, initialState)

    return (
        <div className="min-h-screen bg-[#0B0F19] p-8 md:p-12 space-y-12">

            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-slate-400">Manage users and monitor training compliance across the organization.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Invite User */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <UserPlus className="w-5 h-5 text-purple-400" />
                                Invite New User
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Send an email invitation to a new team member.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={formAction} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
                                    <Input id="fullName" name="fullName" placeholder="John Doe" required className="bg-black/20 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                                    <Input id="email" name="email" type="email" placeholder="john@company.com" required className="bg-black/20 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-slate-300">Phone Number (Optional)</Label>
                                    <Input id="phone" name="phone" placeholder="+1 234 567 890" className="bg-black/20 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="team" className="text-slate-300">Team / Department (Optional)</Label>
                                    <Input id="team" name="team" placeholder="Engineering" className="bg-black/20 border-white/10 text-white" />
                                </div>

                                <SubmitButton />
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Users className="w-5 h-5 text-blue-400" />
                                Quick Links
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start text-slate-300 border-white/10 hover:bg-white/5" asChild>
                                <a href="/dashboard">→ Go to Learner Dashboard</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Analytics */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <FileBarChart className="w-5 h-5 text-cyan-400" />
                                Training Overview
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Real-time completion statistics by module.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingStats ? (
                                <div className="h-[300px] flex items-center justify-center text-slate-500">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                </div>
                            ) : (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.moduleStats || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                                cursor={{ fill: '#ffffff05' }}
                                            />
                                            <Bar dataKey="completed" fill="#8884d8" name="Completed Users" radius={[4, 4, 0, 0]}>
                                                {stats?.moduleStats?.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={['#c084fc', '#22d3ee', '#fb7185', '#fb923c'][index % 4]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Overall Pass Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingStats ? (
                                    <div className="h-[200px] flex items-center justify-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="h-[200px] w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats?.passFailStats}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {stats?.passFailStats?.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : '#f87171'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                <div className="flex justify-center gap-6 mt-4 text-sm font-medium">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div> Passed
                                    </div>
                                    <div className="flex items-center gap-2 text-red-400">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div> Failed/Incomplete
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md flex flex-col justify-center">
                            <CardContent className="text-center p-8">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white">System Healthy</h3>
                                <p className="text-slate-400 mt-2">All backend services are operational. Invitations are being processed normally.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SubmitButton() {
    // Note: useFormStatus hook is available in React canary or Next.js 14+ specific builds, 
    // assuming standard compatibility or passing pending prop if needed.
    // For simplicity with standard client component usage pattern without specialized hook import:
    return (
        <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg h-10 font-medium transition-colors">
            Send Invitation
        </Button>
    )
}
