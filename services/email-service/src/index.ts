import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { Resend } from 'resend';

// Load env from root .env.local
const envPath = path.resolve(process.cwd(), '../../.env.local');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

const app = express();
const port = process.env.EMAIL_SERVICE_PORT || 4002;

const resendApiKey = process.env.RESEND_API_KEY;
console.log('Resend API Key:', resendApiKey ? 'Found' : 'Missing');

let resend: Resend | null = null;
if (resendApiKey) {
    resend = new Resend(resendApiKey);
} else {
    console.warn('WARNING: RESEND_API_KEY missing. Email sending will be disabled.');
}

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'email-service',
        emailProviderConfigured: !!resend
    });
});

app.post('/send', async (req, res) => {
    if (!resend) {
        return res.status(500).json({ error: 'Email provider not configured (RESEND_API_KEY missing)' });
    }

    const { to, subject, html, text } = req.body;

    if (!to || !subject || (!html && !text)) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, and (html or text)' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Policy Training <support@aaplusconsultants.com>', // Verified domain
            to,
            subject,
            html,
            text
        });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error: any) {
        console.error('Email Send Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`[email-service] listening on port ${port}`);
});
