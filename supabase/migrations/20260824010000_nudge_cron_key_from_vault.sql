-- Take the inlined service_role key out of the live send-nudges-daily cron job.
--
-- 20260511000000 scheduled the job with the key written directly into the job
-- body. That file has been corrected, but it is already applied — the running
-- job in cron.job still carries the old key verbatim, so editing the migration
-- alone changes nothing on this database. This reschedules it for real.
--
-- Two things follow from it:
--   * the key stops living in cron.job, where anyone with database access can
--     read it out of the job definition, and
--   * rotating the key becomes a Vault update instead of a schema change.
--
-- PREREQUISITE: the Vault secret must exist before this runs, or the job will
-- send "Bearer " with nothing after it and the function will reject every call:
--   select vault.create_secret('<new service_role key>', 'service_role_key');
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'service_role_key') THEN
    RAISE EXCEPTION
      'Vault secret "service_role_key" not found. Create it before applying: '
      'select vault.create_secret(''<key>'', ''service_role_key'');';
  END IF;

  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-nudges-daily') THEN
    PERFORM cron.unschedule('send-nudges-daily');
  END IF;
END $$;

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

COMMIT;
