-- Departments & Department-Level Module Assignments

-- 1. Departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    UNIQUE(organization_id, name)
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org departments" ON public.departments
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage their org departments" ON public.departments
    FOR ALL USING (public.is_org_admin(organization_id))
    WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Superadmins can manage all departments" ON public.departments
    FOR ALL USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- 2. Department-module assignments
CREATE TABLE IF NOT EXISTS public.department_module_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    UNIQUE(department_id, module_id)
);

ALTER TABLE public.department_module_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view dept module assignments" ON public.department_module_assignments
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage dept module assignments" ON public.department_module_assignments
    FOR ALL USING (public.is_org_admin(organization_id))
    WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Superadmins can manage all dept module assignments" ON public.department_module_assignments
    FOR ALL USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- 3. Add department_id to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
