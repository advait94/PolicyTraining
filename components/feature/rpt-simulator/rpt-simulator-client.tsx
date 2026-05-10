'use client'

import { useState } from 'react'
import {
    ChevronRight, ChevronLeft, CheckCircle, AlertTriangle,
    Info, RotateCcw, Scale, FileText, Users, Building2, ShieldCheck,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type CounterpartyType = 'director_kmp' | 'relative' | 'related_firm' | 'group_company' | 'none' | ''
type TransactionType = 'goods' | 'property_sale' | 'property_lease' | 'services' | 'office_profit' | 'other' | ''

interface FormData {
    counterpartyType: CounterpartyType
    transactionType: TransactionType
    transactionDescription: string
    isOrdinaryCourse: boolean | null
    isArmLength: boolean | null
    transactionValue: string
    annualTurnover: string
    netWorth: string
    isListed: boolean | null
}

interface ComplianceAction {
    id: string
    level?: number
    icon: React.ReactNode
    title: string
    subtitle: string
    body: string
    tag: 'mandatory' | 'conditional' | 'disclosure'
    urgency?: string
}

interface AnalysisResult {
    isRPT: boolean
    reason?: string
    actions: ComplianceAction[]
    flags: string[]
    summary: string
}

// ─── Analysis Engine ──────────────────────────────────────────────────────────

function formatCrore(val: number): string {
    if (val >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(2)} Cr`
    if (val >= 1_00_000) return `₹${(val / 1_00_000).toFixed(2)} L`
    return `₹${val.toLocaleString('en-IN')}`
}

function analyzeTransaction(data: FormData): AnalysisResult {
    if (data.counterpartyType === 'none') {
        return {
            isRPT: false,
            reason: "The counterparty does not fall within the definition of a 'Related Party' under Section 2(76) of the Companies Act, 2013. No special RPT compliance is required for this transaction.",
            actions: [], flags: [], summary: 'Not an RPT',
        }
    }

    const actions: ComplianceAction[] = []
    const flags: string[] = []
    const txValue = parseFloat(data.transactionValue.replace(/,/g, '')) || 0
    const turnover = parseFloat(data.annualTurnover.replace(/,/g, '')) || 0
    const netWorth = parseFloat(data.netWorth.replace(/,/g, '')) || 0
    const turnoverPct = turnover > 0 ? (txValue / turnover) * 100 : 0
    const netWorthPct = netWorth > 0 ? (txValue / netWorth) * 100 : 0
    const exceedsMateriality = turnoverPct > 10 || netWorthPct > 10
    const needsBoard = data.isOrdinaryCourse === false || data.isArmLength === false
    const isArmLengthOrdinary = data.isOrdinaryCourse === true && data.isArmLength === true

    actions.push({
        id: 'audit_committee', level: 1, icon: <ShieldCheck size={16} />,
        title: 'Audit Committee Approval', subtitle: 'Section 177 — Mandatory for ALL RPTs', tag: 'mandatory',
        body: "The Audit Committee must review and approve this transaction before it is executed. This requirement applies to every RPT without exception — including those that are at arm's length and in the ordinary course of business. Omnibus approval is permissible for repetitive transactions with defined parameters.",
        urgency: 'Must be obtained before executing the transaction.',
    })

    if (needsBoard) {
        const reason = [
            ...(data.isOrdinaryCourse === false ? ['not in the ordinary course of business'] : []),
            ...(data.isArmLength === false ? ["not at arm's length"] : []),
        ]
        actions.push({
            id: 'board', level: 2, icon: <Users size={16} />,
            title: 'Board of Directors Approval',
            subtitle: 'Section 188 — Required (transaction is ' + reason.join(' and ') + ')',
            tag: 'mandatory',
            body: `Board approval is required because the transaction is ${reason.join(' and ')}. The approval must be passed at a Board Meeting — it cannot be done by circular resolution. Any director who has an interest must disclose it and recuse themselves from the vote.`,
            urgency: 'Interested directors must recuse completely — not merely abstain.',
        })
    } else if (isArmLengthOrdinary) {
        actions.push({
            id: 'board_exempt', level: 2, icon: <CheckCircle size={16} />,
            title: 'Board Approval — Exempt',
            subtitle: "Section 188 — Qualifies for the arm's length + ordinary course exemption",
            tag: 'conditional',
            body: "Since the transaction is both at arm's length AND in the ordinary course of business, formal Board approval under Section 188 is not required. Audit Committee approval (Step 1) remains mandatory. Retain documentation of the arm's length basis.",
        })
    }

    if (exceedsMateriality) {
        const pctStr = [
            ...(turnover > 0 ? [`${turnoverPct.toFixed(1)}% of annual turnover (${formatCrore(turnover)})`] : []),
            ...(netWorth > 0 ? [`${netWorthPct.toFixed(1)}% of net worth (${formatCrore(netWorth)})`] : []),
        ]
        actions.push({
            id: 'shareholder', level: 3, icon: <Building2 size={16} />,
            title: 'Shareholder Special Resolution',
            subtitle: `Section 188 — Value (${formatCrore(txValue)}) exceeds 10% materiality threshold`,
            tag: 'mandatory',
            body: `The transaction represents ${pctStr.join(' and ')}, exceeding the 10% threshold. A Special Resolution (75% approval) must be passed in a General Meeting before execution. The related party and any entity in which they hold a majority stake cannot vote.`,
            urgency: 'Related party must not vote on this resolution.',
        })
        flags.push(`Transaction is ${turnoverPct.toFixed(1)}% of turnover — Shareholder Special Resolution required.`)
    } else if (txValue > 0 && turnover > 0) {
        flags.push(`Transaction is ${turnoverPct.toFixed(1)}% of annual turnover — below the 10% threshold for shareholder approval.`)
    }

    actions.push({
        id: 'register', level: 4, icon: <FileText size={16} />,
        title: 'Register of Contracts with Related Parties',
        subtitle: 'Section 189 — Statutory Record',
        tag: 'disclosure',
        body: 'An entry must be made in the Register of Contracts (Section 189) once the transaction is approved. The register must be kept at the Registered Office and open for inspection. Falsifying or omitting entries is a criminal offence.',
    })

    actions.push({
        id: 'aoc2', level: 5, icon: <FileText size={16} />,
        title: "Board's Report Disclosure (Form AOC-2)",
        subtitle: 'Section 134 — Annual Disclosure',
        tag: 'disclosure',
        body: "All RPTs that are not at arm's length or not in the ordinary course of business must be disclosed in the Board's Report in Form AOC-2. This is published annually and publicly accessible through MCA21.",
    })

    if (data.isListed) {
        actions.push({
            id: 'sebi_lodr', level: 6, icon: <AlertTriangle size={16} />,
            title: 'SEBI LODR Compliance',
            subtitle: 'Listed Companies — Stricter Standards Apply',
            tag: 'mandatory',
            body: "As a listed company, SEBI's LODR Regulations impose additional RPT requirements — broader definitions, lower materiality thresholds, and immediate stock exchange disclosure. LODR operates in addition to the Companies Act; where they conflict, the stricter standard applies.",
            urgency: 'Check SEBI LODR thresholds independently — they may be lower than Section 188.',
        })
        flags.push('Listed company — SEBI LODR imposes additional disclosure and approval obligations.')
    }

    if (needsBoard) flags.push('If executed before obtaining required approvals, the transaction must be ratified within 3 months or it becomes voidable. The signatory director bears personal liability for resulting losses.')
    if (data.counterpartyType === 'director_kmp') flags.push('The interested Director/KMP must not participate in the Board meeting discussion or vote under Section 184.')
    if (data.counterpartyType === 'group_company') flags.push("Inter-group transactions attract full RPT compliance. 'Intra-group' is not an exemption under the Companies Act.")

    const highestLevel = Math.max(...actions.filter(a => a.tag === 'mandatory' && a.level && a.level <= 3).map(a => a.level ?? 0), 1)
    const summaryMap: Record<number, string> = {
        1: 'Audit Committee Approval Required',
        2: 'Audit Committee + Board Approval Required',
        3: 'Audit Committee + Board + Shareholder Resolution Required',
    }

    return { isRPT: true, actions, flags, summary: summaryMap[highestLevel] ?? 'Multiple Approvals Required' }
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const TAG = {
    mandatory:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   icon: 'rgba(239,68,68,0.15)',   color: '#fca5a5', label: 'Required'    },
    conditional: { bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.2)',  icon: 'rgba(34,211,238,0.12)',  color: '#67e8f9', label: 'Exempt'      },
    disclosure:  { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)', icon: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: 'Disclosure'  },
}

const STEPS = [
    { id: 1, label: 'Counterparty' },
    { id: 2, label: 'Transaction' },
    { id: 3, label: 'Terms' },
    { id: 4, label: 'Value' },
]

const EMPTY: FormData = {
    counterpartyType: '', transactionType: '', transactionDescription: '',
    isOrdinaryCourse: null, isArmLength: null,
    transactionValue: '', annualTurnover: '', netWorth: '', isListed: null,
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ title, sub }: { title: string; sub: string }) {
    return (
        <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{sub}</p>
        </div>
    )
}

function RadioCard({ label, sub, selected, onClick }: { label: string; sub?: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full text-left rounded-xl flex items-start gap-4 transition-all cursor-pointer"
            style={{
                padding: '20px 24px',
                background: selected ? 'rgba(34,211,238,0.08)' : 'var(--glass-bg)',
                border: `1.5px solid ${selected ? 'var(--neon-cyan)' : 'var(--border-glass)'}`,
            }}
        >
            <div
                className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ marginTop: 2, borderColor: selected ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.2)' }}
            >
                {selected && <div className="w-[8px] h-[8px] rounded-full" style={{ background: 'var(--neon-cyan)' }} />}
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: selected ? 'var(--neon-cyan)' : 'var(--text-light)' }}>
                    {label}
                </div>
                {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
            </div>
        </button>
    )
}

function BoolCard({ label, value, current, onClick }: { label: string; value: boolean; current: boolean | null; onClick: () => void }) {
    const selected = current === value
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex-1 text-sm font-medium rounded-xl transition-all cursor-pointer"
            style={{
                padding: '18px 24px',
                background: selected ? 'rgba(34,211,238,0.08)' : 'var(--glass-bg)',
                border: `1.5px solid ${selected ? 'var(--neon-cyan)' : 'var(--border-glass)'}`,
                color: selected ? 'var(--neon-cyan)' : 'var(--text-muted)',
            }}
        >
            {label}
        </button>
    )
}

function NumberInput({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-light)' }}>{label}</label>
            {hint && <div className="text-xs mb-2.5" style={{ color: 'var(--text-muted)' }}>{hint}</div>}
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid var(--border-glass)' }}>
                <div className="px-4 py-3 text-sm font-semibold flex-shrink-0" style={{ background: 'rgba(34,211,238,0.08)', color: 'var(--neon-cyan)', borderRight: '1px solid var(--border-glass)' }}>
                    ₹
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-4 py-3 text-sm outline-none"
                    style={{ background: 'var(--glass-bg)', color: 'var(--text-white)' }}
                    placeholder="0"
                />
            </div>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RptSimulatorClient() {
    const [step, setStep] = useState(1)
    const [data, setData] = useState<FormData>(EMPTY)
    const [result, setResult] = useState<AnalysisResult | null>(null)

    function set<K extends keyof FormData>(key: K, value: FormData[K]) {
        setData(d => ({ ...d, [key]: value }))
    }

    function canContinue(): boolean {
        if (step === 1) return data.counterpartyType !== ''
        if (step === 2) return data.transactionType !== ''
        if (step === 3) return data.counterpartyType === 'none' || (data.isOrdinaryCourse !== null && data.isArmLength !== null)
        if (step === 4) return data.counterpartyType === 'none' || (data.transactionValue !== '' && data.isListed !== null)
        return true
    }

    function handleNext() {
        if (step === 4 || (step === 1 && data.counterpartyType === 'none')) {
            setResult(analyzeTransaction(data))
            setStep(5)
        } else {
            setStep(s => s + 1)
        }
    }

    function handleReset() {
        setStep(1)
        setData(EMPTY)
        setResult(null)
    }

    // ── Results view ──────────────────────────────────────────────────────────
    if (step === 5 && result) {
        return (
            <div style={{ maxWidth: 920, margin: '0 auto', padding: '64px 48px 100px' }}>

                {/* Status banner */}
                <div
                    className="rounded-2xl flex items-start gap-5 mb-10"
                    style={{
                        padding: '32px 36px',
                        background: result.isRPT
                            ? 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(34,211,238,0.08))'
                            : 'rgba(34,197,94,0.1)',
                        border: result.isRPT ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(34,197,94,0.3)',
                    }}
                >
                    <div
                        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                            background: result.isRPT
                                ? 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'
                                : 'rgba(34,197,94,0.2)',
                        }}
                    >
                        <Scale size={20} style={{ color: result.isRPT ? '#fff' : '#4ade80' }} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: result.isRPT ? 'var(--neon-cyan)' : '#4ade80' }}>
                            {result.isRPT ? 'RPT Confirmed' : 'Not an RPT'}
                        </div>
                        <div className="text-lg font-bold text-white">{result.summary}</div>
                        {result.reason && <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.reason}</p>}
                    </div>
                </div>

                {/* Flags */}
                {result.flags.length > 0 && (
                    <div className="rounded-xl mb-8" style={{ padding: '24px 28px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                        <div className="space-y-3">
                            {result.flags.map((f, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                                    <span className="text-xs leading-relaxed" style={{ color: '#fde68a' }}>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action cards */}
                {result.actions.length > 0 && (
                    <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold mb-6" style={{ color: 'var(--text-muted)' }}>
                            Compliance Steps Required
                        </div>
                        <div className="space-y-5">
                            {result.actions.map(action => {
                                const t = TAG[action.tag]
                                return (
                                    <div key={action.id} className="rounded-2xl" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                                        <div className="flex items-start gap-5" style={{ padding: '28px 32px' }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: t.icon, color: t.color }}>
                                                {action.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="text-sm font-semibold text-white">
                                                        {action.level && <span className="text-xs font-mono mr-1.5" style={{ color: 'var(--text-muted)' }}>{String(action.level).padStart(2, '0')}.</span>}
                                                        {action.title}
                                                    </div>
                                                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide flex-shrink-0" style={{ background: t.icon, color: t.color }}>
                                                        {t.label}
                                                    </span>
                                                </div>
                                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{action.subtitle}</div>
                                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-light)' }}>{action.body}</p>
                                                {action.urgency && (
                                                    <div className="flex items-start gap-2 mt-4">
                                                        <Info size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                                                        <span className="text-xs leading-relaxed italic" style={{ color: '#fbbf24' }}>{action.urgency}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 mt-14 text-sm font-semibold rounded-xl cursor-pointer transition-opacity hover:opacity-80"
                    style={{ padding: '16px 32px', background: 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))', color: '#fff' }}
                >
                    <RotateCcw size={14} /> Check Another Transaction
                </button>
            </div>
        )
    }

    // ── Form view ─────────────────────────────────────────────────────────────
    return (
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '64px 48px 100px' }}>

            {/* Intro banner */}
            <div
                className="rounded-2xl mb-10"
                style={{
                    padding: '32px 36px',
                    background: 'var(--glass-card)',
                    border: '1px solid var(--border-glass)',
                    borderLeft: '4px solid var(--neon-cyan)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--neon-cyan)' }}>
                    Interactive Training
                </div>
                <h2 className="text-lg font-bold text-white mb-1">
                    Is your transaction an RPT? What do you need to do?
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Describe the counterparty, nature, terms, and value of the transaction. The tool will
                    determine whether it qualifies as a Related Party Transaction and generate a step-by-step
                    compliance action plan.
                </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-12">
                {STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 flex-1">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                                style={{
                                    background: step > s.id
                                        ? 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'
                                        : step === s.id
                                            ? 'rgba(34,211,238,0.12)'
                                            : 'var(--glass-bg)',
                                    border: `1.5px solid ${step === s.id ? 'var(--neon-cyan)' : step > s.id ? 'transparent' : 'var(--border-glass)'}`,
                                    color: step > s.id ? '#fff' : step === s.id ? 'var(--neon-cyan)' : 'var(--text-muted)',
                                }}
                            >
                                {step > s.id ? <CheckCircle size={14} /> : s.id}
                            </div>
                            <span className="text-[10px]" style={{ color: step === s.id ? 'var(--text-light)' : 'var(--text-muted)' }}>
                                {s.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className="flex-1 h-px mb-4 transition-all"
                                style={{ background: step > s.id + 1 ? 'linear-gradient(90deg, var(--neon-purple), var(--neon-cyan))' : 'var(--border-glass)' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Form card */}
            <div
                className="rounded-2xl mb-6"
                style={{
                    padding: '56px 60px',
                    background: 'var(--glass-card)',
                    border: '1px solid var(--border-glass)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                {/* Step 1 */}
                {step === 1 && (
                    <div>
                        <SectionHeading
                            title="Who is the other party?"
                            sub="Select the category that best describes your counterparty."
                        />
                        <div className="space-y-4">
                            <RadioCard label="A Director or Key Managerial Personnel (KMP)" sub="CEO, MD, CFO, Company Secretary, or any director of your company" selected={data.counterpartyType === 'director_kmp'} onClick={() => set('counterpartyType', 'director_kmp')} />
                            <RadioCard label="A relative of a Director or KMP" sub="Spouse, parent, sibling, child, or their spouses" selected={data.counterpartyType === 'relative'} onClick={() => set('counterpartyType', 'relative')} />
                            <RadioCard label="A firm or company linked to a Director or KMP" sub="A partnership, LLP, or private company where a director/KMP is a partner or director" selected={data.counterpartyType === 'related_firm'} onClick={() => set('counterpartyType', 'related_firm')} />
                            <RadioCard label="A Holding, Subsidiary, or Associate Company" sub="Parent company, subsidiary, or a company where your company holds ≥20% voting power" selected={data.counterpartyType === 'group_company'} onClick={() => set('counterpartyType', 'group_company')} />
                            <RadioCard label="None of the above — unrelated third party" sub="No connection to any director, KMP, or group company" selected={data.counterpartyType === 'none'} onClick={() => set('counterpartyType', 'none')} />
                        </div>
                    </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <div>
                        <SectionHeading
                            title="What is the nature of this transaction?"
                            sub="Select the category that best describes what is being exchanged or provided."
                        />
                        <div className="space-y-4 mb-10">
                            <RadioCard label="Sale, purchase, or supply of goods or materials" selected={data.transactionType === 'goods'} onClick={() => set('transactionType', 'goods')} />
                            <RadioCard label="Sale or purchase of property (movable or immovable)" selected={data.transactionType === 'property_sale'} onClick={() => set('transactionType', 'property_sale')} />
                            <RadioCard label="Lease or rental of property" selected={data.transactionType === 'property_lease'} onClick={() => set('transactionType', 'property_lease')} />
                            <RadioCard label="Providing or receiving services" selected={data.transactionType === 'services'} onClick={() => set('transactionType', 'services')} />
                            <RadioCard label="Appointment to an office or place of profit" sub="Employment, directorship, or any remunerated role" selected={data.transactionType === 'office_profit'} onClick={() => set('transactionType', 'office_profit')} />
                            <RadioCard label="Other / financing arrangement" selected={data.transactionType === 'other'} onClick={() => set('transactionType', 'other')} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-light)' }}>
                                Brief description <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                            </label>
                            <textarea
                                value={data.transactionDescription}
                                onChange={(e) => set('transactionDescription', e.target.value)}
                                rows={3}
                                placeholder="e.g. Annual software maintenance contract for ERP system…"
                                className="w-full text-sm rounded-xl outline-none resize-none"
                                style={{ padding: '14px 16px', border: '1.5px solid var(--border-glass)', background: 'var(--glass-bg)', color: 'var(--text-white)' }}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <div>
                        <SectionHeading
                            title="What are the transaction terms?"
                            sub="These two conditions determine whether Board and Shareholder approval is required."
                        />
                        <div className="space-y-10">
                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>
                                    Is this in the ordinary course of your company&apos;s business?
                                </div>
                                <div className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                                    &ldquo;Ordinary course&rdquo; means this transaction type is a routine part of what your company normally does.
                                </div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — routine activity" value={true} current={data.isOrdinaryCourse} onClick={() => set('isOrdinaryCourse', true)} />
                                    <BoolCard label="No — unusual or one-off" value={false} current={data.isOrdinaryCourse} onClick={() => set('isOrdinaryCourse', false)} />
                                </div>
                            </div>
                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />
                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>
                                    Is this transaction at arm&apos;s length?
                                </div>
                                <div className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                                    &ldquo;Arm&apos;s length&rdquo; means the price and terms are the same as they would be with a completely unrelated third party.
                                </div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — market terms" value={true} current={data.isArmLength} onClick={() => set('isArmLength', true)} />
                                    <BoolCard label="No — special terms or pricing" value={false} current={data.isArmLength} onClick={() => set('isArmLength', false)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                    <div>
                        <SectionHeading
                            title="Transaction value & company details"
                            sub="These figures determine whether a Shareholder Special Resolution is required."
                        />
                        <div className="space-y-8">
                            <NumberInput label="Transaction value (₹)" hint="Total value of this transaction or contract." value={data.transactionValue} onChange={v => set('transactionValue', v)} />
                            <NumberInput label="Company's annual turnover (₹)" hint="Last financial year's total revenue. Leave blank if unknown." value={data.annualTurnover} onChange={v => set('annualTurnover', v)} />
                            <NumberInput label="Company's net worth (₹)" hint="Total equity (paid-up capital + reserves). Leave blank if unknown." value={data.netWorth} onChange={v => set('netWorth', v)} />
                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>
                                    Is your company listed on a stock exchange?
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <BoolCard label="Yes — listed company" value={true} current={data.isListed} onClick={() => set('isListed', true)} />
                                    <BoolCard label="No — private or unlisted" value={false} current={data.isListed} onClick={() => set('isListed', false)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setStep(s => s - 1)}
                    disabled={step === 1}
                    className="quiz-nav-btn secondary"
                >
                    <ChevronLeft size={14} /> Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={!canContinue()}
                    className="quiz-nav-btn primary"
                >
                    {step === 4 ? 'Analyse Transaction' : 'Continue'} <ChevronRight size={14} />
                </button>
            </div>
        </div>
    )
}
