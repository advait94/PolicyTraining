-- Safe link tokens for secure magic-link invite delivery
-- The email never contains the raw magic link; only a token ID is sent.
CREATE TABLE IF NOT EXISTS public.safe_link_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    magic_link TEXT NOT NULL,
    email TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Only accessible via service role (bypasses RLS)
ALTER TABLE public.safe_link_tokens ENABLE ROW LEVEL SECURITY;

-- No RLS policies — this table is only read/written by service-role key in API routes.
-- Regular users should never have direct access.

-- Unique constraint on email so a re-invite replaces the pending token
CREATE UNIQUE INDEX IF NOT EXISTS idx_safe_link_tokens_email ON public.safe_link_tokens(email);

-- Unique constraint on invitations.email so upsert onConflict works correctly
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_email_unique ON public.invitations(email);
