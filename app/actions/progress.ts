'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveModuleProgress(moduleId: string, score: number, passed: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Save progress
    const { error } = await supabase
        .from('user_progress')
        .upsert({
            user_id: user.id,
            module_id: moduleId,
            quiz_score: score,
            is_completed: passed,
            completed_at: passed ? new Date().toISOString() : null
        }, {
            onConflict: 'user_id, module_id' // Requires unique constraint
        })

    if (error) {
        console.error('Error saving progress:', error)
        throw new Error('Failed to save progress')
    }

    revalidatePath('/dashboard')
    revalidatePath(`/modules/${moduleId}`)

    return { success: true }
}
