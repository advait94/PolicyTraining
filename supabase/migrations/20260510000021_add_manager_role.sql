-- Migration: Add 'manager' to the users role check constraint
BEGIN;

ALTER TABLE public.users
    DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('admin', 'learner', 'manager'));

COMMIT;
