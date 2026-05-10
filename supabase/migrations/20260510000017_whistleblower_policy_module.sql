-- Migration: Whistleblower Policy & Speak-Up Culture module
-- Module ID: 00000008-0001-0000-0000-000000000001

BEGIN;

-- ─────────────────────────────────────────────
-- MODULE
-- ─────────────────────────────────────────────
INSERT INTO public.modules (id, title, description, sequence_order)
VALUES (
    '00000008-0001-0000-0000-000000000001',
    'Whistleblower Policy & Speak-Up Culture',
    'Learn how to raise concerns about misconduct, fraud, or policy violations — and understand the protections available to employees who speak up in good faith.',
    16
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- SLIDES
-- ─────────────────────────────────────────────
DELETE FROM public.slides WHERE module_id = '00000008-0001-0000-0000-000000000001';

INSERT INTO public.slides (module_id, sequence_order, title, content) VALUES

('00000008-0001-0000-0000-000000000001', 1, 'Why Speaking Up Matters',
'## Why Speaking Up Matters

A Whistleblower Policy gives every employee a safe, structured way to raise concerns about wrongdoing — without fear of punishment.

**Speaking up protects:**
- Your colleagues and workplace
- The company''s reputation and legal standing
- Customers, investors, and the public

> **The single biggest risk to any organisation is not the misconduct itself — it''s the silence around it.**

### What this module covers
1. What can be reported
2. How to report — available channels
3. Confidentiality and anonymity
4. Protection against retaliation
5. The investigation process
6. Good faith reporting vs. false allegations
7. Key takeaways'),

('00000008-0001-0000-0000-000000000001', 2, 'What Can Be Reported',
'## What Can Be Reported

The Whistleblower Policy covers any genuine concern about conduct that is **illegal, unethical, or in violation of company policy**.

### Reportable concerns include:

| Category | Examples |
|---|---|
| **Financial misconduct** | Fraud, falsified accounts, bribery, embezzlement |
| **Legal violations** | Breach of regulations, tax evasion, data protection failures |
| **Safety risks** | Concealed workplace hazards, tampering with safety records |
| **Conflicts of interest** | Undisclosed related-party dealings, misuse of position |
| **Harassment & discrimination** | Conduct covered by POSH or Code of Conduct |
| **Environmental violations** | Illegal dumping, falsified compliance certificates |

### What is NOT covered
- Personal grievances (salary disputes, performance appraisals, interpersonal conflicts) — these go through HR or the grievance process
- Concerns that are purely speculative with no factual basis

> **If in doubt, report it.** It is not your job to investigate — that is the company''s responsibility.'),

('00000008-0001-0000-0000-000000000001', 3, 'How to Report — Available Channels',
'## How to Report — Available Channels

You have multiple options. Use whichever you are most comfortable with.

### Reporting channels

**1. Ethics Hotline / Speak-Up Portal**
An independent, third-party managed channel. Available 24/7. Supports anonymous reporting.

**2. Company Secretary or Audit Committee**
For concerns involving financial integrity, regulatory compliance, or Board-level matters.

**3. HR Department**
Appropriate for concerns involving workplace conduct, policy violations, or people-related issues.

**4. Direct Manager (or their manager)**
Suitable when the concern does not involve your direct manager.

**5. External Regulators**
As a last resort, or when required by law — e.g., SEBI, MCA, or relevant statutory authorities.

---

### Tips for reporting effectively
- Be as specific as possible: **who, what, when, where**
- Attach supporting documents or evidence if you have them
- Note names of any witnesses
- Keep a copy of your report reference number

> You do **not** need to have proof before reporting — you only need a genuine, reasonable concern.'),

('00000008-0001-0000-0000-000000000001', 4, 'Confidentiality & Anonymity',
'## Confidentiality & Anonymity

### Named reports
When you report with your identity, the company can:
- Keep you informed about the investigation progress
- Ask follow-up questions to gather more detail
- Confirm the outcome to you where permissible

Your identity will be disclosed **only** to those who need to know to conduct the investigation, and only with your consent wherever possible.

### Anonymous reports
You may choose to report without identifying yourself.

> Anonymous reports are taken seriously and will be investigated — the absence of a name does not reduce the credibility of a well-documented concern.

**Limitations of anonymous reporting:**
- The investigator cannot follow up with you for more detail
- You cannot be updated on the outcome
- If the concern requires your testimony, investigation may be limited

### What confidentiality means in practice
- Your report is not shared with your manager or team
- It is not discussed in performance review contexts
- Breach of complainant confidentiality is itself a disciplinable offence'),

('00000008-0001-0000-0000-000000000001', 5, 'Protection Against Retaliation',
'## Protection Against Retaliation

Retaliation against an employee who raises a concern in good faith is **strictly prohibited** and constitutes a serious disciplinary offence — regardless of whether the concern is ultimately substantiated.

### What counts as retaliation

| Overt retaliation | Subtle retaliation |
|---|---|
| Termination or demotion | Being excluded from meetings |
| Transfer against your wishes | Reduced responsibilities |
| Negative performance review | Social isolation by colleagues |
| Threats or intimidation | Being passed over for promotion |

### What to do if you experience retaliation
1. Document it — dates, what was said, who was present
2. Report it immediately through the Ethics Hotline or HR
3. The alleged retaliator will be investigated separately from the original concern

### Legal protections
Under Indian law, employees of listed companies and their subsidiaries have statutory protections under:
- **Section 177 of the Companies Act, 2013** (Audit Committee must establish a vigil mechanism)
- **SEBI (Listing Obligations and Disclosure Requirements) Regulations** — listed entities must have a whistle-blower policy

> The company will take active steps to protect and, if necessary, reassign a reporter who faces risk of retaliation.'),

('00000008-0001-0000-0000-000000000001', 6, 'The Investigation Process',
'## The Investigation Process

When a concern is reported, a structured process follows:

### Stage 1 — Acknowledgement
- Report received and logged (reference number issued if named)
- Initial triage: is it within scope? Which function investigates?

### Stage 2 — Preliminary Review (typically within 5–7 working days)
- Review of available information
- Decision: proceed to full investigation, refer to HR/Legal, or close with rationale

### Stage 3 — Investigation
- Conducted by an independent person (Internal Audit, Legal, or external investigator)
- Interviews, document review, data analysis
- The subject of the complaint is given a fair opportunity to respond

### Stage 4 — Outcome & Action
- Findings documented
- Disciplinary action, process change, regulatory disclosure, or closure
- Reporter informed of outcome where permissible (named reporters only)

---

> **Investigations are confidential.** You should not discuss your report with colleagues during the process — this protects the integrity of the investigation and the people involved.

**Typical timeline:** Most investigations are concluded within **60 days**. Complex or multi-party matters may take longer, with the reporter notified of delays.'),

('00000008-0001-0000-0000-000000000001', 7, 'Good Faith vs. False Allegations',
'## Good Faith Reporting vs. False Allegations

### What "good faith" means
A report is made in **good faith** when you:
- Genuinely believe the concern is true based on what you know
- Are not using the process to settle a personal score
- Are not fabricating or distorting facts

You do **not** need to be 100% certain, and you will **not** be penalised if an investigation finds your concern was mistaken — as long as you reported honestly.

---

### False allegations
Deliberately filing a knowingly false or malicious report is a **serious disciplinary matter** and may result in:
- Disciplinary action up to and including termination
- Personal civil or criminal liability in extreme cases

### The distinction in practice

| Situation | Treatment |
|---|---|
| Genuine concern, investigation finds no wrongdoing | Reporter protected; concern closed |
| Genuine concern, concern is substantiated | Action taken against subject |
| Malicious report fabricated to harm a colleague | Reporter faces disciplinary action |

> The threshold is honesty, not accuracy. Raise the concern if you believe it — let the investigation determine the facts.'),

('00000008-0001-0000-0000-000000000001', 8, 'Key Takeaways',
'## Key Takeaways

### Your rights and responsibilities

**You have the right to:**
- Report concerns through any available channel
- Remain anonymous if you choose
- Be protected from retaliation for good-faith reports
- Be informed of investigation outcomes (named reporters)

**You have the responsibility to:**
- Report concerns you genuinely believe are valid
- Report accurately and honestly
- Not discuss ongoing investigations with colleagues
- Not use the process for personal grievances or malicious purposes

---

### Remember

> **Silence is not neutral.** If you know about wrongdoing and say nothing, you may be contributing to harm to colleagues, customers, and the organisation.

- You only need a reasonable belief — not proof
- The Ethics Hotline accepts anonymous reports at any time
- Retaliation is itself a disciplinable offence — report it immediately
- Investigations are confidential and conducted independently

---

**When in doubt, speak up. The system exists to protect you when you do.**');

-- ─────────────────────────────────────────────
-- QUESTIONS
-- ─────────────────────────────────────────────
DELETE FROM public.answers WHERE question_id::text LIKE '00000008-000%-0002-%';
DELETE FROM public.questions WHERE id::text LIKE '00000008-000%-0002-%';

-- Q1
INSERT INTO public.questions (id, module_id, text) VALUES
('00000008-0001-0002-0000-000000000001', '00000008-0001-0000-0000-000000000001',
'You notice that your manager has been approving expense claims for events that you know never took place. You are concerned about raising it directly with them. What should you do?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000008-0001-0002-0000-000000000001', 'Say nothing — it is not your responsibility and you could be wrong', false),
('00000008-0001-0002-0000-000000000001', 'Report it through the Ethics Hotline, HR, or directly to the Audit Committee — you do not need to confront your manager', true),
('00000008-0001-0002-0000-000000000001', 'Mention it informally to a colleague to see if they agree before doing anything', false),
('00000008-0001-0002-0000-000000000001', 'Wait to see if it continues before escalating', false);

-- Q2
INSERT INTO public.questions (id, module_id, text) VALUES
('00000008-0002-0002-0000-000000000001', '00000008-0001-0000-0000-000000000001',
'A colleague reports a concern through the Ethics Hotline. Their manager later gives them a poor performance review and removes them from a key project — two weeks after the report. This is best described as:');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000008-0002-0002-0000-000000000001', 'Acceptable management discretion', false),
('00000008-0002-0002-0000-000000000001', 'Possible retaliation — it should be reported immediately to HR or the Ethics Hotline as a separate matter', true),
('00000008-0002-0002-0000-000000000001', 'Only a problem if the colleague can prove the review was connected to the report', false),
('00000008-0002-0002-0000-000000000001', 'Not the company''s concern once the original report is closed', false);

-- Q3
INSERT INTO public.questions (id, module_id, text) VALUES
('00000008-0003-0002-0000-000000000001', '00000008-0001-0000-0000-000000000001',
'You suspect a colleague is submitting false invoices, but you are not 100% certain. You only have a feeling and have noticed some inconsistencies. Should you report it?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000008-0003-0002-0000-000000000001', 'No — you should only report when you have definitive proof', false),
('00000008-0003-0002-0000-000000000001', 'No — suspicions are not enough and you could get in trouble for a false report', false),
('00000008-0003-0002-0000-000000000001', 'Yes — you only need a genuine, reasonable belief based on what you have observed; the investigation will determine the facts', true),
('00000008-0003-0002-0000-000000000001', 'Only if you are personally affected by the misconduct', false);

-- Q4
INSERT INTO public.questions (id, module_id, text) VALUES
('00000008-0004-0002-0000-000000000001', '00000008-0001-0000-0000-000000000001',
'An employee files a whistleblower complaint against a senior director. The investigation concludes that the concern was not substantiated — no wrongdoing was found. What happens to the employee who raised the concern?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000008-0004-0002-0000-000000000001', 'They face disciplinary action for making a false allegation', false),
('00000008-0004-0002-0000-000000000001', 'They are protected — as long as the report was made honestly and in good faith, a mistaken concern does not invite punishment', true),
('00000008-0004-0002-0000-000000000001', 'They are transferred to avoid awkwardness with the director', false),
('00000008-0004-0002-0000-000000000001', 'Their name is disclosed to the director as part of closing the investigation', false);

-- Q5
INSERT INTO public.questions (id, module_id, text) VALUES
('00000008-0005-0002-0000-000000000001', '00000008-0001-0000-0000-000000000001',
'You want to report a concern but are worried about being identified. Which of the following is true?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000008-0005-0002-0000-000000000001', 'Anonymous reports are not investigated — the company needs to know who you are to act', false),
('00000008-0005-0002-0000-000000000001', 'You must give your name if reporting to HR, but can be anonymous on the Ethics Hotline only', false),
('00000008-0005-0002-0000-000000000001', 'Anonymous reports are accepted and taken seriously, though investigators cannot follow up with you for more detail', true),
('00000008-0005-0002-0000-000000000001', 'Anonymous reporters lose all legal protections against retaliation', false);

-- Q6
INSERT INTO public.questions (id, module_id, text) VALUES
('00000008-0006-0002-0000-000000000001', '00000008-0001-0000-0000-000000000001',
'Which of the following is NOT an appropriate subject for the Whistleblower Policy?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000008-0006-0002-0000-000000000001', 'A manager approving a vendor contract with a company in which they have an undisclosed interest', false),
('00000008-0006-0002-0000-000000000001', 'Falsification of safety inspection records', false),
('00000008-0006-0002-0000-000000000001', 'A disagreement with your performance rating or salary band', true),
('00000008-0006-0002-0000-000000000001', 'Evidence that financial statements have been manipulated', false);

-- Q7
INSERT INTO public.questions (id, module_id, text) VALUES
('00000008-0007-0002-0000-000000000001', '00000008-0001-0000-0000-000000000001',
'Under the Companies Act, 2013, which body is legally required to establish a vigil mechanism (whistleblower channel) for listed companies?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000008-0007-0002-0000-000000000001', 'The HR department', false),
('00000008-0007-0002-0000-000000000001', 'The MD or CEO', false),
('00000008-0007-0002-0000-000000000001', 'The Audit Committee under Section 177 of the Companies Act, 2013', true),
('00000008-0007-0002-0000-000000000001', 'The Internal Audit function', false);

-- Q8
INSERT INTO public.questions (id, module_id, text) VALUES
('00000008-0008-0002-0000-000000000001', '00000008-0001-0000-0000-000000000001',
'You reported a concern three weeks ago and have heard nothing. What is the most appropriate next step?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000008-0008-0002-0000-000000000001', 'Assume it has been ignored and tell colleagues about what you reported', false),
('00000008-0008-0002-0000-000000000001', 'Withdraw the report to avoid any further complications', false),
('00000008-0008-0002-0000-000000000001', 'Follow up using your report reference number through the same channel — investigations can take up to 60 days and you can ask for a status update', true),
('00000008-0008-0002-0000-000000000001', 'Go directly to an external regulator immediately', false);

-- Q9
INSERT INTO public.questions (id, module_id, text) VALUES
('00000008-0009-0002-0000-000000000001', '00000008-0001-0000-0000-000000000001',
'A colleague asks you what you know about a whistleblower complaint that is currently under investigation. You have some information. What should you do?');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000008-0009-0002-0000-000000000001', 'Share what you know — colleagues deserve to be informed', false),
('00000008-0009-0002-0000-000000000001', 'Share it only with close, trusted colleagues who won''t spread it further', false),
('00000008-0009-0002-0000-000000000001', 'Decline to discuss it — investigations are confidential and discussing them can compromise the process and harm the people involved', true),
('00000008-0009-0002-0000-000000000001', 'Report back to HR that your colleague was asking about the investigation', false);

-- Q10
INSERT INTO public.questions (id, module_id, text) VALUES
('00000008-0010-0002-0000-000000000001', '00000008-0001-0000-0000-000000000001',
'An employee deliberately files a whistleblower complaint they know to be false, intending to damage a colleague they dislike. Under the Whistleblower Policy, this employee:');
INSERT INTO public.answers (question_id, text, is_correct) VALUES
('00000008-0010-0002-0000-000000000001', 'Is protected — whistleblowers are always protected regardless of intent', false),
('00000008-0010-0002-0000-000000000001', 'Faces no consequences if the complaint is eventually dismissed', false),
('00000008-0010-0002-0000-000000000001', 'Faces disciplinary action up to termination, and potentially personal civil or criminal liability for knowingly making a false allegation', true),
('00000008-0010-0002-0000-000000000001', 'Is only penalised if the targeted colleague files a counter-complaint', false);

COMMIT;
