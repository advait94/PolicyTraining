import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/shared/navbar'
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar'

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

    // Fetch full user profile for display name
    const { data: profile } = await supabase
        .from('users')
        .select('display_name, role')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-transparent flex">
            <DashboardSidebar role={profile?.role} />
            <div className="flex-1 flex flex-col" style={{ marginLeft: 220 }}>
                <Navbar userDisplayName={profile?.display_name || user.email} />
                <main className="flex-1 container mx-auto py-8 px-4">
                    {children}
                </main>
            </div>
        </div>
    )
}
