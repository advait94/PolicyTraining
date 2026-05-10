-- Migration: Explanations, deadlines, manager role
BEGIN;

-- 1. Explanation column on questions
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation TEXT;

-- 2. Organization module deadlines (admin sets due date per module per org)
CREATE TABLE IF NOT EXISTS public.organization_module_deadlines (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    module_id       UUID NOT NULL REFERENCES public.modules(id)       ON DELETE CASCADE,
    due_date        DATE NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, module_id)
);

ALTER TABLE public.organization_module_deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org deadlines" ON public.organization_module_deadlines
    FOR SELECT USING (organization_id IN (SELECT get_my_org_ids()));

CREATE POLICY "Admins can manage org deadlines" ON public.organization_module_deadlines
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Superadmins can manage all deadlines" ON public.organization_module_deadlines
    FOR ALL USING (public.is_super_admin());

COMMIT;
