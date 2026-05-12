import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const APP_URL = Deno.env.get("APP_URL") || "https://policytraining.aaplusconsultants.com";

const EMAIL_FROM = "Policy Training <support@aaplusconsultants.com>";

function renderEmail(name: string, body: string): string {
    return `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <p>Hi ${name},</p>
            ${body}
            <a href="${APP_URL}/dashboard"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                Go to Training Hub
            </a>
            <p style="margin-top:24px;font-size:12px;color:#94a3b8;">
                This is an automated reminder from the AA Plus Policy Training Platform.
            </p>
        </div>
    `;
}

serve(async () => {
    try {
        const now = new Date();
        let nudgeCount = 0;

        // ── Part 1: Org-level deadline nudges (due within 7 days or overdue) ──────

        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const { data: deadlines, error: dlError } = await supabase
            .from("organization_module_deadlines")
            .select("organization_id, module_id, due_date, modules(title)")
            .lte("due_date", sevenDaysFromNow.toISOString().split("T")[0]);

        if (dlError) throw dlError;

        for (const deadline of (deadlines || [])) {
            const dueDate = new Date(deadline.due_date);
            const isOverdue = dueDate < now;
            const moduleTitle = (deadline.modules as any)?.title || "a training module";
            const dueDateStr = dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

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

            for (const user of orgUsers.filter((u: any) => !completedUserIds.has(u.id))) {
                if (!user.email) continue;
                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: [user.email],
                    subject: isOverdue
                        ? `Overdue: ${moduleTitle} — Action Required`
                        : `Reminder: ${moduleTitle} due ${dueDateStr}`,
                    html: renderEmail(
                        user.display_name || "there",
                        `<p>This is a reminder that your training on <strong>${moduleTitle}</strong>
                        ${isOverdue
                            ? `was due on <strong>${dueDateStr}</strong> and has not been completed.`
                            : `is due on <strong>${dueDateStr}</strong>.`}
                        </p>`
                    ),
                });
                nudgeCount++;
            }
        }

        // ── Part 2: Annual renewal reminders ─────────────────────────────────────
        // Send a 30-day warning when completed_at was 335 days ago (±1 day window).
        // Send an expiry notice when completed_at was 365 days ago (±1 day window).

        const windows = [
            {
                label: "expiring_soon",
                daysAgoMin: 335,
                daysAgoMax: 336,
                subject: (title: string) => `Your ${title} certification expires in 30 days`,
                bodyHtml: (title: string) =>
                    `<p>Your certification for <strong>${title}</strong> is valid for one year and will expire in <strong>30 days</strong>.</p>
                     <p>Please retake the assessment before it lapses to keep your compliance record current.</p>`,
            },
            {
                label: "expired",
                daysAgoMin: 365,
                daysAgoMax: 366,
                subject: (title: string) => `Action Required: Your ${title} certification has expired`,
                bodyHtml: (title: string) =>
                    `<p>Your certification for <strong>${title}</strong> expired today. Certifications are valid for one year.</p>
                     <p>Please retake the assessment to renew your certification and maintain compliance.</p>`,
            },
        ];

        for (const window of windows) {
            const minDate = new Date(now.getTime() - window.daysAgoMax * 24 * 60 * 60 * 1000).toISOString();
            const maxDate = new Date(now.getTime() - window.daysAgoMin * 24 * 60 * 60 * 1000).toISOString();

            const { data: renewalRows, error: renewalError } = await supabase
                .from("user_progress")
                .select("user_id, module_id, completed_at, modules(title), users(email, display_name)")
                .gte("quiz_score", 70)
                .gte("completed_at", minDate)
                .lte("completed_at", maxDate);

            if (renewalError) throw renewalError;

            for (const row of (renewalRows || [])) {
                const email = (row.users as any)?.email;
                const name = (row.users as any)?.display_name || "there";
                const moduleTitle = (row.modules as any)?.title || "your training module";

                if (!email) continue;

                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: [email],
                    subject: window.subject(moduleTitle),
                    html: renderEmail(name, window.bodyHtml(moduleTitle)),
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
