-- Add plan tier, expiry, and start date to organizations
-- plan_tier uses customer-facing names: essentials / business / professional / corporate / enterprise

ALTER TABLE public.organizations
    ADD COLUMN IF NOT EXISTS plan_tier TEXT
        CHECK (plan_tier IN ('essentials', 'business', 'professional', 'corporate', 'enterprise')),
    ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;
