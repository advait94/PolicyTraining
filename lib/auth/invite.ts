
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

/**
 * Canonical base URL for auth links. The magic-link `redirect_to` must match a
 * Supabase Redirect-URL allow-list entry EXACTLY (scheme + host + path); if it
 * doesn't, GoTrue silently discards it and falls back to the Site URL root,
 * which dumps the user on /login instead of the set-password page.
 *
 * The allow-list only contains the https origin, but NEXT_PUBLIC_APP_URL has been
 * seen set to http:// in production (Vercel then 308-upgrades page loads, hiding
 * the misconfig). So we force https and strip a `www.`/trailing slash for any
 * non-local host to guarantee the generated redirect matches the allow-list.
 */
function getAppUrl(): string {
    let url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(url);
    if (!isLocal) {
        url = url.replace(/^http:\/\//, 'https://').replace(/^https:\/\/www\./, 'https://');
    }
    return url.replace(/\/+$/, '');
}

interface InviteData {
    email: string;
    redirectTo?: string;
    data: {
        full_name?: string;
        organization_id: string;
        role?: string;
        invited_by?: string;
        department_id?: string | null;
    };
    /**
     * Account lookup already performed by the caller. Bulk invites resolve every
     * address in one query (see `resolveExistingUserIds`) rather than paying for
     * a lookup per row.
     *
     * `undefined` — not resolved, look it up here (single-invite callers).
     * `null`      — resolved, no auth account exists for this email.
     * `string`    — resolved, this is the existing auth user's id.
     */
    existingUserId?: string | null;
}

/**
 * Maps lowercased email -> auth user id for every address that already has an
 * account, in a single round trip regardless of how many emails are passed.
 *
 * Backed by the find_auth_users_by_emails() SQL function rather than
 * auth.admin.listUsers, which pages at 1000 and offers no email filter — a
 * lookup built on it silently misses accounts once a project passes 1000 users.
 */
export async function resolveExistingUserIds(emails: string[]): Promise<Map<string, string>> {
    const resolved = new Map<string, string>();

    const unique = [...new Set(
        emails.map(e => (e || '').toLowerCase().trim()).filter(Boolean)
    )];
    if (unique.length === 0) return resolved;

    const { data, error } = await getSupabaseAdmin()
        .rpc('find_auth_users_by_emails', { p_emails: unique });

    if (error) {
        throw new Error(`Could not check for existing accounts: ${error.message}`);
    }

    for (const row of (data ?? []) as { user_id: string; user_email: string }[]) {
        resolved.set(row.user_email, row.user_id);
    }

    return resolved;
}

/**
 * A pre-resolved id can go stale between lookup and createUser — a concurrent
 * invite, or a self-signup landing in the gap. Detecting that lets us fall back
 * to the re-invite path instead of failing the row.
 */
function isDuplicateEmailError(error: { message?: string; code?: string } | null): boolean {
    const message = (error?.message || '').toLowerCase();
    return error?.code === 'email_exists'
        || message.includes('already been registered')
        || message.includes('already registered')
        || message.includes('already exists');
}

async function fetchAuthUser(userId: string) {
    const { data, error } = await getSupabaseAdmin().auth.admin.getUserById(userId);
    if (error) {
        console.error(`Could not load auth user ${userId}:`, error);
        return null;
    }
    return data?.user ?? null;
}

interface OrgBranding {
    name: string;
    logoUrl: string | null;
    supportEmail: string;
}

async function getOrgBranding(organizationId: string): Promise<OrgBranding> {
    const supabaseAdmin = getSupabaseAdmin();
    try {
        const { data: org } = await supabaseAdmin
            .from('organizations')
            .select('display_name, logo_url, support_email')
            .eq('id', organizationId)
            .single();

        return {
            name: org?.display_name || 'Policy Training Platform',
            logoUrl: org?.logo_url || null,
            supportEmail: org?.support_email || 'support@aaplusconsultants.com',
        };
    } catch {
        return {
            name: 'Policy Training Platform',
            logoUrl: null,
            supportEmail: 'support@aaplusconsultants.com',
        };
    }
}

function buildInviteEmail(safeLink: string, branding: OrgBranding, isExistingUser = false): { subject: string; html: string; text: string } {
    const { name, logoUrl, supportEmail } = branding;

    const logoHtml = logoUrl
        ? `<img src="${logoUrl}" alt="${name}" style="max-height:52px;max-width:220px;object-fit:contain;" />`
        : `<span style="font-size:20px;font-weight:700;color:#ffffff;">${name}</span>`;

    const bodyHeading = isExistingUser
        ? `You've been added to ${name}'s training platform`
        : `You've been invited to ${name}'s compliance training`;

    const bodyText = isExistingUser
        ? `Your account has been added to <strong>${name}</strong>'s policy training portal. Log in with your existing credentials to access your assigned modules.`
        : `You have been invited to complete compliance training through <strong>${name}</strong>'s policy training portal. Click the button below to set up your account and get started.`;

    const ctaLabel = isExistingUser ? 'Go to My Dashboard' : 'Set Up My Account';

    const subject = isExistingUser
        ? `You've been added to ${name}'s Training Platform`
        : `You're invited — set up your ${name} training account`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:28px 32px;text-align:center;">
            ${logoHtml}
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a;line-height:1.3;">${bodyHeading}</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">${bodyText}</p>

            <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
              <tr>
                <td style="border-radius:8px;background:#7c3aed;">
                  <a href="${safeLink}"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                    ${ctaLabel}
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">Or copy and paste this link into your browser:</p>
            <p style="margin:0 0 24px;font-size:12px;word-break:break-all;">
              <a href="${safeLink}" style="color:#7c3aed;">${safeLink}</a>
            </p>

            ${!isExistingUser ? `<p style="margin:0;font-size:12px;color:#94a3b8;">This invitation link expires in <strong>24 hours</strong>.</p>` : ''}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#64748b;">
              Need help? Email us at
              <a href="mailto:${supportEmail}" style="color:#7c3aed;">${supportEmail}</a>
            </p>
            <p style="margin:0;font-size:11px;color:#94a3b8;">
              Powered by AA Plus Consultants Policy Training Platform
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const text = isExistingUser
        ? `You've been added to ${name}'s training platform. Log in here: ${safeLink}`
        : `You're invited to ${name}'s compliance training. Set up your account: ${safeLink}`;

    return { subject, html, text };
}

/**
 * Adds an account that already exists in auth.users to the organization and
 * sends it through the magic-link → set-password flow.
 */
async function reinviteExistingUser(
    existingUser: { id: string; user_metadata?: Record<string, any> },
    email: string,
    userData: InviteData['data'],
    branding: OrgBranding
) {
    const supabaseAdmin = getSupabaseAdmin();

    console.log(`User ${email} already exists. Adding directly to organization...`);

    await supabaseAdmin
        .from('users')
        .upsert({
            id: existingUser.id,
            email: email,
            display_name: userData.full_name || email.split('@')[0],
            role: userData.role || 'learner',
            organization_id: userData.organization_id,
            ...(userData.department_id ? { department_id: userData.department_id } : {})
        })
        .select();

    const { error: memberError } = await supabaseAdmin
        .from('organization_members')
        .upsert({
            organization_id: userData.organization_id,
            user_id: existingUser.id,
            role: userData.role || 'learner'
        }, { onConflict: 'organization_id,user_id' });

    if (memberError) {
        console.error('Failed to add existing user to org:', memberError);
        throw new Error(`Failed to add user to organization: ${memberError.message}`);
    }

    const appUrl = getAppUrl();

    // Send every re-invited user through the magic-link → set-password flow,
    // even if they signed up via Microsoft/Google SSO. Setting a password does
    // not remove SSO — it just adds email+password as a second way to log in —
    // so an SSO user who doesn't want to keep using their provider can gain a
    // password. This also covers users who were removed (revokeUserAccess) and
    // may never have set a password.
    //
    // Routing is driven by the `force_password_setup` metadata flag (checked in
    // /auth/callback and /auth/implicit), which works for SSO accounts too and,
    // unlike is_invite, is cleared once the password is set so normal SSO logins
    // are never diverted. We deliberately do NOT add query params to redirectTo:
    // Supabase validates redirectTo against its Redirect-URL allow-list, and an
    // unlisted variant silently falls back to the Site URL (the login page).
    await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
            ...existingUser.user_metadata,
            ...userData,
            is_invite: true,
            force_password_setup: true
        }
    });

    const existingUserRedirect = `${appUrl}/auth/callback`;

    const { data: existingLinkData, error: existingLinkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: existingUserRedirect }
    });

    if (existingLinkError) throw existingLinkError;

    const existingMagicLink = existingLinkData.properties?.action_link;
    if (!existingMagicLink) {
        throw new Error('Failed to generate re-invite link (no action_link returned)');
    }

    const { data: existingTokenRecord, error: existingTokenError } = await supabaseAdmin
        .from('safe_link_tokens')
        .upsert({
            magic_link: existingMagicLink,
            email: email.toLowerCase(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            used: false
        }, { onConflict: 'email' })
        .select('id')
        .single();

    if (existingTokenError || !existingTokenRecord) {
        console.error('Failed to create safe link token for existing user:', existingTokenError);
        throw new Error('Failed to create secure re-invite link');
    }

    const existingSafeLink = `${appUrl}/auth/verify-invite?token=${existingTokenRecord.id}`;

    const { subject, html, text } = buildInviteEmail(existingSafeLink, branding, false);

    const existingEmailResult = await sendEmail({ to: email, subject, html, text });

    if (!existingEmailResult.success) {
        throw new Error(`Email sending failed: ${existingEmailResult.error}`);
    }

    return { success: true, message: 'User re-invited with set-password link.' };
}

export async function inviteUser({ email: rawEmail, redirectTo, data: userData, existingUserId }: InviteData) {
    if (!rawEmail) {
        throw new Error('Email is required');
    }

    /**
     * Everything downstream keys off this address, so normalise it once, here.
     *
     * GoTrue lowercases the address it stores in auth.users, but the invitations
     * row keeps whatever the CSV had. handle_new_user() matches the two with a
     * plain `=`, so a row typed `Pawar.praful@…` produced an auth account whose
     * invitation could never be found: no organization_id, no membership row,
     * invitation stuck on 'pending', and the person invisible in the admin
     * console despite having received their invite email. Writing the address
     * lowercased keeps both sides of that match in the same case.
     */
    const email = rawEmail.toLowerCase().trim();

    const supabaseAdmin = getSupabaseAdmin();

    try {
        // Fetch org branding once upfront
        const branding = await getOrgBranding(userData.organization_id);

        // 0. Does this email already have an auth account? Bulk callers resolve
        //    this for every address in the file up front and pass the answer in.
        let resolvedId = existingUserId;
        if (resolvedId === undefined) {
            resolvedId = (await resolveExistingUserIds([email])).get(email.toLowerCase().trim()) ?? null;
        }

        if (resolvedId) {
            const existingUser = await fetchAuthUser(resolvedId);
            if (existingUser) {
                return await reinviteExistingUser(existingUser, email, userData, branding);
            }
            // Id no longer resolves — account deleted since the lookup. Create fresh.
        }

        // --- NEW USER FLOW ---

        console.log(`Generating invite link for ${email}...`);

        const { error: inviteError } = await supabaseAdmin
            .from('invitations')
            .upsert({
                email,
                organization_id: userData.organization_id,
                role: userData.role || 'learner',
                invited_by: userData.invited_by,
                status: 'pending'
            }, { onConflict: 'email' })
            .select()
            .single();

        if (inviteError) {
            console.error('Failed to create invitation record:', inviteError);
            throw new Error(`Failed to create invitation record: ${inviteError.message}`);
        }

        console.log('Creating user account...');
        const { data: createUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
                ...userData,
                is_invite: true
            }
        });

        if (createUserError) {
            // The lookup can go stale between resolve and create — a concurrent
            // invite for the same address, or a self-signup landing in the gap.
            // Recover into the re-invite path instead of failing the row.
            if (isDuplicateEmailError(createUserError)) {
                const racedId = (await resolveExistingUserIds([email])).get(email.toLowerCase().trim());
                const racedUser = racedId ? await fetchAuthUser(racedId) : null;
                if (racedUser) {
                    return await reinviteExistingUser(racedUser, email, userData, branding);
                }
            }
            console.error('Failed to create user:', createUserError);
            throw new Error(`Failed to create user: ${createUserError.message}`);
        }

        console.log('User created:', createUserData.user.id);

        if (userData.department_id) {
            await supabaseAdmin
                .from('users')
                .update({ department_id: userData.department_id })
                .eq('id', createUserData.user.id);
        }

        const appUrl = getAppUrl();
        const finalRedirect = `${appUrl}/auth/callback`;

        console.log('Generating magic link with simplified redirect:', finalRedirect);

        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
                redirectTo: finalRedirect,
            }
        });

        if (linkError) throw linkError;

        const inviteLink = linkData.properties?.action_link;
        if (!inviteLink) {
            throw new Error('Failed to generate invitation link (no action_link returned)');
        }

        // Store magic link in database, only expose token ID
        const { data: tokenRecord, error: tokenError } = await supabaseAdmin
            .from('safe_link_tokens')
            .upsert({
                magic_link: inviteLink,
                email: email.toLowerCase(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                used: false
            }, { onConflict: 'email' })
            .select('id')
            .single();

        if (tokenError || !tokenRecord) {
            console.error('Failed to create safe link token:', tokenError);
            throw new Error('Failed to create secure invitation link');
        }

        const safeLink = `${appUrl}/auth/verify-invite?token=${tokenRecord.id}`;

        console.log('Safe Token Link Generated:', safeLink);

        const { subject, html, text } = buildInviteEmail(safeLink, branding, false);

        const emailResult = await sendEmail({ to: email, subject, html, text });

        if (!emailResult.success) {
            throw new Error(`Email sending failed: ${emailResult.error}`);
        }

        return { success: true, userId: createUserData.user.id };

    } catch (error: any) {
        console.error('Invite User Logic Error:', error);
        throw error;
    }
}
