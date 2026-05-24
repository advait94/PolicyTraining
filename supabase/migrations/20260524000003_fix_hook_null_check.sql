-- Fix the null check in custom_access_token_hook.
-- PostgreSQL's composite IS NOT NULL requires ALL fields to be non-null.
-- When plan_expires_at is NULL, the record fails IS NOT NULL even if other
-- fields are populated. Replacing with the FOUND special variable fixes this.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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
    FROM public.organization_members om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.user_id = (event->>'user_id')::uuid
    LIMIT 1;

    IF FOUND THEN
        event := jsonb_set(event, '{claims,app_metadata,org_id}',
                           to_jsonb(org_data.organization_id::text));
        event := jsonb_set(event, '{claims,app_metadata,org_role}',
                           to_jsonb(org_data.org_role));
        event := jsonb_set(event, '{claims,app_metadata,plan_tier}',
                           to_jsonb(org_data.plan_tier));
        IF org_data.plan_expires_at IS NOT NULL THEN
            event := jsonb_set(event, '{claims,app_metadata,plan_expires_at}',
                               to_jsonb(org_data.plan_expires_at::text));
        END IF;
    END IF;

    RETURN event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
