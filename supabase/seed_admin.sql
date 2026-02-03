-- Create a new Admin user in public.users linked to Auth
-- NOTE: We cannot easily INSERT into auth.users via SQL editor/migration safely without handling password hashing.
-- HOWEVER, for testing, we can:
-- 1. Use an existing user and promote them to admin.
-- OR
-- 2. Ask the user (agent) to sign up via UI, then manually promote to admin.
-- OR
-- 3. Just promote the existing 'Test Learner' (95449188-...) to admin for a moment? No, their display name is Test Learner.

-- Let's try to find an existing user email to know who to log in as.
-- I can't see emails in public.users (except checking 'Test Learner' joined with auth).
-- I'll use the 'invitations' table to "invite" an admin, but that requires email flow.

-- STRATEGY:
-- I will use the Browser Agent to SIGN UP a new user: "admin@demo.com" / "password123".
-- THEN, I will use SQL to UPDATE that user's role to 'admin' and organization_id to 'd580364f-8455-452b-9dad-bfaf1971fbed'.

-- NO ACTION in this file yet. I will drive the browser.
