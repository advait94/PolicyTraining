-- Create a secure view for Admin Dashboard
CREATE OR REPLACE VIEW public.admin_stats_view AS
WITH user_module_counts AS (
    -- Count completed modules per user
    SELECT 
        user_id,
        COUNT(*) FILTER (WHERE is_completed = true) as completed_modules,
        COUNT(*) as total_modules -- Should be 5 ideally
    FROM public.user_progress
    GROUP BY user_id
),
org_stats AS (
    SELECT 
        om.organization_id,
        o.name as organization_name,
        COUNT(om.user_id) as total_users,
        -- Count users who completed >= 5 modules (Full Certification)
        COUNT(CASE WHEN coalesce(umc.completed_modules, 0) >= 5 THEN 1 END) as fully_certified_users,
        -- Calculate average completion percentage across all users
        AVG(coalesce(umc.completed_modules, 0)::float / 5.0 * 100) as avg_completion_percentage
    FROM public.organization_members om
    JOIN public.organizations o ON o.id = om.organization_id
    LEFT JOIN user_module_counts umc ON umc.user_id = om.user_id
    WHERE om.role != 'admin' -- Exclude admins from stats? Or include? User asked for "users", usually means employees.
    GROUP BY om.organization_id, o.name
)
SELECT 
    organization_id,
    organization_name,
    total_users,
    fully_certified_users,
    ROUND(avg_completion_percentage::numeric, 1) as avg_completion_percentage
FROM org_stats;

-- Enable RLS logic via security barrier or just rely on RLS on tables?
-- Views don't have RLS directly unless defined as security invoker or using specific techniques.
-- Best practice: Use a function or define the view to only return rows visible to the current user.
-- HOWEVER, simple view + Row Security on base tables is tricky.
-- Easier: Filter the view output using the `is_org_admin` check.

-- Redefine with security filter
CREATE OR REPLACE VIEW public.admin_stats_view AS
SELECT 
    os.*
FROM (
    WITH user_module_counts AS (
        SELECT 
            user_id,
            COUNT(*) FILTER (WHERE is_completed = true) as completed_modules
        FROM public.user_progress
        GROUP BY user_id
    ),
    org_stats AS (
        SELECT 
            om.organization_id,
            o.name as organization_name,
            COUNT(om.user_id) as total_users,
            COUNT(CASE WHEN coalesce(umc.completed_modules, 0) >= 5 THEN 1 END) as fully_certified_users,
            AVG(CASE WHEN COALESCE(umc.completed_modules,0) > 5 THEN 100 ELSE COALESCE(umc.completed_modules,0)::float / 5.0 * 100 END) as avg_completion_percentage
        FROM public.organization_members om
        JOIN public.organizations o ON o.id = om.organization_id
        LEFT JOIN user_module_counts umc ON umc.user_id = om.user_id
        -- WHERE om.role != 'admin' 
        GROUP BY om.organization_id, o.name
    )
    SELECT * FROM org_stats
) os
WHERE public.is_org_admin(os.organization_id); -- Only show my org's stats

GRANT SELECT ON public.admin_stats_view TO authenticated;
