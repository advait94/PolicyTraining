-- 1. Allow admins to update department_id for users in their org
CREATE POLICY "Admins can update department for org members" ON public.users
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Allow superadmins to update any user
CREATE POLICY "Superadmins can update all profiles" ON public.users
    FOR UPDATE USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- 2. Add all_employees flag to organization_modules
ALTER TABLE public.organization_modules
    ADD COLUMN IF NOT EXISTS all_employees BOOLEAN NOT NULL DEFAULT false;
