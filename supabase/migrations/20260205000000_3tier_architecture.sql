-- 1. Create super_admins table
CREATE TABLE IF NOT EXISTS public.super_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Enable RLS on super_admins (Strict security)
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Only super_admins or database owners can see this table
-- (Actually, for now, let's allow read access to self so we can check our own status)
CREATE POLICY "Users can check if they are superadmin" ON public.super_admins
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- 2. Helper Function for Superadmin Check
-- This function will be used in RLS policies to grant global access
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Update RLS Policies

-- A. Organizations (Global Access for Superadmin)
-- Current Policy: "Users can view their own organization"
-- We will ADD a new policy for Superadmins to avoid complexity in the existing one
CREATE POLICY "Superadmins can view all organizations" ON public.organizations
    FOR SELECT USING (
        is_super_admin()
    );

CREATE POLICY "Superadmins can insert organizations" ON public.organizations
    FOR INSERT WITH CHECK (
        is_super_admin()
    );

CREATE POLICY "Superadmins can update organizations" ON public.organizations
    FOR UPDATE USING (
        is_super_admin()
    );

-- B. Users (Global Profile Access for Superadmin)
-- Current Policy: "Users can view members of their organization"
-- We ADD a superadmin policy
CREATE POLICY "Superadmins can view all profiles" ON public.users
    FOR SELECT USING (
        is_super_admin()
    );

-- C. User Progress (Global Results Access for Superadmin)
-- Current Policies: "Users can view own progress", "Admins can view org progress"
CREATE POLICY "Superadmins can view all progress" ON public.user_progress
    FOR SELECT USING (
        is_super_admin()
    );

-- D. Organization Members (Global View)
CREATE POLICY "Superadmins can view all org members" ON public.organization_members
    FOR SELECT USING (
        is_super_admin()
    );

-- E. Invitations (Global View if needed, but primarily managing Orgs)
CREATE POLICY "Superadmins can view all invitations" ON public.invitations
    FOR SELECT USING (
        is_super_admin()
    );

-- 4. Initial Seed (Optional - User must do this manually or we can seed if ID is known)
-- INSERT INTO public.super_admins (user_id) VALUES ('your-user-id');
