/**
 * Repairs accounts that handle_new_user() left "homeless".
 *
 * The trigger matches an incoming auth.users row against invitations with
 * `WHERE email = new.email`. GoTrue lowercases the address it stores, but the
 * invitation row keeps whatever case the CSV had — so a row like
 * `Pawar.praful@ishantechnologies.com` never matched, the org was never
 * attached, and the person is invisible in the admin console even though their
 * account exists and their invite email went out.
 *
 * This finds every auth account with no organization_id whose *invitation*
 * (matched case-insensitively) names an organization, and attaches them:
 * users.organization_id + role, an organization_members row, and the invitation
 * flipped to accepted.
 *
 * Dry run by default. Pass --apply to write.
 */
import { createClient } from '@supabase/supabase-js'

try { process.loadEnvFile('.env.local') } catch { }

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — run from the project root.')
    process.exit(1)
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
const APPLY = process.argv.includes('--apply')
/** --org=<uuid> limits the repair to accounts invited to that organization. */
const ONLY_ORG = (process.argv.find(a => a.startsWith('--org=')) || '').slice('--org='.length) || null
const norm = e => (e || '').toLowerCase().trim()

async function fetchAll(table, columns) {
    const out = []
    const PAGE = 1000
    for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase.from(table).select(columns).order('id').range(from, from + PAGE - 1)
        if (error) throw new Error(`${table}: ${error.message}`)
        out.push(...data)
        if (data.length < PAGE) break
    }
    return out
}

async function main() {
    const users = await fetchAll('users', 'id, email, display_name, organization_id, role')
    const invites = await fetchAll('invitations', 'id, email, organization_id, role, status')

    // Best invitation per lowercased address: an org-bearing one wins.
    const inviteByEmail = new Map()
    for (const i of invites) {
        const k = norm(i.email)
        if (!inviteByEmail.has(k) || (!inviteByEmail.get(k).organization_id && i.organization_id)) {
            inviteByEmail.set(k, i)
        }
    }

    const stranded = users
        .filter(u => !u.organization_id)
        .map(u => ({ user: u, invite: inviteByEmail.get(norm(u.email)) }))
        .filter(x => x.invite?.organization_id)
        .filter(x => !ONLY_ORG || x.invite.organization_id === ONLY_ORG)

    if (ONLY_ORG) console.log(`Limited to organization ${ONLY_ORG}\n`)

    if (stranded.length === 0) {
        console.log('No stranded accounts found — every user with a matching invitation already has an organization.')
        return
    }

    console.log(`${stranded.length} account(s) have an invitation but no organization:\n`)
    for (const { user, invite } of stranded) {
        console.log(`  ${user.email}`)
        console.log(`     display_name : ${user.display_name}`)
        console.log(`     invitation   : "${invite.email}" role=${invite.role} status=${invite.status}`)
        console.log(`     -> organization_id = ${invite.organization_id}, role = ${invite.role}`)
    }

    if (!APPLY) {
        console.log('\nDry run. Re-run with --apply to write these changes.')
        return
    }

    console.log('\nApplying...')
    let ok = 0
    for (const { user, invite } of stranded) {
        const role = invite.role || 'learner'

        const { error: userErr } = await supabase
            .from('users')
            .update({ organization_id: invite.organization_id, role })
            .eq('id', user.id)
        if (userErr) { console.error(`  ${user.email}: users update failed — ${userErr.message}`); continue }

        const { error: memberErr } = await supabase
            .from('organization_members')
            .upsert(
                { organization_id: invite.organization_id, user_id: user.id, role },
                { onConflict: 'organization_id,user_id' }
            )
        if (memberErr) { console.error(`  ${user.email}: membership failed — ${memberErr.message}`); continue }

        const { error: inviteErr } = await supabase
            .from('invitations')
            .update({ status: 'accepted' })
            .eq('id', invite.id)
        if (inviteErr) console.error(`  ${user.email}: invitation status not updated — ${inviteErr.message}`)

        console.log(`  ${user.email} -> attached`)
        ok++
    }
    console.log(`\nDone. ${ok}/${stranded.length} repaired.`)
}

main().catch(e => { console.error(e); process.exit(1) })
