-- Performance indexes to support scalable query patterns.
-- user_progress PK is (user_id, module_id) so that composite is already indexed.
-- These cover the remaining high-frequency filter patterns.

-- Partial index: fast lookup of completed records with their timestamps
CREATE INDEX IF NOT EXISTS idx_user_progress_completed_at
    ON user_progress(completed_at)
    WHERE is_completed = true;

-- Partial index: expiry queries (completed records older than 1 year)
-- Also benefits the getAdminStats expired certs query
CREATE INDEX IF NOT EXISTS idx_user_progress_is_completed
    ON user_progress(is_completed, completed_at);

-- section_progress: already has PK on (user_id, module_slug, section_num)
-- Add index for bulk-read queries scoped to a user+module
CREATE INDEX IF NOT EXISTS idx_section_progress_user_module
    ON section_progress(user_id, module_slug);

-- activity_log: paginated audit log queries filter by user + sort by created_at
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created
    ON activity_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_event_type
    ON activity_log(event_type);

-- users: org-scoped queries (organization_id is a FK, may lack index)
CREATE INDEX IF NOT EXISTS idx_users_organization_id
    ON users(organization_id);

-- Custom access token hook — embeds org/role/plan data into the JWT so middleware
-- can skip the organization_members + organizations DB queries on every page load.
-- IMPORTANT: After running this migration, go to Supabase Dashboard →
-- Authentication → Hooks → "Custom access token" and select this function.
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    org_data record;
BEGIN
    SELECT
        om.organization_id,
        om.role      AS org_role,
        o.plan_tier,
        o.plan_expires_at
    INTO org_data
    FROM organization_members om
    JOIN organizations o ON o.id = om.organization_id
    WHERE om.user_id = (event->>'user_id')::uuid
    LIMIT 1;

    IF org_data IS NOT NULL THEN
        event := jsonb_set(event, '{claims,app_metadata,org_id}',      to_jsonb(org_data.organization_id::text));
        event := jsonb_set(event, '{claims,app_metadata,org_role}',    to_jsonb(org_data.org_role));
        event := jsonb_set(event, '{claims,app_metadata,plan_tier}',   to_jsonb(org_data.plan_tier));
        IF org_data.plan_expires_at IS NOT NULL THEN
            event := jsonb_set(event, '{claims,app_metadata,plan_expires_at}',
                               to_jsonb(org_data.plan_expires_at::text));
        END IF;
    END IF;

    RETURN event;
END;
$$;

-- Allow the Supabase Auth service to call this function
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
