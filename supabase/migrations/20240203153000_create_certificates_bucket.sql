-- Create Storage Bucket for Certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Certificates

-- Allow authenticated users to view certificates (Public bucket, but let's be specific if needed)
CREATE POLICY "Public Access to Certificates"
ON storage.objects FOR SELECT
USING ( bucket_id = 'certificates' );

-- Allow authenticated users (or Edge Function via Service Role) to upload certificates
-- For now, we'll allow authenticated users to upload their own certificate?
-- No, the Edge Function will likely generate and upload it.
-- The Edge Function receives the user's token, so it acts as the user?
-- OR the Edge Function uses the Service Role Key.
-- If Edge Function uses Service Role, it bypasses RLS, so we don't strictly need an INSERT policy for users.
-- But let's add one for good measure if we ever change to client-side upload or user-context edge function.
-- Actually, "User context edge function" is standard. If the function is invoked with user JWT, it acts as user.
-- So we need to allow the user to INSERT their own certificate file?
-- No, usually the backend generates it.
-- We will assume the Edge Function creates the file.
-- If the Edge Function uses the `supabase-js` client initialized with specific keys, we can control this.
-- Standard Edge Function pattern:
--   Deno.serve(async (req) => {
--     const supabase = createClient(..., ..., { global: { headers: { Authorization: req.headers.get('Authorization')! } } })
--     ...
--   })
-- This propagates the user context. So if the USER is to save the file, they need INSERT permission.
-- However, we want to prevent users from uploading junk.
-- So, strict approach: ONLY Service Role (Edge Function with service key) can upload.
-- User can only READ.
-- => I will NOT add an INSERT policy for authenticated users.
-- => I will ONLY add SELECT policy.
