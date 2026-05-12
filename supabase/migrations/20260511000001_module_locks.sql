BEGIN;

-- Tracks modules that a superadmin has locked for a specific org.
-- When locked, org admins cannot change the assignment state of that module.
CREATE TABLE IF NOT EXISTS public.organization_module_locks (
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    module_id       UUID NOT NULL REFERENCES public.modules(id)       ON DELETE CASCADE,
    locked_by       UUID NOT NULL REFERENCES auth.users(id),
    locked_at       TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (organization_id, module_id)
);

ALTER TABLE public.organization_module_locks ENABLE ROW LEVEL SECURITY;

-- Org members can read lock state so the UI can display it
CREATE POLICY "Members can view module locks" ON public.organization_module_locks
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

-- Only superadmins can create or remove locks
CREATE POLICY "Superadmins can manage module locks" ON public.organization_module_locks
    FOR ALL USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

COMMIT;
