-- Migration: Data Privacy & Protection module content improvements
-- Changes:
--   1. Update slide 1 (intro) to list all 10 slides
--   2. Add slide 9: Consent in Practice
--   3. Add slide 10: Sharing Data with Third Parties
--   4. Replace Q5 (Right to Erasure name - pure recall) with data deletion request scenario
--   5. Replace Q6 (Data Minimization definition) with "just in case" data collection scenario
--   6. Replace Q9 (penalty amount trivia) with accidental disclosure scenario

BEGIN;

-- ============================================================
-- UPDATE SLIDE 1: Reflect expanded 10-slide structure
-- ============================================================

DELETE FROM public.slides WHERE id = '00000003-0001-0001-0000-000000000001';

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000003-0001-0001-0000-000000000001', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Introduction - Why Data Privacy Matters', $$> **Training Objectives:** By the end of this training, you will understand data privacy fundamentals, DPDP Act requirements, your responsibilities in protecting personal data, how to handle consent, and what to do when things go wrong.

## The Digital Age and Data

In today's interconnected world, data is a **valuable asset**. Personal data is constantly being collected, stored, processed, and shared — from governments and businesses to social media platforms.

> **Why Data Privacy Matters:**
> - **Protect Individuals:** Misuse of personal data leads to identity theft, financial fraud, and discrimination
> - **Maintain Trust:** Customers and employees trust organizations with their data; breaches destroy that trust permanently
> - **Legal Compliance:** India's DPDP Act 2023 imposes penalties up to ₹250 Crore per violation
> - **Business Reputation:** A data breach is front-page news — and the damage lasts years

## Who Needs This Training?

This training is mandatory for all employees who handle personal data in any form — digital or physical.

- **Understand Fundamentals:** The difference between data privacy and data protection
- **Indian Framework:** Your obligations under the DPDP Act 2023
- **Everyday Practice:** How to handle consent, requests, and breaches correctly

## What You Will Learn

1. **Legal Framework:** DPDP Act 2023 and global standards
2. **Data Principles:** Purpose limitation and data minimization
3. **Data Subjects' Rights:** Access, correction, and erasure
4. **Breach Management:** Identification and reporting obligations
5. **International Transfers:** Managing data across borders
6. **Consequences:** Financial and reputational impacts
7. **Best Practices:** Privacy by design and daily habits
8. **Consent in Practice:** What valid consent looks like and how to handle withdrawal
9. **Third-Party Data Sharing:** Due diligence and children's data protections$$, 1);

-- ============================================================
-- NEW SLIDE 9: Consent in Practice
-- ============================================================

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000003-0009-0001-0000-000000000001', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Consent in Practice', $$> **Consent Is Not a Checkbox:** Valid consent under the DPDP Act must be free, specific, informed, and unambiguous. A pre-ticked box, a clause buried in terms and conditions, or silence are NOT valid consent — no matter how common they are.

## What a Valid Consent Notice Must Include

1. **Itemized List:** Every category of personal data being collected, listed clearly
2. **Specific Purpose:** The exact reason each item of data is needed — not vague statements like "to improve our services"
3. **Rights Summary:** A plain-language statement of the Data Principal's rights, including the right to withdraw
4. **Contact Details:** How to reach the Data Protection Officer for questions or complaints

## How Consent Must Be Obtained

- **Separate and Standalone:** Consent cannot be bundled with other agreements or terms of service
- **Plain Language:** Written in clear, simple language — not legal jargon
- **Affirmative Action:** Requires a deliberate act — clicking "I Agree" on a clear, specific notice. NOT a pre-ticked box

> **What Does NOT Count as Valid Consent:**
> - Continued use of a service
> - Silence or inaction
> - A pre-ticked checkbox
> - Consent buried in the 47th paragraph of your Terms & Conditions

## Withdrawing Consent

> **As Easy to Withdraw as to Give:** The DPDP Act explicitly requires that withdrawing consent must be as easy as giving it. If consent was given via a single click, a single click must be available to withdraw it.

When a Data Principal withdraws consent, you must:
- Stop processing their data for the consented purpose immediately
- Delete their data if no other lawful basis for retention exists
- Not penalize the individual — do not degrade unrelated services as retaliation

## Children's Consent

> **Special Rule for Under-18:** Processing personal data of anyone under 18 requires **verifiable parental consent** — not just the child's own agreement. The DPDP Act additionally prohibits:
> - Behavioral monitoring of children
> - Targeted advertising directed at children
> - Any processing likely to cause detrimental effect on a child's wellbeing

If your product or service could be accessed by minors, discuss age-gating requirements with the DPO immediately.$$, 9)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- NEW SLIDE 10: Sharing Data with Third Parties
-- ============================================================

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000003-0010-0001-0000-000000000001', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Sharing Data with Third Parties', $$> **You Remain Responsible:** When you share personal data with a vendor, partner, or service provider, the company remains responsible for ensuring that data is protected. A breach at a vendor's end is still your breach — legally and reputationally.

## Before Sharing Any Personal Data with a Third Party

1. **Assess the Need:** Is there a genuine business purpose? Apply data minimization — share only what is strictly necessary
2. **Verify the Recipient:** Confirm the vendor has adequate data protection practices in place
3. **Ensure a DPA Exists:** A Data Processing Agreement must be signed before any personal data is transferred
4. **Confirm Rights Coverage:** The processor must be able to honor Data Principal rights on your behalf

## What a Data Processing Agreement Must Cover

- The categories of personal data being shared
- The specific purpose and processing instructions
- Security measures the processor must implement
- Prohibition on sub-processing without prior written consent
- Data deletion or return obligations at the end of the relationship
- Breach notification — the processor must inform you promptly so you can notify the Board

> **Red Flag:** If a vendor refuses to sign a DPA, or their privacy practices are unclear or undocumented, do not share personal data with them. Escalate to the DPO before proceeding.

## Your Day-to-Day Obligations

> **Practical Rules:**
> - Never email a customer database, employee list, or any file containing personal data to an external party without confirming a DPA is in place
> - Never upload personal data to a third-party tool — survey platforms, analytics dashboards, collaboration tools — without IT and legal approval
> - If you discover personal data has been shared without a DPA, treat it as a potential breach and report it to the DPO immediately

## Children's Data — Extra Caution with Third Parties

> Processing or sharing children's data (under 18) with any third party carries penalties up to **₹200 Crore** under the DPDP Act. Any third party receiving children's data must have specific, documented safeguards in place — this must be verified before transfer, not assumed.$$, 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- REPLACE WEAK QUIZ QUESTIONS WITH SCENARIO-BASED ONES
-- ============================================================

-- Q5 replacement: data deletion request scenario (was "Right to Erasure = Right to be Forgotten" - pure recall)

DELETE FROM public.answers  WHERE question_id = '00000003-0005-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000003-0005-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0005-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b',
        'A former customer emails your company asking you to delete all records of their account and purchase history. What is the correct response?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000003-0005-0001-0001-000000000003', '00000003-0005-0002-0000-000000000002',
 'Ignore it — you need transaction records for your own purposes', false),
('00000003-0005-0002-0001-000000000003', '00000003-0005-0002-0000-000000000002',
 'Forward the request to the DPO immediately and note the exact date and time received — strict timelines apply', true),
('00000003-0005-0003-0001-000000000003', '00000003-0005-0002-0000-000000000002',
 'Delete the data yourself right away to be helpful', false),
('00000003-0005-0004-0001-000000000003', '00000003-0005-0002-0000-000000000002',
 'Ask the customer to submit the request in person at your office', false);

-- Q6 replacement: "just in case" data collection scenario (was Data Minimization definition)

DELETE FROM public.answers  WHERE question_id = '00000003-0006-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000003-0006-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0006-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b',
        'Your team is designing a new customer registration form. A colleague suggests adding date of birth and home address fields "just in case we need them for future analytics." What should you flag?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000003-0006-0001-0001-000000000003', '00000003-0006-0002-0000-000000000002',
 'Add the fields — more data always gives better analytics options', false),
('00000003-0006-0002-0001-000000000003', '00000003-0006-0002-0000-000000000002',
 'This violates data minimization — only collect data that is necessary for the specific, stated purpose at the time of collection', true),
('00000003-0006-0003-0001-000000000003', '00000003-0006-0002-0000-000000000002',
 'Make the fields optional — that makes collection acceptable', false),
('00000003-0006-0004-0001-000000000003', '00000003-0006-0002-0000-000000000002',
 'It is fine as long as the privacy policy mentions these fields somewhere', false);

-- Q9 replacement: accidental disclosure scenario (was ₹250 Crore penalty trivia)

DELETE FROM public.answers  WHERE question_id = '00000003-0009-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000003-0009-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0009-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b',
        'A colleague accidentally emails a spreadsheet containing 500 customers'' names and phone numbers to the wrong recipient. They are embarrassed and want to handle it quietly. What should they do?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000003-0009-0001-0001-000000000003', '00000003-0009-0002-0000-000000000002',
 'Ask the wrong recipient to delete the email and hope nothing further happens', false),
('00000003-0009-0002-0001-000000000003', '00000003-0009-0002-0000-000000000002',
 'Report it immediately to the DPO — even accidental disclosures are reportable data breaches', true),
('00000003-0009-0003-0001-000000000003', '00000003-0009-0002-0000-000000000002',
 'Wait to see if any customers complain before taking any action', false),
('00000003-0009-0004-0001-000000000003', '00000003-0009-0002-0000-000000000002',
 'Delete the sent email from the server to remove evidence of the mistake', false);

COMMIT;
