'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyWebhooks } from '@/lib/webhooks'
import { revalidatePath } from 'next/cache'

export async function saveModuleProgress(moduleId: string, score: number, passed: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const sanitizedScore = Math.min(100, Math.max(0, Math.round(Number(score) || 0)))
    const sanitizedPassed = sanitizedScore >= 80

    const { error } = await supabase
        .from('user_progress')
        .upsert({
            user_id: user.id,
            module_id: moduleId,
            quiz_score: sanitizedScore,
            is_completed: sanitizedPassed,
            completed_at: passed ? new Date().toISOString() : null,
        }, {
            onConflict: 'user_id, module_id',
        })

    if (error) {
        console.error('Error saving progress:', error)
        throw new Error('Failed to save progress')
    }

    // Log quiz_completed — fire-and-forget
    void Promise.resolve(supabase.from('activity_log').insert({
        user_id: user.id,
        module_id: moduleId,
        event_type: 'quiz_completed',
        metadata: { score: sanitizedScore, passed: sanitizedPassed },
    })).catch(() => {})

    // Fire webhook if passed
    if (sanitizedPassed) {
        const { data: userData } = await supabase
            .from('users')
            .select('organization_id, display_name')
            .eq('id', user.id)
            .single()

        const { data: moduleData } = await supabase
            .from('modules')
            .select('title')
            .eq('id', moduleId)
            .single()

        if (userData?.organization_id && moduleData?.title) {
            void notifyWebhooks(
                {
                    userName: userData.display_name || 'A team member',
                    moduleTitle: moduleData.title,
                    score: sanitizedScore,
                },
                userData.organization_id
            ).catch(err => console.error('Webhook error:', err))
        }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/modules/${moduleId}`)

    return { success: true }
}

export async function saveAttestation(moduleId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const now = new Date().toISOString()

    const { error } = await supabase
        .from('user_progress')
        .update({ attestation_accepted: true, attestation_at: now })
        .eq('user_id', user.id)
        .eq('module_id', moduleId)

    if (error) {
        console.error('Error saving attestation:', error)
        throw new Error('Failed to save attestation')
    }

    // Log attestation in audit trail — fire-and-forget
    void Promise.resolve(supabase.from('activity_log').insert({
        user_id: user.id,
        module_id: moduleId,
        event_type: 'attestation_signed',
        metadata: { signed_at: now },
    })).catch(() => {})

    return { success: true }
}
