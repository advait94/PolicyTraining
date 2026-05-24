-- Migration: Add CERT-In Directions (April 2022) content to security training modules
-- Affects:
--   1. Cybersecurity Awareness (a0c3c3d3-c9a1-447d-87ac-440c14484c87)
--      - Slide 2: Expand Legal Framework with full CERT-In Directions 2022 detail
--      - Slide 6: Expand Incident Response with CERT-In reportable incident types
--      - Q4: Replace definitional question with scenario-based CERT-In question
--      - Q11, Q12: New scenario questions on log retention and incident classification
--   2. Information Security Essentials (00000009-0001-0000-0000-000000000001)
--      - Slide 1: Add CERT-In to module coverage list
--      - Slide 7: Add CERT-In cross-reference to internal reporting
--      - Slide 8 (new): Dedicated CERT-In Directions 2022 slide
--      - Old Slide 8 → Slide 9 (renumber Key Takeaways)
--      - Q11, Q12: New scenario questions on CERT-In

BEGIN;

-- ============================================================
-- CYBERSECURITY AWARENESS: SLIDE 2 — LEGAL FRAMEWORK (EXPANDED)
-- ============================================================

DELETE FROM public.slides WHERE id = '00000002-0002-0001-0000-000000000001';

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0002-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Legal Framework', $$## The Information Technology Act, 2000 (IT Act)

The IT Act is India's primary law governing cybercrime and electronic commerce. It defines cyber offences and establishes the legal basis for incident reporting obligations.

### Key Sections

| Section | Offence / Obligation |
|---|---|
| **66C** | Identity theft — using another person's password or digital signature |
| **66D** | Cheating by impersonation using a computer resource |
| **66E** | Violation of privacy — capturing or publishing private images without consent |
| **70** | Unauthorised access to protected government systems |
| **70B** | Establishes CERT-In and mandates cybersecurity incident reporting |

> **Your Legal Exposure:** Employees can face personal fines or imprisonment under the IT Act for willful negligence or deliberate involvement in a cybercrime.

---

## CERT-In Directions, April 2022

On **28 April 2022**, the Indian Computer Emergency Response Team (CERT-In) issued binding directions under **Section 70B(6) of the IT Act, 2000**. These are among the strictest incident reporting obligations in the world.

### Who Must Comply

These directions apply to all:
- Body corporates and companies operating in India
- Government organisations
- Intermediaries (social media, e-commerce platforms)
- Data centres, cloud service providers
- VPN service providers
- Virtual asset (cryptocurrency) exchanges and wallets

### The 6-Hour Incident Reporting Rule

> **Critical:** When a cybersecurity incident is *noticed*, the organisation has **6 hours** to report it to CERT-In. This clock starts at the moment of discovery — not after investigation, not after confirmation.

This is **stricter than** the 72-hour window under India's DPDP Act, 2023 or the EU GDPR.

| Law | Reporting Window | Trigger |
|---|---|---|
| **CERT-In Directions 2022** | **6 hours** | From the time the incident is *noticed* |
| DPDP Act, 2023 | 72 hours (to Data Protection Board) | Confirmed personal data breach |
| EU GDPR | 72 hours | Confirmed personal data breach |

### The 20 Reportable Incident Types

CERT-In must be notified for **any** of these 20 incident categories:

| Category | Examples |
|---|---|
| **Unauthorised access** | Hacking, account takeover, insider access |
| **Data breach / theft** | Exfiltration of customer data, credentials, IP |
| **Ransomware** | Any ransomware infection, even if not paid |
| **Malicious code** | Viruses, worms, trojans, spyware on systems |
| **Denial of Service** | DoS or DDoS attacks on company infrastructure |
| **Website / social media defacement** | Unauthorised modification of public-facing sites |
| **Phishing / identity theft** | Targeted campaigns against company users or clients |
| **Business Email Compromise (BEC)** | Financial fraud via email impersonation |
| **Digital payment fraud** | Attacks on payment systems or transaction manipulation |
| **SCADA / ICS attacks** | Attacks on industrial control systems |
| **IoT device compromise** | Attacks via internet-connected devices |
| **Fake mobile apps** | Fraudulent apps impersonating company services |
| **Unauthorised social media access** | Compromise of official company accounts |
| **Cloud / data centre attacks** | Infrastructure-level intrusions |
| **Critical network scanning** | Systematic probing of critical infrastructure |

### Log Retention — 180 Days

> All organisations must retain **ICT system logs for a minimum of 180 days** (approximately 6 months). Logs must be stored **within India** and must be made available to CERT-In or law enforcement on demand.

This means: **Do not delete logs to free up disk space.** Always escalate to IT before any log deletion.

### NTP Clock Synchronisation

All ICT systems must synchronise their clocks with NTP servers operated by:
- **NIC** (National Informatics Centre), or
- **NPL** (National Physical Laboratory)

Accurate timestamps are essential for forensic investigations and for meeting the 6-hour reporting deadline.

### Point of Contact (POC)

Every organisation must designate a **Point of Contact (POC)** for CERT-In communications. Your IT Security team holds this role — which is one more reason to report incidents to them immediately.

### What You Must Report to CERT-In

When reporting an incident, CERT-In requires:
- Organisation name and sector
- IP addresses and system details involved
- Nature of the incident and when it was first noticed
- Actions already taken
- Estimated impact

> **Your role:** You provide the raw material for this report. The detail and speed of your internal report directly determines whether the company can meet its legal 6-hour deadline.

---

## Data Privacy Law — DPDP Act, 2023

India's **Digital Personal Data Protection Act, 2023** adds a parallel obligation:
- Personal data breaches must be reported to the **Data Protection Board** (72-hour window)
- Employees must report accidental exposure of personal data to the **DPO** immediately
- Consent and purpose limitation rules apply to all handling of personal data

> **Key distinction:** CERT-In Directions cover all cybersecurity incidents (not just personal data). DPDP covers only personal data breaches. A single incident can trigger both reporting obligations simultaneously.$$, 2)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;


-- ============================================================
-- CYBERSECURITY AWARENESS: SLIDE 6 — INCIDENT RESPONSE (EXPANDED)
-- ============================================================

DELETE FROM public.slides WHERE id = '00000002-0006-0001-0000-000000000001';

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0006-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Incident Response', $$## What is a Cyber Incident?

A cyber incident is any event that threatens the **confidentiality, integrity, or availability** of an information system or its data.

> **Common Examples:** Loss or theft of a laptop or mobile device. Suspicious login attempts or account lockouts. Unusual system performance or unexpected pop-ups. Clicking a phishing link or downloading a suspicious file. Receiving a ransomware message.

---

## Immediate Actions

If you suspect an incident, your first actions are critical to containing the threat.

- **Do Not Power Off:** Unless instructed, avoid shutting down your device — it may erase forensic evidence needed for investigation and legal reporting
- **Disconnect from Network:** Disconnect from Wi-Fi or unplug the network cable to prevent malware from spreading
- **Report Immediately:** Contact the IT Helpdesk and your manager as soon as possible — **within minutes, not hours**
- **Remain Discreet:** Do not discuss the incident on public or personal channels until IT has assessed it

---

## How to Report

> Use the following channels to report any security concerns:
> - **IT Helpdesk:** [support email]
> - **Security Portal:** internal.security.portal
> - **Manager:** Always keep your immediate supervisor informed

---

## The CERT-In 6-Hour Rule

> **Legal Obligation:** Under the CERT-In Directions issued on **28 April 2022**, your organisation has only **6 hours** from the moment an incident is *noticed* to report it to CERT-In. This clock starts at discovery — not after investigation or confirmation.

**Your prompt internal report is what makes legal compliance possible.** By the time IT confirms a breach, investigates, and drafts a CERT-In report, hours have already passed. Delayed employee reporting is the #1 reason organisations miss the 6-hour deadline.

### Which Incidents Trigger Mandatory CERT-In Reporting?

Any of the following require CERT-In notification within 6 hours of being noticed:

| Incident Type | What to Watch For |
|---|---|
| **Ransomware** | Files locked, ransom message on screen |
| **Data breach** | Unusual data access, files sent to unknown addresses |
| **Unauthorised access** | Unknown login locations, account lockouts |
| **Malicious code** | Unexpected programs, sluggish system, pop-ups |
| **DoS / DDoS attack** | Company website or services suddenly unreachable |
| **Website defacement** | Company website shows altered or malicious content |
| **Phishing campaign** | Mass suspicious emails targeting company users |
| **BEC / financial fraud** | Suspicious payment requests appearing to come from leadership |
| **Digital payment fraud** | Unusual transactions, payment gateway anomalies |
| **Fake mobile app** | Reports of fraudulent app impersonating the company |
| **Social media compromise** | Unauthorised posts on official company accounts |

> **Rule of thumb:** If it looks like someone got in, something got out, or a system went down unexpectedly — report it to IT immediately.

---

## What to Document

When you report an incident, capture as much of the following as you can — this is what CERT-In's mandatory report requires:

1. **When** did you first notice it? (exact time)
2. **What** did you see? (error message, email subject, ransom screen, unusual process)
3. **Which system(s)** are affected? (device name, application, IP if known)
4. **What did you do?** (clicked, downloaded, replied, disconnected)
5. **Who else** might be affected?

> **No Penalty for Honest Mistakes:** You will not be penalised for reporting an accidental click on a malicious link — provided you report it **promptly**. The only behaviour that attracts consequences is concealment or deliberate misconduct.$$, 6)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;


-- ============================================================
-- CYBERSECURITY AWARENESS: REPLACE Q4 (definitional → scenario-based)
-- ============================================================

DELETE FROM public.answers  WHERE question_id = '00000002-0004-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000002-0004-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0004-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87',
        'At 9 AM, your IT team discovers that the company''s server was accessed by an unknown IP address at 2 AM and customer records appear to have been exfiltrated. Under the CERT-In Directions (April 2022), by when must this incident be reported to CERT-In?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000002-0004-0001-0001-000000000004', '00000002-0004-0002-0000-000000000002',
 'By 3 PM the same day — within 6 hours of the 9 AM discovery', true),
('00000002-0004-0002-0001-000000000004', '00000002-0004-0002-0000-000000000002',
 'By 9 AM the next morning — 24 hours is the standard window', false),
('00000002-0004-0003-0001-000000000004', '00000002-0004-0002-0000-000000000002',
 'By 9 AM on the third day — 72 hours, same as GDPR', false),
('00000002-0004-0004-0001-000000000004', '00000002-0004-0002-0000-000000000002',
 'Only after the investigation is complete and the breach is confirmed', false);


-- ============================================================
-- CYBERSECURITY AWARENESS: Q11 — Log retention scenario
-- ============================================================

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0011-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87',
        'Your server is running low on disk space. A colleague suggests deleting system logs older than 3 months to free up storage — "Nothing important ever happened 3 months ago." Under the CERT-In Directions 2022, what is the problem with this?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000002-0011-0001-0001-000000000004', '00000002-0011-0002-0000-000000000002',
 'Nothing — 3 months is more than enough; CERT-In only requires 30 days of logs', false),
('00000002-0011-0002-0001-000000000004', '00000002-0011-0002-0000-000000000002',
 'CERT-In requires logs to be retained for at least 180 days (6 months) and stored within India — deleting them would violate the law', true),
('00000002-0011-0003-0001-000000000004', '00000002-0011-0002-0000-000000000002',
 'The problem is that the logs must be stored outside India, not deleted', false),
('00000002-0011-0004-0001-000000000004', '00000002-0011-0002-0000-000000000002',
 'There is no legal obligation on log retention; it is just good practice', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- CYBERSECURITY AWARENESS: Q12 — Incident classification scenario
-- ============================================================

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0012-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87',
        'Which of the following events requires mandatory reporting to CERT-In within 6 hours under the April 2022 Directions?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000002-0012-0001-0001-000000000004', '00000002-0012-0002-0000-000000000002',
 'A scheduled server maintenance window that caused 2 hours of downtime', false),
('00000002-0012-0002-0001-000000000004', '00000002-0012-0002-0000-000000000002',
 'Ransomware encrypting company files and displaying a ransom demand', true),
('00000002-0012-0003-0001-000000000004', '00000002-0012-0002-0000-000000000002',
 'A forgotten password that locked a user out of their account', false),
('00000002-0012-0004-0001-000000000004', '00000002-0012-0002-0000-000000000002',
 'A software update that temporarily broke a non-critical internal tool', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- INFORMATION SECURITY ESSENTIALS: SLIDE 1 — Add CERT-In to coverage list
-- ============================================================

UPDATE public.slides
SET content = '## Why Information Security Is Everyone''s Responsibility

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
6. Reporting security incidents
7. CERT-In Directions 2022 — India''s cybersecurity law
8. Key takeaways'
WHERE module_id = '00000009-0001-0000-0000-000000000001'
  AND sequence_order = 1;


-- ============================================================
-- INFORMATION SECURITY ESSENTIALS: SLIDE 7 — Add CERT-In cross-reference
-- ============================================================

UPDATE public.slides
SET content = '## Reporting Security Incidents

**Speed matters.** The faster an incident is reported, the more damage can be limited — and the more likely the company can meet its legal reporting obligations.

### What counts as a security incident

Under the CERT-In Directions (April 2022), these events require reporting to the Indian government within 6 hours. Report any of these to IT **immediately**:

- Clicking a phishing link or opening a suspicious attachment
- Receiving a suspicious call requesting login credentials
- Finding your account has been accessed from an unknown location
- Losing or having a device stolen
- Accidentally sending confidential data to the wrong recipient
- Noticing unusual behaviour on your computer (slowness, unknown programs, strange pop-ups)
- Receiving a ransomware message or finding files unexpectedly locked
- Any unusual financial transaction or payment request appearing to come from leadership (BEC)
- Suspected data exfiltration — unusual outbound file transfers or access to large volumes of data

> **Do not try to "fix it yourself" first.** Self-remediation often destroys evidence and can make containment harder.

### How to report

1. **Stop using the affected device** if you suspect it is compromised
2. **Call or message the IT Security team immediately** — do not email from the affected account
3. **Document what happened** — exact time you noticed it, what you saw, what you clicked
4. **Preserve evidence** — do not delete suspicious emails; forward them to IT first

### What happens next
- IT will assess and contain the incident
- You will be guided on next steps (password resets, device recovery, etc.)
- If the incident triggers CERT-In reporting requirements, **IT must file a report within 6 hours of discovery** — your prompt report is what makes this possible
- If personal data was exposed, the Privacy/DPO team will be notified under the DPDP Act (72-hour window)

---

> **You will not be punished for reporting a mistake honestly.** The only behaviour that invites consequences is deliberate misconduct or concealment.'
WHERE module_id = '00000009-0001-0000-0000-000000000001'
  AND sequence_order = 7;


-- ============================================================
-- INFORMATION SECURITY ESSENTIALS: Renumber old Slide 8 → Slide 9
-- ============================================================

UPDATE public.slides
SET sequence_order = 9
WHERE module_id = '00000009-0001-0000-0000-000000000001'
  AND sequence_order = 8;


-- ============================================================
-- INFORMATION SECURITY ESSENTIALS: NEW SLIDE 8 — CERT-In Directions 2022
-- ============================================================

INSERT INTO public.slides (module_id, sequence_order, title, content)
VALUES (
    '00000009-0001-0000-0000-000000000001',
    8,
    'CERT-In Directions 2022 — India''s Cybersecurity Law',
    '## CERT-In Directions 2022 — India''s Cybersecurity Law

India has one of the strictest cybersecurity incident reporting laws in the world. As an employee, understanding this law helps you see *why* speed matters when something goes wrong.

### What is CERT-In?

The **Indian Computer Emergency Response Team (CERT-In)** is the national agency under the Ministry of Electronics and Information Technology (MeitY) responsible for responding to cybersecurity incidents in India.

On **28 April 2022**, CERT-In issued binding directions under **Section 70B(6) of the IT Act, 2000** that apply to all organisations operating in India.

---

### The Core Obligations

| Requirement | What It Means |
|---|---|
| **6-hour incident reporting** | Any cybersecurity incident must be reported to CERT-In within **6 hours** of being noticed |
| **180-day log retention** | All ICT system logs must be kept for at least 6 months within India |
| **NTP clock synchronisation** | All systems must sync their clocks with NIC or NPL NTP servers |
| **Point of Contact (POC)** | Every organisation must designate a POC for CERT-In communications |
| **Reporting information** | Reports must include: time of discovery, systems affected, nature of incident, actions taken |

### 6 Hours — Stricter Than You Think

| Law | Reporting Window | What Triggers It |
|---|---|---|
| **CERT-In Directions 2022** | **6 hours** | Any cybersecurity incident, from time of *noticing* |
| DPDP Act, 2023 | 72 hours | Personal data breach only |
| EU GDPR | 72 hours | Personal data breach only |

> The 6-hour clock starts the moment the incident is *noticed* — not after investigation, not after confirmation of a breach. An employee reporting at 9 AM means the company must report to CERT-In by 3 PM the same day.

---

### What Must Be Reported to CERT-In

**20 incident types** require mandatory notification. Key categories relevant to you:

- **Ransomware** — any ransomware infection, even if contained
- **Unauthorised access** — hacking, account takeover, insider breach
- **Data breach** — customer, employee, or business data exfiltrated
- **Phishing / identity theft** — targeted campaigns against the company
- **Business Email Compromise (BEC)** — financial fraud via impersonation
- **Denial of Service (DoS/DDoS)** — company services made unavailable
- **Website or social media defacement** — unauthorised content changes
- **Digital payment fraud** — attacks on payment infrastructure
- **Malicious code** — virus, ransomware, spyware on company systems

---

### Log Retention — Do Not Delete Logs

> CERT-In requires organisations to maintain ICT system logs for **a minimum of 180 days**, stored within India, and available to CERT-In or law enforcement on request.

If you are ever asked to delete system logs or old audit trails — even to free disk space — **escalate to IT before taking any action**. Deleting required logs is a legal violation.

---

### Your Role in the 6-Hour Chain

```
You notice something suspicious
        ↓ (minutes)
You report to IT Security
        ↓ (IT investigates and confirms)
IT drafts and submits CERT-In report
        ↓ must be completed within
      6 hours of your initial notice
```

> **Every minute of delay in your internal report is a minute taken away from IT''s ability to comply with the law.** If you notice something at 9 AM and wait until 11 AM to report it, IT has only 4 hours left to investigate and file.

### The Bottom Line

- **Report immediately** — do not wait to see if it resolves itself
- **Do not delete logs** without IT approval
- **Document the time** you first noticed anything unusual — this is the legal timestamp
- **You are protected** — honest reporting of mistakes is encouraged and never penalised'
);


-- ============================================================
-- INFORMATION SECURITY ESSENTIALS: Q11 — CERT-In 6-hour chain scenario
-- ============================================================

INSERT INTO public.questions (id, module_id, text)
VALUES (
    '00000009-0011-0002-0000-000000000001',
    '00000009-0001-0000-0000-000000000001',
    'You notice at 8 AM that your computer has been behaving strangely overnight — files seem to have been accessed that you did not open. You decide to investigate yourself before reporting, and only tell IT at 2 PM after confirming something is wrong. What is the consequence of this delay under CERT-In Directions 2022?'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0011-0002-0000-000000000001', 'No consequence — IT still has time since the 6-hour clock starts when IT is notified, not when you noticed it', false),
('00000009-0011-0002-0000-000000000001', 'The company''s 6-hour CERT-In reporting window started at 8 AM — by delaying until 2 PM, you have left IT with no time to investigate and file the mandatory report by 2 PM', true),
('00000009-0011-0002-0000-000000000001', 'The 6-hour rule only applies to confirmed breaches, so investigating first is the right approach', false),
('00000009-0011-0002-0000-000000000001', 'Minor consequence — CERT-In allows a grace period if the employee was unaware of the law', false);


-- ============================================================
-- INFORMATION SECURITY ESSENTIALS: Q12 — Log retention scenario
-- ============================================================

INSERT INTO public.questions (id, module_id, text)
VALUES (
    '00000009-0012-0002-0000-000000000001',
    '00000009-0001-0000-0000-000000000001',
    'Your manager asks you to delete server access logs from 4 months ago to free up storage space. Under the CERT-In Directions (April 2022), what should you do?'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000009-0012-0002-0000-000000000001', 'Delete them — 4 months is long enough; CERT-In only requires 90 days', false),
('00000009-0012-0002-0000-000000000001', 'Decline and escalate to IT Security — CERT-In requires logs to be retained for at least 180 days (6 months), so deleting 4-month-old logs would violate the law', true),
('00000009-0012-0002-0000-000000000001', 'Delete them but keep a backup on a personal drive to be safe', false),
('00000009-0012-0002-0000-000000000001', 'Follow your manager''s instruction — the legal obligation falls on the company, not individual employees', false);

COMMIT;
