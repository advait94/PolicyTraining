import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/shared/navbar'
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar'
import { WelcomeGuideModal } from '@/components/feature/onboarding/welcome-guide-modal'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch full user profile for display name and guide flag. The superadmin check
    // rides along so privileged users can jump back to their console from the
    // training hub without going through the admin dashboard first.
    const [{ data: profile }, { data: isSuperAdmin }] = await Promise.all([
        supabase
            .from('users')
            .select('display_name, role, has_seen_guide')
            .eq('id', user.id)
            .single(),
        supabase.rpc('is_super_admin'),
    ])

    return (
        <div className="min-h-screen bg-transparent flex">
            <DashboardSidebar role={profile?.role} isSuperAdmin={!!isSuperAdmin} />
            <div className="flex-1 flex flex-col" style={{ marginLeft: 220 }}>
                <Navbar userDisplayName={profile?.display_name || user.email} />
                <main className="flex-1 container mx-auto py-8 px-4">
                    {children}
                </main>
            </div>
            <WelcomeGuideModal
                role={profile?.role ?? 'learner'}
                hasSeenGuide={profile?.has_seen_guide ?? false}
            />
        </div>
    )
}
