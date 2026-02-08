import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
    try {
        // 1. Calculate the 'due soon' window (e.g. today + 3 days)
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        // 2. Query incomplete progress that is due before threeDaysFromNow and hasn't been nudged recently.
        // For simplicity, we just query based on due_date. 
        // We rely on due_date being set.
        const { data: records, error } = await supabase
            .from('user_progress')
            .select(`
            id,
            user_id,
            module_id,
            due_date,
            users (email, display_name)
        `)
            .eq('is_completed', false)
            .lt('due_date', threeDaysFromNow.toISOString())
            .gt('due_date', now.toISOString()); // Only future due dates? Or past due as well? "due in < 3 days" usually implies imminent.

        if (error) throw error;

        if (!records || records.length === 0) {
            return new Response(JSON.stringify({ message: "No nudges needed." }), { status: 200 });
        }

        console.log(`Found ${records.length} pending items.`);

        // 3. Send Emails
        const results = await Promise.all(
            records.map(async (record: any) => {
                const email = record.users?.email;
                if (!email) return null;

                // Prevent spamming? (In a real app, we'd check a 'last_nudged_at' column)
                // For now, we just send.

                const { data, error } = await resend.emails.send({
                    from: "Policy Training <support@aaplusconsultants.com>",
                    to: [email],
                    subject: "Action Required: Training Due Soon",
                    html: `
                    <h1>Training Reminder</h1>
                    <p>Hi ${record.users.display_name || 'there'},</p>
                    <p>You have incomplete training that is due soon (${new Date(record.due_date).toLocaleDateString()}).</p>
                    <p><a href="${Deno.env.get("APP_URL") || 'http://localhost:3000'}">Login to complete</a></p>
                `
                });
                return { id: record.id, email, data, error };
            })
        );

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
