-- Exact "does this email already have an auth account?" lookup for the invite flow.
--
-- The invite path used to answer this with auth.admin.listUsers({page:1,perPage:1000}),
-- which is wrong two ways: it only ever reads the first 1000 accounts (so it starts
-- returning false negatives the moment a project passes 1000 users, mid-bulk-upload),
-- and it pulls 1000 user records per invite.
--
-- It also can't be answered from public.users: handle_new_user() only writes a profile
-- row when a pending invitation matches, so self-signup accounts exist in auth.users
-- with no public.users row at all. Those are exactly the accounts whose absence makes
-- createUser fail with a duplicate-email error.
--
-- SECURITY DEFINER because auth.users is not readable by API roles. Returns nothing
-- but id + email for addresses the caller already knows, so it can't be used to
-- enumerate the user table. Execute is granted to service_role only.
BEGIN;

CREATE OR REPLACE FUNCTION public.find_auth_users_by_emails(p_emails text[])
RETURNS TABLE (user_id uuid, user_email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT u.id, lower(u.email::text)
    FROM auth.users u
    WHERE u.email IS NOT NULL
      AND lower(u.email::text) = ANY (
          SELECT DISTINCT lower(btrim(e))
          FROM unnest(p_emails) AS e
          WHERE btrim(e) <> ''
      );
$$;

REVOKE ALL ON FUNCTION public.find_auth_users_by_emails(text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.find_auth_users_by_emails(text[]) FROM anon;
REVOKE ALL ON FUNCTION public.find_auth_users_by_emails(text[]) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.find_auth_users_by_emails(text[]) TO service_role;

COMMIT;
