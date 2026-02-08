
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

// We need the SERVICE_ROLE_KEY to perform admin actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

interface InviteData {
    email: string;
    redirectTo?: string;
    data: {
        full_name?: string;
        organization_id: string;
        role?: string;
        invited_by?: string;
    };
}

export async function inviteUser({ email, redirectTo, data: userData }: InviteData) {
    if (!email) {
        throw new Error('Email is required');
    }

    try {
        // 0. Check if user already exists
        let existingUser;
        try {
            // getUserByEmail is not available in newer supabase-js, use listUsers
            const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
                page: 1,
                perPage: 1000 // Ensure we fetch enough - ideally loops but for now valid
            });

            if (error) throw error;

            existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        } catch (e) {
            // Ignore error
            console.error('Error checking existing user:', e);
        }

        if (existingUser) {
            console.log(`User ${email} already exists. Adding directly to organization...`);

            // 1A. Ensure public.users record exists
            await supabaseAdmin
                .from('users')
                .upsert({
                    id: existingUser.id,
                    email: email,
                    display_name: userData.full_name || email.split('@')[0],
                    role: userData.role || 'learner',
                    organization_id: userData.organization_id // Link Org
                })
                .select();

            // 1B. Add to Organization Members
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

            // 1C. Send "Added" Email
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const dashboardLink = `${appUrl}/dashboard`;

            await sendEmail({
                to: email,
                subject: 'You have been added to a new Organization',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Welcome Aboard!</h2>
                        <p>You have been added to the organization on <strong>Policy Training Platform</strong>.</p>
                        <p style="margin: 24px 0;">
                            <a href="${dashboardLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                                Go to Dashboard
                            </a>
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            Log in with your existing credentials or SSO.
                        </p>
                    </div>
                `,
                text: `You have been added to an organization. Login here: ${dashboardLink}`
            });

            return { success: true, message: 'User added to organization correctly.' };
        }

        // --- NEW USER FLOW ---

        console.log(`Generating invite link for ${email}...`);

        // 1. Upsert into public.invitations
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

        // 2. Create the user account first
        console.log('Creating user account...');
        const { data: createUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: false,
            user_metadata: userData
        });

        if (createUserError) {
            console.error('Failed to create user:', createUserError);
            throw new Error(`Failed to create user: ${createUserError.message}`);
        }

        console.log('User created:', createUserData.user.id);

        // 3. Generate magic link for password setup
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
                redirectTo,
                data: userData
            }
        });

        if (linkError) throw linkError;

        const inviteLink = linkData.properties?.action_link;
        if (!inviteLink) {
            throw new Error('Failed to generate invitation link (no action_link returned)');
        }

        // --- OVERRIDE REDIRECT URL ---
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        const desiredRedirect = `${appUrl}/auth/update-password?email=${encodeURIComponent(email)}`;

        // Parse the invite link URL and replace the redirect_to parameter
        const inviteLinkUrl = new URL(inviteLink);

        // Use the passed redirectTo if valid, otherwise fallback to default
        const finalRedirect = redirectTo || desiredRedirect;

        inviteLinkUrl.searchParams.set('redirect_to', finalRedirect);
        const correctedInviteLink = inviteLinkUrl.toString();

        // --- SAFE LINK IMPLEMENTATION ---
        const safeLink = `${appUrl}/auth/verify-invite?target=${encodeURIComponent(correctedInviteLink)}`;

        console.log('Safe Link Generated:', safeLink);

        // 4. Send Email
        const emailResult = await sendEmail({
            to: email,
            subject: 'Set up your Policy Training Platform account',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to Policy Training Platform!</h2>
                    <p>You have been invited to join the <strong>Policy Training Platform</strong>.</p>
                    <p>Click the button below to set up your account password and get started.</p>
                    <p style="margin: 24px 0;">
                        <a href="${safeLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            Set Up Account
                        </a>
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${safeLink}">${safeLink}</a>
                    </p>
                        <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        This link will expire in 24 hours. If the button doesn't work, copy the link above.
                    </p>
                </div>
            `,
            text: `Welcome to Policy Training Platform! Set up your account password here: ${safeLink}`
        });

        if (!emailResult.success) {
            throw new Error(`Email sending failed: ${emailResult.error}`);
        }

        return { success: true, userId: createUserData.user.id };

    } catch (error: any) {
        console.error('Invite User Logic Error:', error);
        throw error;
    }
}
