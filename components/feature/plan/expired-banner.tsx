'use client'

import { useOrganization } from '@/components/providers/organization-provider'
import { isPlanExpired } from '@/lib/plan-utils'

export function ExpiredBanner() {
    const { org } = useOrganization()

    if (!org || !isPlanExpired(org.plan_expires_at)) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white py-2.5 px-4 text-center text-sm font-medium shadow-lg">
            Your plan has expired — contact{' '}
            <a
                href="mailto:praveen@aaplusconsultants.com"
                className="underline hover:text-red-100"
            >
                praveen@aaplusconsultants.com
            </a>{' '}
            to renew.
        </div>
    )
}
