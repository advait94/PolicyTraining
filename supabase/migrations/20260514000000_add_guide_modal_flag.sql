-- Track whether a user has already been shown the welcome guide modal
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS has_seen_guide BOOLEAN DEFAULT false;
