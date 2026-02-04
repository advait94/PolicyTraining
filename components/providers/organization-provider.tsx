'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

type OrgDetails = {
    id: string
    display_name: string
    logo_url: string | null
    support_email: string | null
    helpline_number: string | null
    posh_ic_email: string | null
    theme_color?: string
}

const OrganizationContext = createContext<{
    org: OrgDetails | null
    loading: boolean
}>({
    org: null,
    loading: true
})

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
    const [org, setOrg] = useState<OrgDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const pathname = usePathname()

    // We re-fetch when pathname changes significantly, or just once on mount
    // Ideally just once on mount for the session
    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    setOrg(null)
                    setLoading(false)
                    return
                }

                // Optimization: If we already have org and it matches user (not easily checked without extra call), skip
                // For now, simple fetch

                const { data: userData } = await supabase
                    .from('users')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single()

                if (!userData?.organization_id) {
                    setOrg(null)
                    return
                }

                const { data: orgData } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', userData.organization_id)
                    .single()

                setOrg(orgData)

            } catch (error) {
                console.error('Failed to load organization context', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrg()
    }, [])

    return (
        <OrganizationContext.Provider value={{ org, loading }}>
            {children}
        </OrganizationContext.Provider>
    )
}

export const useOrganization = () => useContext(OrganizationContext)
