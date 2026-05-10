-- Migration: Cybersecurity Awareness module content improvements
-- Changes:
--   1. Update slide 1 (intro) to list all 10 slides
--   2. Update slide 8 (Best Practices) to remove remote work bullets (now in slide 9)
--   3. Add slide 9: Remote Work & BYOD Security
--   4. Add slide 10: Business Email Compromise & CEO Fraud
--   5. Replace Q5 (spear phishing definition) with CEO fraud scenario
--   6. Replace Q6 (social engineering definition) with IT impersonation scenario

BEGIN;

-- ============================================================
-- UPDATE SLIDE 1: Reflect expanded 10-slide structure
-- ============================================================

DELETE FROM public.slides WHERE id = '00000002-0001-0001-0000-000000000001';

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0001-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Introduction - Why Cybersecurity Matters', $$> **Training Objectives:** By the end of this training, you will recognize cyber threats, protect sensitive data, work securely from any location, and respond appropriately to security incidents.

## What is Cybersecurity?

Cybersecurity is the practice of protecting **systems, networks, programs, and data** from digital attacks, unauthorized access, and damage.

> **Why Cybersecurity is Critical:**
> - Cyber attacks cost businesses **$4.45M on average** per breach
> - **Human error** is the leading cause of security breaches
> - A data breach can result in **legal penalties, reputational damage, and financial loss**

## Who Needs This Training?

Everyone who uses company systems is a potential target. Cybersecurity is **everyone's responsibility**.

- **Email Users:** Recognize and avoid phishing and social engineering attacks
- **Data Handlers:** Protect sensitive information at all times
- **Remote Workers:** Secure devices and connections wherever you work

## What You Will Learn

1. **Legal Framework:** Laws governing digital security in India
2. **Common Threats:** Malware, ransomware, and social engineering
3. **Password Security:** Creating and managing strong passwords
4. **Data Protection:** Handling confidential information safely
5. **Incident Response:** What to do when something goes wrong
6. **Consequences:** Impacts of cyber attacks
7. **Best Practices:** Daily security habits
8. **Remote Work & BYOD:** Staying secure outside the office
9. **CEO Fraud & BEC:** Recognizing and stopping impersonation attacks$$, 1);

-- ============================================================
-- UPDATE SLIDE 8: Remove remote work section (now in slide 9)
-- ============================================================

DELETE FROM public.slides WHERE id = '00000002-0008-0001-0000-000000000001';

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0008-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Best Practices', $$## The Human Firewall

Technology alone cannot stop cyber attacks. Your daily habits and vigilance form the "Human Firewall" that protects the entire organization.

> **Cyber Hygiene Checklist:**
> - **Think Before You Click:** Be skeptical of unexpected links or attachments, even from known senders
> - **MFA Everywhere:** Enable Multi-Factor Authentication on all accounts, especially email and banking
> - **Unique Passwords:** Use a password manager — never reuse passwords across accounts
> - **Update Regularly:** Never skip software or operating system updates — they patch real vulnerabilities
> - **Report Early:** When in doubt, report it to IT immediately — there is no penalty for reporting
> - **Lock Your Screen:** Every time, without exception, when stepping away from your device

## Social Media Safety

Attackers research targets on social media before launching attacks. Limit what you share publicly.

- **Oversharing:** Do not post photos of your office badge, workstation, or sensitive documents
- **Privacy Settings:** Keep personal profiles private to limit profiling by attackers
- **Work Details:** Avoid naming clients, projects, or colleagues in public posts
- **Connection Requests:** Be cautious of unknown connection requests — attackers build false trust over time

> **Module Summary:** You have now covered the full cybersecurity landscape — from legal obligations and technical threats to secure behavior and incident response. The next two sections address remote work and sophisticated email attacks before your final assessment.$$, 8);

-- ============================================================
-- NEW SLIDE 9: Remote Work & BYOD Security
-- ============================================================

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0009-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Remote Work & BYOD Security', $$> **The Expanded Attack Surface:** When employees work from home or use personal devices, they create additional entry points for attackers. The same security standards that apply in the office apply everywhere you work.

## Working from Home: Key Rules

1. **Always Use the Corporate VPN** — All work traffic must go through the company VPN. Never access company systems on a home or public connection without it.
2. **Secure Your Home Network** — Change your router's default admin password. Use WPA2 or WPA3 encryption. Keep your router firmware updated.
3. **Lock Your Screen** — Apply the same habit at home as in the office. Lock your device whenever you step away, even briefly.
4. **Separate Work from Personal** — Never use personal email, personal cloud storage (Google Drive, iCloud), or personal USB drives for work files.
5. **Controlled Environment** — Work in a space where family members or visitors cannot see your screen or overhear confidential conversations.

## BYOD (Bring Your Own Device)

> **The Risk:** Personal phones, tablets, and laptops are harder for IT to manage and monitor. A compromised personal device used for work can become a direct gateway into company systems.

### Rules for Personal Devices Used for Work

- **Use Only Approved Apps:** Access company systems only through IT-approved applications and portals
- **Enroll in MDM:** Register your device in the company's Mobile Device Management (MDM) system
- **Keep it Updated:** Personal devices used for work must have current OS patches and antivirus
- **Remote Wipe:** By enrolling, you consent to IT remotely wiping company data from your device if it is lost or stolen — this does not affect your personal data

## Shadow IT — The Hidden Risk

> **What is Shadow IT?** Using WhatsApp, personal Gmail, or Dropbox to send or store work files is called "Shadow IT." It bypasses company security controls entirely and can create a data breach without any attacker being involved.
>
> **Rule:** If a tool has not been approved by IT, do not use it for work. When in doubt, ask IT for an approved alternative.

> **Juice Jacking Warning:** Never plug your phone into a public USB charging port (airports, cafes). Use your own cable and charger, or a USB data blocker. Public charging ports can be rigged to transfer malware to your device.$$, 9)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- NEW SLIDE 10: Business Email Compromise & CEO Fraud
-- ============================================================

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0010-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Business Email Compromise & CEO Fraud', $$> **The Most Expensive Cyber Attack:** Business Email Compromise (BEC) — where attackers impersonate executives or trusted contacts — caused over **$2.9 billion in losses** in 2023 alone. It requires no malware, only deception.

## How BEC Works

1. **Research:** The attacker studies your company's org chart, key executives, and financial processes using LinkedIn and public sources
2. **Impersonation:** They create a fake email that closely resembles a real executive's address (e.g., CEO@cornpany.com instead of CEO@company.com)
3. **Urgency:** They send a high-pressure request — "Wire ₹50 lakhs immediately for a confidential acquisition. Do not discuss with anyone."
4. **Exploit:** The victim, intimidated by the sender's apparent seniority, bypasses normal approvals and transfers the funds

## Red Flags for CEO Fraud & BEC

- **Unusual Urgency:** "This must be completed today — do not go through the normal process"
- **Domain Spoofing:** The email address looks right at a glance but has a subtle typo (cornpany vs company)
- **Secrecy Demand:** Being told not to verify with colleagues or follow standard approval channels
- **Out-of-Character Request:** A payment or access request that would not normally come via email

> **The Golden Rule:** Any request to transfer money, share credentials, or bypass approvals — regardless of who it appears to come from — must be verified by **calling the sender on a known, pre-existing number**. Never reply to the suspicious email to verify.

## Other Social Engineering Techniques

| Attack | Method | Defense |
|---|---|---|
| Pretexting | Caller poses as IT support or auditor to extract credentials | IT will never ask for your password — hang up and call IT directly |
| Baiting | USB drives left in parking lots or common areas | Never plug in an unknown USB device |
| Tailgating | Attacker follows you through a secured door | Never hold the door for anyone you do not recognize — direct them to reception |
| Vishing | Phone call impersonating your bank or HR | Hang up; call the institution back on their official number |

## Your Verification Protocol

> 1. **Stop** — Do not act under pressure or urgency
> 2. **Verify** — Call the sender using a known number that predates this request
> 3. **Report** — Notify IT security even if the request turns out to be legitimate — the unusual pattern is worth flagging$$, 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- REPLACE WEAK QUIZ QUESTIONS WITH SCENARIO-BASED ONES
-- ============================================================

-- Q5 replacement: CEO fraud scenario (was spear phishing definition)

DELETE FROM public.answers  WHERE question_id = '00000002-0005-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000002-0005-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0005-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87',
        'You receive an email appearing to be from your CEO asking you to urgently transfer ₹40 lakhs to a new vendor before end of day — and to skip the usual approval process. What should you do?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000002-0005-0001-0001-000000000003', '00000002-0005-0002-0000-000000000002',
 'Transfer the funds immediately — it came from the CEO', false),
('00000002-0005-0002-0001-000000000003', '00000002-0005-0002-0000-000000000002',
 'Verify by calling the CEO on their known number, then report the email to IT security', true),
('00000002-0005-0003-0001-000000000003', '00000002-0005-0002-0000-000000000002',
 'Reply to the email asking for more details before acting', false),
('00000002-0005-0004-0001-000000000003', '00000002-0005-0002-0000-000000000002',
 'Forward to finance and let them decide', false);

-- Q6 replacement: IT impersonation call scenario (was social engineering definition)

DELETE FROM public.answers  WHERE question_id = '00000002-0006-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000002-0006-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0006-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87',
        'You receive a call from someone claiming to be from IT Support saying your account has been compromised and asking for your current password to restore access. What do you do?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000002-0006-0001-0001-000000000003', '00000002-0006-0002-0000-000000000002',
 'Provide your password — IT needs it to fix the issue', false),
('00000002-0006-0002-0001-000000000003', '00000002-0006-0002-0000-000000000002',
 'Refuse — IT will never ask for your password — and report the call to your real IT team', true),
('00000002-0006-0003-0001-000000000003', '00000002-0006-0002-0000-000000000002',
 'Give only your username, not your password', false),
('00000002-0006-0004-0001-000000000003', '00000002-0006-0002-0000-000000000002',
 'Create a new temporary password and share that instead', false);

COMMIT;
