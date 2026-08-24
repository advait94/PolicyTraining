// Checks that whatever SUPABASE_SERVICE_ROLE_KEY currently holds can do
// everything the invite flow needs. Used to verify the legacy -> sb_secret_
// migration. Never prints the key itself.
//
// Run from the repo root:  node scripts/_verify-service-key.mjs
import { createClient } from '@supabase/supabase-js'

try { process.loadEnvFile('.env.local') } catch { }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
    console.error('FAIL  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from .env.local')
    process.exit(1)
}

const fmt = key.startsWith('sb_secret_') ? 'new (sb_secret_)'
    : key.startsWith('eyJ') ? 'legacy JWT'
        : 'unrecognised'
console.log(`key format : ${fmt}\n`)

const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
})

let failures = 0
const check = (label, ok, detail = '') => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`)
    if (!ok) failures++
}

// 1. PostgREST + the service_role-only RPC the bulk lookup depends on.
const { data: rpcData, error: rpcErr } = await supabase
    .rpc('find_auth_users_by_emails', { p_emails: ['probe@example.invalid'] })
check('rpc find_auth_users_by_emails', !rpcErr && Array.isArray(rpcData),
    rpcErr ? rpcErr.message : `returned ${rpcData?.length ?? 0} rows`)

// 2. GoTrue admin API — createUser and generateLink ride on this.
const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
check('auth admin API', !authErr && !!authData, authErr ? authErr.message : 'reachable')

// 3. A plain RLS-bypassing table read, proving service_role privileges.
const { error: tblErr } = await supabase.from('users').select('id').limit(1)
check('service_role table read', !tblErr, tblErr ? tblErr.message : 'ok')

console.log(failures === 0
    ? '\nAll checks passed — this key covers the full invite path.'
    : `\n${failures} check(s) failed. Do NOT disable legacy keys yet.`)
process.exit(failures === 0 ? 0 : 1)
