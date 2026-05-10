import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const APP_URL = Deno.env.get("APP_URL") || "https://policytraining.aaplusconsultants.com";

serve(async () => {
    try {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // 1. Get all org-level deadlines due within 7 days (or already past)
        const { data: deadlines, error: dlError } = await supabase
            .from("organization_module_deadlines")
            .select("organization_id, module_id, due_date, modules(title)")
            .lte("due_date", sevenDaysFromNow.toISOString().split("T")[0]);

        if (dlError) throw dlError;
        if (!deadlines || deadlines.length === 0) {
            return new Response(JSON.stringify({ message: "No upcoming deadlines." }), { status: 200 });
        }

        let nudgeCount = 0;

        for (const deadline of deadlines) {
            const dueDate = new Date(deadline.due_date);
            const isOverdue = dueDate < now;
            const moduleTitle = (deadline.modules as any)?.title || "a training module";

            // 2. Find users in this org who haven't completed this module
            const { data: orgUsers } = await supabase
                .from("users")
                .select("id, email, display_name")
                .eq("organization_id", deadline.organization_id)
                .not("email", "is", null);

            if (!orgUsers || orgUsers.length === 0) continue;

            const userIds = orgUsers.map((u: any) => u.id);

            const { data: completedProgress } = await supabase
                .from("user_progress")
                .select("user_id")
                .eq("module_id", deadline.module_id)
                .in("user_id", userIds)
                .gte("quiz_score", 70);

            const completedUserIds = new Set((completedProgress || []).map((p: any) => p.user_id));
            const pendingUsers = orgUsers.filter((u: any) => !completedUserIds.has(u.id));

            // 3. Send email to each pending user
            for (const user of pendingUsers) {
                if (!user.email) continue;
                const dueDateStr = dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

                await resend.emails.send({
                    from: "Policy Training <support@aaplusconsultants.com>",
                    to: [user.email],
                    subject: isOverdue
                        ? `Overdue: ${moduleTitle} — Action Required`
                        : `Reminder: ${moduleTitle} due ${dueDateStr}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
                            <h2 style="color: #1e293b;">Training ${isOverdue ? "Overdue" : "Due Soon"}</h2>
                            <p>Hi ${user.display_name || "there"},</p>
                            <p>This is a reminder that your training on <strong>${moduleTitle}</strong>
                            ${isOverdue
                                ? `was due on <strong>${dueDateStr}</strong> and has not been completed.`
                                : `is due on <strong>${dueDateStr}</strong>.`}
                            </p>
                            <a href="${APP_URL}/dashboard"
                               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                                Go to Training Hub
                            </a>
                            <p style="margin-top:24px;font-size:12px;color:#94a3b8;">
                                This is an automated reminder from the AA Plus Policy Training Platform.
                            </p>
                        </div>
                    `,
                });
                nudgeCount++;
            }
        }

        return new Response(JSON.stringify({ message: `Sent ${nudgeCount} nudge(s).` }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
