import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Role-aware landing page.
//
// /dashboard is now the learner training hub for EVERY role — admins and
// superadmins take the same courses as everyone else, and every "Back to Hub"
// link inside a module, quiz or certificate points there. So the "where does
// this person start after signing in?" decision lives here instead, and login,
// magic links and OAuth callbacks all point at /home.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const [{ data: isSuperAdmin }, { data: profile }] = await Promise.all([
        supabase.rpc('is_super_admin'),
        supabase.from('users').select('role').eq('id', user.id).single(),
    ])

    if (isSuperAdmin) redirect('/superadmin')
    if (profile?.role === 'admin') redirect('/admin/dashboard')

    // Managers keep landing on the training hub — their team view is one click
    // away in the sidebar, same as before.
    redirect('/dashboard')
}
