import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Check if user is superadmin using the RPC function we created
    const { data: isSuperAdmin, error } = await supabase.rpc('is_super_admin')

    if (error || !isSuperAdmin) {
        console.error('Superadmin check failed:', error)
        redirect('/404') // Effectively hidden
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#0B0F19] text-white overflow-x-hidden">
            {/* Background Glows */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container flex h-16 items-center px-4">
                    <div className="flex items-center gap-2 font-bold text-xl text-white">
                        <span className="text-2xl">🛡️</span>
                        <span className="tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                            Superadmin<span className="text-white font-light">Control</span>
                        </span>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <div className="text-sm text-slate-400 hidden md:block">
                            <span>Logged in as </span>
                            <span className="text-white font-medium">{user.email}</span>
                        </div>
                        <div className="h-6 w-px bg-white/10 hidden md:block"></div>

                        <a
                            href="/admin/dashboard"
                            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors hidden md:block"
                        >
                            Switch to Admin View
                        </a>

                        <div className="h-6 w-px bg-white/10 hidden md:block"></div>
                        <LogoutButton />
                    </div>
                </div>
            </div>
            <main className="flex-1 container py-8 relative z-10">{children}</main>
        </div>
    )
}
