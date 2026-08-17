'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type OrgDetails = {
    id: string
    display_name: string
    logo_url: string | null
    support_email: string | null
    helpline_number: string | null
    posh_ic_email: string | null
    theme_color?: string
    plan_tier: string | null
    plan_expires_at: string | null
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

    // Runs once per full page load, in the root layout — so it is on the critical
    // path of every route. It used to cost three sequential round trips
    // (getUser → users → organizations). Now:
    //   - getSession() reads the cached session locally instead of calling the
    //     Auth API. This value only picks the org to display; every query behind
    //     it is still enforced server-side by RLS.
    //   - the users → organizations hop is a single embedded select.
    //   - the result is cached in sessionStorage, so client-side navigations and
    //     reloads within a tab do not re-query at all.
    useEffect(() => {
        const CACHE_KEY = 'org-context'

        const fetchOrg = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                const userId = session?.user?.id
                if (!userId) {
                    sessionStorage.removeItem(CACHE_KEY)
                    setOrg(null)
                    setLoading(false)
                    return
                }

                // Stale-while-revalidate: paint from cache immediately, then refresh
                // in the background so an org settings change still lands this load.
                const cached = sessionStorage.getItem(CACHE_KEY)
                if (cached) {
                    try {
                        const parsed = JSON.parse(cached)
                        if (parsed.userId === userId) {
                            setOrg(parsed.org)
                            setLoading(false)
                        }
                    } catch { /* fall through to a fresh fetch */ }
                }

                const { data: userData } = await supabase
                    .from('users')
                    .select('organization_id, organizations(*)')
                    .eq('id', userId)
                    .single()

                const orgRaw = (userData as any)?.organizations
                const orgData = (Array.isArray(orgRaw) ? orgRaw[0] : orgRaw) ?? null

                setOrg(orgData)
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({ userId, org: orgData }))
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
