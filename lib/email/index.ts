
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.warn('WARNING: RESEND_API_KEY missing. Email sending will be disabled.');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({
    to,
    subject,
    html,
    text
}: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}) {
    if (!resend) {
        console.error('Email provider not configured (RESEND_API_KEY missing)');
        return { success: false, error: 'Email provider configuration missing' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Policy Training <support@aaplusconsultants.com>',
            to,
            subject,
            html: html as string,
            text: text as string
        } as any);

        if (error) {
            console.error('Resend API Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Email Send Error:', error);
        return { success: false, error: error.message };
    }
}
