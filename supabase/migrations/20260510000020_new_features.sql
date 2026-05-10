-- Migration: Audit Trail, Attestation, Webhooks
BEGIN;

-- ── 1. Audit Trail ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_log (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    module_id   UUID        NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    slide_id    UUID        REFERENCES public.slides(id) ON DELETE SET NULL,
    event_type  TEXT        NOT NULL,  -- slide_viewed | quiz_started | quiz_completed | attestation_signed
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_module ON public.activity_log (user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at  ON public.activity_log (created_at DESC);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own events
CREATE POLICY "Users can insert own activity" ON public.activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can read activity for users in their org
CREATE POLICY "Admins can view org activity" ON public.activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users admin_u
            JOIN  public.users target_u ON target_u.id = activity_log.user_id
            WHERE admin_u.id = auth.uid()
              AND admin_u.role = 'admin'
              AND admin_u.organization_id = target_u.organization_id
        )
        OR public.is_super_admin()
    );

-- ── 2. Attestation columns on user_progress ───────────────────────────────────
ALTER TABLE public.user_progress
    ADD COLUMN IF NOT EXISTS attestation_accepted BOOLEAN   DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS attestation_at       TIMESTAMPTZ;

-- ── 3. Webhook URLs on organizations ─────────────────────────────────────────
ALTER TABLE public.organizations
    ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT,
    ADD COLUMN IF NOT EXISTS teams_webhook_url TEXT;

COMMIT;
