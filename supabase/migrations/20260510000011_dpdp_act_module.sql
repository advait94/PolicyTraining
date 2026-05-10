-- Migration: New module — Digital Personal Data Protection Act 2023
-- Module ID: 00000006-0000-0001-0000-000000000001
-- 10 slides, 10 questions
-- Sequence order: 35 (between Data Privacy and HSE)

BEGIN;

INSERT INTO public.modules (id, title, description, sequence_order)
VALUES (
    '00000006-0000-0001-0000-000000000001',
    'DPDP Act 2023 — A Complete Guide',
    'A deep-dive into India''s Digital Personal Data Protection Act 2023 — covering key definitions, consent requirements, Data Principal rights, children''s data protections, breach notification, and the Data Protection Board of India.',
    35
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SLIDES
-- ============================================================

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000006-0001-0001-0000-000000000001', '00000006-0000-0001-0000-000000000001', 'Overview — India''s Landmark Privacy Law', $$> **A New Era for Data Privacy in India:** The Digital Personal Data Protection Act, 2023 (DPDP Act) was enacted on **August 11, 2023**, making India one of the few countries with a comprehensive, dedicated data protection law.

## Background & Purpose

For years, India had no standalone privacy law. The DPDP Act was enacted to:

- Recognize the right to privacy as a fundamental right (affirmed by the Supreme Court in 2017)
- Create a clear framework for lawful, fair processing of personal data
- Balance individual privacy rights with the needs of a data-driven economy
- Establish accountability and meaningful enforcement through the Data Protection Board

> **Key Milestone:** India had been working on a data protection law since 2017. Earlier drafts — the PDP Bill 2019 and DPDPB 2022 — were withdrawn. The DPDP Act 2023 represents a streamlined, technology-neutral framework that finally reached the statute books.

## Who Does It Apply To?

1. **All Digital Personal Data:** Processing of personal data collected in digital form, or collected offline but subsequently digitized
2. **Territorial Scope:** Processing within India — AND processing outside India if it involves offering goods or services to individuals in India
3. **All Sectors:** Both private companies and government entities are covered, with limited exemptions

> **What Is NOT Covered:** Personal or domestic use. Data made publicly available by the individual themselves. Anonymized data that cannot identify any individual.

## What You Will Learn in This Module

1. Key definitions and who plays what role
2. The two lawful bases for processing data
3. What a valid Consent Notice looks like
4. Rights of Data Principals and how to respond
5. Special rules for children's data
6. Data breach notification obligations
7. Significant Data Fiduciary obligations
8. The Data Protection Board and its enforcement powers
9. Compliance obligations and real-world scenarios$$, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000006-0002-0001-0000-000000000001', '00000006-0000-0001-0000-000000000001', 'Key Definitions & Roles', $$## The Central Characters

Understanding who plays what role is the foundation of DPDP Act compliance.

### Data Principal
The **individual** whose personal data is being processed.

> **Example:** When a customer fills out your company's registration form, that customer is the **Data Principal**. Their name, phone number, and email address belong to them.

### Data Fiduciary
The entity — a company or individual — that **determines the purpose and means** of processing personal data.

> **Example:** Your company, by deciding to collect customer phone numbers for delivery notifications, is a **Data Fiduciary**. This comes with the full weight of legal obligations under the Act.

### Data Processor
An entity that processes personal data **on behalf of and under the instructions of** a Data Fiduciary.

> **Example:** A third-party email platform that sends marketing messages to your customers on your instructions is a **Data Processor**. They process data but do not decide why.

### Consent Manager
A new concept unique to the DPDP Act — a registered intermediary through which Data Principals can give, manage, review, and withdraw consent across multiple organizations through a single platform.

## Personal Data

> **Definition:** Any data about an identifiable individual. This is intentionally broad — a name, phone number, email address, IP address, location data, or any combination of data points that can identify a person qualifies as personal data.

## Significant Data Fiduciary

> **Higher Risk = Higher Obligations:** The Central Government may designate certain Data Fiduciaries as "Significant Data Fiduciaries" (SDFs) based on the volume and sensitivity of data they process, potential impact on sovereignty or national security, and risk to large numbers of individuals.
>
> SDFs face additional obligations including appointing a resident Data Protection Officer, undergoing independent audits, and conducting Data Protection Impact Assessments.$$, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000006-0003-0001-0000-000000000001', '00000006-0000-0001-0000-000000000001', 'Lawful Bases for Processing', $$## Two Lawful Bases Under the DPDP Act

Unlike GDPR's six lawful bases, the DPDP Act simplifies processing to essentially two legitimate grounds.

---

## 1. Consent

The Data Principal has given **free, specific, informed, and unambiguous consent** through a clear affirmative action.

> **What Consent Must Be:**
> - **Free:** No coercion, no conditions attached to basic services
> - **Specific:** Tied to a stated purpose — not blanket permission for "all future uses"
> - **Informed:** Accompanied by a clear Consent Notice explaining what is collected and why
> - **Unambiguous:** A deliberate affirmative act — NOT silence, NOT a pre-ticked box

---

## 2. Legitimate Uses

The Act permits processing without consent for specific, narrowly defined situations:

- **State functions:** Government entities providing subsidies, benefits, licences, or services
- **Legal compliance:** Processing required by any law in force in India
- **Medical emergency:** Responding to a life-threatening health emergency
- **Epidemic or disaster response:** During a notified disaster or public health emergency
- **Employment purposes:** Reasonable processing for employment obligations and safeguarding employer interests in relation to employees

> **Critical Limitation:** Legitimate uses is a **narrow, specific** category — it cannot be used as a general workaround to avoid obtaining consent. If your processing does not clearly fall into one of these categories, you need consent.

---

> **The Practical Rule:** When in doubt about which basis applies, obtain consent. It is always safer and demonstrates good faith with both individuals and regulators.$$, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000006-0004-0001-0000-000000000001', '00000006-0000-0001-0000-000000000001', 'The Consent Notice — Getting It Right', $$> **The Notice Comes First:** Before requesting consent, or simultaneously with the request, a Data Fiduciary must provide a **Consent Notice** to the Data Principal. No Notice = No valid consent.

## What the Consent Notice Must Contain

1. **Itemized Data List:** Every category of personal data being collected, clearly listed
2. **Specific Purpose:** The exact purpose for which each item will be processed — not vague assurances
3. **Rights Statement:** A clear explanation of the Data Principal's rights and how to exercise them
4. **Contact Details:** How to reach the Data Protection Officer and the Data Protection Board
5. **Language:** Available in English **and** any of the 22 languages listed in the Eighth Schedule of the Constitution, as requested by the individual

## Common Consent Mistakes

> **These Are NOT Valid Under the DPDP Act:**
> - Consent buried in paragraph 47 of your Terms & Conditions
> - Pre-ticked checkboxes ("I agree to receive marketing")
> - Implied consent from continued use of a service
> - Vague purposes like "to improve your experience" or "for better services"
> - Bundled consent where refusing marketing means you cannot use the core product

## Withdrawing Consent

> **As Easy to Withdraw as to Give:** The Act explicitly states this. A Data Principal who gave consent with a single click must be able to withdraw it with a single click.

Upon withdrawal of consent, the Data Fiduciary must:
1. **Stop processing** for that purpose immediately
2. **Delete the data** if there is no other lawful basis for retention
3. **Not penalize** the individual — do not degrade unrelated services as a consequence

> **Record Keeping:** Maintain records of all consents given — what was consented to, when, and through which mechanism. If challenged, you must be able to demonstrate that valid consent existed.$$, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000006-0005-0001-0000-000000000001', '00000006-0000-0001-0000-000000000001', 'Rights of Data Principals', $$> **Rights Are Enforceable:** These are not aspirational guidelines — Data Principals can complain directly to the Data Protection Board if their rights are not honored. The Board can impose significant penalties for failure to respond within prescribed timeframes.

## The Four Rights

### Right to Access Information
A Data Principal can request:
- A summary of all personal data you hold about them
- The identities of all Data Fiduciaries and Data Processors handling their data
- Contact information for your grievance redressal mechanism

### Right to Correction and Erasure
- **Correction:** Have inaccurate, incomplete, or outdated data corrected
- **Erasure:** Have data deleted when the purpose for which it was collected is served — the Right to be Forgotten

> **Processing Completes → Data Must Go:** Once you have fulfilled the purpose for which data was collected and no legal retention requirement exists, you must delete it. Indefinite retention is not permitted.

### Right to Grievance Redressal
Every Data Principal has the right to have complaints addressed by the Data Fiduciary's DPO. Unresolved complaints can be escalated to the Data Protection Board.

### Right to Nominate
A Data Principal can nominate another person to exercise their rights on their behalf in case of death or incapacity — a provision unique to the DPDP Act.

---

## How to Handle a Rights Request

> 1. **Do not attempt to fulfill it yourself** — forward to the DPO immediately
> 2. **Record the exact date and time** the request was received — timelines are strict and non-compliance is separately punishable
> 3. **Do not alter or delete any data** pending the DPO's assessment
> 4. **Maintain confidentiality** about the request and the individual$$, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000006-0006-0001-0000-000000000001', '00000006-0000-0001-0000-000000000001', 'Children''s Data — The Highest Standard', $$> **Maximum Protection for Minors:** The DPDP Act treats children's data as a special category requiring the strictest safeguards. Under the Act, a "child" is any person under **18 years of age**. Violations involving children's data attract penalties up to **₹200 Crore**.

## Verifiable Parental Consent

Before processing any personal data of a child, you must:

1. **Verify age** — confirm the user is under 18 through an appropriate age verification mechanism
2. **Obtain verifiable parental consent** — not just the child's own agreement, but consent from a parent or legal guardian
3. **Process parent's verification data minimally** — only to the extent necessary to verify the consent

> **A Simple Age Declaration Is Not Enough:** Asking "Are you over 18?" and accepting a yes-click does NOT constitute verification. Organizations need robust age verification mechanisms — the specific approved methods will be detailed in the Rules.

## Absolute Prohibitions for Children's Data

> **These Are NEVER Permitted When Processing Children's Data:**
> - Tracking or monitoring the behavior of children
> - Targeted advertising directed at children
> - Processing likely to have any detrimental effect on a child's wellbeing

## Limited Exemptions

The Central Government may exempt certain categories of Data Fiduciaries — such as healthcare providers treating children, or educational institutions — from specific requirements in appropriate circumstances.

## Practical Implications for Your Organization

- If your product or service **could be accessed by anyone under 18**, you need an age-gating mechanism
- Review all advertising targeting parameters to ensure minors are excluded
- Audit existing datasets for records that may have been collected from users who were under 18 at the time of collection
- Any new product involving potential child users must go through DPO review before launch$$, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000006-0007-0001-0000-000000000001', '00000006-0000-0001-0000-000000000001', 'Data Breach Notification', $$## What Constitutes a Data Breach?

Under the DPDP Act, a personal data breach is any event resulting in:
- Unauthorized access, use, disclosure, or copying of personal data
- Accidental or unauthorized destruction, modification, or loss of personal data

> **Common Examples:**
> - Sending a customer database to the wrong email recipient
> - Losing a laptop or USB drive containing unencrypted personal data
> - A cyberattack that exposes customer or employee records
> - An employee accessing records they have no business reason to view
> - A vendor suffering a breach that affects personal data you shared with them

## Two-Track Notification Obligation

The DPDP Act requires notification on two channels following a breach:

| Notify Whom | Content Required |
|---|---|
| **Data Protection Board** | Nature of breach, categories and volume of data affected, likely consequences, remediation steps taken |
| **Each Affected Data Principal** | Nature of data affected, potential harm to them, steps they can take to protect themselves |

> **Timelines:** The exact notification timelines will be prescribed by Rules (not yet finalized as of 2025). However, the obligation to notify exists now. **Internal escalation must happen immediately upon discovery — do not wait for the Rules.**

## Your Immediate Steps Upon Discovering a Breach

1. **Stop** the activity causing or enabling the breach, if possible
2. **Do not attempt to fix or hide it** — concealment compounds liability significantly
3. **Report immediately** to your DPO and line manager
4. **Document everything:** what happened, when, what data was involved, how many individuals affected, how the breach occurred
5. **Preserve all evidence** — do not delete logs, emails, or system records related to the incident

> **The No-Cover-Up Rule:** Attempting to conceal a breach from the Data Protection Board is a separate, independent violation. Early and honest reporting significantly reduces regulatory exposure — regulators treat cooperation very differently from concealment.$$, 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000006-0008-0001-0000-000000000001', '00000006-0000-0001-0000-000000000001', 'Significant Data Fiduciaries', $$## What Makes a "Significant" Data Fiduciary?

The Central Government may designate a Data Fiduciary as a **Significant Data Fiduciary (SDF)** based on:

- **Volume:** The scale of personal data being processed
- **Sensitivity:** Processing of sensitive categories of data
- **National Security:** Risk to sovereignty, integrity, or public order of India
- **Children's Data:** Volume of children's data processed
- **Impact on Rights:** Potential to affect the rights of large numbers of Data Principals

> **Who Is Likely?** Large social media platforms, major e-commerce companies, health data aggregators, fintech platforms, and organizations processing data of tens of millions of Indian users. The Government will publish an official list — monitor compliance channels for updates.

## Additional Obligations for SDFs

Organizations designated as SDFs must comply with a higher standard across four key areas:

### 1. Data Protection Officer (DPO)
- Must be a **senior employee** (key managerial personnel level)
- Must be **resident in India**
- Represents the organization before the Data Protection Board
- Serves as the primary contact for Data Principal grievances

### 2. Independent Data Auditor
A certified, independent auditor must periodically assess compliance with the Act and report findings.

### 3. Data Protection Impact Assessment (DPIA)
A formal, documented risk assessment must be conducted before initiating any new high-risk processing activity — identifying privacy risks and the controls in place to mitigate them.

### 4. Additional Standards
Further compliance standards and practices as prescribed by the Central Government from time to time.

> **Even If You Are Not an SDF:** Appointing a DPO and conducting periodic privacy impact assessments is considered best practice for any organization handling significant volumes of personal data.$$, 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000006-0009-0001-0000-000000000001', '00000006-0000-0001-0000-000000000001', 'The Data Protection Board of India', $$## India's New Privacy Regulator

The **Data Protection Board of India** is the independent quasi-judicial body established by the DPDP Act to adjudicate complaints and enforce compliance. It is distinct from existing regulators like TRAI or SEBI.

## How Complaints Reach the Board

> **The Escalation Path:**
> 1. A Data Principal experiences a violation or unresolved grievance
> 2. They first approach the Data Fiduciary's DPO for resolution
> 3. If unsatisfied, they file a complaint with the Data Protection Board
> 4. The Board examines the complaint and issues a notice to the Data Fiduciary
> 5. Both parties submit their responses and evidence
> 6. The Board issues a final order, which may include penalties and directions

## The Board's Enforcement Powers

- **Investigations:** Conduct inquiries into alleged violations, including calling for records
- **Penalties:** Impose financial penalties — these are cumulative per violation, not a single cap
- **Directions:** Order a Data Fiduciary to stop processing, delete data, or implement specific safeguards
- **Referrals:** Refer matters to law enforcement where criminal liability may exist

## Penalty Structure

| Violation | Maximum Penalty |
|---|---|
| Failure to implement security safeguards to prevent a breach | ₹250 Crore |
| Failure to notify the Board or Data Principals of a breach | ₹200 Crore |
| Non-fulfillment of children's data obligations | ₹200 Crore |
| Failure to honor Data Principal rights within prescribed timelines | ₹150 Crore |
| Non-compliance with Significant Data Fiduciary obligations | ₹150 Crore |
| General non-compliance with the Act | ₹50 Crore |

> **Appeals:** Orders of the Board can be appealed to the Telecom Disputes Settlement and Appellate Tribunal (TDSAT), and thereafter to the High Court.$$, 9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000006-0010-0001-0000-000000000001', '00000006-0000-0001-0000-000000000001', 'Compliance Checklist & Scenarios', $$> **From Awareness to Action:** DPDP Act compliance is not a one-time exercise — it is an ongoing operational commitment. Use this checklist as your practical day-to-day guide.

## Organizational Compliance Checklist

- **Data Mapping:** Know what personal data you collect, where it lives, who can access it, and how long it is retained
- **Consent Notices:** All notices are specific, plain-language, standalone, and available in required languages
- **Withdrawal Mechanism:** A simple, accessible consent withdrawal option exists for every consent point
- **DPO Designated:** A Data Protection Officer has been appointed and their contact details are accessible to Data Principals
- **Vendor DPAs:** Data Processing Agreements are signed with all third-party processors before data is shared
- **Breach Response Plan:** A documented internal procedure exists for detection, containment, and reporting of data breaches
- **Children's Safeguards:** Age verification or appropriate controls are implemented wherever minors could access your product
- **Rights Process:** A clear, documented process exists for receiving and responding to Data Principal rights requests

---

## Scenario 1: The Forgotten Database

**Situation:** Your marketing team has a database of 50,000 trade show leads collected 3 years ago. The stated purpose was to follow up within 3 months — but the database was never used.

> **Issue:** The purpose was fulfilled (or expired) 3 years ago. Retaining this data now violates storage limitation principles and the DPDP Act's deletion obligations.
>
> **Correct Action:** Review with the DPO. Delete all records for which no current, valid processing basis exists. Document the deletion.

---

## Scenario 2: The Unapproved Survey Tool

**Situation:** Your team wants to use a new overseas survey platform to collect customer feedback. No Data Processing Agreement has been signed with this vendor.

> **Issue:** Sharing personal data with any third-party processor without a DPA in place is a DPDP Act violation — regardless of where the vendor is located.
>
> **Correct Action:** Do not share data with this platform until IT, legal, and the DPO have approved it and a DPA is executed. Use an approved internal alternative in the interim.

---

> **Remember:** When you are unsure whether an action is compliant with the DPDP Act, the answer is always to stop and ask the DPO — not to proceed and hope for the best.$$, 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- QUESTIONS AND ANSWERS
-- ============================================================

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000006-0001-0002-0000-000000000002', '00000006-0000-0001-0000-000000000001',
        'Who is a "Data Fiduciary" under the DPDP Act 2023?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000006-0001-0001-0001-000000000003', '00000006-0001-0002-0000-000000000002', 'The individual whose personal data is being collected', false),
('00000006-0001-0002-0001-000000000003', '00000006-0001-0002-0000-000000000002', 'The entity that determines the purpose and means of processing personal data', true),
('00000006-0001-0003-0001-000000000003', '00000006-0001-0002-0000-000000000002', 'A government-appointed privacy officer', false),
('00000006-0001-0004-0001-000000000003', '00000006-0001-0002-0000-000000000002', 'A company that only stores data on behalf of others', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000006-0002-0002-0000-000000000002', '00000006-0000-0001-0000-000000000001',
        'Which of the following constitutes valid consent under the DPDP Act?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000006-0002-0001-0001-000000000003', '00000006-0002-0002-0000-000000000002', 'A pre-ticked checkbox in the sign-up form', false),
('00000006-0002-0002-0001-000000000003', '00000006-0002-0002-0000-000000000002', 'A clear affirmative action after reading a specific, plain-language consent notice', true),
('00000006-0002-0003-0001-000000000003', '00000006-0002-0002-0000-000000000002', 'Continued use of the website after a policy update', false),
('00000006-0002-0004-0001-000000000003', '00000006-0002-0002-0000-000000000002', 'A verbal agreement provided over a recorded call', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000006-0003-0002-0000-000000000002', '00000006-0000-0001-0000-000000000001',
        'Under the DPDP Act, what age defines a "child"?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000006-0003-0001-0001-000000000003', '00000006-0003-0002-0000-000000000002', 'Under 13 years of age', false),
('00000006-0003-0002-0001-000000000003', '00000006-0003-0002-0000-000000000002', 'Under 16 years of age', false),
('00000006-0003-0003-0001-000000000003', '00000006-0003-0002-0000-000000000002', 'Under 18 years of age', true),
('00000006-0003-0004-0001-000000000003', '00000006-0003-0002-0000-000000000002', 'Under 21 years of age', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000006-0004-0002-0000-000000000002', '00000006-0000-0001-0000-000000000001',
        'A customer contacts you requesting deletion of all their personal data. What is the correct immediate action?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000006-0004-0001-0001-000000000003', '00000006-0004-0002-0000-000000000002', 'Delete all their data immediately to resolve it quickly', false),
('00000006-0004-0002-0001-000000000003', '00000006-0004-0002-0000-000000000002', 'Forward to the DPO immediately and record the exact date and time received', true),
('00000006-0004-0003-0001-000000000003', '00000006-0004-0002-0000-000000000002', 'Decline — transaction data must be retained for 7 years', false),
('00000006-0004-0004-0001-000000000003', '00000006-0004-0002-0000-000000000002', 'Ask the customer to submit the request through a notarized letter', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000006-0005-0002-0000-000000000002', '00000006-0000-0001-0000-000000000001',
        'What is the maximum penalty for failure to implement adequate security safeguards to prevent a data breach?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000006-0005-0001-0001-000000000003', '00000006-0005-0002-0000-000000000002', '₹50 Crore', false),
('00000006-0005-0002-0001-000000000003', '00000006-0005-0002-0000-000000000002', '₹100 Crore', false),
('00000006-0005-0003-0001-000000000003', '00000006-0005-0002-0000-000000000002', '₹250 Crore', true),
('00000006-0005-0004-0001-000000000003', '00000006-0005-0002-0000-000000000002', '₹500 Crore', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000006-0006-0002-0000-000000000002', '00000006-0000-0001-0000-000000000001',
        'Your company is designated as a Significant Data Fiduciary. Which of the following new obligations is triggered?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000006-0006-0001-0001-000000000003', '00000006-0006-0002-0000-000000000002', 'Suspend all data processing pending a government audit', false),
('00000006-0006-0002-0001-000000000003', '00000006-0006-0002-0000-000000000002', 'Appoint a Data Protection Officer resident in India and undergo independent data audits', true),
('00000006-0006-0003-0001-000000000003', '00000006-0006-0002-0000-000000000002', 'Transfer all personal data to government-owned servers', false),
('00000006-0006-0004-0001-000000000003', '00000006-0006-0002-0000-000000000002', 'Obtain Supreme Court approval before processing sensitive data', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000006-0007-0002-0000-000000000002', '00000006-0000-0001-0000-000000000001',
        'A Data Principal withdraws their consent for receiving marketing communications. What must your company do?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000006-0007-0001-0001-000000000003', '00000006-0007-0002-0000-000000000002', 'Continue for 30 days as a standard grace period', false),
('00000006-0007-0002-0001-000000000003', '00000006-0007-0002-0000-000000000002', 'Stop processing for marketing immediately and delete data if no other lawful basis exists', true),
('00000006-0007-0003-0001-000000000003', '00000006-0007-0002-0000-000000000002', 'Require the withdrawal to be confirmed in writing before acting', false),
('00000006-0007-0004-0001-000000000003', '00000006-0007-0002-0000-000000000002', 'Restrict their account access until they re-confirm their preferences', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000006-0008-0002-0000-000000000002', '00000006-0000-0001-0000-000000000001',
        'Your company discovers a data breach at 9 AM. Internal systems show 2,000 customer records were exposed overnight. What is the correct sequence of actions?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000006-0008-0001-0001-000000000003', '00000006-0008-0002-0000-000000000002', 'Calculate the financial impact first, then decide whether notification is necessary', false),
('00000006-0008-0002-0001-000000000003', '00000006-0008-0002-0000-000000000002', 'Contain the breach if possible → report to DPO immediately → document everything thoroughly', true),
('00000006-0008-0003-0001-000000000003', '00000006-0008-0002-0000-000000000002', 'Fix the technical vulnerability first, then notify if the situation seems serious', false),
('00000006-0008-0004-0001-000000000003', '00000006-0008-0002-0000-000000000002', 'Wait for legal team to review before taking any action', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000006-0009-0002-0000-000000000002', '00000006-0000-0001-0000-000000000001',
        'A colleague proposes using the "legitimate uses" basis to process customer data without consent because getting consent "takes too long." What is wrong with this reasoning?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000006-0009-0001-0001-000000000003', '00000006-0009-0002-0000-000000000002', 'Nothing — legitimate uses is equivalent to consent under the Act', false),
('00000006-0009-0002-0001-000000000003', '00000006-0009-0002-0000-000000000002', 'Legitimate uses is a narrow, specific category — it cannot be used as a general substitute for consent', true),
('00000006-0009-0003-0001-000000000003', '00000006-0009-0002-0000-000000000002', 'The colleague is correct for B2B data — consent is only required for consumers', false),
('00000006-0009-0004-0001-000000000003', '00000006-0009-0002-0000-000000000002', 'Legitimate uses only applies to government entities, not private companies', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000006-0010-0002-0000-000000000002', '00000006-0000-0001-0000-000000000001',
        'Which of the following is absolutely prohibited when processing personal data of children under the DPDP Act?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000006-0010-0001-0001-000000000003', '00000006-0010-0002-0000-000000000002', 'Asking a parent to create an account on behalf of their child', false),
('00000006-0010-0002-0001-000000000003', '00000006-0010-0002-0000-000000000002', 'Behavioral monitoring and targeted advertising directed at children', true),
('00000006-0010-0003-0001-000000000003', '00000006-0010-0002-0000-000000000002', 'Displaying age-appropriate educational content to verified minors', false),
('00000006-0010-0004-0001-000000000003', '00000006-0010-0002-0000-000000000002', 'Collecting a child''s name and school name for an educational service with parental consent', false)
ON CONFLICT (id) DO NOTHING;

COMMIT;
