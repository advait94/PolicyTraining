-- Migration: POSH Act Training module content improvements
-- Changes:
--   1. Update slide 1 (intro) to correctly list all 12 slides
--   2. Fix slides 8–12: titles were shifted one position, content didn't match title
--      - Old slide 8 "Key Takeaways" (summary/CTA) moved to sequence 12 (end)
--      - Slide 8 now: "Inquiry Process: Steps & Timelines" (was titled "Roles & Responsibilities")
--      - Slide 9 now: "Roles & Responsibilities" (was titled "Consequences of Sexual Harassment")
--      - Slide 10 now: "Consequences of Sexual Harassment" (was titled "Prevention & Prohibition Measures")
--      - Slide 11 now: "Prevention & Prohibition Measures" (was titled "Key Takeaways & Q&A")
--      - Slide 12 now: "Key Takeaways" (the former slide 8 content, moved to end)
--   3. Reformat slides 8–11 with proper markdown (were dense raw paragraphs)
--   4. Replace Q1 (POSH acronym — trivial recall) with harassment recognition scenario
--   5. Replace Q8 (₹50,000 penalty trivia) with bystander response scenario

BEGIN;

-- ============================================================
-- UPDATE SLIDE 1: Reflect corrected 12-slide structure
-- ============================================================

DELETE FROM public.slides WHERE id = '00000005-0001-0001-0000-000000000001';

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0001-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Introduction to POSH Act', $$> **Training Objectives:** By the end of this training, you will understand the POSH Act, recognize all forms of sexual harassment, know exactly what to do if you experience or witness it, and understand how the complaint and inquiry process works.

## Why This Training Matters

Every employee has the right to work in an environment free from sexual harassment. The **Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013** (the POSH Act) provides a legal framework to address this. Compliance is a legal obligation — but more fundamentally, a safe workplace is everyone's responsibility.

> **Key Facts:**
> - Sexual harassment affects **productivity, morale, and well-being** of all employees
> - Organizations are **legally obligated** to prevent and address harassment
> - Non-compliance results in **fines and potential license cancellation**
> - The POSH Act covers every employee — permanent, contractual, intern, or trainee

## Who Should Take This Training?

This training is mandatory for **all employees**. Managers have additional obligations around prevention and early response. ICC members require a deeper understanding of inquiry procedures.

## What You Will Learn

1. **Definition:** What constitutes sexual harassment — including digital and non-verbal forms
2. **POSH Act:** Key provisions, scope, and who is covered
3. **ICC:** Role and composition of the Internal Complaints Committee
4. **Complaint Process:** How to file a complaint and what happens next
5. **Employer Duties:** What your organization is legally required to do
6. **Prevention:** Daily behaviors that build a respectful workplace
7. **Inquiry Process:** Step-by-step timeline from complaint to resolution
8. **Roles & Responsibilities:** What employers, ICC, and employees must each do
9. **Consequences:** What happens when harassment is proven — and when complaints are false
10. **Prevention Measures:** Policy, communication, and bystander intervention in practice
11. **Key Takeaways:** Your rights, reporting channels, and commitment

> **Zero Tolerance Policy:** The organization maintains a zero-tolerance policy towards sexual harassment. Any violation will be dealt with strictly in accordance with the Act and company policy.$$, 1);

-- ============================================================
-- FIX SLIDES 8–12: Delete old, reinsert with correct titles,
-- sequence, and reformatted content
-- ============================================================

DELETE FROM public.slides WHERE id IN (
    '00000005-0008-0001-0000-000000000001',
    '00000005-0009-0001-0000-000000000001',
    '00000005-0010-0001-0000-000000000001',
    '00000005-0011-0001-0000-000000000001',
    '00000005-0012-0001-0000-000000000001'
);

-- NEW SLIDE 8: Inquiry Process: Steps & Timelines
-- (Was slide 9 "Roles & Responsibilities" — wrong title; content is the inquiry process)

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0008-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Inquiry Process: Steps & Timelines', $$> **A Fair, Time-Bound Process:** The POSH Act sets strict timelines for every stage of the complaint process. These timelines exist to protect both the complainant and the respondent. Knowing them ensures no one's rights are delayed or ignored.

## Step 1 — Receiving the Complaint
**Within 7 working days**

The ICC receives the written complaint. If the complainant cannot write, the Presiding Officer must assist. Within 7 working days, the ICC serves a copy of the complaint to the respondent.

## Step 2 — Response from Respondent
**Within 10 working days**

The respondent submits a written response with supporting documents or witness names. Both parties are heard — this is a principle of natural justice.

## Step 3 — Conciliation (Optional)
**Section 10 — before inquiry begins**

> If the complainant requests it, the ICC may attempt conciliation before a formal inquiry. **Important: no monetary settlement is permitted in conciliation.** If successful, the ICC records the settlement and no further inquiry is conducted.

## Step 4 — Inquiry Proceedings
**Within 90 days — Section 11**

If conciliation does not happen or fails, a formal inquiry begins:

- Both parties present evidence and witnesses
- Cross-examination of the other party's witnesses is permitted
- **No legal practitioners** are allowed to represent either party in the inquiry
- The ICC has powers similar to a Civil Court for summoning witnesses and documents

## Step 5 — Inquiry Report
**Within 10 days of inquiry completion — Section 13**

The ICC prepares findings and recommendations:

- **Allegations proven:** recommends disciplinary action against the respondent
- **Allegations not proven:** recommends no action
- **Malicious complaint proven:** recommends action against the complainant (with safeguards — inability to prove is NOT the same as malice)

## Step 6 — Employer's Action
**Within 60 days of receiving the report — Section 13**

The employer must implement the ICC's recommendations. Actions include disciplinary action, compensation, transfer, or other appropriate measures.

## Interim Relief During Inquiry
**Section 12 — available during pendency**

The ICC may recommend the following while the inquiry is ongoing:

- Transfer the complainant or respondent to another workplace
- Grant the complainant additional leave (up to 3 months, separate from regular leave)
- Restrict the respondent from evaluating or supervising the complainant$$, 8);

-- NEW SLIDE 9: Roles & Responsibilities
-- (Was slide 10 "Consequences of Sexual Harassment" — wrong title; content is Roles & Responsibilities)

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0009-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Roles & Responsibilities', $$> **Three Distinct Sets of Obligations:** The POSH Act assigns specific duties to the employer, the ICC, and each individual employee. Understanding what is expected of you — and what to expect from the organization — is essential.

## Employer Responsibilities (Section 19)

- **Constitute ICC:** Form the ICC with the correct composition and ensure members are trained
- **Formulate Policy:** Develop an anti-sexual harassment policy and disseminate it widely
- **Provide a Safe Environment:** Take all necessary steps to prevent sexual harassment
- **Organize Awareness Programs:** Regular sensitization workshops for all employees and ICC members
- **Display Obligations:** Prominently display penal consequences and ICC details at the workplace
- **Provide Assistance:** Facilitate the ICC in conducting inquiries and enforcing recommendations
- **Act on Recommendations:** Implement ICC recommendations within 60 days
- **Annual Reporting:** Submit an annual report to the District Officer on complaints received and resolved

## ICC Responsibilities

- Maintain strict confidentiality throughout the process — identities of all parties must be protected
- Conduct fair, impartial, and timely inquiries based on the principles of natural justice
- Provide a supportive environment for complainants during the process
- Act strictly within the powers granted by the POSH Act
- Submit accurate and timely inquiry reports to the employer
- Support the employer in awareness and prevention programs

## Employee Responsibilities

> **Every employee has both rights and obligations under the POSH Act:**

- **Understand the Policy:** Be aware of what constitutes harassment and what the company policy says
- **Report Concerns:** Promptly report incidents you experience or witness — to the ICC or through HR
- **Cooperate with Inquiry:** If involved in a complaint, cooperate fully and honestly with the ICC
- **Respect Confidentiality:** Never disclose the identity of parties or details of proceedings
- **Promote Respect:** Treat every colleague with dignity — challenge inappropriate behavior when you see it
- **Do Not Retaliate:** Never take any adverse action against a complainant, respondent, or witness$$, 9);

-- NEW SLIDE 10: Consequences of Sexual Harassment
-- (Was slide 11 "Prevention & Prohibition Measures" — wrong title; content is Consequences)

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0010-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Consequences of Sexual Harassment', $$## For the Respondent — If Allegations Are Proven

The employer has discretion to implement any of the following, depending on severity:

- Written apology
- Warning, reprimand, or formal censure
- Withholding of promotion, increment, or pay raise
- Transfer to a different role or location
- Termination from service (for severe cases)
- Deduction from salary to pay compensation to the aggrieved person

> **Criminal Proceedings:** In serious cases — molestation, assault — separate criminal proceedings under the IPC can be initiated alongside the POSH inquiry. POSH and criminal law are not mutually exclusive.

> **Reputational Damage:** A harassment finding becomes part of the respondent's professional record, with lasting career consequences.

## For the Employer — Non-Compliance Penalties

> **Section 26 Penalties:**
> - **First non-compliance** (e.g., no ICC, failure to act on recommendations): Fine up to **₹50,000**
> - **Repeat non-compliance:** Fine doubled, and the employer's **business license or registration may be cancelled**

Beyond fines: public disclosure of non-compliance, loss of talent, legal exposure, and lasting damage to workplace culture.

## For False or Malicious Complaints

> **Important Safeguard:** If the ICC concludes that a complaint was made with malicious intent or that false evidence was provided knowingly, it may recommend action against the complainant. However, **inability to prove a complaint is NOT the same as malice.** The POSH Act protects genuine complainants from this provision being misused to deter reporting.

## Impact on Workplace Culture

Sexual harassment — and the failure to address it — has effects that go far beyond the individuals involved:

- Decreases morale, trust, and team cohesion
- Increases absenteeism and employee turnover
- Damages the organization's ability to attract and retain talent
- Undermines diversity and inclusion efforts
- Creates an environment where others stay silent out of fear$$, 10);

-- NEW SLIDE 11: Prevention & Prohibition Measures
-- (Was slide 12 "Key Takeaways & Q&A" — wrong title; content is Prevention measures)

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0011-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Prevention & Prohibition Measures', $$> **Prevention Requires Action Before a Complaint Is Filed:** A strong POSH policy and a responsive complaint process are necessary — but not sufficient. The workplace culture that makes harassment less likely to happen at all is built through consistent, proactive effort.

## What the Organization Must Do

- **Visible Leadership Commitment:** Management must champion zero tolerance — not just in policy documents but in behavior, tone, and the way complaints are handled
- **Clear POSH Policy:** Easily accessible, covering definitions, complaint procedure, ICC details, confidentiality, and non-retaliation
- **Regular Training:** Annual sensitization workshops for all employees; specialized training for ICC members and managers
- **Prominent Display:** POSH policy, ICC contact details, and penal consequences must be displayed at the workplace — not buried in an intranet folder
- **Internal Communication:** Regular reminders through email, team meetings, and new joiner onboarding

## What You Must Do — Every Day

> **Do's:**
> - Treat every colleague with respect — be conscious of words, actions, and non-verbal behavior
> - Respect personal space and physical boundaries
> - Seek explicit consent for physical contact — do not assume
> - Apply the same standards to digital communication (WhatsApp, email, social media)
> - Speak up if a colleague looks uncomfortable or distressed

> **Don'ts:**
> - Never make sexually colored remarks, jokes, or comments on appearance
> - Never share or display sexually explicit material — including forwarding messages "as a joke"
> - Never touch a colleague without consent
> - Never retaliate against someone who reported a concern — even informally

## Bystander Intervention — The 5 D's

If you witness potential harassment, you do not have to intervene in a way that puts you at risk. Use the 5 D's:

- **Direct:** Address the situation directly if it is safe to do so
- **Distract:** Create an interruption — change the subject, call the person away
- **Delegate:** Involve a manager, HR, or ICC member
- **Document:** Record what you witnessed — date, time, what was said or done
- **Delay:** Check in privately with the affected person afterwards — "Are you okay?"

> **You Are Not a Bystander by Choice:** Witnessing harassment and saying nothing sends a signal that the behavior is acceptable. Intervention — even minor — changes that dynamic.$$, 11);

-- NEW SLIDE 12: Key Takeaways
-- (Was slide 8 — the original "Ready for Assessment" slide, moved to the end)

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0012-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Key Takeaways', $$> **You Have Completed the Training.** Carry these principles with you every day — not just when answering an assessment.

## Core Principles to Remember

1. **Legal Mandate:** The POSH Act is a legal requirement. Every organization with 10+ employees must have an ICC. Non-compliance has serious consequences.
2. **Broad Definition:** Sexual harassment includes unwelcome physical, verbal, non-verbal, and digital conduct of a sexual nature. Intent is irrelevant — what matters is how the recipient experienced it.
3. **Zero Tolerance:** The organization maintains a zero-tolerance policy. This applies equally to employees, contractors, interns, and visitors.
4. **Report — Don't Wait:** Whether you are the person affected or a witness, report to the ICC or HR. Early reporting protects everyone.
5. **Confidentiality Is Protected:** Your identity and the proceedings are kept confidential. Retaliation against complainants is prohibited by law.
6. **Your Responsibility:** A respectful workplace is not built by policy alone — it is built by each person's daily choices about how they speak, act, and respond.

## Key Timelines

| Stage | Timeline |
|---|---|
| Complaint filing deadline | Within **3 months** of the incident (extendable by 3 months) |
| Inquiry completion | Within **90 days** of complaint receipt |
| ICC report submission | Within **10 days** of inquiry completion |
| Employer action on report | Within **60 days** of receiving ICC report |

## Reporting Channels

> **How to Report:**
> - **ICC:** Contact the Presiding Officer or any ICC member directly — details are displayed in the office
> - **HR Department:** Your HR representative can guide you through the process
> - **Anonymous Reporting:** Ethics hotline available 24/7 for anonymous reporting

> **Ready for Assessment:** A score of 70% or higher is required to pass and receive your certificate.$$, 12);

-- ============================================================
-- REPLACE WEAK QUIZ QUESTIONS WITH SCENARIO-BASED ONES
-- ============================================================

-- Q1 replacement: harassment recognition scenario
-- (was "What does POSH stand for?" — pure acronym recall)

DELETE FROM public.answers  WHERE question_id = '00000005-0001-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000005-0001-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0001-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc',
        'A colleague sends a meme with sexually suggestive content to the team WhatsApp group. When others look uncomfortable, he says "relax, it''s just a joke — I sent it to everyone, not just you." Does this constitute sexual harassment under the POSH Act?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000005-0001-0001-0001-000000000003', '00000005-0001-0002-0000-000000000002',
 'No — it was sent to everyone, so it cannot be directed harassment', false),
('00000005-0001-0002-0001-000000000003', '00000005-0001-0002-0000-000000000002',
 'No — digital messages are not covered under the POSH Act', false),
('00000005-0001-0003-0001-000000000003', '00000005-0001-0002-0000-000000000002',
 'Yes — unwelcome sexually suggestive conduct, including digital messages, constitutes sexual harassment regardless of whether it was "meant as a joke"', true),
('00000005-0001-0004-0001-000000000003', '00000005-0001-0002-0000-000000000002',
 'Only if the recipient files a formal objection in writing first', false);

-- Q8 replacement: bystander response scenario
-- (was "What is the penalty for employer''s first non-compliance?" — penalty amount trivia)

DELETE FROM public.answers  WHERE question_id = '00000005-0008-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000005-0008-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0008-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc',
        'You overhear a manager say to a junior colleague: "I''m deciding who gets the new project — let''s discuss it over dinner, just the two of us." The junior colleague looks visibly uncomfortable and changes the subject. What should you do?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000005-0008-0001-0001-000000000003', '00000005-0008-0002-0000-000000000002',
 'Do nothing — it could be an innocent business dinner and is not your concern', false),
('00000005-0008-0002-0001-000000000003', '00000005-0008-0002-0000-000000000002',
 'Check in privately with your colleague, and encourage them to report to the ICC or HR if they felt uncomfortable — you can also report what you witnessed', true),
('00000005-0008-0003-0001-000000000003', '00000005-0008-0002-0000-000000000002',
 'Immediately confront the manager in front of the team', false),
('00000005-0008-0004-0001-000000000003', '00000005-0008-0002-0000-000000000002',
 'Wait to see if it happens again before taking any action', false);

COMMIT;
