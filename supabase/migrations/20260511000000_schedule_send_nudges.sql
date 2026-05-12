-- Remove the old placeholder cron job if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'nudge-users-daily') THEN
    PERFORM cron.unschedule('nudge-users-daily');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-nudges-daily') THEN
    PERFORM cron.unschedule('send-nudges-daily');
  END IF;
END $$;

-- Schedule send-nudges daily at 8:00 AM UTC
SELECT cron.schedule(
  'send-nudges-daily',
  '0 8 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://iamactvdegcjfwtmjvaj.supabase.co/functions/v1/send-nudges',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbWFjdHZkZWdjamZ3dG1qdmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY2OTk4MSwiZXhwIjoyMDg1MjQ1OTgxfQ.a7T_UA1Upo5qI2iXnofqmUc2JBjoeD__PFaupEfFxyY"}'::jsonb,
      body    := '{}'::jsonb
    ) AS request_id;
  $$
);
