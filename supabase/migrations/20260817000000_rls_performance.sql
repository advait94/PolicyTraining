-- RLS performance: make policy helper functions STABLE and hoist auth.uid().
--
-- Two related problems, both of which get worse as row counts grow:
--
-- 1. SQL functions default to VOLATILE. A VOLATILE function in a policy predicate
--    cannot be inlined by the planner and is re-executed for EVERY row scanned.
--    All four helpers below gate high-traffic tables (users, organization_members,
--    organizations, invitations), so every query paid this cost per row.
--
-- 2. A bare auth.uid() in a policy is re-evaluated per row for the same reason.
--    Wrapping it as (select auth.uid()) turns it into an InitPlan that Postgres
--    evaluates once per query.
--
-- These are pure performance changes — the access rules are byte-for-byte identical.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Helper functions → STABLE (and hoist auth.uid() inside them)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE user_id = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_org_ids()
RETURNS TABLE (organization_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT om.organization_id
  FROM public.organization_members om
  WHERE om.user_id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.get_auth_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.users WHERE id = (SELECT auth.uid());
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Policies → hoist bare auth.uid() into a scalar subquery
-- ─────────────────────────────────────────────────────────────────────────────

-- public.users — gates nearly every query in the app
DROP POLICY IF EXISTS "Users can view members of their organization" ON public.users;
CREATE POLICY "Users can view members of their organization" ON public.users
    FOR SELECT USING (
        id = (SELECT auth.uid()) OR
        organization_id IN (SELECT get_my_org_ids())
    );

-- public.user_progress — read on every dashboard and module page
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (
        user_id = (SELECT auth.uid())
    );

DROP POLICY IF EXISTS "Admins can view org progress" ON public.user_progress;
CREATE POLICY "Admins can view org progress" ON public.user_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            JOIN public.users u ON u.id = user_progress.user_id
            WHERE om.organization_id = u.organization_id
              AND om.user_id = (SELECT auth.uid())
              AND om.role = 'admin'
        )
    );

-- public.section_progress — written on every slide advance
DROP POLICY IF EXISTS "Users can manage own section progress" ON public.section_progress;
CREATE POLICY "Users can manage own section progress"
    ON public.section_progress FOR ALL
    USING  ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Supporting indexes for the predicates above
-- ─────────────────────────────────────────────────────────────────────────────

-- get_my_org_ids() and the org-progress policy both filter organization_members
-- by user_id alone. The table has UNIQUE(organization_id, user_id), which only
-- serves lookups leading with organization_id — user_id alone was unindexed.
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id
    ON public.organization_members(user_id);

-- Deliberately NOT added here, because an existing constraint already covers them:
--   super_admins.user_id           → PRIMARY KEY
--   organization_members(org,user) → UNIQUE(organization_id, user_id)
--   departments(org, name)         → UNIQUE(organization_id, name)
