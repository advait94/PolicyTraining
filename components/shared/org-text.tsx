'use client'

import { useOrganization } from '@/components/providers/organization-provider'

type OrgField = 'display_name' | 'support_email' | 'helpline_number' | 'posh_ic_email'

export function OrgText({ field, fallback }: { field: OrgField, fallback?: string }) {
    const { org, loading } = useOrganization()

    if (loading) return <span className="opacity-50 animate-pulse">...</span>

    const value = org?.[field]

    if (!value) {
        // Default Fallbacks if DB is empty
        if (fallback) return <span>{fallback}</span>

        switch (field) {
            case 'display_name': return <span>AA Plus Consultants</span>
            case 'support_email': return <span>support@aaplusconsultants.com</span>
            case 'helpline_number': return <span>+91-9876543210</span>
            case 'posh_ic_email': return <span>posh@aaplusconsultants.com</span>
            default: return <span>...</span>
        }
    }

    return <span>{value}</span>
}
