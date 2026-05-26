BEGIN;

-- Add per-department access control for the three new interactive simulators.
-- Default TRUE so all existing departments keep access; admins opt departments out.

ALTER TABLE public.departments
    ADD COLUMN IF NOT EXISTS posh_simulator_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.departments
    ADD COLUMN IF NOT EXISTS breach_simulator_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.departments
    ADD COLUMN IF NOT EXISTS board_checker_enabled BOOLEAN NOT NULL DEFAULT TRUE;

COMMIT;
