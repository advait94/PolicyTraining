-- Migration: Information Security Essentials module
-- Module ID: 00000009-0001-0000-0000-000000000001

BEGIN;

-- ─────────────────────────────────────────────
-- MODULE
-- ─────────────────────────────────────────────
INSERT INTO public.modules (id, title, description, sequence_order)
VALUES (
    '00000009-0001-0000-0000-000000000001',
    'Information Security Essentials',
    'Understand how to protect company systems, data, and devices from cyber threats — covering passwords, phishing, safe browsing, remote work security, and what to do when something goes wrong.',
    17
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- SLIDES
-- ─────────────────────────────────────────────
DELETE FROM public.slides WHERE module_id = '00000009-0001-0000-0000-000000000001';

INSERT INTO public.slides (module_id, sequence_order, title, content) VALUES

('00000009-0001-0000-0000-000000000001', 1, 'Why Information Security Is Everyone''s Responsibility',
'## Why Information Security Is Everyone''s Responsibility

Cybersecurity is not just an IT problem. The most common entry points for attackers are **people**, not systems.

### The threat landscape

- **91% of cyberattacks** begin with a phishing email
- The average cost of a data breach is **$4.45 million** (IBM, 2023)
- Most breaches involve **employee error** — not sophisticated hacking

### What is at stake

| Risk | Impact |
|---|---|
| Customer data stolen | Legal liability, regulatory fines, loss of trust |
| Financial fraud | Direct monetary loss |
| Ransomware | Business operations shut down |
| Intellectual property theft | Competitive advantage lost permanently |

### Your role
Every employee who uses a device, accesses email, or handles company data is a potential attack surface — and a potential line of defence.

### This module covers
1. Passwords and authentication
2. Phishing and social engineering
3. Safe use of email and the internet
4. Device security and remote work
5. Data classification and handling
6. Reporting security incidents'),

('00000009-0001-0000-0000-000000000001', 2, 'Passwords & Authentication',
'## Passwords & Authentication

Weak or reused passwords are the single most common cause of account compromise.

### Strong password principles

| Do | Don''t |
|---|---|
| Use 12+ characters | Use your name, birthday, or company name |
| Mix letters, numbers, symbols | Reuse passwords across work and personal accounts |
| Use a passphrase (e.g., `Blue$Tiger9!Runs`) | Share passwords with colleagues |
| Use a password manager | Write passwords on sticky notes |

### Multi-Factor Authentication (MFA)
MFA adds a second layer — even if your password is stolen, the attacker cannot log in without your phone or token.

> **Always enable MFA** on all work accounts that support it. If MFA is not available for a system, report it to IT as a risk.

### What to do if you think your password is compromised
1. Change it immediately across all affected accounts
2. Report it to IT / Information Security team
3. Check for unusual login activity in your account settings

---

> **Never share your password with IT support either.** Legitimate IT staff will never ask for your password — they have administrative tools to help you without needing it.'),

('00000009-0001-0000-0000-000000000001', 3, 'Phishing & Social Engineering',
'## Phishing & Social Engineering

**Phishing** is an attempt to trick you into revealing credentials, clicking malicious links, or transferring money — by impersonating a trusted person or organisation.

### Common types

| Type | Description |
|---|---|
| **Email phishing** | Mass emails impersonating banks, IT, or regulators |
| **Spear phishing** | Targeted email using your name, role, or colleagues |
| **Smishing** | SMS messages with malicious links |
| **Vishing** | Phone calls impersonating IT support or vendors |
| **Business Email Compromise (BEC)** | Attacker impersonates CEO or CFO requesting urgent transfers |

### Red flags to spot

- **Urgency** — "Act now or your account will be suspended"
- **Unexpected attachment** — especially .zip, .exe, .docm files
- **Mismatched sender domain** — `support@company-secure.net` instead of `@company.com`
- **Unusual payment or data request** — especially if verbal or via personal email
- **Generic greeting** — "Dear Customer" instead of your name

### What to do
1. **Do not click** — hover over links first to check the actual URL
2. **Do not reply** — even "unsubscribe" confirms your address is active
3. **Report it** — forward to the IT/security team immediately
4. **When in doubt, call back** — verify requests via a known, trusted number

> A 30-second phone call to verify a suspicious request can prevent a ₹50 lakh fraud.'),

('00000009-0001-0000-0000-000000000001', 4, 'Safe Use of Email & the Internet',
'## Safe Use of Email & the Internet

### Email — acceptable use

**Do:**
- Send confidential information only over encrypted or approved channels
- Think before you forward — does the recipient need this?
- Use BCC when emailing large external groups (protects recipient addresses)

**Do not:**
- Forward work emails to personal accounts to "work from home more easily"
- Use work email to sign up for personal services, shopping, or social media
- Open attachments from unknown senders without checking with IT first

### Internet — acceptable use

**Permitted (reasonable personal use):**
- Brief personal browsing during breaks
- Banking or government portals when needed

**Prohibited:**
- Downloading unlicensed software or media
- Visiting sites flagged by the web filter — report false positives to IT
- Using personal cloud storage (Dropbox, personal Google Drive) for work files
- Accessing the dark web or anonymising tools (Tor, VPNs not approved by IT)

### Public Wi-Fi — a high-risk environment
> Never access sensitive company systems (email, ERP, finance tools) over public Wi-Fi without using the company-approved VPN.

Public Wi-Fi in airports, hotels, and cafés is routinely monitored by attackers. The VPN encrypts your traffic so even if the network is compromised, your data is safe.'),

('00000009-0001-0000-0000-000000000001', 5, 'Device Security & Remote Work',
'## Device Security & Remote Work

### Physical device security

- **Lock your screen** every time you step away — use `Win + L` (Windows) or set a 1-minute auto-lock
- **Never leave your laptop unattended** in public spaces — even for "just a minute"
- **Report lost or stolen devices immediately** to IT — remote wipe can be triggered before data is accessed
- **Do not allow family members** to use work devices, even for "quick" tasks

### Software and updates
- **Install security updates promptly** — most ransomware exploits known vulnerabilities that are already patched
- Do not install personal software on company devices without IT approval
- Use only IT-approved tools for video calls, file sharing, and messaging

### Remote work checklist

| Before you start | While working |
|---|---|
| Connect via company VPN | Lock screen when stepping away |
| Use a secure, private network | Don''t share screen with people behind you |
| Check your surroundings for shoulder-surfers | Use headphones for confidential calls |

### BYOD (Bring Your Own Device)
If you use a personal device for work, ensure it:
- Has a screen lock and encryption enabled
- Has the company MDM (Mobile Device Management) profile installed
- Is kept up to date with OS and app patches

> Lost device? **Call IT within the hour.** Quick action can prevent a breach.'),

('00000009-0001-0000-0000-000000000001', 6, 'Data Classification & Handling',
'## Data Classification & Handling

Not all information carries the same risk. Understanding how to classify data helps you apply the right level of protection.

### Classification levels

| Level | Examples | Handling rules |
|---|---|---|
| **Public** | Marketing materials, published reports | No restrictions |
| **Internal** | Policies, org charts, internal memos | Do not share externally |
| **Confidential** | Client data, contracts, financial data, PII | Encrypted at rest and in transit; need-to-know access only |
| **Restricted** | Board minutes, M&A information, MNPI | Strict need-to-know; no personal devices; no cloud storage |

### Key rules for confidential and restricted data

- **Encrypt before emailing** — use the approved encryption tool or secure portal
- **Do not store on personal cloud services** (personal Dropbox, iCloud, WhatsApp)
- **Do not print unless necessary** — shred all printed confidential documents
- **Clear desk policy** — no sensitive documents left visible on your desk at end of day

### Personal data (PII) — extra obligations
Under India''s Digital Personal Data Protection Act, 2023:
- You may only process personal data for the purpose it was collected
- Report any accidental exposure of personal data to the DPO within 72 hours
- Retention: do not keep personal data longer than its defined retention period'),

('00000009-0001-0000-0000-000000000001', 7, 'Reporting Security Incidents',
'## Reporting Security Incidents

**Speed matters.** The faster an incident is reported, the more damage can be limited.

### What counts as a security incident

- Clicking a phishing link or opening a suspicious attachment
- Receiving a suspicious call requesting login credentials
- Finding your account has been accessed from an unknown location
- Losing or having a device stolen
- Accidentally sending confidential data to the wrong recipient
- Noticing unusual behaviour on your computer (slowness, unknown programs, strange pop-ups)

> **Do not try to "fix it yourself" first.** Self-remediation often destroys evidence and can make containment harder.

### How to report

1. **Stop using the affected device** if you suspect it is compromised
2. **Call or message the IT Security team immediately** — do not email from the affected account
3. **Document what happened** — timeline, what you clicked, what you saw
4. **Preserve evidence** — do not delete suspicious emails; forward them to IT first

### What happens next
- IT will assess and contain the incident
- You will be guided on next steps (password resets, device recovery, etc.)
- If personal data was exposed, the Privacy/DPO team will be notified for regulatory assessment

---

> **You will not be punished for reporting a mistake honestly.** The only behaviour that invites consequences is deliberate misconduct or concealment.'),

('00000009-0001-0000-0000-000000000001', 8, 'Key Takeaways',
'## Key Takeaways

### Your security responsibilities in brief

**Passwords & Access**
- Use strong, unique passwords and a password manager
- Enable MFA on every account that supports it
- Never share credentials — not even with IT support

**Phishing**
- Verify unexpected requests by calling back on a known number
- Report suspicious emails to IT — do not just delete them
- When in doubt, don''t click

**Devices & Remote Work**
- Lock your screen every time you step away
- Use the company VPN on public Wi-Fi
- Report lost or stolen devices within the hour

**Data Handling**
- Know the classification of the data you work with
- Encrypt confidential data before sharing
- No personal cloud storage for work files

**Incidents**
- Report mistakes immediately — speed limits damage
- You will not be penalised for honest reporting

---

> ### The golden rule
> **If something feels wrong — an email, a request, a pop-up, a call — stop and check with IT before acting.**
>
> Attackers rely on urgency and embarrassment to prevent people from pausing to verify. Taking 30 seconds to confirm is always the right move.');

-- ─────────────────────────────────────────────
-- QUESTIONS
-- ─────────────────────────────────────────────
DELETE FROM public.answers WHERE question_id::text LIKE '00000009-000%-0002-%';
DELETE FROM public.questions WHERE id::text LIKE '00000009-000%-0002-%';

-- Q1
INSERT INTO public.questions (id, module_id, text) VALUES
('00000009-0001-0002-0000-000000000001', '00000009-0001-0000-0000-000000000001',
'You receive an email that appears to be from your CEO asking you to urgently transfer ₹2 lakhs to a new vendor account. The email says it is confidential and to act before end of day. What should you do?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0001-0002-0000-000000000001', 'Process it — the CEO''s authority overrides normal approval processes in urgent situations', false),
('00000009-0001-0002-0000-000000000001', 'Reply to the email to confirm the request before acting', false),
('00000009-0001-0002-0000-000000000001', 'Do not act on it — call the CEO directly on a known number to verify, and report the email to IT as a suspected Business Email Compromise attempt', true),
('00000009-0001-0002-0000-000000000001', 'Forward it to your manager and let them decide', false);

-- Q2
INSERT INTO public.questions (id, module_id, text) VALUES
('00000009-0002-0002-0000-000000000001', '00000009-0001-0000-0000-000000000001',
'You accidentally click a link in an email and a strange page opens briefly before closing. Your laptop seems to be working normally. What should you do?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0002-0002-0000-000000000001', 'Nothing — since the laptop seems fine, it was probably harmless', false),
('00000009-0002-0002-0000-000000000001', 'Run your personal antivirus and delete the email to avoid trouble', false),
('00000009-0002-0002-0000-000000000001', 'Report it to IT immediately — stop using the device for sensitive work until IT confirms it is safe', true),
('00000009-0002-0002-0000-000000000001', 'Restart the laptop — that usually clears any issues', false);

-- Q3
INSERT INTO public.questions (id, module_id, text) VALUES
('00000009-0003-0002-0000-000000000001', '00000009-0001-0000-0000-000000000001',
'A colleague asks to borrow your login credentials to access a system they don''t yet have access to — they need it urgently for a client deadline. What should you do?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0003-0002-0000-000000000001', 'Share them — it is just a one-time thing for a legitimate business reason', false),
('00000009-0003-0002-0000-000000000001', 'Share them but change your password immediately after', false),
('00000009-0003-0002-0000-000000000001', 'Decline — credentials must never be shared; help them get emergency access through IT or their manager instead', true),
('00000009-0003-0002-0000-000000000001', 'Share them only if your manager approves', false);

-- Q4
INSERT INTO public.questions (id, module_id, text) VALUES
('00000009-0004-0002-0000-000000000001', '00000009-0001-0000-0000-000000000001',
'You are working from a coffee shop and need to access the company''s finance system to approve a payment. The coffee shop has free Wi-Fi. What is the correct approach?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0004-0002-0000-000000000001', 'Use the coffee shop Wi-Fi — company systems are secured on their own', false),
('00000009-0004-0002-0000-000000000001', 'Use your phone''s mobile hotspot instead of the coffee shop Wi-Fi — no VPN needed if you avoid public Wi-Fi', false),
('00000009-0004-0002-0000-000000000001', 'Connect via the company-approved VPN first, then access the finance system', true),
('00000009-0004-0002-0000-000000000001', 'Wait until you are back in the office to approve the payment', false);

-- Q5
INSERT INTO public.questions (id, module_id, text) VALUES
('00000009-0005-0002-0000-000000000001', '00000009-0001-0000-0000-000000000001',
'You receive a call from someone claiming to be from IT support, asking for your password to fix a problem with your account. What should you do?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0005-0002-0000-000000000001', 'Give it — IT support legitimately needs passwords to fix account issues', false),
('00000009-0005-0002-0000-000000000001', 'Give it only if they can confirm your employee ID first', false),
('00000009-0005-0002-0000-000000000001', 'Decline — legitimate IT staff never need your password; hang up and call the IT helpdesk on the official number to verify', true),
('00000009-0005-0002-0000-000000000001', 'Give it and immediately change it after the call ends', false);

-- Q6
INSERT INTO public.questions (id, module_id, text) VALUES
('00000009-0006-0002-0000-000000000001', '00000009-0001-0000-0000-000000000001',
'You need to send a contract containing client personal data to an external lawyer. What is the correct way to do this?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0006-0002-0000-000000000001', 'Email it as a normal attachment — email is secure enough for most purposes', false),
('00000009-0006-0002-0000-000000000001', 'Upload it to your personal Dropbox and share the link', false),
('00000009-0006-0002-0000-000000000001', 'Use the company-approved encrypted file sharing method or secure portal', true),
('00000009-0006-0002-0000-000000000001', 'Send it via WhatsApp — it uses end-to-end encryption', false);

-- Q7
INSERT INTO public.questions (id, module_id, text) VALUES
('00000009-0007-0002-0000-000000000001', '00000009-0001-0000-0000-000000000001',
'Your laptop is stolen from your car overnight. You report it to the police. What should you do next?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0007-0002-0000-000000000001', 'Wait for the police investigation before informing the company', false),
('00000009-0007-0002-0000-000000000001', 'Inform IT immediately so they can trigger a remote wipe — the sooner they act, the less data is at risk', true),
('00000009-0007-0002-0000-000000000001', 'Change your passwords and the company will be fine since all data is encrypted', false),
('00000009-0007-0002-0000-000000000001', 'Only report it to IT if you had confidential documents on the laptop', false);

-- Q8
INSERT INTO public.questions (id, module_id, text) VALUES
('00000009-0008-0002-0000-000000000001', '00000009-0001-0000-0000-000000000001',
'An email arrives with the subject "Urgent: Your salary slip for April" from hr-payroll@company-portal.net. The sender looks legitimate but the domain is slightly different from your company''s usual @company.com domain. What should you do?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0008-0002-0000-000000000001', 'Open it — salary slips are routine and the sender looks credible', false),
('00000009-0008-0002-0000-000000000001', 'Open it but do not click any links inside', false),
('00000009-0008-0002-0000-000000000001', 'Do not open it — the mismatched domain is a phishing red flag; report it to IT', true),
('00000009-0008-0002-0000-000000000001', 'Forward it to HR to confirm whether they sent it before opening', false);

-- Q9
INSERT INTO public.questions (id, module_id, text) VALUES
('00000009-0009-0002-0000-000000000001', '00000009-0001-0000-0000-000000000001',
'Under India''s Digital Personal Data Protection Act, 2023, if you accidentally send a customer''s personal data to the wrong email address, what must happen?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0009-0002-0000-000000000001', 'Nothing, as long as you ask the recipient to delete it', false),
('00000009-0009-0002-0000-000000000001', 'Report it to your manager who will decide whether to inform the DPO', false),
('00000009-0009-0002-0000-000000000001', 'Report it to the Data Protection Officer (DPO) immediately — accidental exposure of personal data must be assessed for regulatory notification within 72 hours', true),
('00000009-0009-0002-0000-000000000001', 'Only report it if the recipient is outside India', false);

-- Q10
INSERT INTO public.questions (id, module_id, text) VALUES
('00000009-0010-0002-0000-000000000001', '00000009-0001-0000-0000-000000000001',
'You receive a software update notification on your work laptop. You are busy and think you will install it next week. What is the risk of delaying?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0010-0002-0000-000000000001', 'No significant risk — updates are mostly for new features, not security', false),
('00000009-0010-0002-0000-000000000001', 'Minor risk — attackers rarely target known vulnerabilities quickly', false),
('00000009-0010-0002-0000-000000000001', 'High risk — most ransomware and malware exploits vulnerabilities that are already patched; delaying updates leaves your device exposed', true),
('00000009-0010-0002-0000-000000000001', 'Risk only applies to internet-facing servers, not employee laptops', false);

COMMIT;
