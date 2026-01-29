import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/shared/navbar'

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
        .select('display_name')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-transparent">
            <Navbar userDisplayName={profile?.display_name || user.email} />
            <main className="container mx-auto py-8 px-4">
                {children}
            </main>
        </div>
    )
}
