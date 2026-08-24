-- Match invitations to new auth accounts case-insensitively.
--
-- handle_new_user() looked its invitation up with `WHERE email = new.email`.
-- GoTrue lowercases the address it writes to auth.users, but invitations.email
-- kept whatever case the bulk-upload CSV contained. Any row typed with a capital
-- ("Pawar.praful@ishantechnologies.com") therefore missed its own invitation:
-- the account was created and the invite email went out, but no organization_id
-- was set, no organization_members row was written, and the invitation stayed
-- 'pending'. The person is invisible in the admin console — which is how a
-- 1934-row upload came back 6 people short with no failures reported.
--
-- Three defences, because fixing only one leaves the door open:
--   1. existing invitation emails are folded to lowercase (duplicates merged),
--   2. a BEFORE trigger keeps every future write lowercase,
--   3. the lookup itself compares lower() to lower().
BEGIN;

-- 1. Merge case-variant duplicates before the unique index sees them.
--    Keep the accepted row where one exists, otherwise the earliest.
DELETE FROM public.invitations a
USING public.invitations b
WHERE lower(a.email) = lower(b.email)
  AND a.id <> b.id
  AND (
        (b.status = 'accepted' AND a.status <> 'accepted')
     OR (b.status = a.status AND (b.created_at, b.id) < (a.created_at, a.id))
  );

UPDATE public.invitations
SET email = lower(email)
WHERE email <> lower(email);

-- 2. Normalise on the way in, so this cannot drift again from any caller.
CREATE OR REPLACE FUNCTION public.normalize_invitation_email()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email := lower(btrim(NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invitations_normalize_email ON public.invitations;
CREATE TRIGGER invitations_normalize_email
    BEFORE INSERT OR UPDATE OF email ON public.invitations
    FOR EACH ROW EXECUTE FUNCTION public.normalize_invitation_email();

-- The unique index stays on the bare column: the app upserts with
-- onConflict: 'email', which PostgREST can only infer from a plain-column index.
-- With every stored value lowercased it is now effectively case-insensitive.

-- 3. Case-insensitive lookup, with an index to match.
CREATE INDEX IF NOT EXISTS idx_invitations_email_lower
    ON public.invitations (lower(email));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
BEGIN
    SELECT * INTO invite_record
    FROM public.invitations
    WHERE lower(email) = lower(new.email)
      AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1;

    -- The profile row is written either way. A signup with no invitation is
    -- still a real account, and leaving it without a public.users row hides it
    -- from every query in the app rather than merely from an organization.
    INSERT INTO public.users (id, email, display_name, role, organization_id)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        COALESCE(invite_record.role, 'learner'),
        invite_record.organization_id
    )
    ON CONFLICT (id) DO UPDATE
    SET organization_id = COALESCE(EXCLUDED.organization_id, public.users.organization_id),
        role = EXCLUDED.role;

    IF invite_record.id IS NOT NULL THEN
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (invite_record.organization_id, new.id, invite_record.role)
        ON CONFLICT (organization_id, user_id) DO NOTHING;

        UPDATE public.invitations
        SET status = 'accepted'
        WHERE id = invite_record.id;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
