
-- Allow Organization Admins to update their own organization
-- This is required for the White-Labeling Settings page to work for non-superadmins.

CREATE POLICY "Admins can update their own organization" ON public.organizations
    FOR UPDATE USING (
        id = get_auth_organization_id()
    )
    WITH CHECK (
        id = get_auth_organization_id()
    );
