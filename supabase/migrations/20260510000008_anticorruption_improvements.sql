-- Migration: Anti-Corruption & Anti-Bribery module content improvements
-- Changes:
--   1. Update slide 1 (intro) to list all 10 slides in the "What You Will Learn" section
--   2. Add slide 9: When You Are Solicited for a Bribe
--   3. Add slide 10: Scenarios & Case Studies
--   4. Replace Q5 (basic gift definition) with a conflict-of-interest gift scenario
--   5. Replace Q8 (Siemens fine trivia) with a solicitation response scenario

BEGIN;

-- ============================================================
-- UPDATE SLIDE 1: Reflect expanded 10-slide structure
-- (Delete + re-insert because ON CONFLICT DO NOTHING cannot update)
-- ============================================================

DELETE FROM public.slides WHERE id = '00000001-0001-0001-0000-000000000001';

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000001-0001-0001-0000-000000000001', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Introduction - Why Anti-Corruption Training Matters', $$> **Training Objectives:** By the end of this training, you will understand the legal framework, recognize corruption red flags, respond correctly when solicited, and know how to report concerns.

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
7. **Best Practices:** How to stay compliant
8. **Handling Solicitation:** What to do when someone asks you for a bribe
9. **Scenarios:** Real-world case studies to test your judgment$$, 1);

-- ============================================================
-- NEW SLIDE 9: When You Are Solicited for a Bribe
-- ============================================================

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000001-0009-0001-0000-000000000001', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'When You Are Solicited for a Bribe', $$> **This Can Happen to Anyone:** A government official, client, or supplier may hint at or directly request a payment. Knowing exactly how to respond — in the moment — is what this section prepares you for.

## Recognizing Solicitation

Solicitation is not always direct. Watch for:

- **Indirect Hints:** "These things take a long time... unless you know the right people"
- **Unexplained Delays:** Normal approvals are held up without any clear reason
- **Excessive Urgency:** Pressure to resolve something "outside normal channels"
- **Direct Demands:** An explicit request for cash, gifts, or favors in exchange for action

## Your Step-by-Step Response

1. **Stay Calm** — Do not react emotionally or make any commitment on the spot
2. **Decline Firmly and Politely** — A clear, professional refusal is all that is needed
3. **Disengage** — End the conversation without escalating or threatening
4. **Document Immediately** — Write down exactly what was said, by whom, when, and where
5. **Report to Compliance** — Notify your manager or the ethics hotline as soon as possible

> **What to Say:** *"I appreciate your assistance, but our company policy does not allow me to make such arrangements. I'll need to proceed through the standard process."*

## What NOT to Do

> **Never:**
> - Agree "just this once" — it creates leverage over you and sets a precedent
> - Make the payment first and plan to report it afterward — the payment itself is the crime
> - Suggest alternatives ("Can we arrange it differently?") — this implies willingness
> - Handle it alone — always involve compliance immediately

## You Are Protected

> **Reporting Protects You:** If you decline and report a solicitation, the company and the law protect you. You have done nothing wrong. The person making the demand is the one who broke the law. Staying silent, however, makes you a participant.$$, 9)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- NEW SLIDE 10: Scenarios & Case Studies
-- ============================================================

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000001-0010-0001-0000-000000000001', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66', 'Scenarios & Case Studies', $$> **Apply What You Have Learned:** The following scenarios reflect real situations employees face. Read each one and think about what you would do before reading the correct approach.

---

## Scenario 1: The Well-Timed Gift

**Situation:** A vendor whose contract renewal is being evaluated next week sends you a ₹4,000 gift basket. Your company's gift limit is ₹5,000, so the value is technically within policy.

> **What is the issue?** The rupee value is within the limit, but the *timing* creates a conflict of interest. Accepting a gift from someone whose contract you are about to decide on — regardless of amount — can be seen as an attempt to influence your judgment.
>
> **Correct Approach:** Decline and return the gift. Inform the vendor that you cannot accept anything while their contract is under review. Document the situation and notify your manager.

---

## Scenario 2: The Government Inspector

**Situation:** During a routine facility inspection, an official suggests the inspection report "might not go well" unless you "arrange something" for ₹10,000 to speed things along.

> **What is the issue?** This is direct solicitation for a facilitation payment — illegal under the PCA, the FCPA, and the UK Bribery Act. The amount is irrelevant.
>
> **Correct Approach:** Decline politely and professionally. Do not pay. End the meeting. Document the exact words used, the time, and the official's name or ID. Report immediately to compliance. The company will manage the situation through legal channels.

---

## Scenario 3: The Well-Connected Agent

**Situation:** You are looking to expand into a new region. A local consultant proposes a 30% commission — far above the market rate — and mentions he has "strong relationships" with the government ministry that issues the licenses you need.

> **What is the issue?** Excessive commissions combined with claimed government influence is a textbook red flag for a bribery intermediary. Your company can be held liable for bribes paid through a third party — even if you never personally made a payment.
>
> **Correct Approach:** Do not engage this consultant without full due diligence. Escalate to compliance before signing anything. If the fee cannot be justified by legitimate services rendered, do not proceed.

---

> **Key Reminder:** In all three scenarios, the right answer is not the easy one in the moment. The purpose of this training is to make the right answer your instinct.$$, 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- REPLACE WEAK QUIZ QUESTIONS WITH SCENARIO-BASED ONES
-- ============================================================

-- Q5 replacement: gift + conflict of interest scenario
-- (Delete answers first due to FK, then the question, then re-insert)

DELETE FROM public.answers  WHERE question_id = '00000001-0005-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000001-0005-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0005-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66',
        'A vendor sends you a ₹4,000 gift basket the week before their contract renewal decision. Your company''s gift limit is ₹5,000. What should you do?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000001-0005-0001-0001-000000000003', '00000001-0005-0002-0000-000000000002',
 'Accept it — it is within the approved limit', false),
('00000001-0005-0002-0001-000000000003', '00000001-0005-0002-0000-000000000002',
 'Decline or return it — the pending contract decision creates a conflict of interest', true),
('00000001-0005-0003-0001-000000000003', '00000001-0005-0002-0000-000000000002',
 'Accept it but declare it after the contract is awarded', false),
('00000001-0005-0004-0001-000000000003', '00000001-0005-0002-0000-000000000002',
 'Accept it since the final decision has not been made yet', false);

-- Q8 replacement: solicitation response scenario (was Siemens fine trivia)

DELETE FROM public.answers  WHERE question_id = '00000001-0008-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000001-0008-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000001-0008-0002-0000-000000000002', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66',
        'A government inspector hints your facility clearance will be delayed "indefinitely" unless you arrange ₹10,000. What is the correct response?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000001-0008-0001-0001-000000000003', '00000001-0008-0002-0000-000000000002',
 'Pay — it is a small amount and keeping operations running is more important', false),
('00000001-0008-0002-0001-000000000003', '00000001-0008-0002-0000-000000000002',
 'Decline, document the conversation in detail, and report immediately to compliance', true),
('00000001-0008-0003-0001-000000000003', '00000001-0008-0002-0000-000000000002',
 'Ask a colleague to make the payment on your behalf to avoid direct involvement', false),
('00000001-0008-0004-0001-000000000003', '00000001-0008-0002-0000-000000000002',
 'Promise to "look into it" and avoid giving a direct answer for now', false);

COMMIT;
