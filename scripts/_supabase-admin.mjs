import { createClient } from '@supabase/supabase-js'

/**
 * Service-role client for one-off maintenance scripts.
 *
 * The key is read from the environment and never inlined. Several of these
 * scripts previously carried a hardcoded service_role key, and two of them
 * reached a public repo that way. That key bypasses RLS completely, so it has
 * to stay out of tracked files — there is no "just this once" version of it.
 *
 * Reads .env.local when present so scripts work the same way `next dev` does,
 * and otherwise falls back to whatever is already exported.
 */
export function createServiceRoleClient() {
    try {
        process.loadEnvFile('.env.local')
    } catch {
        // No .env.local in cwd — rely on the ambient environment instead.
    }

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        console.error(
            'Missing Supabase credentials.\n' +
            '  Needs NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.\n' +
            '  Add them to .env.local, or export them before running this script.'
        )
        process.exit(1)
    }

    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
}
