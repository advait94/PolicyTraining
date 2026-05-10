-- Migration: Seed HTML-converted training modules
-- Generated: 2026-05-10
-- Modules: Anti-Corruption & Anti-Bribery, Cybersecurity Awareness, Data Privacy & Protection,
--          Health Safety & Environment (HSE), POSH Act Training
-- Using fixed UUIDs for idempotent re-runs (ON CONFLICT DO NOTHING)
-- Dollar-quoting ($$) used for slide content to safely handle special characters

BEGIN;

-- ============================================================
-- MODULE 1: Anti-Corruption & Anti-Bribery
-- Module ID: b91198d4-8edc-40fc-b30e-3f5ddaeecd66
-- ============================================================

INSERT INTO public.modules (id, title, description, sequence_order)
VALUES ('b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Anti-Corruption & Anti-Bribery', 'Understanding the legal framework, recognizing corruption red flags, and knowing how to report concerns in compliance with Indian and international anti-corruption laws.', 10)
ON CONFLICT (id) DO NOTHING;

-- Slides for Anti-Corruption & Anti-Bribery

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000001-0001-0001-0000-000000000001', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Introduction - Why Anti-Corruption Training Matters', $$> **Training Objectives:** By the end of this training, you will understand the legal framework, recognize corruption red flags, and know how to report concerns.

## Why This Training Matters

Corruption undermines fair competition, damages reputations, and can result in severe legal consequences for both individuals and organizations. India and many other countries have enacted strict laws to combat bribery and corruption.

> **Key Statistics:** Corruption costs the global economy over **$2.6 trillion annually**. Companies involved in corruption scandals lose an average of **50% of their market value**. Individual employees can face **imprisonment and heavy fines**.

## Who Needs This Training?

This training is mandatory for all employees, regardless of role or seniority. Corruption can occur at any level, and everyone has a responsibility to act with integrity.

- **All Employees:** Everyone must understand ethical obligations
- **Managers:** Lead by example and enforce policies
- **Third Parties:** Vendors and partners must comply too

## What You Will Learn

1. **Legal Framework:** Indian and international anti-corruption laws
2. **Types of Corruption:** Bribery, kickbacks, facilitation payments
3. **Red Flags:** Warning signs to watch for
4. **Company Policies:** Our internal compliance requirements
5. **Reporting:** How to report concerns safely
6. **Consequences:** Penalties for non-compliance
7. **Best Practices:** How to stay compliant$$, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000001-0002-0001-0000-000000000001', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Legal Framework', $$## The Prevention of Corruption Act, 1988 (PCA)

The PCA is India's primary legislation for combating corruption. It applies to public servants and those who bribe them.

> **Key Provisions of PCA:** The Act criminalizes both giving and receiving bribes, with penalties including imprisonment and fines.

### Who is Covered?

- **Public Servants:** Government officials, employees of public sector undertakings
- **Private Parties:** Any person who gives or offers a bribe to a public servant
- **Commercial Organizations:** Companies can be held liable for bribery by employees

### Penalties Under PCA

> - **Bribery:** Imprisonment of 3-7 years and fine
> - **Habitual Offenders:** Enhanced punishment
> - **Commercial Organizations:** Can face prosecution and penalties

## US Foreign Corrupt Practices Act (FCPA)

The FCPA applies to any company with US connections (listed on US exchanges, has US operations, or uses US banking system).

> **FCPA Reach:** The FCPA has extra-territorial jurisdiction. Indian companies with US business ties can be prosecuted for corrupt acts anywhere in the world.

### FCPA Key Elements

- **Anti-Bribery:** Prohibits bribing foreign officials to obtain/retain business
- **Books & Records:** Requires accurate and transparent accounting records
- **Internal Controls:** Mandates effective internal compliance controls

## UK Bribery Act, 2010

One of the strictest anti-corruption laws globally. It applies to UK companies and any company doing business in the UK.

> **UK Bribery Act - Strict Liability:** Unlike other laws, the UK Bribery Act creates a corporate offense for "**failure to prevent bribery**" - companies must prove they had adequate procedures in place.

### Key Features

- **No "Facilitation Payments" Exception:** Even small payments are prohibited
- **Both Public and Private Sector:** Covers bribery of private individuals too
- **Unlimited Fines:** No cap on financial penalties
- **Imprisonment:** Up to 10 years for individuals

> **Adequate Procedures Defense:** Companies can defend themselves by demonstrating they had adequate procedures in place to prevent bribery. This is why compliance training is so important!$$, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000001-0003-0001-0000-000000000001', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Types of Corruption', $$## What is Bribery?

> **Definition:** Bribery is offering, giving, receiving, or soliciting something of value to influence the actions of an official or other person in a position of authority.

### Forms of Bribery

- **Cash Payments:** Direct monetary payments or gifts
- **Gifts & Entertainment:** Lavish gifts, trips, expensive dinners
- **Employment Offers:** Jobs for relatives or associates
- **Benefits in Kind:** Use of assets, services, or favors

## Kickbacks

A kickback is a form of bribery where a portion of the money received in a transaction is returned to the person who facilitated or awarded the contract.

> **Example:** A procurement manager awards a contract to Vendor A at an inflated price. Vendor A then secretly pays back 10% of the contract value to the procurement manager.

## Facilitation Payments

> **Also Known As "Grease Payments":** Small, unofficial payments made to speed up routine government actions (permits, licenses, customs clearance). While some jurisdictions have limited exceptions, many laws (including UK Bribery Act) prohibit them entirely.

## Conflicts of Interest

A conflict of interest occurs when personal interests could improperly influence professional judgment or actions.

### Examples:

- Awarding contracts to companies owned by family members
- Having a financial stake in a competing business
- Making decisions that benefit a personal relationship
- Accepting outside employment that conflicts with job duties

## Fraud & Embezzlement

- **Fraud:** Deception for financial or personal gain (falsifying records, fake invoices)
- **Embezzlement:** Theft or misappropriation of funds entrusted to one's care

## Extortion

Using threats, intimidation, or abuse of power to obtain money, property, or services. Unlike bribery (which involves mutual benefit), extortion involves coercion.$$, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000001-0004-0001-0000-000000000001', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Red Flags & Warning Signs', $$> **What are Red Flags?** Red flags are warning signs that may indicate corrupt practices. Being alert to these indicators can help prevent corruption before it happens.

## Third Party Red Flags

- **Refusal to Certify:** Third party refuses to sign anti-corruption certifications
- **Government Ties:** Close relationships with government officials
- **Unusual Fees:** Excessive commissions or "consulting fees"
- **Shell Companies:** Complex corporate structures with no clear business purpose

## Transaction Red Flags

- Requests for payments in cash or to third party accounts
- Invoices that lack detail or are for vague services
- Payments made to countries other than where services were rendered
- Unusually large discounts or commissions
- Requests to back-date or alter documents
- Unusual urgency to complete transactions

## Employee Behavior Red Flags

> - Living beyond apparent means
> - Reluctance to share information with colleagues
> - Unusually close relationships with vendors or competitors
> - Resistance to policy changes or audits
> - Excessive secrecy about deals or relationships
> - Bypassing normal approval processes

## High-Risk Situations

> **Be Extra Vigilant When:** Operating in countries with high corruption indices. Dealing with government contracts or licenses. Using third-party agents or intermediaries. Undergoing mergers, acquisitions, or joint ventures. Making charitable or political contributions.

> **Remember:** A single red flag doesn't necessarily mean corruption is occurring, but multiple red flags warrant investigation. When in doubt, consult your compliance team.$$, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000001-0005-0001-0000-000000000001', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Company Policies', $$> **Zero Tolerance Policy:** Our company maintains a zero-tolerance policy towards bribery and corruption. All employees, contractors, and business partners are expected to comply fully with anti-corruption laws and company policies.

## Gifts & Entertainment Policy

> **Acceptable:**
> - Modest gifts of nominal value (under ₹5,000)
> - Reasonable business meals
> - Company-branded promotional items
> - Gifts given openly, not secretly

> **Not Acceptable:** Cash or cash equivalents (gift cards, vouchers). Lavish entertainment or travel. Gifts to government officials without prior approval. Gifts made secretly or under suspicious circumstances. Gifts intended to influence business decisions.

## Third Party Due Diligence

Before engaging agents, consultants, distributors, or joint venture partners, the company requires:

- **Background Checks:** Verify identity, ownership, and reputation
- **Written Agreement:** Anti-corruption clauses in all contracts
- **Fair Compensation:** Fees must be reasonable for services
- **Ongoing Monitoring:** Regular reviews and audits

## Record Keeping Requirements

- All transactions must be accurately recorded in company books
- No off-the-books accounts or payments
- Invoices must accurately describe goods or services
- Retain records for minimum 7 years
- Support all entries with appropriate documentation

## Approval Requirements

> **Prior Approval Required For:** Any gift to a government official. Charitable donations over ₹50,000. Sponsorships or event participation. Engaging third-party intermediaries. Any payments that could be considered unusual.$$, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000001-0006-0001-0000-000000000001', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Reporting Mechanisms', $$> **Your Duty to Report:** If you become aware of or suspect any violation of anti-corruption laws or company policies, you have a duty to report it promptly. Early reporting helps protect the company and limits potential damage.

## Reporting Channels

- **Your Manager:** Direct supervisor or department head
- **Compliance Team:** compliance@company.com
- **Ethics Hotline:** 24/7 anonymous reporting line
- **HR Department:** Human Resources team members

## What to Report

- Known or suspected violations of anti-corruption laws
- Requests for improper payments or gifts
- Falsification of books, records, or accounts
- Attempts to circumvent internal controls
- Conflicts of interest
- Concerns about third-party conduct

## Whistleblower Protection

> **You Are Protected:** The company strictly prohibits retaliation against anyone who reports concerns in good faith. Retaliation includes termination, demotion, harassment, or any adverse employment action.

> **Confidentiality Assured:**
> - Reports can be made anonymously through the Ethics Hotline
> - Your identity will be protected to the fullest extent possible
> - Information is shared only on a need-to-know basis for investigation
> - All reports are treated with utmost confidentiality

## What Happens After You Report?

1. **Acknowledgment:** You'll receive confirmation that your report was received
2. **Assessment:** Compliance team reviews the report to determine next steps
3. **Investigation:** Appropriate investigation is conducted by qualified personnel
4. **Action:** Corrective and disciplinary measures are taken as warranted
5. **Follow-up:** You may be contacted for additional information if needed

> **Important Note:** Never conduct your own investigation. Report your concerns and let trained professionals handle the investigation. Unauthorized investigations can compromise evidence and put you at risk.$$, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000001-0007-0001-0000-000000000001', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Consequences of Non-Compliance', $$> **Consequences Are Severe:** Violations of anti-corruption laws have serious consequences for both individuals and organizations. Ignorance is not a defense.

## Consequences for Individuals

- **Criminal Prosecution:** Imprisonment ranging from 3 to 10+ years depending on jurisdiction
- **Heavy Fines:** Personal fines running into lakhs or crores
- **Career Destruction:** Termination, industry blacklisting, damaged reputation
- **Asset Seizure:** Confiscation of property and assets derived from corruption

## Consequences for the Company

- **Massive Fines:** Up to billions in penalties (FCPA, UK Bribery Act)
- **Criminal Prosecution:** Company and executives can face charges
- **Debarment:** Exclusion from government contracts
- **Reputational Damage:** Loss of customer trust and market value
- **Operational Disruption:** Investigations disrupt normal business
- **Civil Lawsuits:** Shareholder and third-party litigation

## Real-World Examples

> **Notable Enforcement Actions:**
> - **Siemens (2008):** $1.6 billion in combined fines (US & Germany)
> - **Walmart (2019):** $282 million FCPA settlement for Mexico bribery
> - **Rolls-Royce (2017):** £671 million global settlement
> - **Various Indian Companies:** Multiple prosecutions under PCA

## Internal Disciplinary Consequences

> **Company Disciplinary Actions:** Immediate termination of employment. Forfeiture of bonuses and benefits. Clawback of previously paid compensation. Referral to law enforcement authorities. Permanent bar from re-employment.

> **The Bottom Line:** No deal or business advantage is worth the risk. The short-term gains from corruption are far outweighed by the devastating long-term consequences.$$, 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000001-0008-0001-0000-000000000001', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Best Practices', $$> **Your Commitment to Integrity:** By following these best practices, you help protect yourself, your colleagues, and the company from the risks of corruption.

## Daily Compliance Habits

- **Ask Questions:** When in doubt, consult compliance before acting
- **Document Everything:** Keep accurate records of all transactions
- **Know Your Partners:** Conduct due diligence on third parties
- **Report Concerns:** Speak up if you see something wrong

## The "Newspaper Test"

> **Before Making a Decision, Ask Yourself:** "How would I feel if this action appeared on the front page of a newspaper? Would I be comfortable explaining it to my family, colleagues, or regulators?" If the answer is no, don't do it. If you're unsure, seek guidance.

## Key Dos and Don'ts

> **DO:**
> - Know and follow company policies
> - Get proper approvals before acting
> - Keep accurate books and records
> - Report any concerns promptly
> - Complete required training
> - Ask compliance for guidance

> **DON'T:**
> - Never pay bribes, even if "everyone does it"
> - Never make facilitation payments
> - Never falsify records or create off-book accounts
> - Never ignore red flags
> - Never retaliate against whistleblowers
> - Never assume it's someone else's problem

## Key Takeaways

1. **Zero Tolerance:** Your Organization has zero tolerance for bribery and corruption
2. **Know the Laws:** Indian PCA, FCPA, and UK Bribery Act have serious consequences
3. **Watch for Red Flags:** Be alert to warning signs
4. **Follow Policies:** Adhere to company guidelines on gifts, third parties, and approvals
5. **Report Concerns:** Use available channels - you are protected from retaliation
6. **When in Doubt, Ask:** Consult compliance before taking questionable actions

> **You Are Now Ready:** Congratulations on completing the training content! Please proceed to the assessment quiz to test your knowledge and receive your certificate of completion.$$, 8)
ON CONFLICT (id) DO NOTHING;

-- Questions and answers for Anti-Corruption & Anti-Bribery

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0001-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'What is the primary Indian legislation for combating corruption?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0001-0001-0001-000000000003', '00000001-0001-0002-0000-000000000002', 'Indian Penal Code, 1860', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0001-0002-0001-000000000003', '00000001-0001-0002-0000-000000000002', 'Prevention of Corruption Act, 1988', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0001-0003-0001-000000000003', '00000001-0001-0002-0000-000000000002', 'Companies Act, 2013', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0001-0004-0001-000000000003', '00000001-0001-0002-0000-000000000002', 'Right to Information Act, 2005', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0002-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Which law creates a corporate offense for "failure to prevent bribery"?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0002-0001-0001-000000000003', '00000001-0002-0002-0000-000000000002', 'US Foreign Corrupt Practices Act (FCPA)', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0002-0002-0001-000000000003', '00000001-0002-0002-0000-000000000002', 'UK Bribery Act, 2010', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0002-0003-0001-000000000003', '00000001-0002-0002-0000-000000000002', 'Prevention of Corruption Act, 1988', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0002-0004-0001-000000000003', '00000001-0002-0002-0000-000000000002', 'None of the above', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0003-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'A "kickback" is best described as:')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0003-0001-0001-000000000003', '00000001-0003-0002-0000-000000000002', 'A legitimate commission payment', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0003-0002-0001-000000000003', '00000001-0003-0002-0000-000000000002', 'A return of a portion of a payment to the person who facilitated the transaction', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0003-0003-0001-000000000003', '00000001-0003-0002-0000-000000000002', 'A performance bonus', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0003-0004-0001-000000000003', '00000001-0003-0002-0000-000000000002', 'A tax refund', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0004-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Which of the following is a red flag for potential corruption?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0004-0001-0001-000000000003', '00000001-0004-0002-0000-000000000002', 'Requests for payments in cash or to third party accounts', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0004-0002-0001-000000000003', '00000001-0004-0002-0000-000000000002', 'Standard invoices with detailed descriptions', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0004-0003-0001-000000000003', '00000001-0004-0002-0000-000000000002', 'Regular competitive bidding processes', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0004-0004-0001-000000000003', '00000001-0004-0002-0000-000000000002', 'Transparent pricing structures', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0005-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Under our company''s policy, which gift is generally acceptable?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0005-0001-0001-000000000003', '00000001-0005-0002-0000-000000000002', 'Cash gift of any amount', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0005-0002-0001-000000000003', '00000001-0005-0002-0000-000000000002', 'Lavish entertainment trip', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0005-0003-0001-000000000003', '00000001-0005-0002-0000-000000000002', 'Modest gift of nominal value given openly', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0005-0004-0001-000000000003', '00000001-0005-0002-0000-000000000002', 'Gift cards to government officials', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0006-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'If you suspect a violation, what should you do FIRST?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0006-0001-0001-000000000003', '00000001-0006-0002-0000-000000000002', 'Conduct your own investigation', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0006-0002-0001-000000000003', '00000001-0006-0002-0000-000000000002', 'Report through available channels (manager, compliance, hotline)', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0006-0003-0001-000000000003', '00000001-0006-0002-0000-000000000002', 'Wait to see if it happens again', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0006-0004-0001-000000000003', '00000001-0006-0002-0000-000000000002', 'Discuss it publicly on social media', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0007-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'What protection do whistleblowers receive?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0007-0001-0001-000000000003', '00000001-0007-0002-0000-000000000002', 'No protection - reporting is at your own risk', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0007-0002-0001-000000000003', '00000001-0007-0002-0000-000000000002', 'Protection from retaliation when reporting in good faith', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0007-0003-0001-000000000003', '00000001-0007-0002-0000-000000000002', 'Only protection if the report leads to prosecution', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0007-0004-0001-000000000003', '00000001-0007-0002-0000-000000000002', 'Protection only for senior employees', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0008-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'What was the combined fine paid by Siemens in 2008 for corruption violations?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0008-0001-0001-000000000003', '00000001-0008-0002-0000-000000000002', '$100 million', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0008-0002-0001-000000000003', '00000001-0008-0002-0000-000000000002', '$500 million', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0008-0003-0001-000000000003', '00000001-0008-0002-0000-000000000002', '$1.6 billion', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0008-0004-0001-000000000003', '00000001-0008-0002-0000-000000000002', '$50 million', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0009-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', '"Facilitation payments" are:')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0009-0001-0001-000000000003', '00000001-0009-0002-0000-000000000002', 'Always legal and acceptable', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0009-0002-0001-000000000003', '00000001-0009-0002-0000-000000000002', 'Small unofficial payments to speed up routine government actions', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0009-0003-0001-000000000003', '00000001-0009-0002-0000-000000000002', 'Standard bank transfer fees', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0009-0004-0001-000000000003', '00000001-0009-0002-0000-000000000002', 'Government-approved service charges', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0010-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'What is the "Newspaper Test"?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0010-0001-0001-000000000003', '00000001-0010-0002-0000-000000000002', 'Checking if newspapers reported similar violations', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0010-0002-0001-000000000003', '00000001-0010-0002-0000-000000000002', 'Asking if you''d be comfortable if your action appeared on the front page', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0010-0003-0001-000000000003', '00000001-0010-0002-0000-000000000002', 'Publishing compliance updates in newspapers', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000001-0010-0004-0001-000000000003', '00000001-0010-0002-0000-000000000002', 'Reading newspapers for compliance news', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- MODULE 2: Cybersecurity Awareness
-- Module ID: a0c3c3d3-c9a1-447d-87ac-440c14484c87
-- ============================================================

INSERT INTO public.modules (id, title, description, sequence_order)
VALUES ('a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Cybersecurity Awareness', 'Protecting systems, networks, programs, and data from digital attacks, covering legal frameworks, common threats, password security, data protection, incident response, and best practices.', 20)
ON CONFLICT (id) DO NOTHING;

-- Slides for Cybersecurity Awareness

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0001-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Introduction - Why Cybersecurity Matters', $$> **Training Objectives:** By the end of this training, you will recognize cyber threats, protect sensitive data, and respond appropriately to security incidents.

## What is Cybersecurity?

Cybersecurity is the practice of protecting **systems, networks, programs, and data** from digital attacks, unauthorized access, and damage.

> **Why Cybersecurity is Critical:**
> - Cyber attacks cost businesses **$4.45M on average** per breach
> - **Human error** is the leading cause of security breaches
> - A data breach can result in **legal penalties, reputational damage, and financial loss**

## Who Needs This Training?

Everyone who uses company systems is a potential target. Cybersecurity is **everyone's responsibility**.

- **Email Users:** Recognize and avoid phishing attacks
- **Data Handlers:** Protect sensitive information always
- **Device Users:** Secure all devices and accounts

## What You Will Learn

1. **Legal Framework:** Laws governing digital security in India
2. **Common Threats:** Malware, ransomware, and social engineering
3. **Password Security:** Creating and managing strong passwords
4. **Data Protection:** Handling confidential information
5. **Incident Response:** What to do when something goes wrong
6. **Consequences:** Impacts of cyber attacks
7. **Best Practices:** Daily security habits$$, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0002-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Legal Framework', $$## The Information Technology Act, 2000 (IT Act)

The IT Act is the primary law in India dealing with cybercrime and electronic commerce. It provides legal recognition for electronic transactions and defines various cyber offenses.

> **Key Provisions of IT Act:** The Act covers offenses like hacking, identity theft, publishing obscene material, and cyber-terrorism.

### Major Offenses & Sections

- **Section 66C:** Punishment for identity theft (using others' passwords/signatures)
- **Section 66D:** Punishment for cheating by personation using computer resource
- **Section 66E:** Violation of privacy (capturing/publishing private images)
- **Section 70:** Protected systems and unauthorized access

### Indian Computer Emergency Response Team (CERT-In)

> CERT-In is the national nodal agency for responding to computer security incidents. Under Section 70B, companies are **mandated** to report cyber incidents to CERT-In within 6 hours of discovery.

## National Cybersecurity Policy

The policy aims to protect information and information infrastructure in cyberspace, build capabilities to prevent and respond to cyber threats, and reduce vulnerabilities.

> **Compliance Requirements:** Organizations must implement robust security practices, conduct regular audits, and maintain a high level of cyber hygiene to comply with national standards.

### Key Elements of Cybersecurity Law

- **Data Privacy:** Legal obligation to protect sensitive personal data
- **Record Keeping:** Maintaining logs and records for forensic investigations
- **Incident Reporting:** Reporting breaches to authorities and affected parties

> **Your Legal Responsibility:** As an employee, you are responsible for following the company's security policies. Negligence or intentional violations can lead to personal legal liability under the IT Act.$$, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0003-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Common Threats', $$## Social Engineering

Social engineering is the psychological manipulation of people into performing actions or divulging confidential information.

> **Phishing:** Phishing is a method of sending fraudulent communications that appear to come from a reputable source, usually through email or SMS.

### Types of Phishing

- **Spear Phishing:** Targeted attacks aimed at specific individuals or companies
- **Whaling:** Phishing attacks targeting high-profile executives
- **Vishing:** Phishing over voice calls (voice phishing)
- **Smishing:** Phishing via SMS or text messages

## Malware

Malware is "malicious software" designed to damage, disrupt, or gain unauthorized access to a computer system.

> **Ransomware:** A type of malware that locks/encrypts your files and demands a "ransom" payment to unlock them. This is one of the most dangerous threats today.

## Common Malware Types

- **Viruses:** Programs that replicate by attaching to other files
- **Trojans:** Malicious software disguised as legitimate programs
- **Spyware:** Software used to secretly record your activity
- **Worms:** Malware that spreads across networks automatically

> **Man-in-the-Middle (MITM):** An attack where the hacker secretly relays and possibly alters the communication between two parties who believe they are directly communicating with each other. Often occurs on insecure public Wi-Fi.

## Credential Stuffing

Hackers use lists of compromised user credentials (usernames and passwords) to gain unauthorized access to user accounts through automated login requests.

> **Red Flags to Watch For:**
> - Urgent or threatening language in emails
> - Requests for sensitive information (passwords, OTPs)
> - Mismatched URLs or sender addresses
> - Unexpected attachments or links$$, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0004-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Password Security', $$## The Importance of Strong Passwords

Passwords are the first line of defense against unauthorized access to your accounts. Weak passwords can be cracked in seconds using automated tools.

> **Complexity Requirements:** A strong password should be at least 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and symbols.

### Password Do's and Don'ts

- **Use Passphrases:** Combine several random words into a long string (e.g., "CorrectHorseBatteryStaple")
- **Avoid Personal Info:** Don't use names, birthdays, or common words like "password123"
- **Unique Passwords:** Never reuse the same password for multiple accounts
- **Keep it Private:** Never share your password or write it down on sticky notes

## Multi-Factor Authentication (MFA)

MFA adds an extra layer of security by requiring at least two forms of verification before allowing access.

> **Why MFA is Critical:** Even if a hacker steals your password, they won't be able to log in without the second factor (like an OTP sent to your phone or a biometric scan).

## Types of Second Factors

- **Knowledge:** Something you know (Security question, PIN)
- **Possession:** Something you have (Smartphone OTP, Security key)
- **Inherence:** Something you are (Fingerprint, Face recognition)

> **OTP Scams:** Be wary of callers claiming to be from "Technical Support" asking for your OTP. **Legitimate organizations will never ask for your OTP or password.**

## Password Managers

Using a password manager is highly recommended. It securely stores all your unique passwords so you only have to remember one "Master Password."

> **Quick Tips:**
> - Change passwords immediately if you suspect a breach
> - Enable MFA on all critical accounts (Email, Banking, Enterprise)
> - Use biometrics (FaceID/TouchID) where available$$, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0005-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Data Protection', $$## Public Wi-Fi Risks

Public Wi-Fi networks in airports, cafes, and hotels are often insecure. Hackers can easily intercept your data on these networks.

> **The Danger of "Evil Twin" Networks:** Hackers can set up fake Wi-Fi hotspots with names like "Free Guest Wi-Fi" to lure you into connecting and stealing your credentials.

### Safe Browsing Tips

- **Use a VPN:** Always use a Virtual Private Network (VPN) when working remotely
- **HTTPS Always:** Ensure websites use "https://" (the padlock icon) before entering data
- **Disable Auto-Connect:** Turn off "auto-connect to Wi-Fi" on your mobile devices
- **Mobile Hotspot:** Use your phone's cellular data hotspot as it is more secure than public Wi-Fi

## Physical Security

Cybersecurity isn't just about software; physical access to your device is a major risk.

> **Lock Your Screen:** Always lock your computer (Win + L) whenever you step away from your desk, even for a minute.

## Secure Handling of Removable Media

- **USB Risks:** Never plug in a found USB drive; it might contain "Rubber Ducky" malware.
- **Encryption:** Ensure all company laptops and USB drives are encrypted.
- **Hard Copies:** Shred sensitive documents; don't just throw them in the trash.

> **Data Classification:** Understand the difference between **Public**, **Internal**, **Confidential**, and **Restricted** data. Handle each according to company policy.

> **Clean Desk Policy:** Maintain a clean desk policy. Clear your workspace of sensitive information, passwords on sticky notes, and unsecured devices before leaving for the day.$$, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0006-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Incident Response', $$## What is a Cyber Incident?

A cyber incident is any event that threatens the confidentiality, integrity, or availability of an information system or its data.

> **Common Examples:** Loss or theft of laptop or mobile device. Suspicious login attempts or account lockouts. Unusual system performance or unexpected pop-ups. Clicking on a phishing link or downloading a suspicious file. Receiving a ransomware message.

## Immediate Actions

If you suspect an incident, your first actions are critical to containing the threat.

- **Do Not Power Off:** Unless instructed, avoid shutting down your PC as it may erase forensic evidence
- **Disconnect Wi-Fi:** Disconnect from Wi-Fi or unplug the network cable to prevent the spread of malware
- **Report Immediately:** Contact the IT Helpdesk and your manager as soon as possible
- **Remain Discreet:** Avoid discussing the incident on public channels until it is resolved

## How to Report

> Use the following channels to report any security concerns:
> - **IT Helpdesk:** [support email]
> - **Security Portal:** internal.security.portal
> - **Manager:** Always keep your immediate supervisor informed

> **The 6-Hour Rule (CERT-In):** Under Indian regulations, certain security incidents must be reported to CERT-In within **6 hours**. Quick internal reporting is essential for the company to comply with the law.

> **No Penalty for Honest Mistakes:** The company encourages a "Reporting Culture." You will not be penalized for reporting an accidental click on a malicious link, provided you report it **promptly**.$$, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0007-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Consequences', $$## Financial Impact

Cyber attacks can lead to direct and indirect financial losses that can be devastating for a company.

> **Direct Losses:** Ransom payments (though discouraged). Theft of funds via fraudulent transfers. Costs for incident response and forensic investigations. Legal fees and regulatory fines.

## Reputational Damage

Loss of trust is often more expensive than the direct financial cost of a breach. Customers and partners may avoid doing business with a "hacked" company.

- **Customer Trust:** Loss of existing and potential customers
- **Market Value:** Drop in stock price and company valuation
- **Brand Image:** Negative media coverage and brand devaluation

## Operational Disruption

> A cyber attack can bring business operations to a complete standstill. This includes:
> - Downtime of critical services and servers
> - Inability to process orders or serve customers
> - Loss of intellectual property or trade secrets
> - Employee productivity loss during system recovery

## Individual Consequences

> **Personal Liability:** Under the IT Act, individuals can face personal fines and imprisonment if they are found to be willfully negligent or involved in a cybercrime.

> **The Value of Prevention:** Every rupee and hour spent on prevention is worth tenfold in recovery costs saved. Your vigilance is our primary defense against these consequences.$$, 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000002-0008-0001-0000-000000000001', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Best Practices', $$## The Human Firewall

Technology alone cannot stop cyber attacks. Your daily habits and vigilance form the "Human Firewall" that protects the organization.

> **Cyber Hygiene Checklist:**
> - **Think Before You Click:** Be skeptical of unexpected links or attachments
> - **MFA Everywhere:** Enable Multi-Factor Authentication on all accounts
> - **Unique Passwords:** Use a password manager for high complexity and uniqueness
> - **Update Regularly:** Never skip software or system updates
> - **Report Early:** When in doubt, report it to IT immediately
> - **Lock Your Screen:** Don't leave your computer unsecured in the office or in public

## Social Media Safety

- **Oversharing:** Don't post sensitive work details or photos of your office badge
- **Privacy Settings:** Keep your personal profiles private to prevent profiling by hackers

## Remote Work Security

> - Connect only via the corporate VPN
> - Secure your home Wi-Fi with a strong password
> - Avoid "Juice Jacking" by using your own charging cables in public
> - Don't allow family or friends to use your corporate devices

> **Module Summary:** You have completed the Cybersecurity training sections. You should now understand the legal landscape, recognize common threats, and know how to protect yourself and the company through secure practices and prompt reporting.

> **Ready for Assessment?** Click the button below to take the final assessment quiz. You must score 80% or higher to receive your certification.$$, 8)
ON CONFLICT (id) DO NOTHING;

-- Questions and answers for Cybersecurity Awareness

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0001-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Which of the following is the BEST practice for creating a strong password?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0001-0001-0001-000000000003', '00000002-0001-0002-0000-000000000002', 'Using your birthdate and name', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0001-0002-0001-000000000003', '00000002-0001-0002-0000-000000000002', 'Using a long passphrase with mixed characters', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0001-0003-0001-000000000003', '00000002-0001-0002-0000-000000000002', 'Reusing a password from another site', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0001-0004-0001-000000000003', '00000002-0001-0002-0000-000000000002', 'Using "password123"', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0002-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'What should you do if you accidentally click a link in a suspicious email?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0002-0001-0001-000000000003', '00000002-0002-0002-0000-000000000002', 'Ignore it and delete the email', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0002-0002-0001-000000000003', '00000002-0002-0002-0000-000000000002', 'Report it to IT immediately and disconnect from the network', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0002-0003-0001-000000000003', '00000002-0002-0002-0000-000000000002', 'Shut down the computer and go home', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0002-0004-0001-000000000003', '00000002-0002-0002-0000-000000000002', 'Wait a few days to see if anything happens', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0003-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Multi-Factor Authentication (MFA) protects you primarily when:')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0003-0001-0001-000000000003', '00000002-0003-0002-0000-000000000002', 'Your password is stolen or compromised', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0003-0002-0001-000000000003', '00000002-0003-0002-0000-000000000002', 'You forget your username', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0003-0003-0001-000000000003', '00000002-0003-0002-0000-000000000002', 'You want to log in faster', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0003-0004-0001-000000000003', '00000002-0003-0002-0000-000000000002', 'The internet is slow', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0004-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Under Section 70B of the IT Act, cyber incidents must be reported to CERT-In within:')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0004-0001-0001-000000000003', '00000002-0004-0002-0000-000000000002', '24 Hours', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0004-0002-0001-000000000003', '00000002-0004-0002-0000-000000000002', '6 Hours', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0004-0003-0001-000000000003', '00000002-0004-0002-0000-000000000002', '1 Week', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0004-0004-0001-000000000003', '00000002-0004-0002-0000-000000000002', '30 Days', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0005-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', '"Spear Phishing" is best described as:')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0005-0001-0001-000000000003', '00000002-0005-0002-0000-000000000002', 'A random attack on everyone', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0005-0002-0001-000000000003', '00000002-0005-0002-0000-000000000002', 'A targeted attack on a specific individual or company', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0005-0003-0001-000000000003', '00000002-0005-0002-0000-000000000002', 'A type of computer hardware', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0005-0004-0001-000000000003', '00000002-0005-0002-0000-000000000002', 'An antivirus software', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0006-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'What is "Social Engineering" in cybersecurity?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0006-0001-0001-000000000003', '00000002-0006-0002-0000-000000000002', 'Building social media platforms', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0006-0002-0001-000000000003', '00000002-0006-0002-0000-000000000002', 'Manipulating people into revealing confidential information', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0006-0003-0001-000000000003', '00000002-0006-0002-0000-000000000002', 'Designing user interfaces', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0006-0004-0001-000000000003', '00000002-0006-0002-0000-000000000002', 'A type of network cable', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0007-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Which of the following is a safe practice when using public Wi-Fi?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0007-0001-0001-000000000003', '00000002-0007-0002-0000-000000000002', 'Access your bank account directly', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0007-0002-0001-000000000003', '00000002-0007-0002-0000-000000000002', 'Share sensitive files over the network', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0007-0003-0001-000000000003', '00000002-0007-0002-0000-000000000002', 'Use a VPN to encrypt your connection', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0007-0004-0001-000000000003', '00000002-0007-0002-0000-000000000002', 'Disable your firewall for faster speeds', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0008-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'What does "Ransomware" typically do to a victim''s computer?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0008-0001-0001-000000000003', '00000002-0008-0002-0000-000000000002', 'Speeds up the computer', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0008-0002-0001-000000000003', '00000002-0008-0002-0000-000000000002', 'Encrypts files and demands payment for decryption', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0008-0003-0001-000000000003', '00000002-0008-0002-0000-000000000002', 'Installs free software', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0008-0004-0001-000000000003', '00000002-0008-0002-0000-000000000002', 'Improves internet connection', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0009-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'Why is it important to regularly update software and operating systems?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0009-0001-0001-000000000003', '00000002-0009-0002-0000-000000000002', 'To get new themes and colors', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0009-0002-0001-000000000003', '00000002-0009-0002-0000-000000000002', 'Updates are not important', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0009-0003-0001-000000000003', '00000002-0009-0002-0000-000000000002', 'To patch security vulnerabilities and fix bugs', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0009-0004-0001-000000000003', '00000002-0009-0002-0000-000000000002', 'To use more storage space', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000002-0010-0002-0000-000000000002', 'a0c3c3d3-c9a1-447d-87ac-440c14484c87', 'What is the best practice for backing up important data?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0010-0001-0001-000000000003', '00000002-0010-0002-0000-000000000002', 'Keep only one copy on your computer', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0010-0002-0001-000000000003', '00000002-0010-0002-0000-000000000002', 'Follow the 3-2-1 rule: 3 copies, 2 different media, 1 offsite', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0010-0003-0001-000000000003', '00000002-0010-0002-0000-000000000002', 'Backups are not necessary', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000002-0010-0004-0001-000000000003', '00000002-0010-0002-0000-000000000002', 'Email all files to yourself', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- MODULE 3: Data Privacy & Protection
-- Module ID: 89fa7f59-1df4-4d03-99f6-c302afc0618b
-- ============================================================

INSERT INTO public.modules (id, title, description, sequence_order)
VALUES ('89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Data Privacy & Protection', 'Understanding data privacy fundamentals, the DPDP Act 2023 and global standards, data subject rights, breach management, and responsibilities in protecting personal data.', 30)
ON CONFLICT (id) DO NOTHING;

-- Slides for Data Privacy & Protection

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000003-0001-0001-0000-000000000001', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Introduction - Why Data Privacy Matters', $$> **Training Objectives:** By the end of this training, you will understand data privacy fundamentals, GDPR and DPDP Act requirements, and your responsibilities in protecting personal data.

## The Digital Age and Data

In today's interconnected world, data is a **valuable asset**. Personal data is constantly being collected, stored, processed, and shared by organizations – from governments and businesses to social media platforms.

> **Why Data Privacy Matters:**
> - **Protect Individuals:** Misuse of personal data can lead to identity theft, financial fraud, and discrimination
> - **Maintain Trust:** Customers and employees trust organizations with their data; breaches erode that trust
> - **Legal Compliance:** GDPR and DPDP Act impose significant penalties for non-compliance
> - **Business Reputation:** Data breaches can severely damage an organization's brand and market value

## Who Needs This Training?

This training is mandatory for all employees who handle personal data. Understanding data protection is everyone's responsibility.

- **Understand Fundamentals:** Learn the difference between data privacy and data protection
- **Global Framework:** Get an overview of GDPR and its relevance
- **Indian Context:** Learn India's DPDP Act, 2023

## What You Will Learn

1. **Legal Framework:** DPDP Act 2023 and global standards
2. **Data Principles:** Purpose limitation and data minimization
3. **Data Subjects' Rights:** Access, correction, and erasure
4. **Breach Management:** Identification and reporting obligations
5. **International Transfers:** Managing data across borders
6. **Consequences:** Financial and reputational impacts
7. **Best Practices:** Privacy by design and daily habits$$, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000003-0002-0001-0000-000000000001', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Legal Framework', $$## The DPDP Act, 2023

India's **Digital Personal Data Protection (DPDP) Act, 2023** is the primary law governing how we handle the digital personal data of individuals.

> **Key Pillars of the Act:**
> - **Consent:** Data can only be processed with free, specific, and informed consent.
> - **Legitimate Uses:** Processing without consent is only allowed for certain "legitimate uses" (e.g., medical emergencies, legal requirements).
> - **Data Fiduciary:** The organization is a "Data Fiduciary" and is responsible for the data it collects.

## Global Perspective

While we operate primarily in India, we often handle data that falls under other international regulations.

- **GDPR:** The General Data Protection Regulation in the EU is the gold standard for privacy globally.
- **CCPA/CPRA:** California's privacy laws that provide rights to US-based residents.

## Sensitive Personal Data

> Certain categories of data require higher protection:
> - Financial Information
> - Health Data
> - Biometric Data
> - Caste or Tribe details
> - Sexual orientation

> **Heavy Penalties:** Non-compliance with the DPDP Act can lead to fines of up to **₹250 Crores** per instance. Protecting data is a financial necessity.$$, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000003-0003-0001-0000-000000000001', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Data Principles', $$## The Seven Core Principles

Every interaction with personal data must adhere to these fundamental principles.

- **Lawfulness & Transparency:** Process data fairly and tell the individual what you are doing.
- **Purpose Limitation:** Only collect data for a specified, explicit, and legitimate purpose.
- **Data Minimization:** Only collect what is absolutely necessary. Don't ask for "just in case" data.
- **Accuracy:** Ensure data is kept up to date and corrected if inaccurate.

## Storage Limitation

> **Delete When Done:** Personal data should not be kept longer than necessary for the purpose for which it was collected. Once the purpose is served, it must be securely deleted or anonymized.

## Integrity & Confidentiality

Data must be protected against unauthorized or unlawful processing, and against accidental loss, destruction, or damage.

> - Use encryption whenever possible.
> - Restrict access on a "Need-to-Know" basis.
> - Always lock your screen when leaving your workstation.

> **Accountability:** The company is responsible for demonstrating compliance with all the above principles. This includes maintaining records of processing activities.$$, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000003-0004-0001-0000-000000000001', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Data Subjects'' Rights', $$## Who is a Data Principal?

Under the DPDP Act, an individual whose personal data is being processed is called a **Data Principal**. They have specific rights that we must honor.

- **Right to Access:** The right to know what data we have about them and who we share it with.
- **Right to Correction:** The right to have inaccurate or incomplete data updated.
- **Right to Erasure:** The right to have their data deleted when it is no longer needed (also known as the "Right to be Forgotten").
- **Right to Withdraw Consent:** The right to change their mind and stop us from processing their data.

## Fulfilling Requests

> **Nomination:** Data Principals also have the right to nominate someone to exercise their rights in case of death or incapacity.

> If you receive a request from a customer or colleague regarding their privacy rights:
> - Do not attempt to handle it yourself.
> - Immediately forward the request to the **Data Protection Officer (DPO)**.
> - Note the date and time the request was received (strict timelines apply).

> **Grievance Redressal:** Data Principals have a right to have their grievances addressed by the company within a specified timeframe. Failure to do so allows them to complain to the Data Protection Board.$$, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000003-0005-0001-0000-000000000001', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Breach Management', $$## What is a Data Breach?

A personal data breach is a breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, personal data.

> **Examples of Breaches:**
> - Sending an email with personal data to the wrong recipient.
> - Losing a USB drive containing unencrypted payroll data.
> - A cyber attack that allows hackers to view customer records.
> - An employee looking at personal data without a business need.

## Reporting Obligations

The DPDP Act requires the company to notify the **Data Protection Board** and each **affected Data Principal** in the event of a breach.

- **Immediate Action:** Internal reporting must happen within minutes of discovery.
- **DPO Notification:** Email the DPO or use the security portal.

> If you suspect a breach:
> 1. Stop the activity immediately (if possible).
> 2. Notify the DPO and your manager.
> 3. Do not try to "fix" or hide the mistake.
> 4. Document what happened (who, what, where, when).

> **Legal Liability:** Failure to report a breach to the authorities can lead to additional heavy fines beyond the penalty for the breach itself.$$, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000003-0006-0001-0000-000000000001', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'International Transfers', $$## The Borderless Digital World

Data often travels across international borders for processing, storage, or analysis. This is carefully regulated to ensure privacy is not lost during the transfer.

> **DPDP Act Provisions:** The Government of India may "restrict" the transfer of personal data to certain countries. Transfers are allowed unless a country is explicitly blacklisted.

## Standard Contractual Clauses (SCCs)

When sharing data with international partners or vendors, we use legally binding agreements to ensure they protect the data as strictly as we do.

- **Enforceable Rights:** Ensuring data subjects have rights in the destination country.
- **Security Safeguards:** Requiring the recipient to have technical security measures in place.

> Before transferring personal data outside of India:
> - Confirm that the transfer is authorized for your project.
> - Ensure a **Data Processing Agreement (DPA)** is in place.
> - Check if the vendor is a "Data Processor" or a "Data Fiduciary."

> **Public Interest Transfers:** Different rules may apply to transfers required by law enforcement or in the interest of national security.$$, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000003-0007-0001-0000-000000000001', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Consequences', $$## Financial Penalties

The DPDP Act has some of the highest financial penalties in Indian law to ensure companies take privacy seriously.

> **Penalty Scale:**
> - **Failure to prevent breach:** Up to ₹250 Crores
> - **Failure to notify breach:** Up to ₹200 Crores
> - **Breach of children's data:** Up to ₹200 Crores
> - **General non-compliance:** Up to ₹50 Crores

## Reputational Harm

- **Loss of Business:** Clients are reluctant to work with companies that have a history of data mismanagement.
- **Trust Deficit:** Employees and customers feel violated when their personal details are leaked.

## Operational Impact

> A major privacy incident can lead to:
> - Internal audits and regulatory investigations.
> - Mandatory changes to business processes at high cost.
> - Individual lawsuits from affected Data Principals.

> **Individual Responsibility:** Willful negligence or unauthorized use of data for personal gain can lead to **disciplinary action**, including termination of employment and possible criminal charges.$$, 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000003-0008-0001-0000-000000000001', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Best Practices', $$## Privacy by Design

Don't add privacy as an afterthought. It should be built into every project, process, and system from the start.

> **Privacy Best Practices:**
> - **Minimize Collection:** Don't collect data "just in case."
> - **Clear Notices:** Help users understand why you need their information.
> - **Secure Sharing:** Only use approved channels to share sensitive info.
> - **Prompt Deletion:** Regularly clean up files that are no longer needed.
> - **Stay Informed:** Privacy laws change rapidly; keep your training up to date.

## Dealing with Vendors

- **Due Diligence:** Verify that third-party vendors have strong privacy controls.
- **DPAs:** Ensure a Data Processing Agreement is signed before sharing data.

> **Final Summary:** Data privacy is about respecting individual freedom and dignity. By following the law, adhering to the seven principles, and honoring data subjects' rights, we maintain our reputation as a trusted technology leader.

> **Ready for Assessment?** Click the button below to take the final assessment quiz. A passing score of 80% is required.$$, 8)
ON CONFLICT (id) DO NOTHING;

-- Questions and answers for Data Privacy & Protection

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0001-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'What is "Personal Data" as defined under the DPDP Act 2023?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0001-0001-0001-000000000003', '00000003-0001-0002-0000-000000000002', 'Only financial information', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0001-0002-0001-000000000003', '00000003-0001-0002-0000-000000000002', 'Any data that can identify a living individual', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0001-0003-0001-000000000003', '00000003-0001-0002-0000-000000000002', 'Only government-issued ID numbers', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0001-0004-0001-000000000003', '00000003-0001-0002-0000-000000000002', 'Only medical records', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0002-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Which of the following is considered "Sensitive Personal Data"?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0002-0001-0001-000000000003', '00000003-0002-0002-0000-000000000002', 'Your favorite color', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0002-0002-0001-000000000003', '00000003-0002-0002-0000-000000000002', 'Your work email address', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0002-0003-0001-000000000003', '00000003-0002-0002-0000-000000000002', 'Your biometric fingerprints', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0002-0004-0001-000000000003', '00000003-0002-0002-0000-000000000002', 'The city you live in', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0003-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'What is the primary principle of "Purpose Limitation" in data privacy?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0003-0001-0001-000000000003', '00000003-0003-0002-0000-000000000002', 'Collect as much data as possible', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0003-0002-0001-000000000003', '00000003-0003-0002-0000-000000000002', 'Data should only be used for the purpose it was collected', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0003-0003-0001-000000000003', '00000003-0003-0002-0000-000000000002', 'Share data with all departments', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0003-0004-0001-000000000003', '00000003-0003-0002-0000-000000000002', 'Keep data indefinitely', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0004-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Under the DPDP Act, what is required before processing personal data?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0004-0001-0001-000000000003', '00000003-0004-0002-0000-000000000002', 'Government approval', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0004-0002-0001-000000000003', '00000003-0004-0002-0000-000000000002', 'Free, specific, informed, and unambiguous consent', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0004-0003-0001-000000000003', '00000003-0004-0002-0000-000000000002', 'Payment from the data subject', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0004-0004-0001-000000000003', '00000003-0004-0002-0000-000000000002', 'Nothing, consent is optional', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0005-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'What is the "Right to Erasure" also known as?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0005-0001-0001-000000000003', '00000003-0005-0002-0000-000000000002', 'Right to Copy', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0005-0002-0001-000000000003', '00000003-0005-0002-0000-000000000002', 'Right to be Forgotten', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0005-0003-0001-000000000003', '00000003-0005-0002-0000-000000000002', 'Right to Access', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0005-0004-0001-000000000003', '00000003-0005-0002-0000-000000000002', 'Right to Portability', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0006-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'What does "Data Minimization" mean?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0006-0001-0001-000000000003', '00000003-0006-0002-0000-000000000002', 'Delete all data immediately after collection', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0006-0002-0001-000000000003', '00000003-0006-0002-0000-000000000002', 'Collect only the minimum data necessary for the purpose', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0006-0003-0001-000000000003', '00000003-0006-0002-0000-000000000002', 'Compress data to save storage', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0006-0004-0001-000000000003', '00000003-0006-0002-0000-000000000002', 'Store data in small files', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0007-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Who is a "Data Fiduciary" under the DPDP Act?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0007-0001-0001-000000000003', '00000003-0007-0002-0000-000000000002', 'The person whose data is being collected', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0007-0002-0001-000000000003', '00000003-0007-0002-0000-000000000002', 'The entity that determines the purpose and means of processing', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0007-0003-0001-000000000003', '00000003-0007-0002-0000-000000000002', 'A government officer', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0007-0004-0001-000000000003', '00000003-0007-0002-0000-000000000002', 'A data storage company', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0008-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'What should you do if you suspect a data breach?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0008-0001-0001-000000000003', '00000003-0008-0002-0000-000000000002', 'Wait and see if it gets worse', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0008-0002-0001-000000000003', '00000003-0008-0002-0000-000000000002', 'Ignore it if no harm is visible', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0008-0003-0001-000000000003', '00000003-0008-0002-0000-000000000002', 'Report it immediately to your data protection officer', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0008-0004-0001-000000000003', '00000003-0008-0002-0000-000000000002', 'Delete all evidence', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0009-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'What is the maximum penalty for significant data breaches under the DPDP Act 2023?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0009-0001-0001-000000000003', '00000003-0009-0002-0000-000000000002', '₹1 Crore', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0009-0002-0001-000000000003', '00000003-0009-0002-0000-000000000002', '₹50 Crore', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0009-0003-0001-000000000003', '00000003-0009-0002-0000-000000000002', '₹250 Crore', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0009-0004-0001-000000000003', '00000003-0009-0002-0000-000000000002', 'No penalty', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000003-0010-0002-0000-000000000002', '89fa7f59-1df4-4d03-99f6-c302afc0618b', 'Before transferring personal data outside India, what must be ensured?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0010-0001-0001-000000000003', '00000003-0010-0002-0000-000000000002', 'Nothing special is required', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0010-0002-0001-000000000003', '00000003-0010-0002-0000-000000000002', 'The recipient country is not on the restricted list and adequate protections exist', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0010-0003-0001-000000000003', '00000003-0010-0002-0000-000000000002', 'Just get verbal approval from the data subject', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000003-0010-0004-0001-000000000003', '00000003-0010-0002-0000-000000000002', 'Cross-border transfers are always prohibited', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- MODULE 4: Health, Safety & Environment (HSE)
-- Module ID: 1875f87e-8e89-4bab-80da-72a1925af152
-- ============================================================

INSERT INTO public.modules (id, title, description, sequence_order)
VALUES ('1875f87e-8e89-4bab-80da-72a1925af152', 'Health, Safety & Environment (HSE)', 'Ensuring a safe, healthy, and environmentally responsible workplace through understanding hazards, fire safety, emergency procedures, and environmental stewardship.', 40)
ON CONFLICT (id) DO NOTHING;

-- Slides for Health, Safety & Environment (HSE)

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000004-0001-0001-0000-000000000001', '1875f87e-8e89-4bab-80da-72a1925af152', 'Introduction - Why HSE Matters', $$> **Training Objectives:** By the end of this training, you will understand HSE fundamentals, recognize workplace hazards, know emergency procedures, and understand your safety responsibilities.

## What is HSE?

HSE is a multi-disciplinary area focused on ensuring the **well-being of employees, the safety of operations, and the protection of the environment**. It is integral to responsible business operations.

> **Why HSE is Important:**
> - **Moral Responsibility:** Protecting employees and communities from harm is our ethical duty
> - **Legal Compliance:** Non-compliance leads to penalties and prosecution
> - **Economic Benefits:** Reduced accidents mean lower costs and higher productivity
> - **Company Reputation:** Demonstrates care for stakeholders

## Who Needs This Training?

This training is for all employees who work in or visit our facilities. Safety is everyone's responsibility.

- **Health:** Protecting workers from occupational illnesses
- **Safety:** Preventing accidents and injuries
- **Environment:** Minimizing impact on the natural environment

## What You Will Learn

1. **Legal Framework:** Factories Act and Environmental Protection Act
2. **Workplace Hazards:** Identifying physical and electrical risks
3. **Fire Safety & PPE:** Prevention and protection equipment
4. **Emergency Procedures:** Evacuation and incident response
5. **Environmental Responsibility:** Waste management and sustainability
6. **Consequences:** Legal and personal impacts of non-compliance
7. **Best Practices:** Daily safety habits$$, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000004-0002-0001-0000-000000000001', '1875f87e-8e89-4bab-80da-72a1925af152', 'Legal Framework', $$## Primary Legislation

HSE compliance is mandatory under various Indian laws. Failure to comply can lead to severe legal and financial penalties.

> **The Factories Act, 1948:** The main legislation governing health, safety, and welfare of workers in factories. It covers hours of work, safety measures, and facility standards.

### Other Key Regulations

- **Environmental Protection Act, 1986:** Framework for protecting and improving the environment and preventing pollution.
- **Indian Electricity Rules:** Safety requirements for electrical installations and operations.
- **Hazardous Waste Rules:** Regulations for the management, handling, and transboundary movement of hazardous waste.
- **BOCW Act:** Building and Other Construction Workers Act for safety in construction sites.

## International Standards

The organization strives to meet international benchmarks for safety and environmental management.

> - **ISO 45001:** Occupational Health and Safety Management Systems
> - **ISO 14001:** Environmental Management Systems

> **Compliance is Mandatory:** Every employee is responsible for following the safety guidelines mandated by these laws. Ignorance of the law is not an excuse for non-compliance.$$, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000004-0003-0001-0000-000000000001', '1875f87e-8e89-4bab-80da-72a1925af152', 'Workplace Hazards', $$## Types of Hazards

A hazard is anything with the potential to cause harm. We classify workplace hazards into four main categories.

- **Physical Hazards:** Slippery floors, unprotected machinery, loud noise, and electrical risks.
- **Chemical Hazards:** Exposure to cleaning agents, solvents, gases, or vapors.
- **Ergonomic Hazards:** Poor workstation setup, repetitive movements, and improper lifting.
- **Psychosocial Hazards:** Workplace stress, harassment, and burnout.

## Risk Assessment

Risk is the likelihood that a hazard will actually cause harm. We use the **Hierarchy of Controls** to manage risk:

1. **Elimination:** Physically remove the hazard.
2. **Substitution:** Replace the hazard.
3. **Engineering Controls:** Isolate people from the hazard (e.g., machine guards).
4. **Administrative Controls:** Change the way people work (e.g., signs, training).
5. **PPE:** Protect the worker with Personal Protective Equipment.

> **Spot the Hazard:** If you see a trailing wire, a spill, or an unstable stack of boxes, **report it or fix it immediately**. Don't assume someone else will do it.

> **Ergonomics Tip:** Ensure your screen is at eye level, your feet are flat on the floor, and you take a "micro-break" every 20 minutes to stretch.$$, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000004-0004-0001-0000-000000000001', '1875f87e-8e89-4bab-80da-72a1925af152', 'Fire Safety & PPE', $$## The Fire Triangle

Fire needs three elements to exist: **Heat, Fuel, and Oxygen**. Removing any one of these will extinguish the fire.

> **Fire Extinguisher Types:**
> - **Type A (Water):** For wood, paper, and cloth.
> - **Type B (CO2/Dry Powder):** For flammable liquids like oil or petrol.
> - **Type C (CO2/Dry Powder):** For electrical fires.
> 
> **Never use water on an electrical fire!**

## Using a Fire Extinguisher: The PASS Method

1. **P**ull the pin.
2. **A**im at the base of the fire.
3. **S**queeze the handle.
4. **S**weep from side to side.

## Personal Protective Equipment (PPE)

PPE is your last line of defense. It must be worn correctly and maintained in good condition.

- **Visibility:** High-visibility vests for field and warehouse operations.
- **Head Protection:** Safety helmets where there's a risk of falling objects.
- **Eye Protection:** Safety goggles when handling chemicals or during drilling/cutting.
- **Hand Protection:** Gloves suited for the task (chemical resistant, heat resistant, etc.)

> **PPE Inspection:** Inspect your PPE before every use. If it is damaged, cracked, or worn out, request a replacement from your supervisor immediately.$$, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000004-0005-0001-0000-000000000001', '1875f87e-8e89-4bab-80da-72a1925af152', 'Emergency Procedures', $$## Fire Evacuation

When the fire alarm sounds, remain calm and follow these steps immediately:

> 1. **Leave immediately:** Do not stop to collect personal belongings.
> 2. **No Elevators:** Always use the stairs.
> 3. **Assembly Point:** Proceed directly to the designated assembly point for your building.
> 4. **Roll Call:** Report to your fire warden so you can be accounted for.
> 5. **Stay Clear:** Do not re-enter the building until the "All Clear" signal is given.

## Medical Emergencies

> **First Aid Assistance:** Alert the nearest First Aider. Note the location of the First Aid boxes and the list of trained responders displayed in your area.

## Reporting Incidents & Near-Misses

An incident is an event that causes harm. A **Near-Miss** is an event that could have caused harm but didn't.

- **Report All Events:** Reporting near-misses helps prevent real accidents in the future.
- **Emergency Hotline:** Dial [Internal Number] for immediate security or medical dispatch.

> **Stop Work Authority:** Every employee has the **authority and obligation** to stop any work that they believe is unsafe or puts the environment at risk.$$, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000004-0006-0001-0000-000000000001', '1875f87e-8e89-4bab-80da-72a1925af152', 'Environmental Responsibility', $$## Waste Management: The 3 Rs

Our goal is to minimize waste through a systematic approach to resource management.

- **Reduce:** Avoid single-use plastics and print only when necessary.
- **Reuse:** Repurpose materials where possible before discarding.
- **Recycle:** Sort waste correctly into the designated bins (E-waste, Dry, Wet).

## Energy & Water Conservation

> - Switch off lights and AC when leaving a room.
> - Unplug chargers and electronic equipment after work.
> - Report leaking taps or pipes immediately.
> - Use energy-efficient settings on company devices.

## E-Waste Management

> **Electronic Waste:** Old batteries, keyboards, phones, and cables contain hazardous materials. **Never throw e-waste in the regular trash.** Use the designated e-waste collection points.

> **Green Initiative:** We are committed to reducing our carbon footprint. Small actions by every employee contribute to this company-wide goal.$$, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000004-0007-0001-0000-000000000001', '1875f87e-8e89-4bab-80da-72a1925af152', 'Consequences', $$## Health & Safety Impacts

The most severe consequence of HSE negligence is physical harm to people.

> **Personal Injury:** Serious injury, disability, or fatality. Chronic illnesses due to long-term exposure to hazards. Psychological trauma for the affected worker and their family.

## Legal & Financial Consequences

- **Financial Penalties:** Heavy fines for the company and individual directors.
- **Imprisonment:** Potential jail time for responsible individuals under the Factories Act.
- **License Revocation:** Cancellation of business licenses and permits.

## Environmental Damage

Irresponsible disposal or accidents can lead to:

> - Contamination of local soil and water sources.
> - Harm to local wildlife and ecosystems.
> - National-level pollution fines and "Polluter Pays" liability.

> **Company Reputation:** Major safety or environmental incidents lead to permanent loss of brand trust, making it difficult to attract customers and top talent.$$, 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000004-0008-0001-0000-000000000001', '1875f87e-8e89-4bab-80da-72a1925af152', 'Best Practices', $$## Safety Mindset

Safety is not just a set of rules; it's a way of thinking and acting every single day.

> **Your Daily Safety Checklist:**
> - **Be Aware:** Pay attention to your surroundings at all times.
> - **Follow Procedures:** Never take shortcuts, even if they save time.
> - **Proper PPE:** Wear the right gear for the right job, every time.
> - **Speak Up:** Intervention is an act of care. Prevent an accident before it happens.
> - **Think Green:** Make sustainability a part of your office habits.

## Team Responsibility

- **Support Colleagues:** Remind others if they forget their PPE or safe practices.
- **Reporting Near-Misses:** Help us learn from "close calls" so we can eliminate hazards.

> **Final Summary:** Safety is a shared journey. By understanding our legal duties, identifying hazards, responding to emergencies correctly, and protecting our environment, we create a workplace where everyone goes home safe every day.

> **Ready for Assessment?** Click the button below to take the final assessment quiz. A passing score of 80% is required.$$, 8)
ON CONFLICT (id) DO NOTHING;

-- Questions and answers for Health, Safety & Environment (HSE)

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0001-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152', 'What does HSE stand for?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0001-0001-0001-000000000003', '00000004-0001-0002-0000-000000000002', 'Health, Safety, and Environment', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0001-0002-0001-000000000003', '00000004-0001-0002-0000-000000000002', 'High Security Equipment', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0001-0003-0001-000000000003', '00000004-0001-0002-0000-000000000002', 'Hazard Safety Engineering', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0001-0004-0001-000000000003', '00000004-0001-0002-0000-000000000002', 'Human Safety Evaluation', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0002-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152', 'Which of the following is an "Ergonomic" hazard?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0002-0001-0001-000000000003', '00000004-0002-0002-0000-000000000002', 'Poor workstation setup causing back pain', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0002-0002-0001-000000000003', '00000004-0002-0002-0000-000000000002', 'A spilled chemical on the floor', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0002-0003-0001-000000000003', '00000004-0002-0002-0000-000000000002', 'High voltage electrical wires', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0002-0004-0001-000000000003', '00000004-0002-0002-0000-000000000002', 'A noisy generator', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0003-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152', 'What is the first thing you should do when you discover a fire?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0003-0001-0001-000000000003', '00000004-0003-0002-0000-000000000002', 'Try to extinguish it yourself', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0003-0002-0001-000000000003', '00000004-0003-0002-0000-000000000002', 'Raise the alarm and evacuate', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0003-0003-0001-000000000003', '00000004-0003-0002-0000-000000000002', 'Collect your belongings', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0003-0004-0001-000000000003', '00000004-0003-0002-0000-000000000002', 'Take photos for documentation', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0004-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152', 'What does PPE stand for?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0004-0001-0001-000000000003', '00000004-0004-0002-0000-000000000002', 'Personal Protective Equipment', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0004-0002-0001-000000000003', '00000004-0004-0002-0000-000000000002', 'Private Protection Entity', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0004-0003-0001-000000000003', '00000004-0004-0002-0000-000000000002', 'Professional Performance Evaluation', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0004-0004-0001-000000000003', '00000004-0004-0002-0000-000000000002', 'Preventive Protection Engineering', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0005-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152', 'What should you do if you notice a safety hazard at work?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0005-0001-0001-000000000003', '00000004-0005-0002-0000-000000000002', 'Ignore it if it doesn''t affect you directly', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0005-0002-0001-000000000003', '00000004-0005-0002-0000-000000000002', 'Report it immediately to your supervisor', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0005-0003-0001-000000000003', '00000004-0005-0002-0000-000000000002', 'Wait for someone else to report it', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0005-0004-0001-000000000003', '00000004-0005-0002-0000-000000000002', 'Post about it on social media', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0006-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152', 'During an emergency evacuation, you should:')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0006-0001-0001-000000000003', '00000004-0006-0002-0000-000000000002', 'Use the elevator for faster exit', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0006-0002-0001-000000000003', '00000004-0006-0002-0000-000000000002', 'Use stairs and proceed to the assembly point', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0006-0003-0001-000000000003', '00000004-0006-0002-0000-000000000002', 'Go back to your desk to save files', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0006-0004-0001-000000000003', '00000004-0006-0002-0000-000000000002', 'Wait at your desk for instructions', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0007-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152', 'Which type of fire extinguisher should be used for electrical fires?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0007-0001-0001-000000000003', '00000004-0007-0002-0000-000000000002', 'Water-based extinguisher', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0007-0002-0001-000000000003', '00000004-0007-0002-0000-000000000002', 'CO2 or dry chemical extinguisher', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0007-0003-0001-000000000003', '00000004-0007-0002-0000-000000000002', 'Foam extinguisher', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0007-0004-0001-000000000003', '00000004-0007-0002-0000-000000000002', 'Any extinguisher will work', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0008-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152', 'What is the purpose of a Safety Data Sheet (SDS)?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0008-0001-0001-000000000003', '00000004-0008-0002-0000-000000000002', 'To track employee attendance', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0008-0002-0001-000000000003', '00000004-0008-0002-0000-000000000002', 'To provide information about hazardous chemicals', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0008-0003-0001-000000000003', '00000004-0008-0002-0000-000000000002', 'To record daily work schedules', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0008-0004-0001-000000000003', '00000004-0008-0002-0000-000000000002', 'To store company policies', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0009-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152', 'What is the correct order of the PASS technique for using a fire extinguisher?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0009-0001-0001-000000000003', '00000004-0009-0002-0000-000000000002', 'Pull, Aim, Squeeze, Sweep', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0009-0002-0001-000000000003', '00000004-0009-0002-0000-000000000002', 'Push, Aim, Spray, Sweep', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0009-0003-0001-000000000003', '00000004-0009-0002-0000-000000000002', 'Pull, Activate, Spray, Stop', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0009-0004-0001-000000000003', '00000004-0009-0002-0000-000000000002', 'Point, Aim, Spray, Shake', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0010-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152', 'Who is responsible for workplace safety?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0010-0001-0001-000000000003', '00000004-0010-0002-0000-000000000002', 'Only the safety officer', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0010-0002-0001-000000000003', '00000004-0010-0002-0000-000000000002', 'Only management', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0010-0003-0001-000000000003', '00000004-0010-0002-0000-000000000002', 'Everyone in the workplace', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000004-0010-0004-0001-000000000003', '00000004-0010-0002-0000-000000000002', 'Only new employees', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- MODULE 5: POSH Act Training
-- Module ID: 510e88a4-f501-4ba7-acc4-4f687fff65cc
-- ============================================================

INSERT INTO public.modules (id, title, description, sequence_order)
VALUES ('510e88a4-f501-4ba7-acc4-4f687fff65cc', 'POSH Act Training', 'Understanding the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013, including definitions, ICC composition, complaint process, and prevention measures.', 50)
ON CONFLICT (id) DO NOTHING;

-- Slides for POSH Act Training

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0001-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Introduction to POSH Act', $$> **Training Objectives:** Understand the POSH Act, recognize sexual harassment, know the complaint process, and learn how to maintain a respectful workplace.

## Why This Training Matters

Every employee has the right to work in an environment free from sexual harassment. The **Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013** (commonly known as the POSH Act) provides a legal framework to address this critical issue.

> **Key Facts:**
> - Sexual harassment affects **productivity, morale, and well-being**
> - Organizations are **legally obligated** to prevent and address harassment
> - Both **men and women** can be victims of harassment
> - Non-compliance can result in **penalties up to ₹50,000** and license cancellation

## Who Should Take This Training?

- **All Employees:** Every employee must understand what constitutes harassment
- **Managers:** Leaders must foster a safe and respectful environment
- **ICC Members:** ICC members need in-depth knowledge of procedures

## What You Will Learn

1. **Definition:** What constitutes sexual harassment at the workplace
2. **POSH Act:** Key provisions and applicability
3. **ICC:** Role and composition of Internal Complaints Committee
4. **Complaint Process:** How to file and what happens next
5. **Employer Duties:** Organizational obligations under the Act
6. **Prevention:** Building a respectful workplace culture

> **Zero Tolerance Policy:** The organization maintains a zero-tolerance policy towards sexual harassment. Any violation will be dealt with strictly as per the law and company policy.$$, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0002-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'What is Sexual Harassment?', $$## Definition Under POSH Act

> **Legal Definition:** Sexual harassment includes any **unwelcome** sexually determined behavior (whether directly or by implication) such as physical contact, demand or request for sexual favors, sexually colored remarks, showing pornography, or any other unwelcome physical, verbal, or non-verbal conduct of a sexual nature.

## Forms of Sexual Harassment

- **Physical:** Unwelcome touching, blocking movement, assault
- **Verbal:** Comments on appearance, jokes, requests for dates, sexual innuendos
- **Non-Verbal:** Staring, gestures, displaying offensive material
- **Digital:** Inappropriate emails, messages, social media posts

## Quid Pro Quo Harassment

> **"This for That":** When employment decisions (hiring, promotion, salary, assignments) are based on acceptance or rejection of sexual advances. Examples:
> - "Accept my proposal if you want that promotion"
> - "Go out with me or face negative performance review"

## Hostile Work Environment

When conduct creates an intimidating, hostile, or offensive work environment that interferes with work performance. This includes:

- Persistent sexual jokes or comments
- Display of sexually explicit material
- Repeated unwanted invitations
- Spreading rumors about someone's personal life

## The "Reasonable Woman" Standard

> **Key Principle:** Whether conduct constitutes harassment is judged from the **perspective of the recipient**, not the intent of the harasser. What matters is how the behavior is **perceived**, not how it was **intended**.

> **Remember:** "I was just joking" or "I didn't mean it that way" is NOT a defense. If the recipient found it unwelcome and offensive, it may constitute harassment.$$, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0003-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'POSH Act Overview', $$## Background

The POSH Act was enacted following the landmark **Vishaka v. State of Rajasthan (1997)** Supreme Court judgment, which laid down guidelines for prevention of sexual harassment at the workplace.

> **Full Name:** **The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013** - came into force on December 9, 2013.

## Who is Covered?

- **Aggrieved Woman:** Any woman of any age, employed or visiting the workplace
- **Workplace:** Any place visited by employee during employment, including transit
- **Employee:** Regular, temporary, contractual, intern, or trainee
- **Employer:** Any person responsible for management, supervision, and control

## Extended Definition of Workplace

> **Workplace Includes:**
> - Office premises, branches, and satellite offices
> - Client locations and project sites
> - Transportation provided by employer
> - Work from home locations
> - Office events, parties, and conferences
> - Business travel and hotel stays

## Key Provisions

- **Mandatory ICC:** Every organization with 10+ employees must constitute an Internal Complaints Committee
- **Complaint Timeline:** Complaint must be filed within 3 months of incident (extendable by 3 months)
- **Inquiry Timeline:** Inquiry to be completed within 90 days
- **Confidentiality:** Identity of parties must be kept confidential
- **No Retaliation:** Protection against victimization for filing complaint

## Penalties for Non-Compliance

> **Consequences for Organizations:**
> - **First Offense:** Fine up to ₹50,000
> - **Repeat Offense:** Double penalty and/or cancellation of license/registration
> - **Reputational Damage:** Public disclosure of non-compliance$$, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0004-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Internal Complaints Committee (ICC)', $$## What is ICC?

> **Internal Complaints Committee:** A committee constituted by the employer to receive and address complaints of sexual harassment. It is **mandatory** for every organization with 10 or more employees.

## Composition of ICC

- **Presiding Officer:** Senior woman employee (mandatory)
- **Internal Members:** At least 2 employees committed to women's cause
- **External Member:** From NGO or person familiar with sexual harassment issues
- **Majority Women:** At least 50% of ICC members must be women

## ICC Member Requirements

> **Members Should:**
> - Be committed to the cause of women's rights
> - Have knowledge of POSH Act provisions
> - Maintain strict confidentiality
> - Be impartial and unbiased
> - Serve for a term not exceeding 3 years

## Powers of ICC

- Receive complaints of sexual harassment
- Initiate action based on complaints
- Conduct inquiry as per rules
- Recommend action to employer
- Recommend interim relief to complainant
- Attempt conciliation if requested by complainant

> **Contact ICC:** Our ICC details are displayed at prominent locations in the office. You can reach the ICC at the ICC email or contact any ICC member directly.

> **Important:** ICC members must recuse themselves if they have any conflict of interest in a particular case (e.g., if they are related to either party).$$, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0005-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Complaint Process', $$## Filing a Complaint

> **Written Complaint:** A written complaint must be submitted to the ICC. If the complainant cannot write, the Presiding Officer shall assist in writing the complaint.

## Complaint Timeline

> **Important Deadlines:**
> - **Filing:** Within 3 months of the incident (or last incident in case of series)
> - **Extension:** ICC can extend by 3 more months if valid reason exists
> - **Inquiry Completion:** 90 days from receipt of complaint
> - **Report Submission:** Within 10 days of inquiry completion
> - **Action by Employer:** Within 60 days of receiving ICC report

## Complaint Process Steps

1. **Complaint Filing:** Aggrieved woman submits written complaint to ICC
2. **Preliminary Assessment:** ICC reviews if complaint falls under POSH
3. **Conciliation Option:** If complainant requests, ICC may attempt settlement (no monetary)
4. **Inquiry Initiation:** If no conciliation, formal inquiry begins
5. **Evidence Collection:** Both parties present evidence and witnesses
6. **Report & Recommendation:** ICC submits findings and recommendations
7. **Action by Employer:** Employer implements ICC recommendations

## Interim Relief

- **Transfer:** Transfer complainant or respondent to different workplace
- **Leave:** Grant leave up to 3 months (in addition to regular leave)
- **Restrict Contact:** Prevent respondent from contacting complainant

## Confidentiality

> **Strict Confidentiality Required:** The identity of the complainant, respondent, witnesses, and inquiry proceedings must be kept strictly confidential. Breach of confidentiality is punishable under the Act.

> **False Complaints:** Making false or malicious complaints is also punishable. However, inability to prove a complaint does not automatically make it false.$$, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0006-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Employer Obligations', $$## Mandatory Obligations

> **Legal Requirements:** Every employer is legally bound to take specific steps to prevent and address sexual harassment at the workplace.

## Key Employer Duties

- **Constitute ICC:** Form ICC with proper composition as per Act
- **Awareness Programs:** Conduct regular training and awareness sessions
- **Display Policy:** Display POSH policy at conspicuous places
- **Annual Report:** Include sexual harassment report in annual report

## Detailed Obligations

- **Safe Environment:** Provide a safe working environment free from harassment
- **Display Information:** Display penal consequences of harassment at prominent locations
- **ICC Details:** Display ICC composition and contact information
- **Organize Training:** Regular sensitization programs for employees and ICC members
- **Assist Complaints:** Provide assistance if complainant wishes to file criminal complaint
- **Treat as Misconduct:** Include sexual harassment as misconduct in service rules
- **Monitor Third Parties:** Ensure third parties at workplace follow the policy

## Action on ICC Recommendations

> **Employer Must:**
> - Act on ICC recommendations within **60 days**
> - Implement recommended disciplinary action
> - Ensure no retaliation against complainant
> - Monitor situation post-resolution

## Annual Compliance

> **Annual Report Requirements:** Employers must include in their annual report:
> - Number of complaints received
> - Number of complaints disposed
> - Number of cases pending for more than 90 days
> - Nature of action taken

> **Company Commitment:** We are committed to maintaining a harassment-free workplace and fully comply with all POSH Act requirements.$$, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0007-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Prevention Measures', $$> **Proactive Prevention:** Prevention is always better than addressing complaints. Creating a culture of respect is everyone's responsibility.

## Your Role in Prevention

- **Be Aware:** Understand what constitutes harassment and recognize red flags
- **Speak Up:** Clearly communicate if behavior is unwelcome; report incidents
- **Be an Ally:** If you witness harassment, consider intervening safely or reporting

## Workplace Behavior Guidelines

> **Do's:**
> - **Treat Everyone with Respect:** Be mindful of your words, actions, and non-verbal cues
> - **Respect Personal Space:** Be conscious of physical boundaries
> - **Ask for Consent:** Always seek explicit consent for physical contact
> - **Maintain Professionalism:** Apply same standards to emails, chats, and social media
> - **Lead by Example:** Managers must role model appropriate behavior

> **Don'ts:**
> - Avoid inappropriate jokes - no sexist, homophobic, or derogatory humor
> - Don't make unwelcome personal comments about appearance
> - Never share or display sexually explicit content
> - Don't touch colleagues without consent
> - Avoid making assumptions about personal relationships

## Bystander Intervention

If you witness potential harassment, you can use the 5 D's:

- **Direct:** Directly address the situation if safe to do so
- **Distract:** Create a distraction to interrupt the behavior
- **Delegate:** Get help from someone in authority
- **Document:** Record what you witnessed for future reference
- **Delay:** Check in with the affected person afterwards

## Creating a Respectful Culture

> **Building a Safe Environment:**
> - Participate actively in awareness programs
> - Challenge inappropriate behavior when you see it
> - Support colleagues who report concerns
> - Promote diversity and inclusion
> - Treat all allegations seriously and with confidentiality$$, 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0008-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Key Takeaways', $$> **You've Completed the Training!** Remember these key points as you apply your knowledge in the workplace.

## Core Principles to Remember

> **Essential Points:**
> 1. **Legal Mandate:** The POSH Act is a legal requirement aimed at creating a safe workplace for women
> 2. **Broad Definition:** Sexual harassment includes unwelcome physical, verbal, and non-verbal conduct of a sexual nature
> 3. **Zero Tolerance:** The organization maintains a zero-tolerance policy towards sexual harassment
> 4. **ICC Role:** The Internal Complaints Committee is a neutral and confidential body to address complaints
> 5. **Your Rights:** You have a right to a safe workplace and a responsibility to maintain it
> 6. **Speak Up:** Report any incident - your identity will be protected
> 7. **Consequences:** Non-compliance has severe consequences for individuals and the organization

## Key Timelines

- **3 Months:** Time limit to file a complaint from the date of incident
- **90 Days:** Maximum time for ICC to complete inquiry
- **60 Days:** Time for employer to act on ICC recommendations

## Reporting Channels

> **How to Report:**
> - **ICC:** Contact any ICC member directly
> - **HR Department:** Reach out to your HR representative
> - **Email:** ICC email address
> - **Anonymous:** Ethics hotline available 24/7

## Your Commitment

> **Remember Your Responsibilities:**
> - Adhere to the POSH policy at all times
> - Report any incidents you witness or experience
> - Cooperate with any inquiry process
> - Maintain confidentiality of proceedings
> - Contribute to a culture of respect
> - Never retaliate against complainants or witnesses

> **Ready for Assessment:** You're now ready to take the assessment quiz. A score of 70% or higher is required to pass and receive your certificate.$$, 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0009-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Roles & Responsibilities', $$### Inquiry Process: Steps & Timelines

**Step 1: Receiving the Complaint (Within 7 working days)**

ICC/LCC receives the written complaint. If the complaint is not in writing, the Presiding Officer/Chairperson must provide all reasonable assistance to the aggrieved woman to do so. ICC/LCC will provide a copy of the complaint to the respondent within 7 working days.

**Step 2: Response from Respondent (Within 10 working days)**

The respondent has 10 working days to submit their written response to the complaint, along with any supporting documents or names of witnesses.

**Step 3: Conciliation (Optional - Section 10)**

Before commencing inquiry, the ICC/LCC may, at the request of the aggrieved woman, attempt conciliation. **Important: Conciliation should not involve any monetary settlement.** If conciliation is successful, the ICC/LCC records the settlement and forwards it to the employer for implementation. No further inquiry is conducted.

**Step 4: Inquiry Proceedings (Within 90 days - Section 11)**

If conciliation fails or is not opted for, the ICC/LCC proceeds with the inquiry. The inquiry must be conducted in accordance with the principles of natural justice. Both parties must be given a fair opportunity to be heard. They can present their case, examine witnesses, and produce relevant documents. They have the right to cross-examine witnesses presented by the other party. No party can bring a legal practitioner to represent them in the inquiry proceedings. The inquiry must be completed within a period of 90 days. The ICC/LCC has powers similar to a Civil Court for summoning witnesses and producing documents.

**Step 5: Submission of Inquiry Report (Within 10 days of inquiry completion - Section 13)**

Upon completion of the inquiry, the ICC/LCC prepares an Inquiry Report containing findings and recommendations. If allegations are proven: recommends action against the respondent. If allegations are not proven: recommends no action. If the complaint is found to be malicious or false: recommends action against the aggrieved woman (with specific safeguards). The ICC/LCC submits the report to the employer within 10 days of completing the inquiry.

**Step 6: Employer's Action (Within 60 days - Section 13)**

The employer must act on the recommendations of the ICC/LCC within 60 days of receiving the report. Actions can include: implementing disciplinary action (warning, apology, withholding promotion/increment, termination), directing compensation to the aggrieved woman, or other appropriate measures.

**Interim Relief to Aggrieved Woman (Section 12)**

During the pendency of the inquiry, the ICC/LCC may recommend: Transfer the aggrieved woman or the respondent to any other workplace. Grant leave to the aggrieved woman up to 3 months (in addition to her regular leave entitlement). Restrain the respondent from reporting on the work performance of, or evaluating, or supervising the aggrieved woman. Any other relief as deemed appropriate.$$, 9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0010-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Consequences of Sexual Harassment', $$**Roles & Responsibilities**

### Employer's Responsibilities (Section 19)

The POSH Act places significant responsibility on the employer to ensure a safe workplace:

- **Constitute ICC:** Ensure formation of an ICC with the correct composition and adequate training.
- **Formulate Policy:** Develop and widely disseminate an anti-sexual harassment policy.
- **Provide a Safe Working Environment:** Take all necessary steps to prevent sexual harassment.
- **Organize Awareness Programs:** Conduct regular workshops and sensitization programs for all employees and ICC members.
- **Display Penal Consequences:** Prominently display the penal consequences of sexual harassment and the order constituting the ICC.
- **Provide Assistance:** Extend all necessary facilities to the ICC/LCC for conducting inquiries and enforcing recommendations.
- **Act on Recommendations:** Implement the recommendations of the ICC/LCC within the stipulated timeframe.
- **Monitor & Report:** Submit an annual report to the District Officer and ensure compliance.

**Internal Complaints Committee (ICC) Responsibilities**

- Maintain strict confidentiality throughout the process.
- Conduct fair, impartial, and timely inquiries based on principles of natural justice.
- Provide a safe and supportive environment for complainants.
- Act within the powers granted by the Act.
- Submit accurate and timely inquiry reports.
- Educate employees and assist the employer in prevention.

**Employee's Responsibilities**

- **Understand and Adhere:** Be aware of and adhere to the organization's POSH policy.
- **Report Concerns:** Promptly report any incidents of sexual harassment witnessed or experienced.
- **Cooperate with Inquiry:** Cooperate fully and honestly with the ICC/LCC during any inquiry.
- **Respect Confidentiality:** Maintain confidentiality of proceedings.
- **Promote a Respectful Culture:** Contribute to a workplace culture free from harassment by treating all colleagues with dignity and respect.
- **Avoid Retaliation:** Do not retaliate against a complainant or a witness.$$, 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0011-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Prevention & Prohibition Measures', $$> **Consequences of Sexual Harassment**

> **Consequences for the Respondent (If Allegations are Proven)**

**Disciplinary Actions (Employer Discretion):**

- Written apology
- Warning, reprimand, or censure
- Withholding of promotion, increment, or pay raise
- Termination from service (for severe cases)
- Transfer
- Community service or counseling
- Deduction from salary/wages to pay compensation to the aggrieved woman

**Criminal Charges:** In severe cases (e.g., molestation, assault), separate criminal proceedings can be initiated under the Indian Penal Code (IPC) alongside the POSH inquiry.

**Reputational Damage:** Severe damage to personal and professional reputation, affecting future career prospects.

**Legal Costs:** Potential costs if criminal or civil cases are pursued.

> **Consequences for the Employer (For Non-Compliance)**

**Financial Penalties (Section 26):**

- Initial non-compliance (e.g., failure to constitute ICC, not acting on recommendations): Fine up to INR 50,000.
- Repeated non-compliance: Fine can be doubled, and the employer's business license/registration may be cancelled.

**Reputational Damage:** Negative publicity, loss of public trust, difficulty in attracting and retaining talent.

**Legal Action:** Potential lawsuits from aggrieved parties.

**Impact on Morale:** A workplace seen as unsafe can severely impact employee morale and productivity.

> **Consequences for Malicious Complaints or False Evidence (Section 14)**

The Act provides safeguards against misuse. If the ICC/LCC concludes that the complaint was made maliciously or with false intent, or that false evidence was provided knowingly, it may recommend action against the complainant. This provision is not meant to deter genuine complaints, but to prevent false accusations. A mere inability to substantiate a complaint is not considered malicious intent.

**Impact on Workplace Culture:** Sexual harassment creates a hostile, intimidating, and offensive environment. It decreases employee morale, trust, and productivity, increases absenteeism and employee turnover, damages the organization's brand and reputation, and undermines diversity and inclusion efforts.$$, 11)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000005-0012-0001-0000-000000000001', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Key Takeaways & Q&A', $$**Prevention & Prohibition Measures**

**Proactive Measures by the Organization**

**Strong Leadership Commitment (Tone from the Top):** Management must visibly champion a zero-tolerance policy towards sexual harassment and clearly communicate its commitment to a safe workplace.

### Clear & Comprehensive POSH Policy

Ensure the policy is easily accessible, clearly defines sexual harassment, outlines the complaint and redressal mechanism, and details consequences. A desirable policy includes:

- **Zero-Tolerance Statement:** Explicit commitment to preventing and addressing sexual harassment.
- **Definition of Sexual Harassment:** Clear, easy-to-understand explanation of all forms, including examples.
- **Scope & Applicability:** Who is covered (employees, interns, visitors, third parties) and what constitutes the 'workplace' (physical, virtual, off-site events).
- **ICC Details:** Names, contact information, and roles of ICC members.
- **Complaint Procedure:** Step-by-step guide on how to file a complaint, timelines, and required documentation.
- **Inquiry Process:** Explanation of the inquiry stages, principles of natural justice, and expected timelines.
- **Interim Relief:** Details on available interim measures for the aggrieved woman during inquiry.
- **Conciliation Process:** How and when conciliation can be opted for (non-monetary).
- **Confidentiality Clause:** Assurance that identities and details will be protected.
- **Non-Retaliation Clause:** Strong statement against any form of retaliation towards complainants or witnesses.
- **Consequences of Proven Harassment:** Clear outline of disciplinary actions against respondents.
- **Consequences of Malicious Complaints:** Safeguards and actions against false complaints.
- **Roles & Responsibilities:** Clarifies duties of employer, ICC, and all employees.
- **Awareness & Training:** Commitment to regular sensitization programs.
- **Annual Reporting:** Information on the submission of the annual report.

### Regular Awareness & Sensitization Workshops

For all employees: To educate them on what constitutes harassment, how to prevent it, and how to report. For ICC members: To equip them with the necessary skills for inquiry, conciliation, and maintaining confidentiality. Conduct these periodically (e.g., annually) and for new joinees.

**Prominent Display:** Display the POSH policy, penal consequences, and ICC contact details at conspicuous places in the workplace.

**Internal Communication:** Regularly communicate the importance of a respectful workplace through emails, intranet, posters, and team meetings.

**Your Role in Prevention and Prohibition:**

- **Be Aware:** Understand what constitutes sexual harassment and recognize red flags.
- **Speak Up:** If comfortable, clearly and firmly communicate to the harasser that their behavior is unwelcome. Report incidents, whether you are the aggrieved person or a witness.
- **Be an Ally/Bystander Intervention:** If you witness harassment, consider intervening safely (e.g., distracting, confronting, or reporting).
- **Treat Everyone with Respect:** Be mindful of your words, actions, and non-verbal cues.
- **Respect Personal Space:** Be conscious of physical boundaries.
- **Avoid Stereotypes & Jokes:** Refrain from making or laughing at sexist, homophobic, or derogatory jokes.
- **Maintain Professionalism Online:** Apply the same standards of conduct to online communication (emails, chat groups, social media) related to work.
- **Ask for Consent:** Always seek explicit consent if you intend to engage in any physical contact or personal conversation.
- **Lead by Example:** Managers and leaders must role model appropriate behavior and ensure their teams understand and comply with the policy.$$, 12)
ON CONFLICT (id) DO NOTHING;

-- Questions and answers for POSH Act Training

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0001-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'What does POSH stand for?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0001-0001-0001-000000000003', '00000005-0001-0002-0000-000000000002', 'Protection of Sexual Harassment', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0001-0002-0001-000000000003', '00000005-0001-0002-0000-000000000002', 'Prevention of Sexual Harassment', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0001-0003-0001-000000000003', '00000005-0001-0002-0000-000000000002', 'Prohibition of Sexual Harassment', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0001-0004-0001-000000000003', '00000005-0001-0002-0000-000000000002', 'Punishment of Sexual Harassment', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0002-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'How many employees must an organization have to mandate an ICC?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0002-0001-0001-000000000003', '00000005-0002-0002-0000-000000000002', '5 employees', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0002-0002-0001-000000000003', '00000005-0002-0002-0000-000000000002', '10 employees', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0002-0003-0001-000000000003', '00000005-0002-0002-0000-000000000002', '20 employees', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0002-0004-0001-000000000003', '00000005-0002-0002-0000-000000000002', '50 employees', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0003-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Who should be the Presiding Officer of the ICC?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0003-0001-0001-000000000003', '00000005-0003-0002-0000-000000000002', 'Any employee', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0003-0002-0001-000000000003', '00000005-0003-0002-0000-000000000002', 'A woman employed at a senior level', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0003-0003-0001-000000000003', '00000005-0003-0002-0000-000000000002', 'An external legal expert', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0003-0004-0001-000000000003', '00000005-0003-0002-0000-000000000002', 'The HR Head', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0004-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'What is the time limit for filing a complaint?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0004-0001-0001-000000000003', '00000005-0004-0002-0000-000000000002', '1 month from incident', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0004-0002-0001-000000000003', '00000005-0004-0002-0000-000000000002', '3 months from incident', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0004-0003-0001-000000000003', '00000005-0004-0002-0000-000000000002', '6 months from incident', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0004-0004-0001-000000000003', '00000005-0004-0002-0000-000000000002', '1 year from incident', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0005-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Within how many days must the inquiry be completed?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0005-0001-0001-000000000003', '00000005-0005-0002-0000-000000000002', '30 days', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0005-0002-0001-000000000003', '00000005-0005-0002-0000-000000000002', '60 days', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0005-0003-0001-000000000003', '00000005-0005-0002-0000-000000000002', '90 days', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0005-0004-0001-000000000003', '00000005-0005-0002-0000-000000000002', '180 days', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0006-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'What is "Quid Pro Quo" harassment?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0006-0001-0001-000000000003', '00000005-0006-0002-0000-000000000002', 'Making offensive jokes', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0006-0002-0001-000000000003', '00000005-0006-0002-0000-000000000002', 'Promising benefits or threatening consequences in exchange for sexual favors', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0006-0003-0001-000000000003', '00000005-0006-0002-0000-000000000002', 'Staring or leering', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0006-0004-0001-000000000003', '00000005-0006-0002-0000-000000000002', 'Sending unwanted emails', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0007-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Can conciliation involve monetary settlement?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0007-0001-0001-000000000003', '00000005-0007-0002-0000-000000000002', 'Yes, any amount', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0007-0002-0001-000000000003', '00000005-0007-0002-0000-000000000002', 'Yes, up to 3 months salary', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0007-0003-0001-000000000003', '00000005-0007-0002-0000-000000000002', 'No, conciliation cannot involve monetary settlement', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0007-0004-0001-000000000003', '00000005-0007-0002-0000-000000000002', 'Only if respondent agrees', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0008-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'What is the penalty for employer''s first non-compliance with POSH Act?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0008-0001-0001-000000000003', '00000005-0008-0002-0000-000000000002', 'Up to INR 10,000', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0008-0002-0001-000000000003', '00000005-0008-0002-0000-000000000002', 'Up to INR 25,000', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0008-0003-0001-000000000003', '00000005-0008-0002-0000-000000000002', 'Up to INR 50,000', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0008-0004-0001-000000000003', '00000005-0008-0002-0000-000000000002', 'Up to INR 1,00,000', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0009-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'Does the definition of "workplace" include virtual meetings?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0009-0001-0001-000000000003', '00000005-0009-0002-0000-000000000002', 'No, only physical locations', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0009-0002-0001-000000000003', '00000005-0009-0002-0000-000000000002', 'Yes, if related to work', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0009-0003-0001-000000000003', '00000005-0009-0002-0000-000000000002', 'Only if employer specifically includes it', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0009-0004-0001-000000000003', '00000005-0009-0002-0000-000000000002', 'Only during office hours', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000005-0010-0002-0000-000000000002', '510e88a4-f501-4ba7-acc4-4f687fff65cc', 'What percentage of ICC members must be women?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0010-0001-0001-000000000003', '00000005-0010-0002-0000-000000000002', 'At least 25%', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0010-0002-0001-000000000003', '00000005-0010-0002-0000-000000000002', 'At least 50%', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0010-0003-0001-000000000003', '00000005-0010-0002-0000-000000000002', 'At least 75%', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.answers (id, question_id, text, is_correct)
VALUES ('00000005-0010-0004-0001-000000000003', '00000005-0010-0002-0000-000000000002', '100%', false)
ON CONFLICT (id) DO NOTHING;


COMMIT;
