-- Fix hook crash when org has no plan_tier (NULL).
-- jsonb_set(target, path, NULL::jsonb) returns NULL, which cascades and wipes
-- the entire event — causing Supabase Auth to reject the hook output.
-- Guard all nullable fields with IS NOT NULL before calling jsonb_set.

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
        -- org_id and org_role are always non-null (FK + not-null column)
        event := jsonb_set(event, '{claims,app_metadata,org_id}',
                           to_jsonb(org_data.organization_id::text));
        event := jsonb_set(event, '{claims,app_metadata,org_role}',
                           to_jsonb(org_data.org_role));

        -- plan_tier and plan_expires_at may be NULL — skip jsonb_set if so
        -- because jsonb_set with a NULL new_value returns NULL for the entire result
        IF org_data.plan_tier IS NOT NULL THEN
            event := jsonb_set(event, '{claims,app_metadata,plan_tier}',
                               to_jsonb(org_data.plan_tier));
        END IF;
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
