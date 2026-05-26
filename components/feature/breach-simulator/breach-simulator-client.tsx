'use client'

import { useState } from 'react'
import {
    ChevronRight, ChevronLeft, ChevronDown, CheckCircle, AlertTriangle,
    Info, RotateCcw, ShieldAlert, FileText, Clock, Globe, Server, Users,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type BreachType = 'unauthorized_access' | 'ransomware' | 'data_exfiltration' | 'accidental_disclosure' | 'lost_device' | 'insider_threat' | 'supply_chain' | ''
type DiscoveryTime = 'within_6_hours' | '6_to_24_hours' | '24_to_72_hours' | 'over_72_hours' | ''
type RecordsCount = 'under_100' | '100_to_1000' | 'over_1000' | 'unknown' | ''

type SensitiveCategory = 'financial_data' | 'health_data' | 'biometric' | 'children_data' | 'government_ids' | 'passwords_credentials'
type SystemAffected = 'production_servers' | 'cloud_storage' | 'endpoint_devices' | 'third_party_systems' | 'email_systems'

interface FormData {
    breachType: BreachType
    isConfirmed: boolean | null
    discoveryTime: DiscoveryTime
    personalDataInvolved: boolean | null
    sensitiveCategories: SensitiveCategory[]
    recordsCount: RecordsCount
    isCriticalInfrastructure: boolean | null
    systemsAffected: SystemAffected[]
    isDataFiduciary: boolean | null
    hasDataProcessor: boolean | null
    isOngoingBreach: boolean | null
    containmentDone: boolean | null
    backupAvailable: boolean | null
    legalCounselNotified: boolean | null
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
    actions: ComplianceAction[]
    flags: string[]
    summary: string
    urgencyLevel: 'critical' | 'high' | 'medium'
}

// ─── Analysis Engine ──────────────────────────────────────────────────────────

function analyzeDataBreach(data: FormData): AnalysisResult {
    const actions: ComplianceAction[] = []
    const flags: string[] = []

    const isWithin6Hrs = data.discoveryTime === 'within_6_hours'
    const isOver72Hrs = data.discoveryTime === 'over_72_hours'
    const hasChildrensData = data.sensitiveCategories.includes('children_data')
    const hasSensitiveData = data.sensitiveCategories.length > 0

    let urgencyLevel: 'critical' | 'high' | 'medium' = 'medium'
    if (isWithin6Hrs || data.isCriticalInfrastructure) urgencyLevel = 'critical'
    else if (data.discoveryTime === '6_to_24_hours' || data.isOngoingBreach) urgencyLevel = 'high'

    actions.push({
        id: 'certin_6hr',
        icon: <Clock size={16} />,
        title: isWithin6Hrs ? 'CERT-In 6-Hour Report — File Immediately' : 'CERT-In Initial Report — Overdue',
        subtitle: `Clause 3(i), CERT-In Directions 2022 — ${isWithin6Hrs ? 'Clock is running' : 'Report should have been filed within 6 hours of discovery'}`,
        tag: 'mandatory',
        body: `All cybersecurity incidents must be reported to CERT-In within 6 hours of detection. This is mandatory regardless of whether the breach is confirmed or still under investigation. Report by email to incident@cert-in.org.in using the prescribed format. Include: type of incident, date/time of discovery, affected systems, initial assessment of impact, and actions taken. ${isOver72Hrs ? 'This report is now significantly overdue — file immediately and document the reasons for delayed detection.' : ''}`,
        urgency: isWithin6Hrs
            ? 'File to incident@cert-in.org.in immediately — 6-hour window is open.'
            : isOver72Hrs
                ? 'Report is overdue — file now and document reasons for late detection.'
                : 'File as soon as possible — 6-hour deadline may have already passed.',
    })

    actions.push({
        id: 'certin_72hr',
        icon: <FileText size={16} />,
        title: 'CERT-In 72-Hour Detailed Report',
        subtitle: 'CERT-In Directions 2022 — Follow-up to initial 6-hour report',
        tag: 'mandatory',
        body: `A detailed report must be submitted to CERT-In within 72 hours of the initial 6-hour report. This report must include: detailed incident description, root cause analysis (if determined), full scope of impact, systems and data affected, remediation steps taken or planned, and security measures implemented. Maintain a log of all actions taken from discovery onwards.`,
        urgency: 'The 72-hour clock runs from the time of the initial 6-hour report, not from the time of discovery.',
    })

    if (data.isCriticalInfrastructure) {
        actions.push({
            id: 'critical_infra',
            icon: <Server size={16} />,
            title: 'Critical Infrastructure — 1-Hour Reporting Applies',
            subtitle: 'CERT-In Directions Section 5 — Stricter Timeline for Critical Sectors',
            tag: 'mandatory',
            body: `Your organisation operates in a critical infrastructure sector (power, banking, telecom, health, transport, or government systems). For certain incident types affecting critical infrastructure, CERT-In may require reporting within 1 hour. Contact CERT-In's 24×7 helpdesk immediately at +91-1800-11-4949. In addition to the email report, a telephone call to CERT-In is strongly recommended for critical infrastructure incidents.`,
            urgency: 'Contact CERT-In helpdesk by telephone: +91-1800-11-4949 (24×7)',
        })
        flags.push('Critical infrastructure sector — CERT-In may require 1-hour initial notification. Call helpdesk immediately.')
    }

    if (data.personalDataInvolved && data.isDataFiduciary) {
        actions.push({
            id: 'dpdp_dpb',
            icon: <Globe size={16} />,
            title: 'Data Protection Board Notification — DPDP Act',
            subtitle: 'Section 8(6), Digital Personal Data Protection Act 2023',
            tag: 'mandatory',
            body: `As a Data Fiduciary, you must notify the Data Protection Board of India (DPBI) of this personal data breach. You must also notify affected Data Principals (individuals whose data was breached) in such manner and within such time as prescribed. Note: The DPDP Rules are still being finalised as of mid-2026 — the exact notification format, timeline, and prescribed manner have not been fully specified yet. However, the obligation to notify is in force. Document all breach details immediately and prepare notifications for both the DPBI and affected Data Principals.`,
            urgency: 'Notification obligation is in force even though DPDP Rules timelines are not yet fully prescribed. Notify promptly.',
        })
        flags.push('Data Fiduciary — DPDP Act Section 8(6) notification to Data Protection Board is mandatory.')
    } else if (data.personalDataInvolved && data.isDataFiduciary === false) {
        actions.push({
            id: 'dpdp_non_fiduciary',
            icon: <Globe size={16} />,
            title: 'DPDP Act — Not a Data Fiduciary',
            subtitle: 'Primary notification obligation may fall on your Data Fiduciary',
            tag: 'conditional',
            body: `If your organisation is a Data Processor (processing data on behalf of a Data Fiduciary), your primary obligation is to notify the Data Fiduciary immediately upon discovery of the breach. The Data Fiduciary then holds the obligation to notify the Data Protection Board and affected Data Principals. Notify the Data Fiduciary in writing without delay and preserve all breach documentation.`,
        })
    }

    if (data.hasDataProcessor) {
        actions.push({
            id: 'data_processor',
            icon: <Users size={16} />,
            title: 'Data Processor Notification',
            subtitle: 'DPDP Act — Processor must notify Fiduciary immediately',
            tag: 'conditional',
            body: `If a Data Processor (third-party vendor processing data on your behalf) was involved in or affected by this breach, that processor must notify your organisation (as the Data Fiduciary) immediately. The Data Fiduciary — your organisation — holds primary responsibility for notification to the Data Protection Board and affected Data Principals. Obtain a written breach report from the Data Processor and assess their contractual obligations regarding breach notification.`,
        })
        flags.push('Data Processor involved — obtain written breach notification from processor; your fiduciary obligations are not reduced.')
    }

    if (hasChildrensData) {
        actions.push({
            id: 'childrens_data',
            icon: <ShieldAlert size={16} />,
            title: "Children's Data — Heightened Obligations",
            subtitle: 'Chapter III, DPDP Act 2023 — Special protection for minors',
            tag: 'mandatory',
            body: `The breach involves personal data of children (under 18 years). The DPDP Act imposes heightened obligations for processing children's data, including requirements for verifiable parental consent and prohibition on processing that could cause harm to children. The Data Protection Board is likely to treat breaches involving children's data with greater scrutiny. Ensure that: (a) children's data is segregated in your breach impact assessment; (b) parental notifications are sent where children's data is involved; (c) legal counsel is engaged immediately.`,
            urgency: "Children's data breaches attract heightened regulatory scrutiny — engage legal counsel immediately.",
        })
        flags.push("Children's personal data is involved — heightened DPDP Act obligations and regulatory scrutiny apply.")
    }

    if (data.isOngoingBreach) {
        actions.push({
            id: 'ongoing_breach',
            icon: <AlertTriangle size={16} />,
            title: 'Active/Ongoing Breach — Containment Priority',
            subtitle: 'Immediate incident response before notification',
            tag: 'mandatory',
            body: `The breach is still active or ongoing. Containment must be the immediate priority: isolate affected systems, revoke compromised credentials, block attacker access, and preserve forensic evidence (do not wipe systems before forensic imaging). The notification clock under CERT-In began running from when the breach was first detected, even if it was not yet confirmed. Notification obligations do not pause for containment.`,
            urgency: 'Containment and notification must proceed in parallel — notification timelines do not wait for containment.',
        })
        flags.push('Active breach — containment and notification are parallel obligations; timelines do not pause.')
    }

    actions.push({
        id: 'penalties',
        icon: <AlertTriangle size={16} />,
        title: 'Regulatory Penalty Exposure',
        subtitle: 'IT Act Section 70B(7) + DPDP Act Section 33',
        tag: 'disclosure',
        body: `Failure to report to CERT-In within the prescribed timeline exposes your organisation to penalties under Section 70B(7) of the IT Act, 2000 — up to ₹1 crore per unreported incident. Additionally, the Data Protection Board under the DPDP Act, 2023 may impose financial penalties for breach notification failures. Boards and executive teams may also face personal liability under applicable laws. Document all notification actions with timestamps.`,
    })

    actions.push({
        id: 'documentation',
        icon: <FileText size={16} />,
        title: 'Internal Incident Documentation',
        subtitle: 'Preserve records for regulatory, legal, and insurance purposes',
        tag: 'disclosure',
        body: `Maintain a comprehensive incident log from first detection through resolution, including: timeline of events, systems and data affected, persons notified (internal and external), remediation actions, and lessons learned. This documentation is essential for: CERT-In's 72-hour report, regulatory investigations, cybersecurity insurance claims, and potential litigation. Engage legal counsel early to assess privilege over investigation documents.`,
    })

    actions.push({
        id: 'board_notification',
        icon: <Users size={16} />,
        title: 'Board / Audit Committee Notification',
        subtitle: 'Internal governance — immediate escalation required',
        tag: 'disclosure',
        body: `For significant data breaches, the Board of Directors and/or Audit Committee should be notified promptly. Listed companies may have obligations under SEBI LODR to disclose material cyber incidents to stock exchanges. Assess whether this breach constitutes a material event requiring exchange disclosure (Regulation 30, SEBI LODR). Consult your Company Secretary and legal counsel for listed entity obligations.`,
    })

    if (hasSensitiveData) {
        const categoryLabels: Record<SensitiveCategory, string> = {
            financial_data: 'financial data',
            health_data: 'health/medical data',
            biometric: 'biometric data',
            children_data: "children's data",
            government_ids: 'government IDs (Aadhaar, PAN, etc.)',
            passwords_credentials: 'passwords and credentials',
        }
        const labels = data.sensitiveCategories.map(c => categoryLabels[c]).join(', ')
        flags.push(`Sensitive personal data categories affected: ${labels}. This heightens both the regulatory risk and the potential harm to individuals.`)
    }
    if (!data.containmentDone) {
        flags.push('Containment not yet completed — prioritise system isolation and credential rotation before further escalation.')
    }
    if (!data.legalCounselNotified) {
        flags.push('Legal counsel has not been notified — engage immediately to assess notification obligations, litigation risk, and document privilege.')
    }
    if (data.recordsCount === 'over_1000') {
        flags.push('Over 1,000 records affected — prepare for individual notifications to affected Data Principals under DPDP Act.')
    }

    const summaryParts = [
        'CERT-In 6-hr Report Required',
        data.personalDataInvolved && data.isDataFiduciary ? '+ DPDP DPB Notification' : '',
        data.isCriticalInfrastructure ? '+ Critical Infrastructure Protocol' : '',
    ].filter(Boolean)

    return { actions, flags, summary: summaryParts.join(' '), urgencyLevel }
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const TAG = {
    mandatory:   { bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.28)',  icon: 'rgba(239,68,68,0.15)',  color: '#fca5a5', label: 'Required',   accent: 'rgba(239,68,68,0.7)'   },
    conditional: { bg: 'rgba(34,211,238,0.07)',  border: 'rgba(34,211,238,0.18)', icon: 'rgba(34,211,238,0.12)', color: '#67e8f9', label: 'Assess',     accent: 'rgba(34,211,238,0.6)'  },
    disclosure:  { bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.22)', icon: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: 'Disclosure', accent: 'rgba(245,158,11,0.65)' },
}

const URGENCY_COLORS = {
    critical: { bg: 'linear-gradient(135deg, rgba(239,68,68,0.17), rgba(59,130,246,0.06))', border: 'rgba(239,68,68,0.38)', color: '#fca5a5', label: 'CRITICAL' },
    high:     { bg: 'linear-gradient(135deg, rgba(245,158,11,0.13), rgba(59,130,246,0.06))', border: 'rgba(245,158,11,0.38)', color: '#fbbf24', label: 'HIGH URGENCY' },
    medium:   { bg: 'linear-gradient(135deg, rgba(59,130,246,0.13), rgba(34,211,238,0.07))', border: 'rgba(59,130,246,0.28)', color: '#93c5fd', label: 'ACTION REQUIRED' },
}

const BLUE_GRAD = 'linear-gradient(135deg, rgba(59,130,246,0.85), rgba(34,211,238,0.65))'
const BLUE_PROG = 'linear-gradient(90deg, rgba(59,130,246,0.8), rgba(34,211,238,0.6))'

const STEPS = [
    { id: 1, label: 'Breach' },
    { id: 2, label: 'Data' },
    { id: 3, label: 'Scope' },
    { id: 4, label: 'Response' },
]

const SENSITIVE_OPTIONS: { value: SensitiveCategory; label: string; sub: string }[] = [
    { value: 'financial_data',        label: 'Financial data',             sub: 'Bank account details, card numbers, financial records' },
    { value: 'health_data',           label: 'Health / medical data',      sub: 'Medical records, prescriptions, diagnoses' },
    { value: 'biometric',             label: 'Biometric data',             sub: 'Fingerprints, facial recognition, iris scans' },
    { value: 'children_data',         label: "Children's personal data",   sub: 'Personal data of individuals under 18 years' },
    { value: 'government_ids',        label: 'Government IDs',             sub: 'Aadhaar, PAN, passport, driving licence numbers' },
    { value: 'passwords_credentials', label: 'Passwords / credentials',    sub: 'Login credentials, API keys, authentication tokens' },
]

const SYSTEMS_OPTIONS: { value: SystemAffected; label: string }[] = [
    { value: 'production_servers',   label: 'Production servers / databases' },
    { value: 'cloud_storage',        label: 'Cloud storage (AWS S3, Google Drive, Azure Blob, etc.)' },
    { value: 'endpoint_devices',     label: 'Endpoint devices (laptops, phones, USB drives)' },
    { value: 'third_party_systems',  label: 'Third-party systems / vendors' },
    { value: 'email_systems',        label: 'Email systems / communication platforms' },
]

const EMPTY: FormData = {
    breachType: '',
    isConfirmed: null,
    discoveryTime: '',
    personalDataInvolved: null,
    sensitiveCategories: [],
    recordsCount: '',
    isCriticalInfrastructure: null,
    systemsAffected: [],
    isDataFiduciary: null,
    hasDataProcessor: null,
    isOngoingBreach: null,
    containmentDone: null,
    backupAvailable: null,
    legalCounselNotified: null,
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
                ...(selected ? { background: 'rgba(59,130,246,0.09)' } : {}),
                border: `1.5px solid ${selected ? 'rgba(59,130,246,0.6)' : 'var(--border-glass)'}`,
            }}
        >
            <div
                className="w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ marginTop: 3, borderColor: selected ? 'rgba(59,130,246,0.8)' : 'rgba(255,255,255,0.2)' }}
            >
                {selected && <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'rgba(59,130,246,0.9)' }} />}
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium leading-snug" style={{ color: selected ? '#93c5fd' : 'var(--text-light)' }}>
                    {label}
                </div>
                {sub && <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
            </div>
        </button>
    )
}

function CheckCard({ label, sub, checked, onClick }: { label: string; sub?: string; checked: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left rounded-xl flex items-start gap-3 transition-all duration-200 cursor-pointer ${!checked ? 'hover:bg-white/[.06]' : ''}`}
            style={{
                padding: '10px 14px',
                ...(checked ? { background: 'rgba(59,130,246,0.09)' } : {}),
                border: `1.5px solid ${checked ? 'rgba(59,130,246,0.5)' : 'var(--border-glass)'}`,
            }}
        >
            <div
                className="w-[16px] h-[16px] rounded flex items-center justify-center flex-shrink-0"
                style={{
                    marginTop: 3,
                    background: checked ? 'rgba(59,130,246,0.7)' : 'transparent',
                    border: `1.5px solid ${checked ? 'rgba(59,130,246,0.8)' : 'rgba(255,255,255,0.2)'}`,
                }}
            >
                {checked && <CheckCircle size={11} style={{ color: '#fff' }} />}
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium leading-snug" style={{ color: checked ? '#93c5fd' : 'var(--text-light)' }}>{label}</div>
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
                ...(selected ? { background: 'rgba(59,130,246,0.09)' } : {}),
                border: `1.5px solid ${selected ? 'rgba(59,130,246,0.6)' : 'var(--border-glass)'}`,
                color: selected ? '#93c5fd' : 'var(--text-muted)',
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

export function BreachSimulatorClient() {
    const [step, setStep] = useState(1)
    const [data, setData] = useState<FormData>(EMPTY)
    const [result, setResult] = useState<AnalysisResult | null>(null)

    function set<K extends keyof FormData>(key: K, value: FormData[K]) {
        setData(d => ({ ...d, [key]: value }))
    }

    function toggleSensitiveCategory(cat: SensitiveCategory) {
        setData(d => ({
            ...d,
            sensitiveCategories: d.sensitiveCategories.includes(cat)
                ? d.sensitiveCategories.filter(c => c !== cat)
                : [...d.sensitiveCategories, cat],
        }))
    }

    function toggleSystem(sys: SystemAffected) {
        setData(d => ({
            ...d,
            systemsAffected: d.systemsAffected.includes(sys)
                ? d.systemsAffected.filter(s => s !== sys)
                : [...d.systemsAffected, sys],
        }))
    }

    function canContinue(): boolean {
        if (step === 1) return data.breachType !== '' && data.isConfirmed !== null && data.discoveryTime !== ''
        if (step === 2) return data.personalDataInvolved !== null && data.recordsCount !== '' && data.isCriticalInfrastructure !== null
        if (step === 3) return data.systemsAffected.length > 0 && data.isDataFiduciary !== null && data.hasDataProcessor !== null && data.isOngoingBreach !== null
        if (step === 4) return data.containmentDone !== null && data.backupAvailable !== null && data.legalCounselNotified !== null
        return true
    }

    function handleNext() {
        if (step === 4) {
            setResult(analyzeDataBreach(data))
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
        const uc = URGENCY_COLORS[result.urgencyLevel]
        return (
            <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>

                {/* Status banner */}
                <div
                    className="rounded-2xl flex items-start gap-4 mb-8"
                    style={{ padding: '24px 28px', background: uc.bg, border: `1px solid ${uc.border}` }}
                >
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(59,130,246,0.25)', border: `1px solid ${uc.border}` }}
                    >
                        <ShieldAlert size={18} style={{ color: uc.color }} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: uc.color }}>
                            {uc.label}
                        </div>
                        <div className="text-base font-bold text-white mb-1">{result.summary}</div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            Review the compliance obligations below. CERT-In notification timelines begin from the moment of first detection — not from confirmation.
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
                        Response & Notification Obligations
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
                    style={{ padding: '13px 28px', background: BLUE_GRAD, color: '#fff' }}
                >
                    <RotateCcw size={13} /> Analyse Another Breach
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
                    borderLeft: '4px solid rgba(59,130,246,0.8)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: '#93c5fd' }}>
                    Interactive Training
                </div>
                <h2 className="text-base font-bold text-white mb-1">
                    What must you do when a data breach occurs?
                </h2>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Describe the breach, affected data, and current response status. The tool will generate your
                    notification obligations under the CERT-In Directions 2022 and the Digital Personal Data
                    Protection Act, 2023 — with precise timelines.
                </p>
            </div>

            {/* Step progress */}
            <StepProgress
                step={step}
                total={STEPS.length}
                label={STEPS[step - 1]?.label ?? ''}
                gradient={BLUE_PROG}
            />

            {/* Step dots */}
            <div className="flex items-center gap-2 mb-8">
                {STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 flex-1">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                                style={{
                                    background: step > s.id ? BLUE_GRAD : step === s.id ? 'rgba(59,130,246,0.12)' : 'var(--glass-bg)',
                                    border: `1.5px solid ${step === s.id ? 'rgba(59,130,246,0.6)' : step > s.id ? 'transparent' : 'var(--border-glass)'}`,
                                    color: step > s.id ? '#fff' : step === s.id ? '#93c5fd' : 'var(--text-muted)',
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
                                style={{ background: step > s.id + 1 ? BLUE_PROG : 'var(--border-glass)' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className="mb-7">
                {/* Step 1 — Breach Classification */}
                {step === 1 && (
                    <div>
                        <SectionHeading
                            title="What type of breach has occurred?"
                            sub="Select the breach type and indicate when it was discovered. All timelines begin from the moment of first detection."
                        />
                        <div className="space-y-10">
                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Breach type</div>
                                <div className="flex flex-col" style={{ gap: 8 }}>
                                    <RadioCard label="Unauthorised access to systems or data" selected={data.breachType === 'unauthorized_access'} onClick={() => set('breachType', 'unauthorized_access')} />
                                    <RadioCard label="Ransomware attack / encryption of data" selected={data.breachType === 'ransomware'} onClick={() => set('breachType', 'ransomware')} />
                                    <RadioCard label="Data exfiltration / theft of data" sub="Data has been copied or transmitted out of your environment" selected={data.breachType === 'data_exfiltration'} onClick={() => set('breachType', 'data_exfiltration')} />
                                    <RadioCard label="Accidental disclosure" sub="Data sent to wrong recipient, misconfigured access, public exposure" selected={data.breachType === 'accidental_disclosure'} onClick={() => set('breachType', 'accidental_disclosure')} />
                                    <RadioCard label="Lost or stolen device" sub="Laptop, phone, USB drive, or other device containing data" selected={data.breachType === 'lost_device'} onClick={() => set('breachType', 'lost_device')} />
                                    <RadioCard label="Insider threat" sub="Intentional or negligent data misuse by an employee" selected={data.breachType === 'insider_threat'} onClick={() => set('breachType', 'insider_threat')} />
                                    <RadioCard label="Supply chain / third-party compromise" sub="Breach via a vendor or third-party service" selected={data.breachType === 'supply_chain'} onClick={() => set('breachType', 'supply_chain')} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Is the breach confirmed or still suspected?</div>
                                <div className="flex gap-3 mb-3">
                                    <BoolCard label="Confirmed breach" value={true} current={data.isConfirmed} onClick={() => set('isConfirmed', true)} />
                                    <BoolCard label="Suspected / under investigation" value={false} current={data.isConfirmed} onClick={() => set('isConfirmed', false)} />
                                </div>
                                {data.isConfirmed === false && (
                                    <div className="flex items-start gap-2 rounded-lg" style={{ padding: '8px 10px', background: 'rgba(245,158,11,0.08)' }}>
                                        <Info size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                                        <p className="text-xs" style={{ color: '#fde68a' }}>
                                            CERT-In timelines run from first detection, not from confirmation. A suspected breach still triggers the 6-hour reporting obligation.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>How long ago was the breach first detected?</div>
                                <div className="flex flex-col" style={{ gap: 8 }}>
                                    <RadioCard label="Within the last 6 hours" sub="CERT-In 6-hour window is still open" selected={data.discoveryTime === 'within_6_hours'} onClick={() => set('discoveryTime', 'within_6_hours')} />
                                    <RadioCard label="6 to 24 hours ago" sub="CERT-In initial report is likely overdue" selected={data.discoveryTime === '6_to_24_hours'} onClick={() => set('discoveryTime', '6_to_24_hours')} />
                                    <RadioCard label="24 to 72 hours ago" selected={data.discoveryTime === '24_to_72_hours'} onClick={() => set('discoveryTime', '24_to_72_hours')} />
                                    <RadioCard label="More than 72 hours ago" sub="Both CERT-In reports are overdue" selected={data.discoveryTime === 'over_72_hours'} onClick={() => set('discoveryTime', 'over_72_hours')} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2 — Data Categories */}
                {step === 2 && (
                    <div>
                        <SectionHeading
                            title="What data has been affected?"
                            sub="Data categories determine which additional laws and obligations apply beyond CERT-In."
                        />
                        <div className="space-y-10">
                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Does the breach involve personal data as defined under the DPDP Act, 2023?</div>
                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Personal data = any data that identifies or is capable of identifying an individual.</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — personal data involved" value={true} current={data.personalDataInvolved} onClick={() => set('personalDataInvolved', true)} />
                                    <BoolCard label="No — only system/technical data" value={false} current={data.personalDataInvolved} onClick={() => set('personalDataInvolved', false)} />
                                </div>
                            </div>

                            {data.personalDataInvolved && (
                                <>
                                    <div className="h-px" style={{ background: 'var(--border-glass)' }} />
                                    <div>
                                        <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Select sensitive data categories affected <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(select all that apply)</span></div>
                                        <div className="flex flex-col mt-3" style={{ gap: 8 }}>
                                            {SENSITIVE_OPTIONS.map(opt => (
                                                <CheckCard
                                                    key={opt.value}
                                                    label={opt.label}
                                                    sub={opt.sub}
                                                    checked={data.sensitiveCategories.includes(opt.value)}
                                                    onClick={() => toggleSensitiveCategory(opt.value)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Approximate number of records / individuals affected</div>
                                <div className="flex flex-col" style={{ gap: 8 }}>
                                    <RadioCard label="Fewer than 100 records" selected={data.recordsCount === 'under_100'} onClick={() => set('recordsCount', 'under_100')} />
                                    <RadioCard label="100 to 1,000 records" selected={data.recordsCount === '100_to_1000'} onClick={() => set('recordsCount', '100_to_1000')} />
                                    <RadioCard label="More than 1,000 records" selected={data.recordsCount === 'over_1000'} onClick={() => set('recordsCount', 'over_1000')} />
                                    <RadioCard label="Unknown at this time" selected={data.recordsCount === 'unknown'} onClick={() => set('recordsCount', 'unknown')} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Does your organisation operate in a critical infrastructure sector?</div>
                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                                    Critical sectors include: banking and financial services, power and energy, telecom, healthcare, transport, government IT systems.
                                </div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — critical sector" value={true} current={data.isCriticalInfrastructure} onClick={() => set('isCriticalInfrastructure', true)} />
                                    <BoolCard label="No — non-critical" value={false} current={data.isCriticalInfrastructure} onClick={() => set('isCriticalInfrastructure', false)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3 — Systems & Scope */}
                {step === 3 && (
                    <div>
                        <SectionHeading
                            title="What systems are affected and what is your organisation's data role?"
                            sub="System scope and your organisation's role under the DPDP Act determine additional obligations."
                        />
                        <div className="space-y-10">
                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Select all affected systems <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(select all that apply)</span></div>
                                <div className="flex flex-col mt-3" style={{ gap: 8 }}>
                                    {SYSTEMS_OPTIONS.map(opt => (
                                        <CheckCard
                                            key={opt.value}
                                            label={opt.label}
                                            checked={data.systemsAffected.includes(opt.value)}
                                            onClick={() => toggleSystem(opt.value)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Is your organisation a Data Fiduciary under the DPDP Act?</div>
                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                                    A Data Fiduciary is any entity that determines the purpose and means of processing personal data. Most commercial organisations are Data Fiduciaries. A Data Processor only processes data on behalf of a Fiduciary.
                                </div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — we are a Data Fiduciary" value={true} current={data.isDataFiduciary} onClick={() => set('isDataFiduciary', true)} />
                                    <BoolCard label="No — we are a Data Processor only" value={false} current={data.isDataFiduciary} onClick={() => set('isDataFiduciary', false)} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Was a third-party Data Processor involved in the breach?</div>
                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>For example, a cloud vendor, SaaS provider, or outsourcing partner who processes data on your behalf.</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes" value={true} current={data.hasDataProcessor} onClick={() => set('hasDataProcessor', true)} />
                                    <BoolCard label="No" value={false} current={data.hasDataProcessor} onClick={() => set('hasDataProcessor', false)} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Is the breach still active or ongoing?</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — still active" value={true} current={data.isOngoingBreach} onClick={() => set('isOngoingBreach', true)} />
                                    <BoolCard label="No — contained" value={false} current={data.isOngoingBreach} onClick={() => set('isOngoingBreach', false)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4 — Current Response */}
                {step === 4 && (
                    <div>
                        <SectionHeading
                            title="What is your current response status?"
                            sub="This helps identify any gaps in your incident response that need immediate attention."
                        />
                        <div className="space-y-10">
                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Has containment been completed?</div>
                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Containment = systems isolated, compromised credentials revoked, attacker access blocked.</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — contained" value={true} current={data.containmentDone} onClick={() => set('containmentDone', true)} />
                                    <BoolCard label="No — in progress" value={false} current={data.containmentDone} onClick={() => set('containmentDone', false)} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Are clean backups available for recovery?</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes" value={true} current={data.backupAvailable} onClick={() => set('backupAvailable', true)} />
                                    <BoolCard label="No / unknown" value={false} current={data.backupAvailable} onClick={() => set('backupAvailable', false)} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Has legal counsel been notified?</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes" value={true} current={data.legalCounselNotified} onClick={() => set('legalCounselNotified', true)} />
                                    <BoolCard label="No" value={false} current={data.legalCounselNotified} onClick={() => set('legalCounselNotified', false)} />
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
                    {step === 4 ? 'Generate Response Plan' : 'Continue'} <ChevronRight size={14} />
                </button>
            </div>
        </div>
    )
}
