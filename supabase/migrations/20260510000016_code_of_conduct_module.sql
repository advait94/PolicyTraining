-- Migration: Code of Conduct module
-- A foundational module for ALL employees covering conflicts of interest,
-- gifts & hospitality, use of company assets, and social media policy.
-- sequence_order 15 — positioned before the other compliance modules.

BEGIN;

INSERT INTO public.modules (id, title, description, sequence_order)
VALUES (
    '00000007-0001-0000-0000-000000000001',
    'Code of Conduct',
    'The foundational principles every employee must understand — conflicts of interest, gifts and hospitality, proper use of company assets, and professional conduct in person and online.',
    15
) ON CONFLICT (id) DO NOTHING;

-- ── SLIDES ────────────────────────────────────────────────────────────────────

INSERT INTO public.slides (id, module_id, title, content, sequence_order) VALUES
('00000007-0001-0001-0000-000000000001', '00000007-0001-0000-0000-000000000001',
'Introduction — What the Code of Conduct Means', $$> **Training Objectives:** By the end of this training, you will understand your obligations under the Code of Conduct, be able to identify and manage conflicts of interest, know when to refuse gifts, and understand the rules around company assets and social media.

## Why We Have a Code of Conduct

A Code of Conduct is not a list of rules designed to restrict you — it is a shared set of principles that protects you, your colleagues, and the organization. When everyone understands and follows the same standards, the organization maintains the trust of clients, regulators, and the public.

> **Why It Matters:**
> - **Protects you personally:** Following the Code means you are never in a position where your judgment can be questioned
> - **Maintains stakeholder trust:** Clients and partners choose to work with organizations they can trust
> - **Legal protection:** Many Code provisions reflect legal obligations — violations can result in personal liability
> - **Creates a fair workplace:** The Code applies equally to all employees regardless of seniority

## Who This Applies To

The Code of Conduct applies to **all employees, contractors, and interns** without exception. Seniority does not grant exemptions — in fact, leadership is held to a higher standard because their conduct sets the tone for everyone below them.

## What You Will Learn

1. **Conflicts of Interest:** How to identify, disclose, and manage situations where personal interests could affect professional judgment
2. **Gifts & Hospitality:** When accepting or offering something of value is acceptable, and when it is not
3. **Company Assets:** What counts as a company asset and your obligations when using them
4. **Confidentiality:** Your duty to protect information that belongs to the company or its clients
5. **Social Media:** How your online presence relates to your professional obligations
6. **Raising Concerns:** How to speak up when you see something that doesn't feel right$$, 1),

('00000007-0002-0001-0000-000000000001', '00000007-0001-0000-0000-000000000001',
'Conflicts of Interest', $$> **A Conflict of Interest Exists When Personal Interests Could — Or Could Appear To — Influence Professional Judgment.** The key word is "appear." Even if your decision is completely objective, an undisclosed conflict undermines trust and exposes both you and the organization to risk.

## Common Conflict Scenarios

| Situation | Why It Is a Conflict |
|---|---|
| You oversee procurement and your spouse owns one of the vendors | Financial interest in the outcome of your decisions |
| You are interviewing a candidate who is your former classmate | Personal relationship may bias your assessment |
| You receive a job offer from a key client while still serving them | Incentive to favor that client over the company's interests |
| You own shares in a competitor | Financial interest in the competitor's success |
| Your brother-in-law's firm is bidding on a company contract | Family financial benefit from a decision you may influence |

## What You Must Do

> **Disclose, Don't Decide:** If you have any potential conflict — real or perceived — your obligation is to disclose it to your manager or HR immediately. You do not need to judge whether it is "serious enough." Disclose and let the company decide.

The company will then determine whether you should:
- Recuse yourself from the decision entirely
- Proceed with enhanced oversight from a neutral party
- Take no action because the conflict is not material

## What "Recusal" Means in Practice

If you are recused from a decision, you must:
- Not participate in any discussion or recommendation relating to it
- Not review materials prepared for that decision
- Not attempt to influence anyone else who is making the decision
- Not receive any information about the outcome until it is final

> **Failure to Disclose Is Always the Worse Outcome:** An undisclosed conflict that surfaces later — even if your decision was objectively fair — is treated as a serious integrity violation. Disclosure protects you. Silence does not.$$, 2),

('00000007-0003-0001-0000-000000000001', '00000007-0001-0000-0000-000000000001',
'Gifts & Hospitality', $$> **Giving and Receiving Gifts Is a Normal Part of Business Relationships — But It Must Never Create an Obligation, Real or Perceived.** Even a small gift can compromise your independence if it comes from someone whose interests are affected by your decisions.

## The Core Test

Before accepting or offering anything of value, ask:

1. Would you be comfortable if your manager saw this?
2. Would you be comfortable if it appeared in a company audit?
3. Would a reasonable person question whether it influenced a decision?

If the answer to any of these is "no" or "maybe," decline.

## What Is Generally Acceptable

- **Branded merchandise** of nominal value (pen, notepad, tote bag) from a vendor or client
- **Meals and hospitality** that are modest, infrequent, and include business discussion — and where the giver would be present
- **Tickets to events** that are of reasonable value, not excessive, and where business colleagues will also attend

## What Is Not Acceptable

> **Never accept or offer:**
> - Cash or cash equivalents (gift cards, vouchers, cryptocurrency)
> - Gifts above the company's stated threshold (check your policy for the specific amount)
> - Anything offered at a point when a procurement, contract, or decision is pending
> - Travel, accommodation, or entertainment paid for entirely by a vendor or client
> - Personal gifts (not business-related) — jewelry, luxury goods, personal travel

## The Timing Rule

> A gift offered at the exact time a contract is being decided is a bribe regardless of its value. Timing matters as much as amount.

## Offering Gifts

The same rules apply in reverse. Never offer anything to a client, government official, or partner that you would not be comfortable disclosing to your compliance team. Giving an improper gift exposes the company to the same legal risk as receiving one — under the Prevention of Corruption Act, offering is as serious as accepting.

## When in Doubt — Decline and Disclose

If you are unsure, the safest answer is always to politely decline and inform your manager that you were offered something. This protects you completely.$$, 3),

('00000007-0004-0001-0000-000000000001', '00000007-0001-0000-0000-000000000001',
'Use of Company Assets', $$> **Company Assets Exist to Enable Your Work — Not for Personal Benefit.** Using company resources appropriately protects the company's financial interests and ensures fair treatment of all employees.

## What Counts as a Company Asset

Assets are not limited to physical objects. They include:

- **Physical:** Laptops, phones, vehicles, office equipment, printed materials
- **Digital:** Software licenses, cloud storage, email accounts, company social media profiles
- **Financial:** Expense accounts, corporate cards, petty cash, travel budgets
- **Intellectual:** Confidential information, client data, internal processes, proprietary systems
- **Reputational:** The company's name, brand, and relationships

## Acceptable Use

- Equipment provided for work may be used for **incidental personal use** that is minor, does not affect performance, and does not incur additional cost to the company
- Work email and systems are for **business purposes** — personal accounts should handle personal matters

## Unacceptable Use

> **Never use company assets to:**
> - Run a personal business or side venture — even outside working hours
> - Store, access, or distribute inappropriate, offensive, or illegal content
> - Make unauthorized software installations on company devices
> - Use a corporate credit card for personal expenses not covered by policy
> - Share client data, confidential documents, or proprietary information with outside parties

## Returning Assets

All company assets must be returned in good condition on departure. This includes deleting company accounts from personal devices and revoking any access credentials you control. Retention of company data after departure is a legal violation — not a technicality.

> **If You Discover a Misuse:** If you become aware that company assets are being misused by a colleague, report it to your manager or through the ethics channel. Staying silent about known misuse can make you complicit.$$, 4),

('00000007-0005-0001-0000-000000000001', '00000007-0001-0000-0000-000000000001',
'Confidentiality & Information Handling', $$> **Confidential Information Is One of the Company's Most Valuable Assets — and One of the Easiest to Lose Accidentally.** Most confidentiality breaches are not malicious — they happen because people do not recognize what is confidential, or treat it carelessly.

## What Is Confidential

As a general rule, assume that **all non-public company information is confidential** unless you have been explicitly told otherwise. This includes:

- Client names, relationships, engagements, and any client data
- Commercial strategy, pricing, bids in progress, and M&A activity
- Financial results before they are publicly announced
- Employee information — salaries, performance reviews, personal details
- Internal systems, processes, and intellectual property
- Communications marked as confidential or privileged

## Your Day-to-Day Obligations

- Do not discuss client work or internal matters in public spaces — lifts, restaurants, and transport are not private
- Do not send confidential documents to personal email addresses
- Do not share login credentials or leave systems unlocked in shared spaces
- Do not store confidential files on personal devices or unapproved cloud services
- Apply need-to-know: share confidential information only with colleagues who have a legitimate business reason to receive it

## Confidentiality After You Leave

> **Your Obligation Does Not End on Your Last Day.** Confidentiality obligations survive your employment. Taking client lists, internal documents, strategy materials, or proprietary data when you leave is a legal breach — not a gray area. This applies equally to personal device backups made during employment.

## When Asked to Share

If a client, regulator, journalist, or any external party asks for information about the company, direct them to the appropriate spokesperson. **Do not respond independently** — even if the request seems routine.$$, 5),

('00000007-0006-0001-0000-000000000001', '00000007-0001-0000-0000-000000000001',
'Social Media & Professional Conduct', $$> **Your Online Presence Is Part of Your Professional Identity.** What you post publicly — even outside working hours — can affect the company's reputation and your own.

## The Core Principle

You are entitled to a private life and private opinions. However:

- If your employer is identifiable from your profile, you are representing the company whether you intend to or not
- Content that would violate the Code of Conduct in the office also violates it online

## What You Must Not Do

> **Never post, share, or comment:**
> - Confidential company information, client names, or internal data — even in vague terms
> - Negative, disparaging, or defamatory content about clients, partners, competitors, or colleagues
> - Content that constitutes harassment, discrimination, or creates a hostile environment for any colleague
> - Unofficial statements about the company's financial performance, strategy, or legal matters
> - Content that misrepresents your role, credentials, or the company's products

## What You Should Be Careful About

- **Identifying your employer on public profiles** means professional standards apply to your public posts
- **Commenting on client matters** — even positively — without authorization can create legal risk
- **Sharing company news** before it is officially announced can constitute a breach of confidentiality or insider trading regulations

## Official Company Channels

Only designated employees may post on behalf of the company on official channels. If you manage a company account, all content must be approved through the appropriate internal process before publishing.

## Speaking to Media

> **All media enquiries must be directed to your Communications team.** Do not speak to journalists, podcasters, or industry media about the company — even for a "quick background comment" — without authorization. Unauthorized statements bind the company as much as official ones.$$, 6),

('00000007-0007-0001-0000-000000000001', '00000007-0001-0000-0000-000000000001',
'Raising Concerns & Non-Retaliation', $$> **The Code Only Works If People Speak Up When They See Something Wrong.** A culture where concerns are silenced — through fear, pressure, or indifference — is one where violations grow until they become crises.

## When You Should Raise a Concern

You should report any situation where you believe:
- The Code of Conduct, a company policy, or the law may be being violated
- Someone is being asked to do something unethical
- A conflict of interest has not been disclosed
- Company assets are being misused
- A colleague or superior is behaving in a way that harms others

You do not need proof. You do not need to be certain. A reasonable, genuine belief that something may be wrong is enough.

## How to Raise a Concern

1. **Your manager** — the first point of contact for most concerns
2. **HR** — for concerns involving your manager, or for people-related matters
3. **The Ethics Hotline** — available 24/7, confidential, and anonymous if you choose
4. **The Audit Committee or Board** — for concerns about senior management

> **You Choose the Channel.** If you are not comfortable with the most direct route, escalate to the next level. There is no requirement to report to someone who is part of the problem.

## Non-Retaliation — Your Absolute Protection

> **Retaliation against anyone who raises a concern in good faith is a serious disciplinary offence — up to and including dismissal.** This applies regardless of whether the concern turns out to be correct, and regardless of who the concern is about.

"Good faith" means you genuinely believed what you reported was true. It does not mean you need to be right.

## What Is NOT Protected

Making a deliberately false report about a colleague with the intent to harm them is not protected and will be treated as a disciplinary matter. This provision is not there to discourage reporting — it exists to protect the integrity of the process.$$, 7),

('00000007-0008-0001-0000-000000000001', '00000007-0001-0000-0000-000000000001',
'Key Takeaways', $$> **The Code of Conduct Is a Framework for Good Judgment — Not a Substitute for It.** No policy can cover every situation. When the policy is unclear, ask yourself: would this decision be defensible if it were public knowledge?

## Core Principles to Carry Forward

1. **Disclose conflicts early** — the moment you suspect a conflict may exist, tell your manager. Do not wait to assess its severity yourself.
2. **When in doubt about gifts, decline** — politeness is sufficient justification; you never need to explain why you are following company policy.
3. **Company assets are for business purposes** — minor personal use is acceptable; using them for commercial personal benefit is not.
4. **Confidential means confidential beyond your employment** — the obligation continues after you leave.
5. **Online standards match offline standards** — the Code applies to your professional online presence.
6. **Speak up** — you are protected when you raise concerns in good faith. Staying silent is not neutral.

## The Disclosure Rule

> **If you are ever unsure whether something needs to be disclosed or reported — disclose and report.** The cost of an unnecessary disclosure is zero. The cost of a missed one can be severe.

## Key Contacts

- **Your Line Manager** — first point of contact for most Code questions
- **HR** — conflicts involving your manager, or people-related matters
- **Ethics Hotline** — confidential, available 24/7, anonymous if needed
- **Compliance / Legal** — guidance on specific legal obligations

> **Ready for Assessment:** A score of 70% or higher is required to complete this module.$$, 8);

-- ── QUIZ QUESTIONS ────────────────────────────────────────────────────────────

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000007-0001-0002-0000-000000000002', '00000007-0001-0000-0000-000000000001',
'You are on the procurement team evaluating vendor bids. You realise that one of the bidding companies is 30% owned by your brother. The price they are offering is the most competitive. What should you do?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000007-0001-0001-0001-000000000003', '00000007-0001-0002-0000-000000000002', 'Proceed — the pricing is objective and your decision will be based on merit', false),
('00000007-0001-0002-0001-000000000003', '00000007-0001-0002-0000-000000000002', 'Disclose the conflict of interest to your manager immediately and recuse yourself from this evaluation', true),
('00000007-0001-0003-0001-000000000003', '00000007-0001-0002-0000-000000000002', 'Tell your brother''s company to withdraw so there is no issue', false),
('00000007-0001-0004-0001-000000000003', '00000007-0001-0002-0000-000000000002', 'Only disclose if your brother''s company wins the contract', false);

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000007-0002-0002-0000-000000000002', '00000007-0001-0000-0000-000000000001',
'A supplier you manage sends a ₹5,000 gift hamper to your home address ahead of the contract renewal. What is the right response?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000007-0002-0001-0001-000000000003', '00000007-0002-0002-0000-000000000002', 'Accept it — it is a gesture of goodwill with no specific request attached', false),
('00000007-0002-0002-0001-000000000003', '00000007-0002-0002-0000-000000000002', 'Decline and return it, then inform your manager that you were offered a gift by this supplier ahead of renewal', true),
('00000007-0002-0003-0001-000000000003', '00000007-0002-0002-0000-000000000002', 'Accept it but report it after the renewal process is complete', false),
('00000007-0002-0004-0001-000000000003', '00000007-0002-0002-0000-000000000002', 'Accept it — declining would damage the business relationship', false);

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000007-0003-0002-0000-000000000002', '00000007-0001-0000-0000-000000000001',
'You are using your company laptop to run a small online tutoring service in your evenings and weekends. The laptop is always returned in good condition and your work performance is unaffected. Is this acceptable?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000007-0003-0001-0001-000000000003', '00000007-0003-0002-0000-000000000002', 'Yes — you are using it outside working hours and it does not affect your performance', false),
('00000007-0003-0002-0001-000000000003', '00000007-0003-0002-0000-000000000002', 'No — using company assets to run a personal commercial venture is not permitted, regardless of timing', true),
('00000007-0003-0003-0001-000000000003', '00000007-0003-0002-0000-000000000002', 'Yes — incidental personal use of company equipment is always acceptable', false),
('00000007-0003-0004-0001-000000000003', '00000007-0003-0002-0000-000000000002', 'Only if you reimburse the company for any wear and tear', false);

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000007-0004-0002-0000-000000000002', '00000007-0001-0000-0000-000000000001',
'You are leaving the company next week. You copy client contact lists and project files to your personal laptop "for reference, just in case." Is this acceptable?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000007-0004-0001-0001-000000000003', '00000007-0004-0002-0000-000000000002', 'Yes — you worked on these files and may need them for your CV or portfolio', false),
('00000007-0004-0002-0001-000000000003', '00000007-0004-0002-0000-000000000002', 'No — copying confidential company data when leaving is a legal breach of confidentiality obligations regardless of intent', true),
('00000007-0004-0003-0001-000000000003', '00000007-0004-0002-0000-000000000002', 'Acceptable only for files you personally created', false),
('00000007-0004-0004-0001-000000000003', '00000007-0004-0002-0000-000000000002', 'Yes — confidentiality obligations end on your last day of employment', false);

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000007-0005-0002-0000-000000000002', '00000007-0001-0000-0000-000000000001',
'You post on LinkedIn: "Excited to be working on a major deal in the renewable energy space — big things coming!" Your employer is identifiable from your profile. What is the problem?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000007-0005-0001-0001-000000000003', '00000007-0005-0002-0000-000000000002', 'No problem — you have not named the client or shared any financials', false),
('00000007-0005-0002-0001-000000000003', '00000007-0005-0002-0000-000000000002', 'This could breach confidentiality — hinting at unannounced deals or transactions on public channels can harm the company and potentially constitute a disclosure violation', true),
('00000007-0005-0003-0001-000000000003', '00000007-0005-0002-0000-000000000002', 'Only a problem if the post gets more than 1,000 impressions', false),
('00000007-0005-0004-0001-000000000003', '00000007-0005-0002-0000-000000000002', 'No problem — LinkedIn posts are considered personal communication', false);

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000007-0006-0002-0000-000000000002', '00000007-0001-0000-0000-000000000001',
'A journalist calls and says they are writing an article about your industry and would like a "quick background comment — nothing on the record." What should you do?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000007-0006-0001-0001-000000000003', '00000007-0006-0002-0000-000000000002', 'Speak briefly — an off-the-record comment cannot be attributed to you or the company', false),
('00000007-0006-0002-0001-000000000003', '00000007-0006-0002-0000-000000000002', 'Decline and direct them to the company''s designated communications contact — all media enquiries must go through the official channel', true),
('00000007-0006-0003-0001-000000000003', '00000007-0006-0002-0000-000000000002', 'Answer general industry questions but avoid anything specific to the company', false),
('00000007-0006-0004-0001-000000000003', '00000007-0006-0002-0000-000000000002', 'Agree to speak but inform your manager afterwards', false);

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000007-0007-0002-0000-000000000002', '00000007-0001-0000-0000-000000000001',
'You suspect your manager is approving inflated expense claims. You are nervous about raising it because your manager controls your appraisal. What should you do?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000007-0007-0001-0001-000000000003', '00000007-0007-0002-0000-000000000002', 'Do nothing — it is your manager''s responsibility, not yours', false),
('00000007-0007-0002-0001-000000000003', '00000007-0007-0002-0000-000000000002', 'Report it to HR, the Ethics Hotline, or the Audit Committee — you are legally protected from retaliation for raising a genuine concern in good faith', true),
('00000007-0007-0003-0001-000000000003', '00000007-0007-0002-0000-000000000002', 'Wait until after your appraisal before raising it', false),
('00000007-0007-0004-0001-000000000003', '00000007-0007-0002-0000-000000000002', 'Raise it with your manager directly — they should know you are watching', false);

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000007-0008-0002-0000-000000000002', '00000007-0001-0000-0000-000000000001',
'A client offers your team tickets to a prestigious cricket match. The tickets are worth approximately ₹8,000 each. A contract negotiation with this client is currently in progress. What is the correct response?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000007-0008-0001-0001-000000000003', '00000007-0008-0002-0000-000000000002', 'Accept — cricket is a normal business hospitality activity in India', false),
('00000007-0008-0002-0001-000000000003', '00000007-0008-0002-0000-000000000002', 'Decline — the timing (during an active contract negotiation) makes this inappropriate regardless of value; disclose the offer to your manager', true),
('00000007-0008-0003-0001-000000000003', '00000007-0008-0002-0000-000000000002', 'Accept but declare it after the contract is signed', false),
('00000007-0008-0004-0001-000000000003', '00000007-0008-0002-0000-000000000002', 'Accept only if the entire team attends together', false);

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000007-0009-0002-0000-000000000002', '00000007-0001-0000-0000-000000000001',
'Which of the following best describes what "recusal" means in the context of a conflict of interest?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000007-0009-0001-0001-000000000003', '00000007-0009-0002-0000-000000000002', 'Submitting a written report to HR explaining the conflict', false),
('00000007-0009-0002-0001-000000000003', '00000007-0009-0002-0000-000000000002', 'Removing yourself entirely from a decision — not participating in discussions, reviewing materials, or influencing the outcome in any way', true),
('00000007-0009-0003-0001-000000000003', '00000007-0009-0002-0000-000000000002', 'Asking a colleague to make the decision on your behalf while staying informed', false),
('00000007-0009-0004-0001-000000000003', '00000007-0009-0002-0000-000000000002', 'Declaring the conflict verbally in a meeting and then proceeding as normal', false);

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000007-0010-0002-0000-000000000002', '00000007-0001-0000-0000-000000000001',
'A colleague asks you to share the salary details of two team members so they can verify they are being paid fairly compared to their peers. You have access to this information. Should you share it?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000007-0010-0001-0001-000000000003', '00000007-0010-0002-0000-000000000002', 'Yes — pay transparency is fair and helps colleagues advocate for themselves', false),
('00000007-0010-0002-0001-000000000003', '00000007-0010-0002-0000-000000000002', 'No — employee salary information is confidential; sharing it without authorization violates the Code and data privacy obligations regardless of motive', true),
('00000007-0010-0003-0001-000000000003', '00000007-0010-0002-0000-000000000002', 'Yes — if you have access, you are trusted to use it as you judge appropriate', false),
('00000007-0010-0004-0001-000000000003', '00000007-0010-0002-0000-000000000002', 'Only if the colleague promises to keep it confidential', false);

COMMIT;
