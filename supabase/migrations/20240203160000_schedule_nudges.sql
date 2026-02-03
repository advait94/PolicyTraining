-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the daily nudge
-- NOTE: You must replace <PROJECT_REF> and <SERVICE_ROLE_KEY> with your actual values.
-- You can find these in your Supabase Dashboard > Project Settings > API.

SELECT cron.schedule(
  'nudge-users-daily',
  '0 9 * * *', -- Runs daily at 9:00 AM UTC
  $$
    SELECT
      net.http_post(
          -- Replace with your Edge Function URL
          url:='https://<PROJECT_REF>.supabase.co/functions/v1/scheduler-nudge', 
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);
