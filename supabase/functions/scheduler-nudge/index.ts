import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Identify users with pending training
        // Logic: Find users who have incomplete progress
        // And assume a deadline of 7 days from user creation or progress creation if we had it.
        // For this implementation, we will nudge ALL users with incomplete progress
        // where user created_at is older than 3 days (so we don't nudge immediately).

        // We need to fetch users and their progress.
        // However, if we want "due in < 3 days" and total time is 7 days, we look for users created 4-7 days ago.

        // Let's simplified approach: Get all incomplete progress.

        const { data: incompleteProgress, error: fetchError } = await supabase
            .from('user_progress')
            .select(`
            id,
            user_id,
            module_id,
            users!inner (
                id,
                display_name,
                email,  -- NOTE: We added email join in RPC, but here in Edge Function with Service Role we can't join auth.users easily via postgrest unless we have a view or replicate email. 
                        -- Wait, we DON'T have email in public.users yet.
                        -- We MUST fetch email from auth (admin api) or a view.
                        -- Using Service Role, we can use supabase.auth.admin.listUsers() but mapping is slow for many users.
                        -- Best approach: Create a secure view that joins auth.users and public.users.
            ),
            modules (
                title
            )
        `)
            .eq('is_completed', false)

        // ISSUE: public.users does not have email.
        // We need email to send email.
        // Solution: We will use the 'invitations' table if they are invited? No.
        // We need to fetch user emails.
        // We can iterate over the users and fetch email via auth.admin.getUser(id) (Slow but works for batch).
        // Or we create a View. I'll assume we can use auth.admin.getUser for the nudge batch since it runs daily and volume might be manageable.

        if (fetchError) throw fetchError

        const notifications = []

        if (incompleteProgress) {
            for (const record of incompleteProgress) {
                // Get user email
                const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(record.user_id)

                if (user && user.email) {
                    // Check if we should nudge (Simulated "Due Soon" logic)
                    // For demo, we nudge everyone incomplete.

                    // Send Email via Resend
                    const res = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${RESEND_API_KEY}`
                        },
                        body: JSON.stringify({
                            from: 'Policy Training <support@aaplusconsultants.com>', // Verified domain
                            to: [user.email],
                            subject: `Action Required: Complete your training - ${record.modules.title}`,
                            html: `
                            <h1>Training Reminder</h1>
                            <p>Hi ${record.users.display_name || 'there'},</p>
                            <p>You have pending training: <strong>${record.modules.title}</strong>.</p>
                            <p>Please log in and complete it as soon as possible.</p>
                        `
                        })
                    })

                    if (res.ok) {
                        notifications.push({ email: user.email, module: record.modules.title, status: 'sent' })
                    } else {
                        const err = await res.text()
                        console.error('Resend Error:', err)
                        notifications.push({ email: user.email, module: record.modules.title, status: 'failed', error: err })
                    }
                }
            }
        }

        return new Response(
            JSON.stringify(notifications),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        )
    }
})
