'use server'

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client with Service Role Key
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function inviteUser(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const team = formData.get('team') as string

    if (!email || !fullName) {
        return { success: false, message: 'Email and Name are required' }
    }

    try {
        // 1. Generate Invite Link manually (instead of sending default email)
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
                data: {
                    full_name: fullName,
                    phone_number: phone,
                    team: team,
                    organization_id: 'org_default' // Default or dynamic
                }
            }
        })

        if (linkError) throw linkError

        const actionLink = linkData.properties.action_link

        // 2. Add to Invitations table with the link
        const { error: dbError } = await supabaseAdmin
            .from('invitations')
            .insert({
                email,
                display_name: fullName,
                role: 'user',
                invited_by: 'admin',
                action_link: actionLink
            })

        if (dbError) {
            console.error('DB Insert Error:', dbError)
            // Proceed regardless
        }

        return { success: true, message: `Invitation generated for ${email}` }
    } catch (error: any) {
        console.error('Invite Error:', error)
        return { success: false, message: error.message || 'Failed to invite user' }
    }
}

export async function getAdminStats() {
    try {
        // Fetch all user progress
        const { data: progressData, error: progressError } = await supabaseAdmin
            .from('user_progress')
            .select('*')

        if (progressError) throw progressError

        // Fetch total modules count
        const { data: modules, error: modulesError } = await supabaseAdmin
            .from('modules')
            .select('id, title')

        if (modulesError) throw modulesError

        const totalModules = modules.length

        // Process Stats
        // 1. Completion Rate per Module
        const moduleStats = modules.map(m => {
            const relevantProgress = progressData.filter(p => p.module_id === m.id)
            const completed = relevantProgress.filter(p => p.quiz_score >= 70 || p.is_completed).length
            const attempts = relevantProgress.length
            return {
                name: m.title,
                completed: completed,
                total: attempts // Or total users if known, currently just based on started progress
            }
        })

        // 2. Overall Pass/Fail (simplistic view based on progress entries)
        const passedCount = progressData.filter(p => p.quiz_score >= 70).length
        const failedCount = progressData.filter(p => p.quiz_score < 70).length

        return {
            moduleStats,
            passFailStats: [
                { name: 'Passed', value: passedCount },
                { name: 'Failed', value: failedCount }
            ]
        }
    } catch (error) {
        console.error('Stats Error:', error)
        return { moduleStats: [], passFailStats: [] }
    }
}
