'use client'

import { useEffect, useRef, useState } from 'react'
import { getReportChartData, getComplianceReport } from '@/app/actions/admin'
import { PlanGate } from '@/components/feature/plan/plan-gate'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, LineChart, Line, Legend
} from 'recharts'
import {
    Download, Loader2, Users, Trophy, TrendingUp,
    Target, FileDown, AlertCircle, Calendar, RefreshCw
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

// ── Colours ──────────────────────────────────────────────────────────────────
const SCORE_COLORS: Record<string, string> = {
    '0–39 (Fail)': '#f87171',
    '40–59': '#fb923c',
    '60–69': '#facc15',
    '70–79 (Pass)': '#34d399',
    '80–100 (Distinction)': '#a855f7',
}
const STATUS_COLORS = { completed: '#34d399', inProgress: '#facc15', notStarted: '#475569' }

// ── Quick date presets ────────────────────────────────────────────────────────
const PRESETS = [
    { label: 'All time', startDate: '', endDate: '' },
    {
        label: 'This year',
        startDate: `${new Date().getFullYear()}-01-01`,
        endDate: new Date().toISOString().slice(0, 10),
    },
    {
        label: 'Last 6 months',
        get startDate() {
            const d = new Date(); d.setMonth(d.getMonth() - 6); return d.toISOString().slice(0, 10)
        },
        endDate: new Date().toISOString().slice(0, 10),
    },
    {
        label: 'Last 30 days',
        get startDate() {
            const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10)
        },
        endDate: new Date().toISOString().slice(0, 10),
    },
]

// ── Download helper ───────────────────────────────────────────────────────────
async function downloadChartAsPng(ref: React.RefObject<HTMLDivElement | null>, filename: string) {
    const html2canvas = (await import('html2canvas')).default
    if (!ref.current) return
    try {
        const canvas = await html2canvas(ref.current, { backgroundColor: '#0B0F19', scale: 2, useCORS: true })
        const link = document.createElement('a')
        link.download = `${filename}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
    } catch {
        toast.error('Failed to download chart')
    }
}

// ── Chart wrapper ─────────────────────────────────────────────────────────────
function ChartCard({
    title, description, filename, children,
}: {
    title: string; description?: string; filename: string; children: React.ReactNode
}) {
    const ref = useRef<HTMLDivElement>(null)
    return (
        <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                    <CardTitle className="text-white text-base">{title}</CardTitle>
                    {description && <CardDescription className="text-slate-400 text-xs mt-1">{description}</CardDescription>}
                </div>
                <Button
                    size="sm" variant="ghost"
                    onClick={() => downloadChartAsPng(ref, filename)}
                    className="text-slate-400 hover:text-white hover:bg-white/10 shrink-0 ml-4"
                    title="Download as PNG"
                >
                    <FileDown className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div ref={ref} className="bg-[#0B0F19] rounded-xl p-4">{children}</div>
            </CardContent>
        </Card>
    )
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color }: {
    label: string; value: string | number; sub?: string; icon: any; color: string
}) {
    return (
        <div className="bg-[#151A29]/80 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
                {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
            <p className="text-slate-300 font-medium mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ color: p.color }} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
                    {p.name}: <span className="font-semibold">{p.value}</span>
                </p>
            ))}
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────
export function ComplianceCharts() {
    const [data, setData] = useState<Awaited<ReturnType<typeof getReportChartData>>>(null)
    const [loading, setLoading] = useState(true)
    const [downloadingCsv, setDownloadingCsv] = useState(false)

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [activePreset, setActivePreset] = useState('All time')

    function applyPreset(preset: typeof PRESETS[0]) {
        setStartDate(preset.startDate)
        setEndDate(preset.endDate)
        setActivePreset(preset.label)
        fetchData(preset.startDate, preset.endDate)
    }

    function fetchData(sd = startDate, ed = endDate) {
        setLoading(true)
        getReportChartData({ startDate: sd || undefined, endDate: ed || undefined })
            .then(d => { setData(d); setLoading(false) })
    }

    useEffect(() => { fetchData() }, [])

    async function handleDownloadCsv() {
        setDownloadingCsv(true)
        try {
            const rows = await getComplianceReport()
            if (!rows?.length) { toast.error('No data to export'); return }
            const ws = XLSX.utils.json_to_sheet(rows)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Compliance')
            XLSX.writeFile(wb, `compliance_report_${new Date().toISOString().slice(0, 10)}.xlsx`)
            toast.success('Report downloaded')
        } catch {
            toast.error('Failed to download report')
        } finally {
            setDownloadingCsv(false)
        }
    }

    async function handleDownloadMatrix() {
        if (!data?.employeeMatrix?.length) return
        const ws = XLSX.utils.json_to_sheet(data.employeeMatrix)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Employee Matrix')
        XLSX.writeFile(wb, `employee_module_matrix_${new Date().toISOString().slice(0, 10)}.xlsx`)
        toast.success('Matrix downloaded')
    }

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
    )

    if (!data) return (
        <div className="text-center py-16 text-slate-500">Failed to load report data.</div>
    )

    const { summary, moduleBreakdown, deptBreakdown, scoreDistribution, timeline, moduleList, employeeMatrix } = data
    const scoreBands = ['0–39 (Fail)', '40–59', '60–69', '70–79 (Pass)', '80–100 (Distinction)']

    return (
        <div className="space-y-6">
            {/* ── Header + Download Bar ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-bold text-white">Compliance Analytics</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Current compliance state as of {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <PlanGate required="business">
                <div className="flex gap-3 flex-wrap">
                    <Button onClick={handleDownloadMatrix} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10 gap-2">
                        <Download className="w-4 h-4" /> Employee Matrix (.xlsx)
                    </Button>
                    <Button onClick={handleDownloadCsv} disabled={downloadingCsv} className="bg-green-600 hover:bg-green-500 text-white gap-2">
                        {downloadingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Full Report (.xlsx)
                    </Button>
                </div>
                </PlanGate>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Total Employees" value={summary.totalMembers} icon={Users} color="bg-blue-500/20 text-blue-400" />
                <KpiCard
                    label="Fully Compliant"
                    value={`${summary.fullyCompliant} (${summary.fullyCompliantRate}%)`}
                    sub="All modules completed"
                    icon={Trophy}
                    color="bg-green-500/20 text-green-400"
                />
                <KpiCard
                    label="Avg Quiz Score"
                    value={`${summary.overallAvgScore}%`}
                    sub={`Across ${summary.totalCompletions} completions`}
                    icon={Target}
                    color="bg-purple-500/20 text-purple-400"
                />
                {summary.hasDeadlines ? (
                    <KpiCard
                        label="Overdue Employees"
                        value={summary.overdueCount}
                        sub={summary.overdueCount === 0 ? 'All on track' : 'Behind on ≥1 deadline'}
                        icon={AlertCircle}
                        color={summary.overdueCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}
                    />
                ) : (
                    <KpiCard
                        label="Active Learners"
                        value={summary.uniqueStarted}
                        sub={`${summary.uniqueCompleted} completed ≥1 module`}
                        icon={TrendingUp}
                        color="bg-orange-500/20 text-orange-400"
                    />
                )}
            </div>

            {/* ── Timeline date range controls ── */}
            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <CardTitle className="text-white text-base flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-cyan-400" />
                                Completion Timeline
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs mt-1">
                                Completions per week — adjust range with the controls below
                            </CardDescription>
                        </div>
                        <Button
                            size="sm" variant="ghost"
                            onClick={() => fetchData()}
                            className="text-slate-400 hover:text-white hover:bg-white/10 gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </Button>
                    </div>
                    {/* Preset buttons + custom range */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                        {PRESETS.map(p => (
                            <button
                                key={p.label}
                                onClick={() => applyPreset(p)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    activePreset === p.label
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                        <span className="text-slate-600 text-xs">or custom:</span>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={e => { setStartDate(e.target.value); setActivePreset('') }}
                            className="h-7 w-36 bg-black/20 border-white/10 text-white text-xs"
                        />
                        <span className="text-slate-500 text-xs">to</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={e => { setEndDate(e.target.value); setActivePreset('') }}
                            className="h-7 w-36 bg-black/20 border-white/10 text-white text-xs"
                        />
                        <Button
                            size="sm"
                            onClick={() => { setActivePreset(''); fetchData() }}
                            className="h-7 px-3 text-xs bg-purple-600 hover:bg-purple-500 text-white"
                        >
                            Apply
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="bg-[#0B0F19] rounded-xl p-4">
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={timeline} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                                <XAxis dataKey="week" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip content={<DarkTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="completions"
                                    name="Completions"
                                    stroke="#a855f7"
                                    strokeWidth={2.5}
                                    dot={{ fill: '#a855f7', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* ── Chart 1: Module Completion Breakdown ── */}
            {moduleBreakdown.length > 0 && (
                <ChartCard
                    title="Module Completion Breakdown"
                    description="Completed · In Progress · Not Started — for each enabled module"
                    filename="module-completion-breakdown"
                >
                    <ResponsiveContainer width="100%" height={moduleBreakdown.length * 60 + 40}>
                        <BarChart
                            layout="vertical"
                            data={moduleBreakdown}
                            margin={{ top: 8, right: 40, left: 8, bottom: 8 }}
                            barSize={16}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                            <XAxis type="number" domain={[0, summary.totalMembers]} stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="shortTitle" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={160} />
                            <Tooltip content={<DarkTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 12 }} />
                            <Bar dataKey="completed" name="Completed" stackId="a" fill={STATUS_COLORS.completed} />
                            <Bar dataKey="inProgress" name="In Progress" stackId="a" fill={STATUS_COLORS.inProgress} />
                            <Bar dataKey="notStarted" name="Not Started" stackId="a" fill={STATUS_COLORS.notStarted} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Per-module stats table */}
                    <div className="mt-4 space-y-1">
                        <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-medium border-b border-white/5 pb-1">
                            <span>Module</span>
                            <div className="flex items-center gap-6 shrink-0">
                                <span>Avg Score</span>
                                <span title="Average quiz attempts before passing">Avg Attempts</span>
                                <span>Completion</span>
                            </div>
                        </div>
                        {moduleBreakdown.map(m => (
                            <div key={m.moduleId} className="flex items-center justify-between text-xs px-1">
                                <span className="text-slate-400 truncate max-w-[55%]">{m.title}</span>
                                <div className="flex items-center gap-6 shrink-0">
                                    <span className="text-slate-500 w-14 text-right">
                                        <span className="text-white font-medium">{m.avgScore}%</span>
                                    </span>
                                    <span className={`w-20 text-right font-medium ${
                                        m.avgAttempts === null ? 'text-slate-600' :
                                        (m.avgAttempts as number) > 2 ? 'text-amber-400' : 'text-slate-300'
                                    }`}>
                                        {m.avgAttempts === null ? '—' : `${m.avgAttempts}×`}
                                    </span>
                                    <span className={`w-20 text-right font-semibold ${
                                        m.completionRate >= 70 ? 'text-green-400' :
                                        m.completionRate >= 40 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                        {m.completionRate}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            )}

            {/* ── Chart 2: Score Distribution ── */}
            {scoreDistribution.length > 0 && (
                <ChartCard
                    title="Quiz Score Distribution"
                    description="How employees scored across each module (number of completions per score band)"
                    filename="score-distribution"
                >
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={scoreDistribution} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                            <XAxis
                                dataKey="shortTitle"
                                stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false}
                                angle={-20} textAnchor="end" interval={0}
                            />
                            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={<DarkTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }} />
                            {scoreBands.map(band => (
                                <Bar key={band} dataKey={band} stackId="s" fill={SCORE_COLORS[band]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* ── Chart 3: Department Performance ── */}
            {deptBreakdown.length > 0 && (
                <ChartCard
                    title="Department Performance"
                    description="Overall compliance rate per department"
                    filename="department-performance"
                >
                    <ResponsiveContainer width="100%" height={Math.max(260, deptBreakdown.length * 52 + 40)}>
                        <BarChart
                            layout="vertical"
                            data={deptBreakdown}
                            margin={{ top: 8, right: 48, left: 8, bottom: 8 }}
                            barSize={20}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="dept" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={140} />
                            <Tooltip content={<DarkTooltip />} formatter={(val: any) => [`${val}%`, 'Completion Rate']} />
                            <Bar dataKey="overallRate" name="Completion Rate %" radius={[0, 6, 6, 0]}>
                                {deptBreakdown.map((entry, i) => (
                                    <Cell key={i} fill={entry.overallRate >= 70 ? '#34d399' : entry.overallRate >= 40 ? '#facc15' : '#f87171'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* ── Chart 4: Module × Department heatmap table ── */}
            {deptBreakdown.length > 0 && moduleList.length > 0 && (
                <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white text-base">Module × Department Matrix</CardTitle>
                        <CardDescription className="text-slate-400 text-xs mt-1">
                            Completion rate (%) per module per department
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="p-3 text-slate-400 font-medium whitespace-nowrap">Department</th>
                                        <th className="p-3 text-slate-400 font-medium">Employees</th>
                                        {moduleList.map(m => (
                                            <th key={m.id} className="p-3 text-slate-400 font-medium whitespace-nowrap max-w-[120px] truncate" title={m.title}>
                                                {m.title.length > 18 ? m.title.substring(0, 16) + '…' : m.title}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {deptBreakdown.map((row, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-slate-300 font-medium whitespace-nowrap">{row.dept}</td>
                                            <td className="p-3 text-slate-400">{row.total}</td>
                                            {moduleList.map(m => {
                                                const val = row[m.title] ?? 0
                                                return (
                                                    <td key={m.id} className="p-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full"
                                                                    style={{
                                                                        width: `${val}%`,
                                                                        background: val >= 70 ? '#34d399' : val >= 40 ? '#facc15' : '#f87171'
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className={val >= 70 ? 'text-green-400' : val >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                                                                {val}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Employee Matrix Table ── */}
            {employeeMatrix.length > 0 && (
                <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div>
                            <CardTitle className="text-white text-base">Individual Employee Progress</CardTitle>
                            <CardDescription className="text-slate-400 text-xs mt-1">
                                Per-employee, per-module completion status and quiz scores
                            </CardDescription>
                        </div>
                        <PlanGate required="business">
                        <Button
                            size="sm" variant="ghost"
                            onClick={handleDownloadMatrix}
                            className="text-slate-400 hover:text-white hover:bg-white/10 gap-1.5"
                        >
                            <FileDown className="w-4 h-4" /> .xlsx
                        </Button>
                        </PlanGate>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="sticky top-0 bg-[#151A29] z-10">
                                    <tr className="border-b border-white/5">
                                        <th className="p-3 text-slate-400 font-medium whitespace-nowrap">Employee</th>
                                        <th className="p-3 text-slate-400 font-medium whitespace-nowrap">Department</th>
                                        {moduleList.map(m => (
                                            <th key={m.id} className="p-3 text-slate-400 font-medium whitespace-nowrap" title={m.title}>
                                                {m.title.length > 16 ? m.title.substring(0, 14) + '…' : m.title}
                                            </th>
                                        ))}
                                        <th className="p-3 text-slate-400 font-medium whitespace-nowrap">Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {employeeMatrix.map((row: any, i: number) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 whitespace-nowrap">
                                                <div className="text-slate-200 font-medium">{row.name}</div>
                                                <div className="text-slate-500">{row.email}</div>
                                            </td>
                                            <td className="p-3 text-slate-400 whitespace-nowrap">{row.department}</td>
                                            {moduleList.map(m => {
                                                const val: string = row[m.title] || 'Not Started'
                                                const isComplete = val.startsWith('✓')
                                                const isInProgress = val === 'In Progress'
                                                return (
                                                    <td key={m.id} className="p-3 whitespace-nowrap">
                                                        <span className={
                                                            isComplete ? 'text-green-400' :
                                                            isInProgress ? 'text-yellow-400' :
                                                            'text-slate-600'
                                                        }>
                                                            {val}
                                                        </span>
                                                    </td>
                                                )
                                            })}
                                            <td className="p-3 whitespace-nowrap">
                                                <span className="text-slate-300">{row['Modules Completed']}</span>
                                                <span className="text-slate-500 ml-1">({row['Overall Rate']})</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
