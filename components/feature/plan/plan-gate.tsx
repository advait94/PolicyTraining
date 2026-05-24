'use client'

import { Lock, ArrowUpCircle } from 'lucide-react'
import { useOrganization } from '@/components/providers/organization-provider'
import { TIER_RANK, TIER_LABELS, isPlanExpired, type PlanTier } from '@/lib/plan-utils'

interface Props {
    required: PlanTier
    children: React.ReactNode
    /** Pass local planTier state to skip reading from context (avoids loading flicker in large pages) */
    tierOverride?: PlanTier
    /** Pass local expired state to skip reading from context */
    expiredOverride?: boolean
}

export function PlanGate({ required, children, tierOverride, expiredOverride }: Props) {
    const { org, loading } = useOrganization()

    const tier = tierOverride ?? ((org?.plan_tier as PlanTier) ?? 'essentials')
    const expired = expiredOverride ?? isPlanExpired(org?.plan_expires_at)

    // While context is loading and no overrides provided, show nothing to avoid flash
    if (!tierOverride && !expiredOverride && loading) return null

    if (expired) {
        return (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-white font-semibold">Plan Expired</h3>
                <p className="text-slate-400 text-sm">
                    Your plan has expired. This feature is unavailable until you renew.
                </p>
                <p className="text-slate-500 text-xs">
                    Contact{' '}
                    <a href="mailto:praveen@aaplusconsultants.com" className="text-red-400 underline hover:text-red-300">
                        praveen@aaplusconsultants.com
                    </a>{' '}
                    to renew your plan.
                </p>
            </div>
        )
    }

    if ((TIER_RANK[tier] ?? 0) < TIER_RANK[required]) {
        return (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
                    <ArrowUpCircle className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-white font-semibold">Upgrade your plan</h3>
                <p className="text-slate-400 text-sm">
                    This feature requires the{' '}
                    <span className="text-amber-300 font-medium">{TIER_LABELS[required]}</span> plan or higher.
                    You&apos;re currently on the{' '}
                    <span className="text-slate-300 font-medium">{TIER_LABELS[tier]}</span> plan.
                </p>
                <p className="text-slate-500 text-xs">
                    Contact{' '}
                    <a href="mailto:praveen@aaplusconsultants.com" className="text-amber-400 underline hover:text-amber-300">
                        praveen@aaplusconsultants.com
                    </a>{' '}
                    to upgrade.
                </p>
            </div>
        )
    }

    return <>{children}</>
}
