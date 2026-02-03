-- 1. Create organization_members table
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    UNIQUE(organization_id, user_id)
);

-- 2. Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
    token TEXT, -- For link based validation if needed
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);

-- 3. The "Handshake" Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
BEGIN
    -- Check for pending invitation
    SELECT * INTO invite_record
    FROM public.invitations
    WHERE email = new.email
      AND status = 'pending'
    LIMIT 1;

    IF FOUND THEN
        -- 1. Insert into public.users (Profile)
        -- We ensure the profile exists and link it to the organization
        INSERT INTO public.users (id, email, display_name, role, organization_id)
        VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'full_name', new.email),
            invite_record.role,
            invite_record.organization_id
        )
        ON CONFLICT (id) DO UPDATE
        SET organization_id = EXCLUDED.organization_id,
            role = EXCLUDED.role;

        -- 2. Insert into organization_members
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (invite_record.organization_id, new.id, invite_record.role)
        ON CONFLICT (organization_id, user_id) DO NOTHING;

        -- 3. Mark invitation as accepted
        UPDATE public.invitations
        SET status = 'accepted'
        WHERE id = invite_record.id;
    
    ELSE
        -- No invite found. User is created in auth.users but NOT in public.users or organization_members.
        -- They are effectively "homeless".
        NULL;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
-- Drop existing trigger if it exists to replace it logic
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS Policies

-- Helper function to check if user is admin of an org
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get user's org IDs
CREATE OR REPLACE FUNCTION public.get_my_org_ids()
RETURNS TABLE (organization_id UUID) AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;


-- Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policies for organization_members
CREATE POLICY "Users can view members of their organizations" ON public.organization_members
    FOR SELECT USING (
        organization_id IN (SELECT get_my_org_ids())
    );

-- Policies for invitations
-- Only admins can view/create invitations for their org
CREATE POLICY "Admins can view invitations for their org" ON public.invitations
    FOR SELECT USING (
        is_org_admin(organization_id)
    );

CREATE POLICY "Admins can create invitations for their org" ON public.invitations
    FOR INSERT WITH CHECK (
        is_org_admin(organization_id)
    );

CREATE POLICY "Admins can update invitations for their org" ON public.invitations
    FOR UPDATE USING (
        is_org_admin(organization_id)
    );

-- strict Policies for public.users (profiles)
-- Users can see themselves, and members of their same organizations
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view members of their organization" ON public.users;
CREATE POLICY "Users can view members of their organization" ON public.users
    FOR SELECT USING (
        id = auth.uid() OR
        organization_id IN (SELECT get_my_org_ids())
    );

-- strict Policies for user_progress (Quiz Results)
-- Users see their own. Admins see their org members'.
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Admins can view org progress" ON public.user_progress;

CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "Admins can view org progress" ON public.user_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            JOIN public.users u ON u.id = user_progress.user_id
            WHERE om.organization_id = u.organization_id -- Link admin's org to target user's org
              AND om.user_id = auth.uid()
              AND om.role = 'admin'
        )
    );
