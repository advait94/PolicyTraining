export type PlanTier = 'essentials' | 'business' | 'professional' | 'corporate' | 'enterprise'

export const TIER_RANK: Record<PlanTier, number> = {
    essentials: 1,
    business: 2,
    professional: 3,
    corporate: 4,
    enterprise: 5,
}

export const TIER_LABELS: Record<PlanTier, string> = {
    essentials: 'Essentials',
    business: 'Business',
    professional: 'Professional',
    corporate: 'Corporate',
    enterprise: 'Enterprise',
}

export function tierAtLeast(current: PlanTier | null | undefined, required: PlanTier): boolean {
    if (!current) return false
    return (TIER_RANK[current] ?? 0) >= TIER_RANK[required]
}

export function isPlanExpired(expiresAt: string | null | undefined): boolean {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
}
