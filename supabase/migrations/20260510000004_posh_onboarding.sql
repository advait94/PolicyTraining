-- First-time admin onboarding flag
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS settings_completed BOOLEAN DEFAULT false;

-- POSH policy configuration (ICC details, address, effective date)
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS posh_details JSONB DEFAULT '{}';

-- Mark all existing orgs as already having completed settings
-- so this flow only triggers for newly created organizations going forward
UPDATE public.organizations SET settings_completed = true;
