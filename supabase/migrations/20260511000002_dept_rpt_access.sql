BEGIN;

-- Add per-department RPT Simulator access control.
-- Defaults to true so all existing departments keep access; admins opt departments out.
ALTER TABLE public.departments
    ADD COLUMN IF NOT EXISTS rpt_simulator_enabled BOOLEAN NOT NULL DEFAULT TRUE;

COMMIT;
