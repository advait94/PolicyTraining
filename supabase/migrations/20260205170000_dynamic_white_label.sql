-- Add Dynamic White-Labeling columns to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT 'AA Plus Consultants',
ADD COLUMN IF NOT EXISTS support_email TEXT,
ADD COLUMN IF NOT EXISTS helpline_number TEXT,
ADD COLUMN IF NOT EXISTS posh_ic_email TEXT;

-- Note: Existing RLS policies for 'organizations' table should already allow Admins to UPDATE their own row.
-- No new policies needed unless we want to restrict specific columns, which we don't.
