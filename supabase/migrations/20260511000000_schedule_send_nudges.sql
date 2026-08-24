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
--
-- The service_role key is read from Vault at each run rather than written into
-- the job body. It used to be inlined here, which put a live RLS-bypassing key
-- into a public repo and meant every rotation silently broke this job until the
-- schedule was rewritten. Looking it up per run makes rotation a Vault update.
--
-- Requires a Vault secret named 'service_role_key':
--   select vault.create_secret('<key>', 'service_role_key');
SELECT cron.schedule(
  'send-nudges-daily',
  '0 8 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://iamactvdegcjfwtmjvaj.supabase.co/functions/v1/send-nudges',
      headers := jsonb_build_object(
                   'Content-Type', 'application/json',
                   'Authorization', 'Bearer ' || (
                     SELECT decrypted_secret
                     FROM vault.decrypted_secrets
                     WHERE name = 'service_role_key'
                   )
                 ),
      body    := '{}'::jsonb
    ) AS request_id;
  $$
);
