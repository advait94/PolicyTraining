-- Rename tenants table to organizations
ALTER TABLE public.tenants RENAME TO organizations;

-- Rename tenant_id to organization_id in users table
ALTER TABLE public.users RENAME COLUMN tenant_id TO organization_id;

-- Update Foreign Key constraint name
ALTER TABLE public.users RENAME CONSTRAINT users_tenant_id_fkey TO users_organization_id_fkey;

-- Update RLS Function
DROP FUNCTION IF EXISTS get_current_tenant_id() CASCADE;

CREATE OR REPLACE FUNCTION get_auth_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Update RLS Policies

-- Modify Policies on 'organizations' (formerly tenants)
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.organizations;

CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT USING (id = get_auth_organization_id());

-- Modify Policies on 'users'
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Allow users to view their own profile AND other users in the same organization
CREATE POLICY "Users can view members of their organization" ON public.users
  FOR SELECT USING (
    organization_id = get_auth_organization_id() OR id = auth.uid()
  );
