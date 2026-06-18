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

    const rangeLabel = startDate || endDate
        ? `${startDate || 'start'} to ${endDate || 'today'}`
        : 'All time'

    // Consolidated, multi-sheet workbook: Summary · Module Breakdown ·
    // Department Breakdown · Employee Matrix · Detailed Records.
    async function handleDownloadXlsx() {
        if (!data) { toast.error('No data to export'); return }
        setDownloadingCsv(true)
        try {
            const { summary, moduleBreakdown, deptBreakdown, employeeMatrix } = data
            const generatedOn = new Date().toLocaleString('en-IN')
            const wb = XLSX.utils.book_new()

            // 1. Summary — KPI key/value sheet
            const summaryRows = [
                ['AA Plus — Compliance Report'],
                ['Generated on', generatedOn],
                ['Reporting period', rangeLabel],
                [],
                ['Metric', 'Value'],
                ['Total employees', summary.totalMembers],
                ['Enabled modules', summary.totalModules],
                ['Fully compliant employees', summary.fullyCompliant],
                ['Fully compliant rate (%)', summary.fullyCompliantRate],
                ['Total completions', summary.totalCompletions],
                ['Unique learners started', summary.uniqueStarted],
                ['Unique learners completed ≥1', summary.uniqueCompleted],
                ['Average quiz score (%)', summary.overallAvgScore],
                ...(summary.hasDeadlines ? [['Employees overdue', summary.overdueCount]] : []),
            ]
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'Summary')

            // 2. Module Breakdown
            if (moduleBreakdown.length) {
                const modRows = moduleBreakdown.map((m: any) => ({
                    Module: m.title,
                    Completed: m.completed,
                    'In Progress': m.inProgress,
                    'Not Started': m.notStarted,
                    'Completion %': m.completionRate,
                    'Avg Score (%)': m.avgScore,
                    'Avg Attempts': m.avgAttempts ?? '—',
                }))
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(modRows), 'Module Breakdown')
            }

            // 3. Department Breakdown (rename leading keys, keep per-module % columns)
            if (deptBreakdown.length) {
                const deptRows = deptBreakdown.map((d: any) => {
                    const { dept, total, overallRate, ...modulePct } = d
                    return { Department: dept, Employees: total, 'Overall %': overallRate, ...modulePct }
                })
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(deptRows), 'Department Breakdown')
            }

            // 4. Employee Matrix
            if (employeeMatrix.length) {
                const matrixRows = employeeMatrix.map((m: any) => {
                    const { name, email, department, ...rest } = m
                    return { Name: name, Email: email, Department: department, ...rest }
                })
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matrixRows), 'Employee Matrix')
            }

            // 5. Detailed Records — one row per employee × module
            const detailed = await getComplianceReport()
            if (detailed?.length) {
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailed), 'Detailed Records')
            }

            XLSX.writeFile(wb, `compliance_report_${new Date().toISOString().slice(0, 10)}.xlsx`)
            toast.success('Report downloaded')
        } catch {
            toast.error('Failed to download report')
        } finally {
            setDownloadingCsv(false)
        }
    }

    // Single-sheet export for the contextual button on the Employee Matrix table.
    function handleDownloadMatrix() {
        if (!data?.employeeMatrix?.length) return
        const matrixRows = data.employeeMatrix.map((m: any) => {
            const { name, email, department, ...rest } = m
            return { Name: name, Email: email, Department: department, ...rest }
        })
        const ws = XLSX.utils.json_to_sheet(matrixRows)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Employee Matrix')
        XLSX.writeFile(wb, `employee_module_matrix_${new Date().toISOString().slice(0, 10)}.xlsx`)
        toast.success('Matrix downloaded')
    }

    // Branded, print-to-PDF compliance summary — matches the certificate
    // print idiom used elsewhere in the app (no extra PDF dependency).
    function handleDownloadPdf() {
        if (!data) { toast.error('No data to export'); return }
        const { summary, moduleBreakdown, deptBreakdown } = data
        const win = window.open('', '_blank')
        if (!win) { toast.error('Allow pop-ups to export the PDF summary'); return }

        const esc = (s: any) => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string))
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        const logoSrc = `${window.location.origin}/aaplus_logo.png`

        const kpi = (label: string, value: string, accent: string) =>
            `<div class="kpi"><div class="kv" style="color:${accent}">${esc(value)}</div><div class="kl">${esc(label)}</div></div>`

        const moduleRows = moduleBreakdown.map((m: any) => `
            <tr>
              <td class="l">${esc(m.title)}</td>
              <td>${m.completed}</td><td>${m.inProgress}</td><td>${m.notStarted}</td>
              <td><b>${m.completionRate}%</b></td><td>${m.avgScore}%</td>
            </tr>`).join('')

        const deptRows = deptBreakdown.map((d: any) => `
            <tr><td class="l">${esc(d.dept)}</td><td>${d.total}</td>
              <td><b>${d.overallRate}%</b></td></tr>`).join('')

        win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
        <title>Compliance Summary — ${esc(today)}</title>
        <style>
          *{box-sizing:border-box;margin:0;padding:0;}
          body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#0b1220;padding:40px;max-width:900px;margin:0 auto;}
          .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #01356f;padding-bottom:18px;margin-bottom:8px;}
          .top img{height:42px;}
          .top .meta{text-align:right;font-size:12px;color:#475569;}
          h1{font-size:24px;color:#01356f;margin:22px 0 4px;}
          .subtitle{font-size:13px;color:#64748b;margin-bottom:24px;}
          .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;}
          .kpi{border:1px solid #e2e8f0;border-radius:10px;padding:16px;text-align:center;}
          .kv{font-size:26px;font-weight:800;line-height:1;}
          .kl{font-size:11px;color:#64748b;margin-top:8px;}
          h2{font-size:15px;color:#01356f;margin:24px 0 10px;border-left:4px solid #009ee2;padding-left:10px;}
          table{width:100%;border-collapse:collapse;font-size:12.5px;}
          th,td{padding:8px 10px;text-align:center;border-bottom:1px solid #e2e8f0;}
          th{background:#f1f5f9;color:#334155;font-size:11px;text-transform:uppercase;letter-spacing:.03em;}
          td.l,th.l{text-align:left;}
          .attest{margin-top:34px;padding:16px 18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-size:12.5px;color:#334155;line-height:1.6;}
          .sign{display:flex;justify-content:space-between;margin-top:46px;font-size:12px;color:#475569;}
          .sign .line{border-top:1.5px solid #0b1220;padding-top:6px;width:220px;text-align:center;color:#0b1220;font-weight:600;}
          .foot{margin-top:30px;text-align:center;font-size:10.5px;color:#94a3b8;}
          @media print{body{padding:24px;}.kpi{break-inside:avoid;}table{break-inside:avoid;}}
        </style></head><body>
          <div class="top">
            <img src="${logoSrc}" alt="AA Plus" onerror="this.style.display='none'">
            <div class="meta">Generated ${esc(today)}<br>Reporting period: ${esc(rangeLabel)}</div>
          </div>
          <h1>Compliance Summary Report</h1>
          <div class="subtitle">Workforce training & regulatory compliance status</div>
          <div class="kpis">
            ${kpi('Total Employees', String(summary.totalMembers), '#01356f')}
            ${kpi('Fully Compliant', `${summary.fullyCompliantRate}%`, '#16a34a')}
            ${kpi('Avg Quiz Score', `${summary.overallAvgScore}%`, '#7c3aed')}
            ${summary.hasDeadlines
                ? kpi('Overdue', String(summary.overdueCount), summary.overdueCount > 0 ? '#dc2626' : '#16a34a')
                : kpi('Active Learners', String(summary.uniqueStarted), '#ea580c')}
          </div>
          <h2>Module Completion</h2>
          <table><thead><tr><th class="l">Module</th><th>Completed</th><th>In&nbsp;Progress</th><th>Not&nbsp;Started</th><th>Completion</th><th>Avg&nbsp;Score</th></tr></thead><tbody>${moduleRows}</tbody></table>
          ${deptRows ? `<h2>Department Completion</h2><table><thead><tr><th class="l">Department</th><th>Employees</th><th>Overall&nbsp;Rate</th></tr></thead><tbody>${deptRows}</tbody></table>` : ''}
          <div class="attest">
            <b>${summary.fullyCompliant}</b> of <b>${summary.totalMembers}</b> employees
            (<b>${summary.fullyCompliantRate}%</b>) have completed all ${summary.totalModules} assigned
            compliance modules as of ${esc(today)}. This report reflects the organization's current
            training records and may be used to support statutory and regulatory compliance attestations.
          </div>
          <div class="sign">
            <div class="line">Authorized Signatory</div>
            <div class="line">Date</div>
          </div>
          <div class="foot">Generated by AA Plus Policy Training Platform · training.aaplus.app</div>
          <script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script>
        </body></html>`)
        win.document.close()
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
                    <Button onClick={handleDownloadPdf} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10 gap-2">
                        <FileDown className="w-4 h-4" /> Summary (PDF)
                    </Button>
                    <Button onClick={handleDownloadXlsx} disabled={downloadingCsv} className="bg-green-600 hover:bg-green-500 text-white gap-2">
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
