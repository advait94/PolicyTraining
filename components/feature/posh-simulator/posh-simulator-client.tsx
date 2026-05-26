'use client'

import { useState } from 'react'
import {
    ChevronRight, ChevronLeft, ChevronDown, CheckCircle, AlertTriangle,
    Info, RotateCcw, HeartPulse, FileText, Users, ShieldCheck, Clock, Building2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type IncidentType = 'physical' | 'verbal' | 'written_digital' | 'quid_pro_quo' | 'hostile_environment' | 'other' | ''
type ComplainantType = 'employee' | 'contract_worker' | 'intern' | 'visitor_client' | ''
type RespondentType = 'colleague' | 'supervisor' | 'senior_management' | 'third_party_vendor' | ''
type EmployeeCount = 'under_10' | '10_to_49' | '50_or_more' | ''

interface FormData {
    incidentType: IncidentType
    complainantType: ComplainantType
    respondentType: RespondentType
    employeeCount: EmployeeCount
    isOrganizedSector: boolean | null
    withinLimitationPeriod: boolean | null
    incidentFrequency: 'single' | 'repeated' | ''
    hasWitnesses: boolean | null
    informalResolutionAttempted: boolean | null
    evidenceAvailable: boolean | null
    respondentStillEmployed: boolean | null
}

interface ComplianceAction {
    id: string
    icon: React.ReactNode
    title: string
    subtitle: string
    body: string
    tag: 'mandatory' | 'conditional' | 'disclosure'
    urgency?: string
}

interface AnalysisResult {
    jurisdictionType: 'ICC' | 'LCC'
    actions: ComplianceAction[]
    flags: string[]
    summary: string
}

// ─── Analysis Engine ──────────────────────────────────────────────────────────

function analyzePoshComplaint(data: FormData): AnalysisResult {
    const actions: ComplianceAction[] = []
    const flags: string[] = []

    const isLCC = data.employeeCount === 'under_10' || data.isOrganizedSector === false
    const jurisdictionType: 'ICC' | 'LCC' = isLCC ? 'LCC' : 'ICC'
    const committeeLabel = isLCC ? 'Local Complaints Committee (LCC)' : 'Internal Complaints Committee (ICC)'

    actions.push({
        id: 'jurisdiction',
        icon: <Building2 size={16} />,
        title: `${committeeLabel} — Jurisdiction`,
        subtitle: isLCC
            ? 'District Officer constituted under Section 7, POSH Act 2013'
            : 'Employer-constituted committee under Section 4, POSH Act 2013',
        tag: 'mandatory',
        body: isLCC
            ? `Since the organisation has fewer than 10 employees or operates in the unorganised sector, the complaint must be filed with the Local Complaints Committee (LCC) constituted by the District Officer under Section 7 of the POSH Act, 2013. The LCC exercises all the powers of the ICC.`
            : `The complaint must be filed with your organisation's Internal Complaints Committee (ICC), constituted under Section 4 of the POSH Act, 2013. The ICC must have a minimum of 4 members including a Presiding Officer (senior woman employee), at least 2 employee members, and one external member from an NGO or legal body.`,
        urgency: isLCC
            ? 'Obtain contact details of your District Officer / LCC from the local District administration.'
            : 'The ICC Presiding Officer must be a senior woman employee at the workplace.',
    })

    if (data.withinLimitationPeriod === false) {
        actions.push({
            id: 'limitation',
            icon: <Clock size={16} />,
            title: 'Limitation Period — Delay Condonation Required',
            subtitle: 'Section 9, POSH Act — 3-month period may have elapsed',
            tag: 'mandatory',
            body: `The complaint should ordinarily be filed within 3 months of the incident (or last incident in a series). The ${committeeLabel} may extend this by a further 3 months (total 6 months) if sufficient cause is shown. Beyond 6 months, the complaint may not be entertained. Compile all reasons for the delay and submit them with the complaint.`,
            urgency: 'Document reasons for delay in writing — the committee has discretion to condone up to 3 additional months.',
        })
        flags.push('Limitation period may have elapsed. File immediately and include written reasons for delay to seek condonation under Section 9.')
    } else {
        actions.push({
            id: 'complaint_filing',
            icon: <FileText size={16} />,
            title: 'Written Complaint to be Filed',
            subtitle: 'Section 9, POSH Act — within 3 months of incident',
            tag: 'mandatory',
            body: `The complainant must submit a written complaint (or have one prepared on their behalf) to the ${committeeLabel} within 3 months of the incident. If the complainant is unable to make a complaint due to physical or mental incapacity, a legal heir or other authorised person may file on their behalf. Six copies of the complaint must be submitted.`,
        })
    }

    actions.push({
        id: 'inquiry_timeline',
        icon: <Clock size={16} />,
        title: '90-Day Inquiry Deadline',
        subtitle: 'Section 11, POSH Act — Mandatory Completion Timeline',
        tag: 'mandatory',
        body: `The ${committeeLabel} must complete the inquiry within 90 days from the date the complaint is received. Upon completion, it must submit its findings report to the employer (or District Officer for LCC) within 10 days of completing the inquiry. The employer must then act on the recommendation within 60 days.`,
        urgency: 'The 90-day clock runs from the date of receipt of complaint, not the date of incident.',
    })

    if (data.informalResolutionAttempted === true || data.incidentType !== 'quid_pro_quo') {
        actions.push({
            id: 'conciliation',
            icon: <Users size={16} />,
            title: 'Conciliation Option — Section 10',
            subtitle: 'Available only if requested by the complainant — no monetary settlement',
            tag: 'conditional',
            body: `Before initiating a formal inquiry, the ${committeeLabel} may, at the written request of the aggrieved woman, attempt conciliation between the parties. Important: conciliation must NOT be initiated in cases of quid pro quo harassment. No monetary settlement may be made as a basis of conciliation. If conciliation succeeds, no further inquiry is required; the terms are recorded and complied with.`,
        })
    }

    if (data.respondentStillEmployed === true && data.incidentFrequency === 'repeated') {
        actions.push({
            id: 'interim_relief',
            icon: <ShieldCheck size={16} />,
            title: 'Interim Relief — Section 12',
            subtitle: 'Available during pendency of inquiry',
            tag: 'conditional',
            body: `Since the respondent remains employed and the harassment was repeated, interim relief should be considered during the pendency of the inquiry. The ${committeeLabel} may recommend: (a) transfer of the complainant or respondent to a different workplace; (b) grant of leave to the complainant (up to 3 months, in addition to their entitled leave); (c) restrain the respondent from reporting on the complainant's work. The complainant must apply in writing for interim relief.`,
            urgency: 'Interim relief application can be made at any time during the inquiry.',
        })
        flags.push('Repeated harassment by a current employee — consider applying for interim relief (Section 12) including transfer or leave.')
    }

    actions.push({
        id: 'employer_obligations',
        icon: <ShieldCheck size={16} />,
        title: 'Employer Obligations — Section 19',
        subtitle: 'Mandatory duties regardless of complaint outcome',
        tag: 'mandatory',
        body: `The employer must: (a) provide a safe working environment; (b) display the penal consequences of sexual harassment prominently; (c) organise awareness programmes for employees at regular intervals; (d) provide necessary facilities to the ICC for dealing with the complaint; (e) assist in securing attendance of respondent and witnesses; (f) treat sexual harassment as misconduct under the service rules and initiate action accordingly.`,
    })

    actions.push({
        id: 'penalties',
        icon: <AlertTriangle size={16} />,
        title: 'Employer Penalty Exposure — Section 26',
        subtitle: 'Non-compliance with the POSH Act',
        tag: 'disclosure',
        body: `Failure to comply with the POSH Act exposes the employer to a fine of up to ₹50,000 for a first offence. A second or subsequent conviction doubles the fine and may result in cancellation or non-renewal of business licences, registrations, or approvals granted by the government or local authority. The District Officer may take cognisance of non-compliance suo motu.`,
    })

    actions.push({
        id: 'annual_report',
        icon: <FileText size={16} />,
        title: 'Annual Report Disclosure — Section 21 / Section 22',
        subtitle: 'ICC to submit annual report; Employer to include in Board Report',
        tag: 'disclosure',
        body: `The ICC must prepare an annual report and submit it to the employer and District Officer at the end of each calendar year. The report must include: number of complaints received, number disposed of, number pending beyond 90 days, number of awareness programmes conducted, and nature of action taken. Listed and certain other companies must include this in the Board's Report under the Companies Act.`,
    })

    if (data.hasWitnesses === true) {
        flags.push('Witnesses identified — the ICC/LCC may summon and examine witnesses. Collect and preserve witness statements early.')
    }
    if (data.evidenceAvailable === true) {
        flags.push('Evidence available — preserve all digital communications, emails, CCTV footage, or documents. Submit copies (not originals) with the complaint.')
    }
    if (data.complainantType === 'contract_worker' || data.complainantType === 'visitor_client') {
        flags.push('Third-party complainant — the employer is responsible for taking action against the respondent even where the aggrieved person is not a direct employee (Section 19(g)).')
    }
    if (data.respondentType === 'third_party_vendor') {
        flags.push('Third-party respondent — the employer must take all reasonable steps to assist the complainant in terms of support and preventive action even when the respondent is not an employee.')
    }

    const summary = `${committeeLabel} — ${data.withinLimitationPeriod === false ? 'Delay Condonation Required + ' : ''}90-Day Inquiry`

    return { jurisdictionType, actions, flags, summary }
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const TAG = {
    mandatory:   { bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.28)',  icon: 'rgba(239,68,68,0.15)',  color: '#fca5a5', label: 'Required',   accent: 'rgba(239,68,68,0.7)'   },
    conditional: { bg: 'rgba(34,211,238,0.07)',  border: 'rgba(34,211,238,0.18)', icon: 'rgba(34,211,238,0.12)', color: '#67e8f9', label: 'Available',  accent: 'rgba(34,211,238,0.6)'  },
    disclosure:  { bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.22)', icon: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: 'Disclosure', accent: 'rgba(245,158,11,0.65)' },
}

const PINK_GRAD = 'linear-gradient(135deg, rgba(236,72,153,0.85), rgba(168,85,247,0.65))'
const PINK_PROG = 'linear-gradient(90deg, rgba(236,72,153,0.8), rgba(168,85,247,0.6))'

const STEPS = [
    { id: 1, label: 'Incident' },
    { id: 2, label: 'Parties' },
    { id: 3, label: 'Timeline' },
    { id: 4, label: 'Status' },
]

const EMPTY: FormData = {
    incidentType: '',
    complainantType: '',
    respondentType: '',
    employeeCount: '',
    isOrganizedSector: null,
    withinLimitationPeriod: null,
    incidentFrequency: '',
    hasWitnesses: null,
    informalResolutionAttempted: null,
    evidenceAvailable: null,
    respondentStillEmployed: null,
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ title, sub }: { title: string; sub: string }) {
    return (
        <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{sub}</p>
        </div>
    )
}

function RadioCard({ label, sub, selected, onClick }: { label: string; sub?: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left rounded-xl flex items-start gap-3 transition-all duration-200 cursor-pointer ${!selected ? 'hover:bg-white/[.06]' : ''}`}
            style={{
                padding: '10px 14px',
                ...(selected ? { background: 'rgba(236,72,153,0.09)' } : {}),
                border: `1.5px solid ${selected ? 'rgba(236,72,153,0.6)' : 'var(--border-glass)'}`,
            }}
        >
            <div
                className="w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ marginTop: 3, borderColor: selected ? 'rgba(236,72,153,0.8)' : 'rgba(255,255,255,0.2)' }}
            >
                {selected && <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'rgba(236,72,153,0.9)' }} />}
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium leading-snug" style={{ color: selected ? '#f9a8d4' : 'var(--text-light)' }}>
                    {label}
                </div>
                {sub && <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
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
            className={`flex-1 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer text-center ${!selected ? 'hover:bg-white/[.06]' : ''}`}
            style={{
                padding: '11px 16px',
                ...(selected ? { background: 'rgba(236,72,153,0.09)' } : {}),
                border: `1.5px solid ${selected ? 'rgba(236,72,153,0.6)' : 'var(--border-glass)'}`,
                color: selected ? '#f9a8d4' : 'var(--text-muted)',
            }}
        >
            {label}
        </button>
    )
}

function ActionCard({ action, t }: { action: ComplianceAction; t: typeof TAG[keyof typeof TAG] }) {
    const [open, setOpen] = useState(action.tag === 'mandatory')
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: t.bg, border: `1px solid ${t.border}`, borderLeft: `3px solid ${t.accent}` }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-start gap-4 text-left cursor-pointer transition-colors duration-150 hover:bg-white/[.02]"
                style={{ padding: '14px 20px' }}
            >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: t.icon, color: t.color }}>
                    {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-white leading-snug">{action.title}</div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide" style={{ background: t.icon, color: t.color }}>
                                {t.label}
                            </span>
                            <ChevronDown size={13} className={`transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{action.subtitle}</div>
                </div>
            </button>
            {open && (
                <div style={{ padding: '0 20px 16px 68px' }}>
                    <div className="h-px mb-4" style={{ background: t.border }} />
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-light)' }}>{action.body}</p>
                    {action.urgency && (
                        <div className="flex items-start gap-2 mt-3 rounded-lg" style={{ padding: '7px 10px', background: 'rgba(245,158,11,0.08)' }}>
                            <Info size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                            <span className="text-xs leading-relaxed" style={{ color: '#fde68a' }}>{action.urgency}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function StepProgress({ step, total, label, gradient }: { step: number; total: number; label: string; gradient: string }) {
    const pct = ((step - 1) / total) * 100
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Step {step} of {total}
                </span>
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
            <div className="w-full rounded-full" style={{ height: 3, background: 'var(--border-glass)' }}>
                <div
                    className="rounded-full transition-all duration-500"
                    style={{ height: 3, width: `${pct}%`, background: gradient }}
                />
            </div>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PoshSimulatorClient() {
    const [step, setStep] = useState(1)
    const [data, setData] = useState<FormData>(EMPTY)
    const [result, setResult] = useState<AnalysisResult | null>(null)

    function set<K extends keyof FormData>(key: K, value: FormData[K]) {
        setData(d => ({ ...d, [key]: value }))
    }

    function canContinue(): boolean {
        if (step === 1) return data.incidentType !== ''
        if (step === 2) return data.complainantType !== '' && data.respondentType !== '' && data.employeeCount !== '' && data.isOrganizedSector !== null
        if (step === 3) return data.withinLimitationPeriod !== null && data.incidentFrequency !== '' && data.hasWitnesses !== null
        if (step === 4) return data.informalResolutionAttempted !== null && data.evidenceAvailable !== null && data.respondentStillEmployed !== null
        return true
    }

    function handleNext() {
        if (step === 4) {
            setResult(analyzePoshComplaint(data))
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
            <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>

                {/* Status banner */}
                <div
                    className="rounded-2xl flex items-start gap-4 mb-8"
                    style={{
                        padding: '24px 28px',
                        background: 'linear-gradient(135deg, rgba(236,72,153,0.13), rgba(168,85,247,0.07))',
                        border: '1px solid rgba(236,72,153,0.28)',
                    }}
                >
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: PINK_GRAD }}
                    >
                        <HeartPulse size={18} style={{ color: '#fff' }} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#f9a8d4' }}>
                            {result.jurisdictionType} Jurisdiction
                        </div>
                        <div className="text-base font-bold text-white mb-1">{result.summary}</div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            Review the compliance steps below. All timelines run from the date of complaint receipt unless otherwise stated.
                        </p>
                    </div>
                </div>

                {/* Flags */}
                {result.flags.length > 0 && (
                    <div className="rounded-xl mb-8" style={{ padding: '18px 22px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)' }}>
                        <div className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: '#fbbf24' }}>
                            Key Alerts
                        </div>
                        <div className="space-y-3">
                            {result.flags.map((f, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                                    <span className="text-xs leading-relaxed" style={{ color: '#fde68a' }}>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action cards */}
                <div>
                    <div className="text-[10px] uppercase tracking-widest font-bold mb-5" style={{ color: 'var(--text-muted)' }}>
                        Compliance Steps
                    </div>
                    <div className="space-y-3">
                        {result.actions.map(action => (
                            <ActionCard key={action.id} action={action} t={TAG[action.tag]} />
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 mt-10 text-sm font-semibold rounded-xl cursor-pointer transition-opacity hover:opacity-80"
                    style={{ padding: '13px 28px', background: PINK_GRAD, color: '#fff' }}
                >
                    <RotateCcw size={13} /> Analyse Another Complaint
                </button>
            </div>
        )
    }

    // ── Form view ─────────────────────────────────────────────────────────────
    return (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>

            {/* Intro banner */}
            <div
                className="rounded-2xl mb-8"
                style={{
                    padding: '22px 28px',
                    background: 'var(--glass-card)',
                    border: '1px solid var(--border-glass)',
                    borderLeft: '4px solid rgba(236,72,153,0.8)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: '#f9a8d4' }}>
                    Interactive Training
                </div>
                <h2 className="text-base font-bold text-white mb-1">
                    What is the correct complaint procedure for this harassment scenario?
                </h2>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Describe the incident, parties involved, and timeline. The tool will determine jurisdiction
                    (ICC vs LCC), applicable timelines, interim relief options, and employer compliance obligations
                    under the POSH Act, 2013.
                </p>
            </div>

            {/* Step progress */}
            <StepProgress
                step={step}
                total={STEPS.length}
                label={STEPS[step - 1]?.label ?? ''}
                gradient={PINK_PROG}
            />

            {/* Step dots */}
            <div className="flex items-center gap-2 mb-8">
                {STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 flex-1">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                                style={{
                                    background: step > s.id ? PINK_GRAD : step === s.id ? 'rgba(236,72,153,0.12)' : 'var(--glass-bg)',
                                    border: `1.5px solid ${step === s.id ? 'rgba(236,72,153,0.6)' : step > s.id ? 'transparent' : 'var(--border-glass)'}`,
                                    color: step > s.id ? '#fff' : step === s.id ? '#f9a8d4' : 'var(--text-muted)',
                                }}
                            >
                                {step > s.id ? <CheckCircle size={13} /> : s.id}
                            </div>
                            <span className="text-[9px]" style={{ color: step === s.id ? 'var(--text-light)' : 'var(--text-muted)' }}>
                                {s.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className="flex-1 h-px mb-3 transition-all"
                                style={{ background: step > s.id + 1 ? PINK_PROG : 'var(--border-glass)' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className="mb-7">
                {/* Step 1 — Incident Type */}
                {step === 1 && (
                    <div>
                        <SectionHeading
                            title="What is the nature of the incident?"
                            sub="Select the category that best describes the alleged conduct."
                        />
                        <div className="flex flex-col" style={{ gap: 8 }}>
                            <RadioCard label="Physical contact or advances" sub="Unwelcome touching, assault, or physical proximity" selected={data.incidentType === 'physical'} onClick={() => set('incidentType', 'physical')} />
                            <RadioCard label="Verbal harassment" sub="Offensive remarks, sexual jokes, innuendo, or comments about appearance" selected={data.incidentType === 'verbal'} onClick={() => set('incidentType', 'verbal')} />
                            <RadioCard label="Written or digital communication" sub="Offensive emails, messages, social media, or explicit material" selected={data.incidentType === 'written_digital'} onClick={() => set('incidentType', 'written_digital')} />
                            <RadioCard label="Quid pro quo harassment" sub="Demands for sexual favours in exchange for employment benefits or to avoid detriment" selected={data.incidentType === 'quid_pro_quo'} onClick={() => set('incidentType', 'quid_pro_quo')} />
                            <RadioCard label="Hostile work environment" sub="Persistent conduct creating an intimidating, hostile, or humiliating work environment" selected={data.incidentType === 'hostile_environment'} onClick={() => set('incidentType', 'hostile_environment')} />
                            <RadioCard label="Other / unclear category" selected={data.incidentType === 'other'} onClick={() => set('incidentType', 'other')} />
                        </div>
                    </div>
                )}

                {/* Step 2 — Parties & Workplace */}
                {step === 2 && (
                    <div>
                        <SectionHeading
                            title="Who is involved and what is the workplace context?"
                            sub="These details determine whether the Internal Complaints Committee (ICC) or the Local Complaints Committee (LCC) has jurisdiction."
                        />
                        <div className="space-y-10">
                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>What is the complainant&apos;s relationship to the organisation?</div>
                                <div className="flex flex-col" style={{ gap: 8 }}>
                                    <RadioCard label="Direct employee" selected={data.complainantType === 'employee'} onClick={() => set('complainantType', 'employee')} />
                                    <RadioCard label="Contract worker, daily wage, or temporary worker" selected={data.complainantType === 'contract_worker'} onClick={() => set('complainantType', 'contract_worker')} />
                                    <RadioCard label="Intern, trainee, or apprentice" selected={data.complainantType === 'intern'} onClick={() => set('complainantType', 'intern')} />
                                    <RadioCard label="Visitor, client, or customer" selected={data.complainantType === 'visitor_client'} onClick={() => set('complainantType', 'visitor_client')} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Who is the respondent (alleged harasser)?</div>
                                <div className="flex flex-col" style={{ gap: 8 }}>
                                    <RadioCard label="Colleague at the same level" selected={data.respondentType === 'colleague'} onClick={() => set('respondentType', 'colleague')} />
                                    <RadioCard label="Supervisor or line manager" selected={data.respondentType === 'supervisor'} onClick={() => set('respondentType', 'supervisor')} />
                                    <RadioCard label="Senior management or director" selected={data.respondentType === 'senior_management'} onClick={() => set('respondentType', 'senior_management')} />
                                    <RadioCard label="Third-party vendor, client, or visitor" selected={data.respondentType === 'third_party_vendor'} onClick={() => set('respondentType', 'third_party_vendor')} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>How many employees does the organisation have?</div>
                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>This determines whether an ICC is required or if the complaint goes to the LCC.</div>
                                <div className="flex flex-col" style={{ gap: 8 }}>
                                    <RadioCard label="Fewer than 10 employees" selected={data.employeeCount === 'under_10'} onClick={() => set('employeeCount', 'under_10')} />
                                    <RadioCard label="10 to 49 employees" selected={data.employeeCount === '10_to_49'} onClick={() => set('employeeCount', '10_to_49')} />
                                    <RadioCard label="50 or more employees" selected={data.employeeCount === '50_or_more'} onClick={() => set('employeeCount', '50_or_more')} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Is this a formal/organised sector workplace?</div>
                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Domestic workers, agricultural workers, and informal sector workers always go to the LCC regardless of employer size.</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — formal workplace" value={true} current={data.isOrganizedSector} onClick={() => set('isOrganizedSector', true)} />
                                    <BoolCard label="No — unorganised sector" value={false} current={data.isOrganizedSector} onClick={() => set('isOrganizedSector', false)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3 — Timeline */}
                {step === 3 && (
                    <div>
                        <SectionHeading
                            title="When did the incident occur?"
                            sub="Timing affects whether the complaint can still be filed and what interim protections may apply."
                        />
                        <div className="space-y-10">
                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>
                                    Did the incident occur within the last 3 months?
                                </div>
                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                                    Complaints must ordinarily be filed within 3 months of the incident. The committee may extend this by a further 3 months (to 6 months total) for sufficient cause.
                                </div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — within 3 months" value={true} current={data.withinLimitationPeriod} onClick={() => set('withinLimitationPeriod', true)} />
                                    <BoolCard label="No — more than 3 months ago" value={false} current={data.withinLimitationPeriod} onClick={() => set('withinLimitationPeriod', false)} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Was this a single incident or repeated conduct?</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Single incident" value={false} current={data.incidentFrequency === 'single' ? false : data.incidentFrequency === 'repeated' ? true : null} onClick={() => set('incidentFrequency', 'single')} />
                                    <BoolCard label="Repeated / ongoing" value={true} current={data.incidentFrequency === 'repeated' ? true : data.incidentFrequency === 'single' ? false : null} onClick={() => set('incidentFrequency', 'repeated')} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Are there any witnesses?</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes" value={true} current={data.hasWitnesses} onClick={() => set('hasWitnesses', true)} />
                                    <BoolCard label="No" value={false} current={data.hasWitnesses} onClick={() => set('hasWitnesses', false)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4 — Prior Actions */}
                {step === 4 && (
                    <div>
                        <SectionHeading
                            title="Current status and available evidence"
                            sub="This determines whether interim relief, conciliation, or other steps are appropriate."
                        />
                        <div className="space-y-10">
                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Has informal resolution been attempted?</div>
                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Informal attempts do not bar a formal complaint but may inform the committee&apos;s approach.</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes" value={true} current={data.informalResolutionAttempted} onClick={() => set('informalResolutionAttempted', true)} />
                                    <BoolCard label="No" value={false} current={data.informalResolutionAttempted} onClick={() => set('informalResolutionAttempted', false)} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Is documentary or digital evidence available?</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes" value={true} current={data.evidenceAvailable} onClick={() => set('evidenceAvailable', true)} />
                                    <BoolCard label="No / unsure" value={false} current={data.evidenceAvailable} onClick={() => set('evidenceAvailable', false)} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Is the respondent still employed at the same workplace?</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes" value={true} current={data.respondentStillEmployed} onClick={() => set('respondentStillEmployed', true)} />
                                    <BoolCard label="No — resigned or transferred" value={false} current={data.respondentStillEmployed} onClick={() => set('respondentStillEmployed', false)} />
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
                    {step === 4 ? 'Analyse Complaint' : 'Continue'} <ChevronRight size={14} />
                </button>
            </div>
        </div>
    )
}
