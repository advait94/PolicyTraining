-- RPC function to get organization statistics
CREATE OR REPLACE FUNCTION get_org_stats(target_org_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Verify the requesting user belongs to the target organization or is a super-admin
  -- (Assuming 'admin' role in 'users' table is sufficient for now, coupled with RLS on the calling side?
  --  Actually, RLS applies to tables, but RPCs run with the permissions of the definer if SECURITY DEFINER is used.
  --  Or we can use SECURITY INVOKER. Let's use SECURITY DEFINER to ensure we can aggregate data appropriately
  --  but MUST check permissions inside.)
  
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
      AND (organization_id = target_org_id AND role = 'admin')
  ) THEN
    RAISE EXCEPTION 'Access Denied: User is not an admin of this organization.';
  END IF;

  SELECT json_build_object(
    'total_employees', (
      SELECT COUNT(*) FROM public.users WHERE organization_id = target_org_id
    ),
    'module_completion', (
      SELECT json_agg(stats) FROM (
        SELECT 
          m.title,
          COUNT(up.id) FILTER (WHERE up.is_completed) as completed_count,
          (COUNT(up.id) FILTER (WHERE up.is_completed)::float / NULLIF(COUNT(u.id), 0)::float) * 100 as completion_percentage
        FROM public.modules m
        CROSS JOIN public.users u
        LEFT JOIN public.user_progress up ON up.module_id = m.id AND up.user_id = u.id
        WHERE u.organization_id = target_org_id
        GROUP BY m.id, m.title
      ) stats
    ),
    'expired_certifications', (
      -- Assuming certification expires 1 year after completion
      -- OR listing users who have completed > 1 year ago
      SELECT json_agg(expired) FROM (
        SELECT 
          u.display_name,
          au.email,
          m.title as module_title,
          up.completed_at
        FROM public.user_progress up
        JOIN public.users u ON up.user_id = u.id
        JOIN auth.users au ON u.id = au.id
        JOIN public.modules m ON up.module_id = m.id
        WHERE u.organization_id = target_org_id
          AND up.is_completed = true
          AND up.completed_at < (NOW() - INTERVAL '1 year')
      ) expired
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
