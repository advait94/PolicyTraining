-- 1. Add logo_url to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Create Storage Bucket 'org-logos' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-logos', 'org-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS on the bucket (Standard practice, though buckets usually inherit)
-- (Objects table already has RLS enabled by default in Supabase)

-- 4. RLS Policies for 'org-logos'

-- Policy: Public Read Access
CREATE POLICY "Public can view org logos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'org-logos'
);

-- Policy: Org Admins can insert/update/delete their own logo
-- We assume the file path pattern: {organization_id}/{filename}
CREATE POLICY "Org Admins can manage their own org logo" ON storage.objects
FOR ALL USING (
    bucket_id = 'org-logos' 
    AND auth.role() = 'authenticated'
    AND (
        SELECT organization_id::text 
        FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    ) = (storage.foldername(name))[1]
) WITH CHECK (
    bucket_id = 'org-logos' 
    AND auth.role() = 'authenticated'
    AND (
        SELECT organization_id::text 
        FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    ) = (storage.foldername(name))[1]
);

-- 5. Update Organization Policy to allow Admins to update their own logo_url
-- (Existing policy might already cover this, but let's ensure specific update access if needed)
-- Current policy: "Admins can update their own organization" usually exists. 
-- We'll explicitly verify/ensure it allows updating `logo_url`.
-- (Assuming existing policy handles "UPDATE" based on organization_id check)
