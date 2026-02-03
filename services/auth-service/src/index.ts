import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load env from root .env.local
// Assumption: CWD is services/auth-service
const envPath = path.resolve(process.cwd(), '../../.env.local');
console.log('Current Working Directory:', process.cwd());
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

const app = express();
const port = process.env.AUTH_SERVICE_PORT || 4006; // Changed to 4006 to avoid conflicts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing');

let supabaseAdmin: any;

if (supabaseUrl && supabaseServiceKey) {
    try {
        supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        console.log('Supabase Admin Client initialized');
    } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
    }
} else {
    console.error('CRITICAL: Missing Supabase URL or Service Role Key. Client not initialized.');
}

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'auth-service',
        supabaseConfigured: !!supabaseAdmin
    });
});

app.post('/invite', async (req, res) => {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase client not configured' });
    }

    const { email, redirectTo, data: userData } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // 0. Check if user already exists
        let existingUser;
        try {
            const result = await supabaseAdmin.auth.admin.getUserByEmail(email);
            if (result.data && result.data.user) {
                existingUser = result.data.user;
            }
        } catch (e) {
            // Ignore error, user doesn't exist
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

            // 1C. Send "Added" Email (Simple Notification)
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const dashboardLink = `${appUrl}/dashboard`;

            await fetch('http://localhost:4002/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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
                })
            });

            return res.json({ success: true, message: 'User added to organization correctly.' });
        }

        // --- NEW USER FLOW ---

        console.log(`Generating invite link for ${email}...`);

        // 1. Upsert into public.invitations (CRITICAL for Gatekeeper Trigger)
        const { data: inviteRecord, error: inviteError } = await supabaseAdmin
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

        console.log('Invitation record created:', inviteRecord.id);

        // 2. Generate Invite Link manually
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email,
            options: {
                redirectTo,
                data: userData
            }
        });

        if (error) throw error;

        const inviteLink = data.properties?.action_link;
        if (!inviteLink) {
            throw new Error('Failed to generate invitation link (no action_link returned)');
        }

        // --- SAFE LINK IMPLEMENTATION ---
        // We wrap the real link in a redirect param to our frontend intermediate page.
        // This prevents email scanners (Safe Links) from consuming the token.
        // Frontend URL: http://localhost:3001/auth/verify-invite?target=...
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        const safeLink = `${appUrl}/auth/verify-invite?target=${encodeURIComponent(inviteLink)}`;

        console.log('Invite Raw Link:', inviteLink);
        console.log('Safe Link Generated:', safeLink);

        console.log('Sending email via email-service...');

        // 2. Send Email via Email Service (Resend)
        const emailResponse = await fetch('http://localhost:4002/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: email,
                subject: 'You have been invited to Policy Training Platform',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>You've been invited!</h2>
                        <p>You have been invited to join the <strong>Policy Training Platform</strong>.</p>
                        <p style="margin: 24px 0;">
                            <a href="${safeLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                                Accept Invitation
                            </a>
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            Or copy and paste this link into your browser:<br>
                            <a href="${safeLink}">${safeLink}</a>
                        </p>
                         <p style="color: #999; font-size: 12px; margin-top: 30px;">
                            This link will expire in 24 hours. If buttons don't work, copy the link above.
                        </p>
                    </div>
                `,
                text: `You have been invited to the Policy Training Platform. Click here to accept: ${safeLink}`
            })
        });

        if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            throw new Error(`Email service failed: ${errorText}`);
        }

        const emailResult = await emailResponse.json();
        console.log('Email sent successfully:', emailResult);

        res.json({ success: true, data: { user: data.user, emailId: emailResult.data?.id } });
    } catch (error: any) {
        console.error('Invite Error Full Details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        res.status(500).json({
            error: error.message,
            debug: {
                code: error.code,
                details: error.details
            }
        });
    }
});

app.get('/users', async (req, res) => {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase client not configured' });
    }

    try {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) throw error;

        res.json({ success: true, users });
    } catch (error: any) {
        console.error('List Users Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`[auth-service] listening on port ${port}`);
});
