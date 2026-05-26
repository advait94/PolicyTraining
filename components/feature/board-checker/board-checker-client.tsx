'use client'

import { useState } from 'react'
import {
    ChevronRight, ChevronLeft, ChevronDown, CheckCircle, AlertTriangle,
    Info, RotateCcw, Building2, Users, FileText, ShieldCheck, XCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type CompanyType = 'public_limited' | 'private_limited' | 'small_company' | 'opc' | ''
type CapitalRange = 'under_1cr' | '1cr_to_10cr' | '10cr_to_100cr' | 'over_100cr' | ''
type AuditChairType = 'independent_director' | 'non_executive' | 'executive' | 'unknown' | ''
type IdTenure = 'within_5_years' | 'second_term_within_5_years' | 'exceeds_10_years' | 'unknown' | ''

interface FormData {
    isListed: boolean | null
    companyType: CompanyType
    paidUpCapital: CapitalRange
    hasExecutiveChairman: boolean | null
    totalDirectors: number | null
    independentDirectors: number | null
    womenDirectors: number | null
    nonExecutiveDirectors: number | null
    hasManagingDirector: boolean | null
    hasAuditCommittee: boolean | null
    auditCommitteeSize: number | null
    auditCommitteeIndependents: number | null
    auditCommitteeChair: AuditChairType
    hasNRC: boolean | null
    nrcSize: number | null
    nrcIndependents: number | null
    hasStakeholderCommittee: boolean | null
    hasRMC: boolean | null
    anyDirectorDisqualified: boolean | null
    idTenure: IdTenure
}

interface ComplianceAction {
    id: string
    icon: React.ReactNode
    title: string
    subtitle: string
    body: string
    tag: 'mandatory' | 'conditional' | 'disclosure'
    urgency?: string
    status: 'pass' | 'fail' | 'info'
}

interface AnalysisResult {
    actions: ComplianceAction[]
    flags: string[]
    summary: string
    passCount: number
    failCount: number
}

// ─── Analysis Engine ──────────────────────────────────────────────────────────

function analyzeBoardComposition(data: FormData): AnalysisResult {
    const actions: ComplianceAction[] = []
    const flags: string[] = []

    const total = data.totalDirectors ?? 0
    const independent = data.independentDirectors ?? 0
    const women = data.womenDirectors ?? 0
    const nonExec = data.nonExecutiveDirectors ?? 0
    const auditSize = data.auditCommitteeSize ?? 0
    const auditInd = data.auditCommitteeIndependents ?? 0
    const nrcSize = data.nrcSize ?? 0
    const nrcInd = data.nrcIndependents ?? 0

    const isPublic = data.companyType === 'public_limited'
    const isPrivate = data.companyType === 'private_limited'
    const isSmall = data.companyType === 'small_company'
    const isOPC = data.companyType === 'opc'
    const isListed = data.isListed === true
    const cap10cr = data.paidUpCapital === '10cr_to_100cr' || data.paidUpCapital === 'over_100cr'
    const cap100cr = data.paidUpCapital === 'over_100cr'

    const needsID = isListed || (isPublic && cap10cr)
    const needsAuditCommittee = isListed || (isPublic && cap10cr)

    let passCount = 0
    let failCount = 0

    function addCheck(pass: boolean, action: Omit<ComplianceAction, 'status' | 'tag' | 'body' | 'urgency'>, passBody: string, failBody: string, failUrgency?: string): void {
        if (pass) passCount++; else failCount++
        actions.push({
            ...action,
            tag: pass ? 'conditional' : 'mandatory',
            status: pass ? 'pass' : 'fail',
            body: pass ? passBody : failBody,
            urgency: pass ? undefined : failUrgency,
        })
    }

    // ── Minimum Directors ──
    const minDirs = isOPC ? 1 : isPrivate ? 2 : 3
    addCheck(
        total >= minDirs,
        { id: 'min_directors', icon: <Users size={16} />, title: 'Minimum Directors — Section 149(1)', subtitle: `Required: ${minDirs} | Present: ${total}` },
        `Board has ${total} directors — meets the minimum requirement of ${minDirs} directors for a ${data.companyType?.replace('_', ' ')} company.`,
        `Board has only ${total} director(s). A ${isOPC ? 'One Person Company' : isPrivate ? 'private limited company' : 'public limited company'} requires a minimum of ${minDirs} directors under Section 149(1) of the Companies Act, 2013. Appoint additional directors immediately.`,
        'Appoint additional directors — board is below statutory minimum.',
    )

    // ── Maximum Directors ──
    if (total > 15) {
        failCount++
        actions.push({
            id: 'max_directors', icon: <Users size={16} />, title: 'Exceeds Maximum Director Limit — Section 149(1)',
            subtitle: `Maximum: 15 | Present: ${total}`,
            tag: 'mandatory', status: 'fail',
            body: `The board has ${total} directors, exceeding the maximum of 15 directors prescribed under Section 149(1) of the Companies Act, 2013. A company may increase this limit only by passing a Special Resolution. Without a Special Resolution, the excess appointments may be invalid.`,
            urgency: 'Pass a Special Resolution to authorise the increased board strength, or reduce the board to 15.',
        })
    }

    // ── Independent Directors ──
    if (needsID) {
        const minID = isListed ? Math.ceil(total / 3) : 2
        const requirement = isListed ? `≥ 1/3 of total board (${Math.ceil(total / 3)} IDs)` : 'minimum 2 IDs'
        addCheck(
            independent >= minID,
            { id: 'independent_directors', icon: <ShieldCheck size={16} />, title: 'Independent Directors — Section 149(4) / SEBI LODR Reg 17', subtitle: `Required: ${minID} | Present: ${independent}` },
            `Board has ${independent} Independent Director(s) — meets the requirement of ${requirement}.`,
            `Board has ${independent} Independent Director(s). ${isListed ? `Listed companies must have at least 1/3 of the total board as Independent Directors under SEBI LODR Regulation 17 (minimum ${Math.ceil(total / 3)} IDs for a board of ${total}).` : `Public companies with paid-up capital ≥ ₹10 crore must have at least 2 Independent Directors under Section 149(4).`} Appoint additional IDs.`,
            `Appoint ${minID - independent} additional Independent Director(s) to meet the statutory requirement.`,
        )
    } else if (!isOPC && !isSmall && isPublic) {
        actions.push({
            id: 'independent_directors_na', icon: <ShieldCheck size={16} />,
            title: 'Independent Directors — Not Mandatory at This Scale',
            subtitle: 'Section 149(4) threshold not met',
            tag: 'disclosure', status: 'info',
            body: `Section 149(4) requires Independent Directors for public companies with paid-up capital ≥ ₹10 crore or turnover ≥ ₹100 crore. Based on the stated capital range, the mandatory ID requirement under the Companies Act does not currently apply. However, consider appointing IDs voluntarily for governance quality.`,
        })
    }

    // ── Executive Chairman → 50% Non-Executive Rule ──
    if (isListed && data.hasExecutiveChairman === true) {
        const minNonExec = Math.ceil(total / 2)
        const pass = nonExec >= minNonExec
        addCheck(
            pass,
            { id: 'exec_chairman_nonexec', icon: <Building2 size={16} />, title: 'Executive Chairman — 50% Non-Executive Requirement (SEBI LODR)', subtitle: `Required: ≥${minNonExec} non-executive | Present: ${nonExec}` },
            `Board has ${nonExec} non-executive directors — meets the ≥50% requirement for listed companies with an Executive Chairman under SEBI LODR.`,
            `Listed companies with an Executive Chairman must have at least 50% non-executive directors (SEBI LODR Regulation 17). The board has ${nonExec} non-executives out of ${total} directors but requires at least ${minNonExec}.`,
            'Appoint additional non-executive directors or separate the Chairman and MD/CEO roles.',
        )
    }

    // ── Women Director ──
    const needsWoman = isListed || (isPublic && cap100cr)
    if (needsWoman) {
        addCheck(
            women >= 1,
            { id: 'women_director', icon: <Users size={16} />, title: 'Woman Director — Section 149(1) Proviso', subtitle: `Required: ≥1 | Present: ${women}` },
            `Board has ${women} woman director(s) — meets the mandatory requirement under Section 149(1) proviso.`,
            `At least one Woman Director is mandatory for listed public companies and public companies with paid-up capital ≥ ₹100 crore. The board currently has ${women} woman director(s). Appoint a woman director without delay.`,
            'Non-compliance with this requirement attracts a penalty on both the company and the defaulting officers.',
        )
    }

    // ── ID Tenure ──
    if (data.idTenure === 'exceeds_10_years') {
        failCount++
        actions.push({
            id: 'id_tenure', icon: <AlertTriangle size={16} />,
            title: 'Independent Director Tenure — Section 149(10)/(11)',
            subtitle: 'Maximum 2 consecutive terms of 5 years each',
            tag: 'mandatory', status: 'fail',
            body: `An Independent Director who has completed 2 consecutive terms of 5 years (total 10 years) cannot be re-appointed until a cooling-off period of 3 years has elapsed. During the cooling-off period, the person may not be appointed in any capacity. An ID completing tenure in excess of 10 years may not be a valid Independent Director and the board composition may be non-compliant.`,
            urgency: 'Review all ID appointments for tenure compliance. A director whose term has expired is not counted as an ID.',
        })
        flags.push('One or more IDs may have exceeded the maximum 10-year tenure. Review and replace if necessary — over-tenure IDs are not counted for compliance.')
    } else if (data.idTenure === 'within_5_years' || data.idTenure === 'second_term_within_5_years') {
        passCount++
        actions.push({
            id: 'id_tenure', icon: <ShieldCheck size={16} />,
            title: 'Independent Director Tenure — Compliant',
            subtitle: `Section 149(10)/(11) — Within permissible tenure`,
            tag: 'conditional', status: 'pass',
            body: `Independent Director tenure is within permissible limits under Section 149(10)/(11). ${data.idTenure === 'second_term_within_5_years' ? 'IDs in their second term have up to 5 more years before the mandatory cooling-off applies. Plan ahead for succession.' : 'IDs are in their first 5-year term and may be re-appointed for one further term.'}`,
        })
    }

    // ── Audit Committee ──
    if (needsAuditCommittee) {
        if (data.hasAuditCommittee === false) {
            failCount++
            actions.push({
                id: 'audit_committee_absent', icon: <FileText size={16} />,
                title: 'Audit Committee — Not Constituted (Non-Compliant)',
                subtitle: 'Section 177 — Mandatory for this company',
                tag: 'mandatory', status: 'fail',
                body: `${isListed ? 'Listed companies' : 'Public companies with paid-up capital ≥ ₹10 crore'} must constitute an Audit Committee under Section 177 of the Companies Act, 2013. The Audit Committee must have a minimum of 3 directors, with the majority being Independent Directors. The chairperson must be an Independent Director. Constitute the Audit Committee immediately.`,
                urgency: 'Constitute the Audit Committee before the next Board meeting. Non-constitution is a continuous offence.',
            })
        } else if (data.hasAuditCommittee === true) {
            addCheck(
                auditSize >= 3,
                { id: 'audit_size', icon: <FileText size={16} />, title: 'Audit Committee — Minimum Size', subtitle: `Required: ≥3 members | Present: ${auditSize}` },
                `Audit Committee has ${auditSize} members — meets the minimum requirement of 3 members under Section 177.`,
                `Audit Committee has only ${auditSize} member(s). Section 177 requires a minimum of 3 directors. Expand the committee without delay.`,
                'Expand Audit Committee to minimum 3 members.',
            )
            const minAuditInd = isListed ? Math.ceil(auditSize * 2 / 3) : Math.ceil(auditSize / 2) + (auditSize % 2 === 0 ? 1 : 0)
            const auditIndLabel = isListed ? `≥ 2/3 IDs (${Math.ceil(auditSize * 2 / 3)})` : 'majority IDs'
            addCheck(
                auditInd >= (isListed ? Math.ceil(auditSize * 2 / 3) : Math.floor(auditSize / 2) + 1),
                { id: 'audit_independence', icon: <ShieldCheck size={16} />, title: 'Audit Committee — Independence Requirement', subtitle: `Required: ${auditIndLabel} | Present: ${auditInd} IDs` },
                `Audit Committee has ${auditInd} Independent Director(s) — meets the ${auditIndLabel} requirement.`,
                `Audit Committee requires ${auditIndLabel} but has only ${auditInd} Independent Director(s). ${isListed ? 'SEBI LODR Regulation 18 requires at least 2/3 of Audit Committee members to be Independent Directors.' : 'Section 177 requires the majority of Audit Committee members to be Independent Directors.'} Reconstitute the committee.`,
            )
            if (data.auditCommitteeChair === 'executive') {
                failCount++
                actions.push({
                    id: 'audit_chair', icon: <AlertTriangle size={16} />,
                    title: 'Audit Committee Chairperson — Not an Independent Director',
                    subtitle: 'Section 177 / SEBI LODR Reg 18 — Chairperson must be an ID',
                    tag: 'mandatory', status: 'fail',
                    body: `The Audit Committee must be chaired by an Independent Director under Section 177 and SEBI LODR Regulation 18. The current chairperson is an executive director, which does not meet this requirement. The Chairperson of the Audit Committee must also be present at the Annual General Meeting to answer shareholder queries.`,
                    urgency: 'Reconstitute chairpersonship — an Independent Director must chair the Audit Committee.',
                })
            } else if (data.auditCommitteeChair === 'independent_director') {
                passCount++
                actions.push({
                    id: 'audit_chair', icon: <CheckCircle size={16} />,
                    title: 'Audit Committee Chairperson — Compliant',
                    subtitle: 'Chaired by an Independent Director as required',
                    tag: 'conditional', status: 'pass',
                    body: 'The Audit Committee is chaired by an Independent Director — compliant with Section 177 and SEBI LODR Regulation 18.',
                })
            }
        }
    } else {
        actions.push({
            id: 'audit_committee_na', icon: <FileText size={16} />,
            title: 'Audit Committee — Not Mandatorily Required',
            subtitle: 'Section 177 threshold not met for this company',
            tag: 'disclosure', status: 'info',
            body: 'Section 177 mandates an Audit Committee for listed companies and public companies meeting size thresholds. Based on the provided details, the Audit Committee is not mandatory for this company at this time. Voluntary constitution is recommended as the company grows.',
        })
    }

    // ── NRC ──
    if (needsAuditCommittee) {
        if (data.hasNRC === false) {
            failCount++
            actions.push({
                id: 'nrc_absent', icon: <Users size={16} />,
                title: 'Nomination & Remuneration Committee — Not Constituted',
                subtitle: 'Section 178 — Mandatory for this company',
                tag: 'mandatory', status: 'fail',
                body: `A Nomination and Remuneration Committee (NRC) is mandatory under Section 178 for the same companies that require an Audit Committee. The NRC must have at least 3 non-executive directors, with at least half being Independent Directors (SEBI LODR Regulation 19 requires at least 50% IDs). The chairperson must be an Independent Director or a non-executive director. Constitute the NRC immediately.`,
                urgency: 'Constitute the NRC before the next Board meeting.',
            })
        } else if (data.hasNRC === true && nrcSize > 0) {
            addCheck(
                nrcSize >= 3,
                { id: 'nrc_size', icon: <Users size={16} />, title: 'NRC — Minimum Size', subtitle: `Required: ≥3 non-executive directors | Present: ${nrcSize}` },
                `NRC has ${nrcSize} members — meets the minimum requirement of 3 non-executive directors.`,
                `NRC has ${nrcSize} member(s). Section 178 requires at least 3 non-executive directors on the NRC.`,
            )
            const minNrcInd = Math.ceil(nrcSize / 2)
            addCheck(
                nrcInd >= minNrcInd,
                { id: 'nrc_independence', icon: <ShieldCheck size={16} />, title: 'NRC — Independence Requirement', subtitle: `Required: ≥50% IDs (${minNrcInd}) | Present: ${nrcInd}` },
                `NRC has ${nrcInd} Independent Director(s) — meets the 50% independence requirement.`,
                `NRC requires at least 50% Independent Directors (${minNrcInd} IDs for a committee of ${nrcSize}) but has only ${nrcInd}. Reconstitute the NRC.`,
            )
        }
    }

    // ── Director Disqualification ──
    if (data.anyDirectorDisqualified === true) {
        failCount++
        actions.push({
            id: 'disqualification', icon: <XCircle size={16} />,
            title: 'Director Disqualification — Section 164',
            subtitle: 'Disqualified director cannot hold office',
            tag: 'mandatory', status: 'fail',
            body: `A disqualified director under Section 164 of the Companies Act, 2013 is automatically vacated from all directorships. A disqualified person cannot be re-appointed as director of any company for 5 years from the date of disqualification. Common grounds include: convicted offences, failure to file financial statements for 3 consecutive years, and failure to repay deposits. Identify and remove the disqualified director immediately and file Form DIR-12 for vacation of office.`,
            urgency: 'File Form DIR-12 immediately. Board resolutions passed with participation of a disqualified director may be invalid.',
        })
        flags.push('Disqualified director on the board — board resolutions with their participation may be invalid. Remove and file Form DIR-12 immediately.')
    }

    // ── Annual Disclosures ──
    actions.push({
        id: 'annual_disclosures', icon: <FileText size={16} />,
        title: 'Annual Board Evaluation & Disclosures',
        subtitle: 'SEBI LODR Regulation 25 (listed) / Section 134 (all companies)',
        tag: 'disclosure', status: 'info',
        body: `Listed companies must conduct a formal Board Evaluation annually under SEBI LODR Regulation 25 — covering the Board, individual Directors, and Committees. All companies must include in the Board's Report: a statement on Declaration by Independent Directors, particulars of board meetings held, and disclosure on familiarisation programmes for IDs. The Company Secretary must file annual returns on board composition with MCA21.`,
    })

    actions.push({
        id: 'id_declaration', icon: <FileText size={16} />,
        title: 'Independent Director Declaration — Section 149(7)',
        subtitle: 'Annual declaration required at every AGM and first Board meeting of the year',
        tag: 'disclosure', status: 'info',
        body: `Every Independent Director must give a declaration at the first Board meeting of each financial year (and upon appointment) stating that they meet the independence criteria under Section 149(6). The declaration must be placed before the Board and disclosed in the Annual Report. Ensure all IDs submit this declaration on time.`,
    })

    const summary = failCount === 0
        ? 'Board composition is fully compliant'
        : `${failCount} compliance gap${failCount > 1 ? 's' : ''} identified — ${passCount} check${passCount > 1 ? 's' : ''} passed`

    return { actions, flags, summary, passCount, failCount }
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const TAG = {
    mandatory:   { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.28)',  icon: 'rgba(239,68,68,0.15)',  color: '#fca5a5', label: 'Non-Compliant', accent: 'rgba(239,68,68,0.7)'   },
    conditional: { bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.22)',  icon: 'rgba(34,197,94,0.12)',  color: '#86efac', label: 'Compliant',     accent: 'rgba(34,197,94,0.6)'   },
    disclosure:  { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.22)', icon: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: 'Disclosure',    accent: 'rgba(245,158,11,0.65)' },
}

const AMBER_GRAD = 'linear-gradient(135deg, rgba(245,158,11,0.85), rgba(168,85,247,0.55))'
const AMBER_PROG = 'linear-gradient(90deg, rgba(245,158,11,0.8), rgba(168,85,247,0.5))'

const STEPS = [
    { id: 1, label: 'Company' },
    { id: 2, label: 'Board' },
    { id: 3, label: 'Committees' },
    { id: 4, label: 'History' },
]

const EMPTY: FormData = {
    isListed: null,
    companyType: '',
    paidUpCapital: '',
    hasExecutiveChairman: null,
    totalDirectors: null,
    independentDirectors: null,
    womenDirectors: null,
    nonExecutiveDirectors: null,
    hasManagingDirector: null,
    hasAuditCommittee: null,
    auditCommitteeSize: null,
    auditCommitteeIndependents: null,
    auditCommitteeChair: '',
    hasNRC: null,
    nrcSize: null,
    nrcIndependents: null,
    hasStakeholderCommittee: null,
    hasRMC: null,
    anyDirectorDisqualified: null,
    idTenure: '',
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
                ...(selected ? { background: 'rgba(245,158,11,0.09)' } : {}),
                border: `1.5px solid ${selected ? 'rgba(245,158,11,0.6)' : 'var(--border-glass)'}`,
            }}
        >
            <div
                className="w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ marginTop: 3, borderColor: selected ? 'rgba(245,158,11,0.8)' : 'rgba(255,255,255,0.2)' }}
            >
                {selected && <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'rgba(245,158,11,0.9)' }} />}
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium leading-snug" style={{ color: selected ? '#fbbf24' : 'var(--text-light)' }}>
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
                ...(selected ? { background: 'rgba(245,158,11,0.09)' } : {}),
                border: `1.5px solid ${selected ? 'rgba(245,158,11,0.6)' : 'var(--border-glass)'}`,
                color: selected ? '#fbbf24' : 'var(--text-muted)',
            }}
        >
            {label}
        </button>
    )
}

function NumberInput({ label, hint, value, onChange, min = 0, max = 50 }: {
    label: string; hint?: string; value: number | null; onChange: (v: number | null) => void; min?: number; max?: number
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-light)' }}>{label}</label>
            {hint && <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{hint}</div>}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(min, (value ?? 0) - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:bg-white/[.08] cursor-pointer"
                    style={{ border: '1.5px solid var(--border-glass)', color: 'var(--text-muted)' }}
                >
                    −
                </button>
                <input
                    type="number"
                    min={min}
                    max={max}
                    value={value ?? ''}
                    onChange={(e) => {
                        const v = e.target.value === '' ? null : parseInt(e.target.value, 10)
                        onChange(isNaN(v as number) ? null : v)
                    }}
                    className="w-16 text-sm rounded-lg outline-none text-center font-semibold"
                    style={{
                        padding: '8px 6px',
                        border: '1.5px solid var(--border-glass)',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-white)',
                    }}
                    placeholder="0"
                />
                <button
                    type="button"
                    onClick={() => onChange(Math.min(max, (value ?? 0) + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:bg-white/[.08] cursor-pointer"
                    style={{ border: '1.5px solid var(--border-glass)', color: 'var(--text-muted)' }}
                >
                    +
                </button>
            </div>
        </div>
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

export function BoardCheckerClient() {
    const [step, setStep] = useState(1)
    const [data, setData] = useState<FormData>(EMPTY)
    const [result, setResult] = useState<AnalysisResult | null>(null)

    function set<K extends keyof FormData>(key: K, value: FormData[K]) {
        setData(d => ({ ...d, [key]: value }))
    }

    function canContinue(): boolean {
        if (step === 1) return data.isListed !== null && data.companyType !== '' && data.paidUpCapital !== '' && data.hasExecutiveChairman !== null
        if (step === 2) return data.totalDirectors !== null && data.independentDirectors !== null && data.womenDirectors !== null && data.nonExecutiveDirectors !== null
        if (step === 3) return data.hasAuditCommittee !== null && data.hasNRC !== null
        if (step === 4) return data.anyDirectorDisqualified !== null && data.idTenure !== ''
        return true
    }

    function handleNext() {
        if (step === 4) {
            setResult(analyzeBoardComposition(data))
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
        const allClear = result.failCount === 0
        return (
            <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>

                {/* Status banner */}
                <div
                    className="rounded-2xl flex items-start gap-4 mb-8"
                    style={{
                        padding: '24px 28px',
                        background: allClear
                            ? 'linear-gradient(135deg, rgba(34,197,94,0.13), rgba(245,158,11,0.04))'
                            : 'linear-gradient(135deg, rgba(239,68,68,0.13), rgba(245,158,11,0.07))',
                        border: `1px solid ${allClear ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.28)'}`,
                    }}
                >
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: allClear ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)' }}
                    >
                        <Building2 size={18} style={{ color: allClear ? '#4ade80' : '#fca5a5' }} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: allClear ? '#4ade80' : '#fca5a5' }}>
                                {allClear ? 'Fully Compliant' : 'Gaps Identified'}
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: '#86efac' }}>
                                {result.passCount} Pass
                            </span>
                            {result.failCount > 0 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                                    {result.failCount} Fail
                                </span>
                            )}
                        </div>
                        <div className="text-base font-bold text-white mb-1">{result.summary}</div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            Review each check below. Red cards require immediate action; green cards are compliant; amber cards require disclosures.
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
                        Compliance Assessment
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
                    style={{ padding: '13px 28px', background: AMBER_GRAD, color: '#fff' }}
                >
                    <RotateCcw size={13} /> Check Another Board
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
                    borderLeft: '4px solid rgba(245,158,11,0.8)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: '#fbbf24' }}>
                    Interactive Training
                </div>
                <h2 className="text-base font-bold text-white mb-1">
                    Does your board composition meet the statutory requirements?
                </h2>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Enter your board and committee details. The tool checks compliance against the Companies Act, 2013
                    (Sections 149, 177, 178) and SEBI LODR Regulations — producing a pass/fail assessment for each requirement.
                </p>
            </div>

            {/* Step progress */}
            <StepProgress
                step={step}
                total={STEPS.length}
                label={STEPS[step - 1]?.label ?? ''}
                gradient={AMBER_PROG}
            />

            {/* Step dots */}
            <div className="flex items-center gap-2 mb-8">
                {STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 flex-1">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                                style={{
                                    background: step > s.id ? AMBER_GRAD : step === s.id ? 'rgba(245,158,11,0.12)' : 'var(--glass-bg)',
                                    border: `1.5px solid ${step === s.id ? 'rgba(245,158,11,0.6)' : step > s.id ? 'transparent' : 'var(--border-glass)'}`,
                                    color: step > s.id ? '#fff' : step === s.id ? '#fbbf24' : 'var(--text-muted)',
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
                                style={{ background: step > s.id + 1 ? AMBER_PROG : 'var(--border-glass)' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className="mb-7">
                {/* Step 1 — Company Profile */}
                {step === 1 && (
                    <div>
                        <SectionHeading
                            title="Tell us about the company"
                            sub="Company type, listing status, and capital determine which requirements apply."
                        />
                        <div className="space-y-10">
                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Is the company listed on NSE or BSE?</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — listed company" value={true} current={data.isListed} onClick={() => set('isListed', true)} />
                                    <BoolCard label="No — unlisted" value={false} current={data.isListed} onClick={() => set('isListed', false)} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Company type</div>
                                <div className="flex flex-col" style={{ gap: 8 }}>
                                    <RadioCard label="Public Limited Company" selected={data.companyType === 'public_limited'} onClick={() => set('companyType', 'public_limited')} />
                                    <RadioCard label="Private Limited Company" selected={data.companyType === 'private_limited'} onClick={() => set('companyType', 'private_limited')} />
                                    <RadioCard label="Small Company" sub="Paid-up capital ≤ ₹4 crore and turnover ≤ ₹40 crore" selected={data.companyType === 'small_company'} onClick={() => set('companyType', 'small_company')} />
                                    <RadioCard label="One Person Company (OPC)" selected={data.companyType === 'opc'} onClick={() => set('companyType', 'opc')} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Paid-up share capital</div>
                                <div className="flex flex-col" style={{ gap: 8 }}>
                                    <RadioCard label="Less than ₹1 crore" selected={data.paidUpCapital === 'under_1cr'} onClick={() => set('paidUpCapital', 'under_1cr')} />
                                    <RadioCard label="₹1 crore to ₹10 crore" selected={data.paidUpCapital === '1cr_to_10cr'} onClick={() => set('paidUpCapital', '1cr_to_10cr')} />
                                    <RadioCard label="₹10 crore to ₹100 crore" selected={data.paidUpCapital === '10cr_to_100cr'} onClick={() => set('paidUpCapital', '10cr_to_100cr')} />
                                    <RadioCard label="More than ₹100 crore" selected={data.paidUpCapital === 'over_100cr'} onClick={() => set('paidUpCapital', 'over_100cr')} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Does the company have an Executive Chairman?</div>
                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>An Executive Chairman is a Chairman who is also a Whole-Time Director or MD. This triggers a 50% non-executive board requirement for listed companies.</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — Executive Chairman" value={true} current={data.hasExecutiveChairman} onClick={() => set('hasExecutiveChairman', true)} />
                                    <BoolCard label="No — Non-Executive Chairman" value={false} current={data.hasExecutiveChairman} onClick={() => set('hasExecutiveChairman', false)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2 — Board Composition */}
                {step === 2 && (
                    <div>
                        <SectionHeading
                            title="Current board composition"
                            sub="Enter the exact current numbers as of today. Include all directors, regardless of category."
                        />
                        <div className="grid grid-cols-2 gap-8">
                            <NumberInput label="Total directors on board" hint="Include all categories." value={data.totalDirectors} onChange={v => set('totalDirectors', v)} max={30} />
                            <NumberInput label="Independent Directors (IDs)" hint="Directors meeting Section 149(6) criteria." value={data.independentDirectors} onChange={v => set('independentDirectors', v)} max={30} />
                            <NumberInput label="Woman Directors" hint="Any gender-diverse directors." value={data.womenDirectors} onChange={v => set('womenDirectors', v)} max={15} />
                            <NumberInput label="Non-Executive Directors" hint="Non-executive (including IDs)." value={data.nonExecutiveDirectors} onChange={v => set('nonExecutiveDirectors', v)} max={30} />
                        </div>
                    </div>
                )}

                {/* Step 3 — Committees */}
                {step === 3 && (
                    <div>
                        <SectionHeading
                            title="Statutory committees"
                            sub="Committee constitution is mandatory for listed and large public companies."
                        />
                        <div className="space-y-10">
                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Has an Audit Committee been constituted?</div>
                                <div className="flex gap-3 mb-5">
                                    <BoolCard label="Yes" value={true} current={data.hasAuditCommittee} onClick={() => set('hasAuditCommittee', true)} />
                                    <BoolCard label="No" value={false} current={data.hasAuditCommittee} onClick={() => set('hasAuditCommittee', false)} />
                                </div>
                                {data.hasAuditCommittee === true && (
                                    <div className="grid grid-cols-2 gap-6 mt-4">
                                        <NumberInput label="Audit Committee members" value={data.auditCommitteeSize} onChange={v => set('auditCommitteeSize', v)} max={15} />
                                        <NumberInput label="Independent Directors on AC" value={data.auditCommitteeIndependents} onChange={v => set('auditCommitteeIndependents', v)} max={10} />
                                        <div className="col-span-2">
                                            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Who chairs the Audit Committee?</div>
                                            <div className="flex flex-col" style={{ gap: 8 }}>
                                                <RadioCard label="Independent Director" selected={data.auditCommitteeChair === 'independent_director'} onClick={() => set('auditCommitteeChair', 'independent_director')} />
                                                <RadioCard label="Non-executive (but not an ID)" selected={data.auditCommitteeChair === 'non_executive'} onClick={() => set('auditCommitteeChair', 'non_executive')} />
                                                <RadioCard label="Executive / Whole-Time Director" selected={data.auditCommitteeChair === 'executive'} onClick={() => set('auditCommitteeChair', 'executive')} />
                                                <RadioCard label="Unknown / not yet decided" selected={data.auditCommitteeChair === 'unknown'} onClick={() => set('auditCommitteeChair', 'unknown')} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Has a Nomination & Remuneration Committee (NRC) been constituted?</div>
                                <div className="flex gap-3 mb-5">
                                    <BoolCard label="Yes" value={true} current={data.hasNRC} onClick={() => set('hasNRC', true)} />
                                    <BoolCard label="No" value={false} current={data.hasNRC} onClick={() => set('hasNRC', false)} />
                                </div>
                                {data.hasNRC === true && (
                                    <div className="grid grid-cols-2 gap-6 mt-4">
                                        <NumberInput label="NRC members" value={data.nrcSize} onChange={v => set('nrcSize', v)} max={10} />
                                        <NumberInput label="Independent Directors on NRC" value={data.nrcIndependents} onChange={v => set('nrcIndependents', v)} max={10} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4 — History */}
                {step === 4 && (
                    <div>
                        <SectionHeading
                            title="Director qualification and tenure"
                            sub="Disqualified directors and over-tenure IDs invalidate board composition."
                        />
                        <div className="space-y-10">
                            <div>
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-light)' }}>Is any director currently disqualified under Section 164?</div>
                                <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Common grounds: convicted offences, company failing to file returns for 3 consecutive years, failure to repay deposits or debentures.</div>
                                <div className="flex gap-3">
                                    <BoolCard label="Yes — disqualified director present" value={true} current={data.anyDirectorDisqualified} onClick={() => set('anyDirectorDisqualified', true)} />
                                    <BoolCard label="No — all directors qualified" value={false} current={data.anyDirectorDisqualified} onClick={() => set('anyDirectorDisqualified', false)} />
                                </div>
                            </div>

                            <div className="h-px" style={{ background: 'var(--border-glass)' }} />

                            <div>
                                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-light)' }}>Independent Director tenure status</div>
                                <div className="flex flex-col" style={{ gap: 8 }}>
                                    <RadioCard label="All IDs are in their first 5-year term" selected={data.idTenure === 'within_5_years'} onClick={() => set('idTenure', 'within_5_years')} />
                                    <RadioCard label="One or more IDs are in their second 5-year term" sub="Second consecutive term — permissible but plan for succession" selected={data.idTenure === 'second_term_within_5_years'} onClick={() => set('idTenure', 'second_term_within_5_years')} />
                                    <RadioCard label="One or more IDs have served more than 10 years in total" sub="Exceeds maximum permitted tenure — non-compliant" selected={data.idTenure === 'exceeds_10_years'} onClick={() => set('idTenure', 'exceeds_10_years')} />
                                    <RadioCard label="Unknown / not yet reviewed" selected={data.idTenure === 'unknown'} onClick={() => set('idTenure', 'unknown')} />
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
                    {step === 4 ? 'Run Compliance Check' : 'Continue'} <ChevronRight size={14} />
                </button>
            </div>
        </div>
    )
}
