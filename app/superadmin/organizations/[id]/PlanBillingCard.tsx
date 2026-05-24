'use client'

import { useState } from 'react'
import { CreditCard, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react'
import { updateOrgPlan } from '@/app/superadmin/actions'

const TIERS = [
    { value: 'essentials', label: 'Essentials' },
    { value: 'business', label: 'Business' },
    { value: 'professional', label: 'Professional' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'enterprise', label: 'Enterprise' },
] as const

type Tier = typeof TIERS[number]['value']

interface Props {
    orgId: string
    initialTier: Tier | null
    initialExpiresAt: string | null
    initialStartedAt: string | null
}

function expiryStatus(expiresAt: string | null): 'active' | 'expired' | 'none' {
    if (!expiresAt) return 'none'
    return new Date(expiresAt) > new Date() ? 'active' : 'expired'
}

function toDateInputValue(iso: string | null): string {
    if (!iso) return ''
    return iso.slice(0, 10)
}

function todayInputValue(): string {
    return new Date().toISOString().slice(0, 10)
}

export default function PlanBillingCard({ orgId, initialTier, initialExpiresAt, initialStartedAt }: Props) {
    const [tier, setTier] = useState<Tier | ''>(initialTier ?? '')
    const [expiresAt, setExpiresAt] = useState(toDateInputValue(initialExpiresAt))
    const [startedAt, setStartedAt] = useState(toDateInputValue(initialStartedAt) || todayInputValue())
    const [saving, setSaving] = useState(false)
    const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

    const status = expiryStatus(expiresAt ? new Date(expiresAt).toISOString() : null)

    async function handleSave() {
        setSaving(true)
        setResult(null)
        const res = await updateOrgPlan(
            orgId,
            tier || null,
            expiresAt ? new Date(expiresAt).toISOString() : null,
            startedAt ? new Date(startedAt).toISOString() : null,
        )
        setSaving(false)
        setResult(res.success
            ? { ok: true, msg: 'Plan updated.' }
            : { ok: false, msg: res.error ?? 'Failed to save.' })
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <div>
                    <h3 className="text-lg font-semibold text-white">Plan &amp; Billing</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Manage this organisation's subscription tier and expiry date.</p>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Plan tier */}
                <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Plan Tier</label>
                    <select
                        value={tier}
                        onChange={e => setTier(e.target.value as Tier | '')}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                    >
                        <option value="" className="bg-slate-900 text-slate-400">— No plan —</option>
                        {TIERS.map(t => (
                            <option key={t.value} value={t.value} className="bg-slate-900 text-white">{t.label}</option>
                        ))}
                    </select>
                </div>

                {/* Start date */}
                <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Plan Started At
                    </label>
                    <input
                        type="date"
                        value={startedAt}
                        onChange={e => setStartedAt(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
                    />
                </div>

                {/* Expiry date */}
                <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Plan Expires At
                    </label>
                    <input
                        type="date"
                        value={expiresAt}
                        onChange={e => setExpiresAt(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
                    />
                    {expiresAt && (
                        <div className="flex items-center gap-1.5 text-xs mt-0.5">
                            {status === 'active' && <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Active</span></>}
                            {status === 'expired' && <><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-400">Expired</span></>}
                        </div>
                    )}
                </div>

                {/* Save */}
                <div className="flex items-center gap-4 pt-1">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium text-white transition-colors"
                    >
                        {saving ? 'Saving…' : 'Save Plan'}
                    </button>
                    {result && (
                        <span className={`text-sm ${result.ok ? 'text-green-400' : 'text-red-400'}`}>
                            {result.msg}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
