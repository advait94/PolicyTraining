import { createClient } from '@/lib/supabase/server'
import { type PlanTier, isPlanExpired } from '@/lib/plan-utils'

export type { PlanTier } from '@/lib/plan-utils'
export { TIER_RANK, TIER_LABELS, tierAtLeast, isPlanExpired } from '@/lib/plan-utils'

export async function getOrgPlan(orgId: string): Promise<{ tier: PlanTier; expired: boolean }> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('organizations')
        .select('plan_tier, plan_expires_at')
        .eq('id', orgId)
        .single()

    const tier = (data?.plan_tier as PlanTier) ?? 'essentials'
    const expired = isPlanExpired(data?.plan_expires_at)

    return { tier, expired }
}

export async function getPlanTier(orgId: string): Promise<PlanTier> {
    const { tier } = await getOrgPlan(orgId)
    return tier
}
