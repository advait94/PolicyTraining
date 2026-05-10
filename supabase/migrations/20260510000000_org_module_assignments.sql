-- Organization Module Assignments
-- Allows admins to control which training modules are visible to their org's learners.

CREATE TABLE IF NOT EXISTS public.organization_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(organization_id, module_id)
);

ALTER TABLE public.organization_modules ENABLE ROW LEVEL SECURITY;

-- Learners and admins can see which modules are assigned to their org
CREATE POLICY "Members can view their org module assignments" ON public.organization_modules
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

-- Org admins can assign and unassign modules for their org
CREATE POLICY "Admins can manage their org module assignments" ON public.organization_modules
    FOR ALL USING (
        public.is_org_admin(organization_id)
    ) WITH CHECK (
        public.is_org_admin(organization_id)
    );

-- Superadmins have full access
CREATE POLICY "Superadmins can manage all module assignments" ON public.organization_modules
    FOR ALL USING (
        public.is_super_admin()
    ) WITH CHECK (
        public.is_super_admin()
    );
