-- Migration: Add 'manager' to the organization_members role check constraint.
--
-- handle_new_user() copies invitations.role straight into organization_members,
-- so inviting a manager tripped organization_members_role_check inside the
-- auth.users trigger and GoTrue reported "Database error creating new user".
-- 20260510000021 widened public.users only; this does the same for the
-- membership table. 'member' stays for rows created before 'learner' was used.
BEGIN;

ALTER TABLE public.organization_members
    DROP CONSTRAINT IF EXISTS organization_members_role_check;

ALTER TABLE public.organization_members
    ADD CONSTRAINT organization_members_role_check
    CHECK (role IN ('admin', 'member', 'learner', 'manager'));

COMMIT;
