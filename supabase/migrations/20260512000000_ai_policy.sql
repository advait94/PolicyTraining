BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: organization_ai_policy
-- Stores the admin quiz answers and resolved tier per org.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.organization_ai_policy (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    completed_by        UUID        REFERENCES auth.users(id),
    allow_invoices      BOOLEAN     NOT NULL,
    allow_specs         BOOLEAN     NOT NULL,
    allow_legal_docs    BOOLEAN     NOT NULL,
    allow_situational   BOOLEAN     NOT NULL,
    assigned_tier       SMALLINT    NOT NULL CHECK (assigned_tier IN (1, 2, 3)),
    assigned_module_id  UUID        NOT NULL REFERENCES public.modules(id),
    completed_at        TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id)
);

ALTER TABLE public.organization_ai_policy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org AI policy" ON public.organization_ai_policy
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage their org AI policy" ON public.organization_ai_policy
    FOR ALL USING (public.is_org_admin(organization_id))
    WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Superadmins can manage all AI policies" ON public.organization_ai_policy
    FOR ALL USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- MODULE 1: AI in the Workplace – Restricted Use  (Tier 1)
-- ID: 0000000a-0001-0000-0000-000000000001  sequence_order: 51
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.modules (id, title, description, sequence_order)
VALUES (
    '0000000a-0001-0000-0000-000000000001',
    'AI in the Workplace – Restricted Use',
    'For organizations with conservative AI policies — covers what AI can and cannot be used for, how to ask questions without sharing sensitive documents, approved use cases, and responsible AI habits when document sharing is not permitted.',
    51
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order) VALUES

('0000000a-0001-0001-0000-000000000001', '0000000a-0001-0000-0000-000000000001',
'Introduction — AI at Work Under a Restricted Policy',
$$> **Training Objective:** By the end of this module you will understand exactly what AI tools can and cannot be used for at your organization, how to get the benefit of AI without sharing any documents, and what to do when you are unsure.

## Why Your Organization Has a Restricted AI Policy

AI tools — including generative AI assistants like ChatGPT, Copilot, and Gemini — are powerful productivity tools. However, they also carry real data security risks. Your organization has evaluated those risks and concluded that, for now, **document sharing with AI systems is not permitted**.

This is not a permanent ban on AI. It is a measured policy that protects the company and its clients while AI governance frameworks mature.

> **What This Means in Practice:**
> - You may use AI for general knowledge questions and drafting help
> - You must **not** paste, upload, or describe the contents of any company document into an AI tool
> - You must **not** share client data, financial figures, or project specifics with AI
> - When in doubt, do not share it

## Why Document Sharing Is the Core Risk

When you paste a document into an AI tool, you are transmitting that data to a third-party server. Depending on the tool's privacy settings, that data may be:
- Used to train future AI models
- Stored indefinitely by the AI provider
- Accessible to the AI provider's staff for safety reviews
- Potentially exposed if the provider suffers a breach

Even if the risk seems theoretical, the consequences of a confidential document appearing in an AI training dataset — or in another user's AI response — are severe.

## What You Will Learn

1. The types of AI use that are permitted
2. How to use AI productively without sharing documents
3. The anonymization technique — how to ask about scenarios without revealing real data
4. Approved use cases at your organization
5. How to recognize and report a policy violation$$, 1),

('0000000a-0002-0001-0000-000000000001', '0000000a-0001-0000-0000-000000000001',
'What AI Can and Cannot Do for You',
$$## Understanding What Generative AI Actually Does

Before you can use AI responsibly, you need to understand what it is. AI language models are trained on vast amounts of text. When you ask a question, the model generates a response based on patterns in that training data — it does not search the internet (unless specifically connected to a search tool) and it does not "know" your company.

### AI Is Good At

| Task | Example |
|---|---|
| Explaining general concepts | "Explain what a Bill of Materials is" |
| Drafting and editing text | "Help me write a professional email declining a meeting" |
| Summarising public information | "What are the key provisions of the DPDP Act 2023?" |
| Brainstorming ideas | "What are 5 ways to improve team stand-up meetings?" |
| Writing templates | "Give me a template for a vendor evaluation form" |
| Translating or simplifying language | "Simplify this legal definition into plain English" |
| Learning new skills | "Teach me how pivot tables work in Excel" |

### AI Is NOT Appropriate For (Under This Policy)

| Task | Why It Is Prohibited |
|---|---|
| Pasting in an invoice and asking AI to summarise it | The invoice contains financial data and vendor information |
| Uploading a contract for AI to review | Legal documents contain confidential obligations and counterparty details |
| Describing a specific client's situation with their name | Client data must not leave company systems |
| Asking AI to analyse a specific employee's performance data | Personal data protection obligations apply |
| Sharing pricing information | Commercially sensitive — could expose competitive strategy |

> **The Simple Test:** Before using AI, ask yourself — "Would I be comfortable if this exact text appeared on a public website?" If the answer is no, do not share it with AI.$$, 2),

('0000000a-0003-0001-0000-000000000001', '0000000a-0001-0000-0000-000000000001',
'The Anonymization Technique — Getting Help Without Sharing Actuals',
$$## How to Ask AI About Real Situations Without Sharing Real Data

The single most valuable skill for using AI under a restricted policy is **anonymization** — the practice of replacing real, identifiable details with fictional or generic stand-ins before asking your question.

### The Principle

You do not need to share the actual document. You need to share **the shape of the problem** — the type of situation, the general context, and the decision you need to make. AI can help you think through that without ever seeing the real data.

### Before and After Examples

**Scenario: You have an invoice that seems to have an error in the tax calculation.**

- **Do not do this:** *"Here is our invoice from Tata Steel dated March 2026 for ₹4,82,000 — the GST seems wrong"*
- **Do this instead:** *"A vendor invoice shows a total of approximately ₹5 lakhs. The stated GST is 12%. How do I verify whether GST has been calculated correctly, and what should I check?"*

**Scenario: You need to draft a follow-up email about a delayed delivery.**

- **Do not do this:** Paste the original supplier email thread
- **Do this instead:** *"Help me draft a professional follow-up email to a supplier who is 2 weeks behind on a component delivery. The tone should be firm but collaborative."*

**Scenario: You are trying to understand a clause in a contract.**

- **Do not do this:** Paste the contract clause
- **Do this instead:** *"In general terms, what does an 'indemnification clause' in a vendor contract usually mean for the buyer?"*

### What to Anonymize

| Replace This | With This |
|---|---|
| Company name | "my company" or "a mid-sized manufacturing firm" |
| Client name | "a large retail client" |
| Specific amounts | "approximately ₹X lakhs" or "a five-figure sum" |
| Employee names | "a team member" or "a colleague" |
| Vendor names | "a raw material supplier" |
| Dates | "last quarter" or "this month" |
| Project names | "an infrastructure project" |

> **Key Insight:** The more specific your question, the more specific AI's answer. You do not need real data to get a specific answer — you need a well-framed, specific question.$$, 3),

('0000000a-0004-0001-0000-000000000001', '0000000a-0001-0000-0000-000000000001',
'Approved Use Cases and Practical Examples',
$$## What You Are Specifically Permitted to Use AI For

Your organization permits the following categories of AI use. These have been evaluated as low-risk because they do not involve sharing company-specific data.

### 1. Learning and Skill Development
Use AI as a personal tutor. Ask it to explain concepts, walk you through calculations, or teach you how to use tools.
- *"Explain the difference between FIFO and weighted average costing"*
- *"How does VLOOKUP work in Excel? Show me with a simple example"*
- *"What are the main risks in a construction subcontract?"*

### 2. Writing and Communication
Use AI to improve the quality of your writing. Give it a general context and ask for a draft — then customize with real details yourself.
- *"Help me write a polite but firm escalation email when a vendor has missed a deadline three times"*
- *"Review this paragraph for clarity and grammar"* — (acceptable as long as no confidential content is included)
- *"Draft a meeting agenda for a project kick-off"*

### 3. Process and Template Creation
Use AI to create blank frameworks and templates.
- *"Create a risk register template for a mid-size project"*
- *"What columns should a vendor comparison spreadsheet include?"*
- *"Give me a checklist for onboarding a new team member"*

### 4. Situational Reasoning
Use the anonymization technique to get AI's help thinking through a problem.
- *"In general, when a customer asks for a credit note without providing a reason, what steps should a finance team take?"*
- *"A project is 3 weeks behind and the client doesn't know yet. What are my options?"* — (no real client name, no project specifics)

### 5. Research and Background Reading
Ask AI to explain regulatory, market, or technical topics.
- *"What is REACH compliance in chemical manufacturing?"*
- *"Summarize the key obligations under India's DPDP Act 2023"*

> **Before Every AI Interaction:** Ask yourself — does my input contain any real company data, client data, financial figures, or project-specific information? If yes, anonymize or do not use AI.$$, 4),

('0000000a-0005-0001-0000-000000000001', '0000000a-0001-0000-0000-000000000001',
'Situational Questions — Your Most Powerful AI Tool',
$$## Why Situational AI Questions Are Always Safe

Situational questions are the safest and most effective way to use AI. They give you the thinking support of a knowledgeable expert without requiring you to share any real data.

### What Makes a Question "Situational"

A situational question describes **a type of scenario** and asks for **guidance on how to think about or handle it**. It does not include specific names, figures, or documents.

### High-Value Situational Questions by Department

**Finance and Accounts:**
- *"A client disputing an invoice has stopped responding. What are the escalation options available to a finance team?"*
- *"In general, what are the most common causes of a bank reconciliation discrepancy?"*

**Operations and Supply Chain:**
- *"A key supplier has requested a 15% price increase mid-contract, citing raw material costs. How should procurement evaluate whether this is reasonable?"*
- *"What factors should be considered when evaluating whether to dual-source a critical component?"*

**HR and People:**
- *"An employee has raised a concern about a manager's behavior that does not clearly constitute a policy violation. What is the best process for HR to follow?"*
- *"What are the best practices for a structured performance improvement plan conversation?"*

**Legal and Compliance:**
- *"In general, what due diligence steps are typically required before signing a distribution agreement in a new market?"*
- *"What questions should a compliance officer ask when evaluating a new third-party vendor's integrity risks?"*

> **The Power of This Approach:** With well-framed situational questions, you can get expert-level guidance on nearly any business challenge — without ever risking a data breach. This is the recommended and approved approach for all employees.$$, 5),

('0000000a-0006-0001-0000-000000000001', '0000000a-0001-0000-0000-000000000001',
'Recognizing and Reporting a Policy Violation',
$$## Your Obligations When Something Goes Wrong

Mistakes happen. What matters is that they are caught and reported quickly. The longer a data exposure sits unreported, the more potential damage it causes.

### Situations That Are Policy Violations

You must report any of the following:
- You accidentally pasted a real document, real client name, or real financial data into an AI tool
- A colleague tells you they have been sharing documents with AI
- You discover an AI tool that is connected to company data without your IT team having approved it
- You used an AI tool that you later realize retains all inputs and shows them to the provider

### How to Report

Your organization has a designated reporting channel. Depending on your setup:
- Email your direct manager or IT Security team immediately
- Log the incident in the internal compliance system if one exists
- If you are unsure who to tell, escalate to HR

> **You Will Not Be Penalized for Honest Reporting:** The policy exists to protect the organization. Reporting an accidental violation promptly is the responsible thing to do. Concealing a known violation is the policy breach that carries consequences.

### What Happens After You Report

1. IT Security assesses whether any sensitive data was exposed
2. The AI provider is contacted if necessary to request data deletion
3. An incident record is created
4. If the exposure involves client data, the client may need to be notified

### Building Good Habits

- **Before using AI:** Pause and ask — "Does my input contain any real company data?"
- **When in doubt:** Use the anonymization technique or do not use AI for that task
- **Keep up to date:** AI policy will evolve. Pay attention to updates from IT and HR.

> **Final Principle:** AI is a tool that works for you. Your job is to ensure it never works against your organization by becoming a channel for data exposure.$$, 6);

-- ─────────────────────────────────────────────────────────────────────────────
-- MODULE 2: AI in the Workplace – Standard Use  (Tier 2)
-- ID: 0000000b-0001-0000-0000-000000000001  sequence_order: 52
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.modules (id, title, description, sequence_order)
VALUES (
    '0000000b-0001-0000-0000-000000000001',
    'AI in the Workplace – Standard Use',
    'For organizations that permit operational document sharing (invoices, specs) but restrict legal and personal documents — covers data minimization, what not to share, verifying AI outputs, and best practices for moderate AI use.',
    52
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order) VALUES

('0000000b-0001-0001-0000-000000000001', '0000000b-0001-0000-0000-000000000001',
'Introduction — AI at Work Under a Standard Policy',
$$> **Training Objective:** By the end of this module you will understand which documents you are permitted to share with AI, how to minimize data exposure even with permitted documents, what is strictly off-limits, and why AI outputs always require verification before you act on them.

## Your Organization's Standard AI Policy

Your organization has evaluated the risks and benefits of AI tool use and landed on a **Standard Use** policy. This means:

**Permitted with care:**
- Operational documents such as invoices, Bills of Materials (BoM), and technical specifications may be shared with approved AI tools to support your work
- Situational questions — asking AI how to think about a scenario without sharing the actual document — are always permitted and encouraged

**Not permitted under any circumstances:**
- Legal and contractual documents (NDAs, agreements, terms of service)
- Personal data about employees, customers, or third parties
- Salary, compensation, or HR records
- Board-level or investor-related communications
- Documents marked "Confidential" or "Restricted"

## Why Operational Documents Are Different

An invoice or a product specification sheet typically contains information that is:
- Already known to multiple external parties (suppliers, logistics, QA teams)
- Less competitively sensitive than strategic or legal documents
- Practical and time-bound in nature

That said, **even operational documents require care.** The goal is always to share the minimum necessary and verify what AI gives you.

## What You Will Learn

1. How to share operational documents safely
2. The data minimization principle
3. What is never permitted to share
4. Verifying AI outputs — why this matters
5. Situational questions — the always-safe alternative
6. Incident reporting$$, 1),

('0000000b-0002-0001-0000-000000000001', '0000000b-0001-0000-0000-000000000001',
'Sharing Operational Documents Safely',
$$## The Rules for Sharing Invoices, BoMs, and Specs

Your policy permits sharing these document types with AI tools that have been approved by your IT or management team. The following rules apply every time.

### Before You Share Any Document

**Step 1: Check the tool is approved.**
Only use AI tools that your organization has vetted. Using a consumer-grade AI tool (a free personal account) with work documents is not permitted, even if the document type is allowed.

**Step 2: Check the document classification.**
If the document has a confidentiality label ("Restricted," "Confidential," "Internal Only"), do not share it regardless of document type.

**Step 3: Apply data minimization.**
You do not need to share the entire document. Extract or describe only the part relevant to your question.

### Data Minimization in Practice

| Situation | Full Document Share (Avoid) | Minimized Share (Preferred) |
|---|---|---|
| Checking a BoM for a missing component | Upload the entire 50-line BoM | Share only the relevant section or a simplified version |
| Comparing two invoices for discrepancies | Upload both full invoices | Share the specific line items that differ |
| Asking AI to explain a spec parameter | Upload the full spec sheet | Paste only the relevant parameter and its value |
| Summarizing delivery terms | Upload the entire purchase order | Share only the delivery terms section |

### What to Remove Before Sharing

Even from a permitted operational document, remove or redact:
- Full names of individual employees
- Personal contact details (mobile numbers, home addresses)
- Bank account details
- Any content that was added to the document by hand and is not the original typed content

> **Good Habit:** Before pasting anything into AI, spend 30 seconds reading it and asking — "Is there anything in here that goes beyond what's needed for my question?"$$, 2),

('0000000b-0003-0001-0000-000000000001', '0000000b-0001-0000-0000-000000000001',
'What You Must Never Share With AI',
$$## The Hard Limits Under This Policy

Your Standard Use policy draws a clear line at legal, personal, and strategic documents. These are off-limits regardless of how pressing the task feels.

### Legal and Contractual Documents

| Document Type | Why It Is Prohibited |
|---|---|
| NDAs and confidentiality agreements | Contain obligations to third parties who have not consented to AI processing |
| Vendor and customer contracts | Competitively sensitive; may contain force majeure, liability caps, and pricing that must stay confidential |
| Employment agreements | Contain personal data and legal obligations to employees |
| Settlement agreements | Highly sensitive; often contain explicit confidentiality clauses |
| Board resolutions | Strategic and governance-sensitive |

> **Even if you only need one clause** from a legal document — do not paste it into AI. Instead, describe the clause type and ask for a general explanation. Example: *"What does a limitation of liability clause typically mean for the service provider?"*

### Personal Data

The DPDP Act 2023 and most privacy frameworks restrict how personal data is processed. Sharing employee names, performance data, salary details, health information, or customer personal data with an AI tool is a data protection violation — regardless of whether the AI gives a useful answer.

### Financially Sensitive Strategic Data

- Unpublished financial results or forecasts
- Pricing models and discount structures
- M&A or fundraising information
- Pipeline or opportunity data with customer names

### The Test

Before sharing any document or data with AI, ask:
1. Is this document on the approved types list? (Invoices, BoMs, specs = yes; legal docs, HR records = no)
2. Does it contain personal data that I have not removed?
3. Could this document harm the company or a third party if it appeared outside this conversation?

If any answer is "yes" or "unsure" — do not share it. Use the situational approach instead.$$, 3),

('0000000b-0004-0001-0000-000000000001', '0000000b-0001-0000-0000-000000000001',
'Verifying AI Outputs — Why AI Is Always a Starting Point',
$$## AI Gets Things Wrong — Especially on Specifics

Generative AI tools are designed to produce fluent, confident-sounding responses. This is precisely what makes them dangerous when used without verification — they can be wrong in ways that sound completely right.

### Types of AI Errors You Will Encounter

**Hallucination:** AI confidently states a specific fact — a number, a name, a law — that is simply incorrect.
*Example: AI quotes a GST rate that was changed two years ago and gives you the old figure.*

**Outdated information:** AI training data has a cutoff date. Tax rules, regulatory requirements, and standards change.
*Example: AI describes a compliance requirement that has since been amended.*

**Context errors:** AI misunderstands a term or applies a general rule to a specific context where it does not apply.
*Example: AI gives advice on a general invoice format when your specific client requires a format that follows their ERP system's requirements.*

**Partial answers:** AI solves part of the problem and presents it as the complete answer.
*Example: AI identifies three issues in a BoM but misses a fourth because it only processed a portion of the data.*

### Verification Rules

| AI Output Type | How to Verify |
|---|---|
| Financial calculations (tax, totals) | Recompute manually or in a spreadsheet |
| Legal or regulatory statements | Check against the original source law or your legal team |
| Supplier or product specifications | Cross-check against the original supplier document |
| Drafts and communications | Read carefully; AI may add commitments or promises you did not intend |
| Process recommendations | Validate against your internal SOPs |

> **The Golden Rule:** AI output is a first draft and a starting point. You are accountable for every action you take based on it. If an AI-generated figure appears in an email you send, or an AI-drafted clause appears in a document you sign — you own that content.$$, 4),

('0000000b-0005-0001-0000-000000000001', '0000000b-0001-0000-0000-000000000001',
'Situational Questions — Always Safe, Often Better',
$$## When to Use Situational Questions Instead of Sharing Documents

Even though your policy permits sharing certain operational documents with AI, situational questions are often the faster, safer, and equally effective approach. Before sharing a document, always ask: *"Could I get a useful answer by describing the situation instead?"*

### Situational vs. Document-Based Comparison

| Task | Document-Based Approach | Situational Approach |
|---|---|---|
| Understanding a spec parameter | Share the spec sheet | "What does 'tensile strength 550 MPa minimum' mean in a steel specification, and what testing method verifies it?" |
| Checking an invoice calculation | Share the invoice | "An invoice shows quantity 200, unit price ₹450, and a 12% GST rate. Is the total of ₹1,00,800 correct?" |
| Improving a BoM structure | Share the full BoM | "What columns should a manufacturing Bill of Materials include for a product with 50+ components?" |
| Understanding delivery terms | Share the purchase order | "What does 'Ex-Works (EXW) Incoterms' mean for the buyer in terms of transport and risk?" |

### Best Practices for Situational Questions

1. **Be specific about the type of scenario** — AI gives better answers when it understands the industry, transaction type, and what decision you are trying to make
2. **Ask for reasoning, not just answers** — "Walk me through the calculation" is more useful than "What is the answer?"
3. **Follow up** — treat AI like a conversation; a follow-up question often gets you a much more useful response
4. **Save useful question formats** — if a situational question format works well, save it as a template for future use

> **Under both situational and document-based approaches, always verify the output before taking action.**$$, 5),

('0000000b-0006-0001-0000-000000000001', '0000000b-0001-0000-0000-000000000001',
'Incident Reporting and Keeping the Policy Current',
$$## What to Do When Something Goes Wrong

The Standard Use policy is designed with the understanding that occasional mistakes will happen. The response to a mistake matters more than the mistake itself.

### Events You Must Report Immediately

- You shared a legal or contractual document with AI (even accidentally)
- You shared personal data about employees or customers with AI
- You used an unapproved AI tool with any work-related document
- You received an AI response that included information that appeared to come from another company or individual — this may indicate the tool is not secure
- A colleague is sharing documents that appear to violate this policy

### How to Report

Contact your IT Security team or line manager within the same working day. Provide:
- What tool you used
- What you shared with it
- When it happened
- Any output the AI generated based on that input

> **There is no penalty for prompt, honest reporting.** The policy exists to protect the organization. Acting quickly after a mistake limits the damage. The misconduct is concealment, not the mistake.

### Policy Updates

AI tools and their privacy practices change rapidly. Your organization will update this policy as the landscape evolves. Watch for communications from IT, HR, or Compliance about:
- New approved or prohibited tools
- Changes to which document types may be shared
- New data handling requirements from regulators

> **Summary:** Operational documents may be shared with approved AI tools, with data minimization applied. Legal documents, personal data, and strategic information are never permitted. Every AI output requires verification before action. Situational questions are always a safe and effective alternative.$$, 6);

-- ─────────────────────────────────────────────────────────────────────────────
-- MODULE 3: AI in the Workplace – Responsible Use  (Tier 3)
-- ID: 0000000c-0001-0000-0000-000000000001  sequence_order: 53
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.modules (id, title, description, sequence_order)
VALUES (
    '0000000c-0001-0000-0000-000000000001',
    'AI in the Workplace – Responsible Use',
    'For organizations with an open AI policy — covers responsible use across all document types including legal documents, governance and confidentiality obligations, handling sensitive material with AI, validating AI-generated content, and building a culture of accountable AI use.',
    53
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.slides (id, module_id, title, content, sequence_order) VALUES

('0000000c-0001-0001-0000-000000000001', '0000000c-0001-0000-0000-000000000001',
'Introduction — AI at Work Under an Open Policy',
$$> **Training Objective:** By the end of this module you will understand how to use AI across all document types — including legal and contractual documents — with appropriate governance, confidentiality awareness, output validation discipline, and accountability.

## Your Organization's Open AI Policy

Your organization has evaluated AI tools and concluded that employees may use AI across a broad range of document types, including legal and contractual documents, provided that responsible use principles are consistently applied.

**This is a high-trust policy.** With greater access comes greater responsibility.

### What "Open" Means

| Permitted | With What Obligation |
|---|---|
| Sharing operational documents (invoices, BoMs, specs) | Data minimization; use approved tools only |
| Sharing legal and contractual documents | Understand confidentiality obligations; do not share third-party documents beyond what the counterparty has consented to |
| Asking AI situational questions | Always safe and often the better choice |
| Using AI to draft, review, and analyze documents | Output must be verified and reviewed by an accountable human before use |

### What This Policy Does Not Permit

Even under an open policy, the following remain prohibited:
- Sharing personal data (employee, customer, or third-party) beyond what is strictly required
- Using unapproved AI tools with sensitive documents
- Treating AI output as final — a human must review, verify, and take accountability for anything AI produces
- Sharing another party's confidential information beyond the terms of the agreement you have with them

## What You Will Learn

1. Governance — the framework around responsible AI use
2. Working with legal and contractual documents
3. Confidentiality obligations that travel with sensitive documents
4. Output validation — why human review is non-negotiable
5. Situational questions — the always-safe approach
6. Accountability and incident response$$, 1),

('0000000c-0002-0001-0000-000000000001', '0000000c-0001-0000-0000-000000000001',
'Governance — The Framework for Open AI Use',
$$## Why Governance Matters More as Access Increases

An open AI policy dramatically expands what employees can do with AI tools. Without a governance framework, this freedom can quickly translate into inconsistent practices, accidental breaches, and outcomes the organization cannot defend.

Governance does not restrict your use of AI — it ensures the organization can stand behind it.

### The Four Pillars of AI Governance

**1. Approved Tools Only**
Not all AI tools are equal. Consumer AI tools may store your inputs indefinitely, use them for training, and share them with third parties. Your organization maintains a list of approved tools that have been vetted for enterprise data handling.
- *Only use tools on the approved list*
- *If you find a tool that would be useful and is not on the list, request approval rather than using it anyway*

**2. Data Classification Awareness**
Every document your organization handles belongs to a data classification level. Before sharing with AI, you must know what level the document is.

| Classification | Example | AI Sharing Rule |
|---|---|---|
| Public | Published brochures, public pricing | Always permitted |
| Internal | Process documents, meeting minutes | Permitted with approved tools |
| Confidential | Contracts, financial data, client data | Permitted with additional care |
| Restricted | Board papers, M&A, regulatory findings | Special approval required |

**3. Human Accountability**
AI is a tool, not a decision-maker. You are responsible for every output that carries your name or your action. If an AI-generated clause appears in a contract you signed — you signed that clause.

**4. Incident Reporting**
Errors will happen. Report them promptly. The governance framework is not punitive — it is protective. Prompt reporting limits damage and allows the organization to respond.

> **Governance Summary:** Approved tools + data awareness + human accountability + transparent reporting = responsible AI use.$$, 2),

('0000000c-0003-0001-0000-000000000001', '0000000c-0001-0000-0000-000000000001',
'Working With Legal and Contractual Documents',
$$## Special Obligations When AI Meets Legal Documents

Legal documents are permitted under your policy, but they carry unique obligations that do not apply to operational documents. Before sharing any legal document with AI, understand what obligations travel with it.

### Confidentiality Obligations in Contracts

Most commercial contracts contain a confidentiality clause. That clause restricts how the information in the contract can be shared — and **it applies to AI tools too**.

> **Practical Rule:** Before sharing a contract or clause with an AI tool, check whether the contract has a confidentiality clause. If it does, sharing the contract contents with a third-party AI tool may breach that obligation — even if the AI tool is approved by your IT team. When in doubt, check with your legal team.

### What AI Can Help With — Safely

| Task | Notes |
|---|---|
| Understanding unfamiliar clause types | Safe — describe the clause type, not the specific text, when there is a confidentiality risk |
| Comparing standard vs. unusual contract terms | Safe — AI can tell you what is market-standard without seeing your specific agreement |
| Drafting new contract language based on approved templates | Safe — AI generates text; legal team reviews before use |
| Summarizing your own internal policy documents | Safe — no third-party confidentiality obligation |
| Extracting action items from an internal meeting agreement | Safe with approved tools |

### What Requires Extra Caution

- **Third-party NDAs:** You have an obligation to the other party. Do not paste their confidential information into AI without considering whether this is permitted
- **Settlement agreements:** Often contain explicit "no disclosure" obligations that may extend to AI processing
- **Regulatory correspondence:** May be subject to legal privilege; confirm before sharing

### The Practical Approach for Legal Documents

1. **Identify whether the document contains third-party confidential information**
2. **Check for a confidentiality clause** — if present, consider using the situational approach
3. **If you share it, use only approved tools** and the enterprise (not personal) account
4. **Do not treat AI's output as legal advice** — always have a qualified person review

> **AI is not your legal counsel.** It is a drafting assistant, a clause explainer, and a starting-point researcher. Every legal output requires human legal review.$$, 3),

('0000000c-0004-0001-0000-000000000001', '0000000c-0001-0000-0000-000000000001',
'Output Validation — Why Human Review Is Non-Negotiable',
$$## The Fundamental Rule: You Own Every Output You Use

Generative AI is not reliably accurate. It is reliably fluent — which is more dangerous than being obviously wrong.

### Why Open-Policy Environments Need Stronger Validation Habits

The more you use AI, the more opportunities there are for errors to slip through. An organization with an open AI policy that lacks strong validation culture will eventually have an AI-generated error cause a real business consequence — a contract with the wrong liability cap, an invoice with the wrong tax calculation, a compliance statement citing a superseded regulation.

### The Validation Framework

**For Documents You Will Send or Sign:**
- Read every line — AI-generated documents can contain plausible-sounding language that does not reflect your intent
- Compare key numbers and dates against source documents
- Have a second reviewer check any document with legal or financial significance
- If AI drafted contract language, have your legal team review before signature

**For Calculations and Numerical Outputs:**
- Recompute independently for any figure that will appear in a financial document
- AI can make arithmetic errors — especially with GST, compound calculations, or multi-currency conversions
- Never use an AI-provided tax rate without verifying it against the current official schedule

**For Regulatory and Legal Statements:**
- AI training data has a cutoff. Laws and regulations change.
- Any AI statement about a law, regulation, or compliance requirement must be verified against the primary source or your legal/compliance team
- "The regulation requires X" from AI is a research lead, not a confirmed fact

**For AI-Generated Drafts You Will Distribute:**
- Check that AI has not included false attributions or invented quotes
- Verify that all named parties, dates, and document references are accurate
- Look for overcommitments — AI sometimes agrees to things on your behalf in drafts that you did not intend

> **Standard:** Before any AI-assisted work product leaves your hands, a human with the relevant expertise must have read it, verified its key claims, and taken ownership of its accuracy.$$, 4),

('0000000c-0005-0001-0000-000000000001', '0000000c-0001-0000-0000-000000000001',
'Situational Questions — Always the Safer First Step',
$$## Even Under an Open Policy, Situational Questions Often Work Better

An open policy means you may share documents with AI — not that you must. Situational questions require no data sharing, carry zero confidentiality risk, and often produce answers that are just as useful as document-based analysis.

### The Strategic Value of Situational Questions in a Legal Context

Legal documents in particular benefit from the situational approach because:
- You avoid potential confidentiality obligation concerns entirely
- You force yourself to understand the issue before asking AI — which usually produces a better question
- AI's general answer helps you know what to look for in the actual document, making your own review more effective

### High-Impact Situational Question Examples

**Before reviewing a contract:**
*"What clauses in a software services agreement most commonly lead to disputes, and what should the client look for to protect themselves?"*
— Now you know what to focus on when you read the actual agreement.

**When interpreting a liability clause:**
*"In a commercial contract, what is the difference between 'direct damages' and 'consequential damages', and why does the distinction matter?"*
— You understand the concept without sharing your contract.

**When preparing for a negotiation:**
*"What are the most common negotiating positions on payment terms in a B2B services contract in India?"*
— You are better prepared without exposing your draft terms.

**For compliance research:**
*"What are the key obligations for a data processor under India's DPDP Act 2023 when handling customer personal data on behalf of a Data Fiduciary?"*
— Precise, useful, and zero data exposure.

> **Best Practice for Open Policy Users:** Use the situational approach first. Share the document with AI only when the situational approach cannot give you what you need.$$, 5),

('0000000c-0006-0001-0000-000000000001', '0000000c-0001-0000-0000-000000000001',
'Accountability, Culture, and Incident Response',
$$## Building a Culture of Accountable AI Use

An open AI policy works in the long term only if the culture around it is one of genuine accountability — not a culture where AI is used as a shield for errors or a way to move fast without thinking.

### Individual Accountability Principles

**You are always the author.** When you use AI to help write something, you are the author. You cannot attribute an error to AI. The reader, client, or regulator does not care that AI generated it — you sent it.

**Speed is not an excuse for sloppiness.** AI makes it very fast to produce documents that look complete and professional. The temptation to send without reviewing is real. Resist it.

**Disclose AI use when it matters.** In some contexts — legal submissions, formal reports, client-facing analysis — it may be important to note that AI was used in drafting. When in doubt, err on the side of disclosure.

### Recognizing and Reporting Incidents Under This Policy

| Incident Type | Action Required |
|---|---|
| You used an unapproved AI tool with a sensitive document | Report to IT Security same day |
| AI output you used turns out to contain an error that caused a business impact | Report to your manager; assess client/regulatory notification need |
| You inadvertently shared a third-party's confidential data with AI | Report to IT and Legal immediately — the counterparty may need to be notified |
| A colleague is using AI in a way that appears to violate this policy | Raise it with your manager or the compliance team |

### The Policy Evolves — So Should You

AI technology changes rapidly. Your organization will regularly review and update this policy. Be a proactive participant:
- Flag AI tools you discover that would be valuable and request approval rather than using them without it
- Share good practices with your team
- Raise concerns when you see colleagues taking shortcuts with sensitive data

> **Final Statement:** An open AI policy is a sign of organizational maturity — the belief that employees can be trusted to use powerful tools responsibly. That trust is maintained one interaction at a time, by every employee who pauses to think before sharing, validates before sending, and reports when something goes wrong.$$, 6);

-- ─────────────────────────────────────────────────────────────────────────────
-- QUIZ QUESTIONS — MODULE 1 (TIER 1 — RESTRICTED)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.questions (id, module_id, text, explanation) VALUES
('0000000a-0001-0000-0001-000000000001', '0000000a-0001-0000-0000-000000000001',
 'An employee needs to verify whether the GST on a vendor invoice is correctly calculated. Under the Restricted Use policy, what is the correct approach?',
 'The anonymization technique lets you get AI help with the calculation without sharing the actual invoice. You describe the scenario (amount, rate type) in general terms and ask AI to verify the math.'),
('0000000a-0001-0000-0001-000000000002', '0000000a-0001-0000-0000-000000000001',
 'Why does your organization prohibit sharing documents with AI tools, even if the information seems harmless?',
 'When data is transmitted to a third-party AI server, it may be stored, used for training, or exposed in a breach. The policy prevents this risk regardless of how sensitive the individual item seems.'),
('0000000a-0001-0000-0001-000000000003', '0000000a-0001-0000-0000-000000000001',
 'A colleague tells you they have been regularly pasting project specs into ChatGPT to get drafting help. What should you do?',
 'Sharing project specs violates the Restricted Use policy. This must be reported — not to get the colleague in trouble, but because it is an ongoing data exposure risk.'),
('0000000a-0001-0000-0001-000000000004', '0000000a-0001-0000-0000-000000000001',
 'Which of the following is an example of a correctly anonymized situational AI question?',
 'The correct example removes all specific identifying details (client name, exact amount, project name) and replaces them with generic descriptions, while still being specific enough to get a useful answer.'),
('0000000a-0001-0000-0001-000000000005', '0000000a-0001-0000-0000-000000000001',
 'An employee accidentally pastes a real client email into an AI tool before realizing their mistake. What is the correct next step?',
 'Prompt reporting is essential. The IT Security team needs to know immediately so they can assess the exposure and take any necessary action with the AI provider.'),
('0000000a-0001-0000-0001-000000000006', '0000000a-0001-0000-0000-000000000001',
 'Which of the following tasks is permitted under the Restricted Use policy?',
 'Asking AI to explain a general concept (like GST rate categories) involves no company data and is fully permitted. The policy restricts document sharing, not general AI use.'),
('0000000a-0001-0000-0001-000000000007', '0000000a-0001-0000-0000-000000000001',
 'What is the primary reason that even "harmless-looking" details should be anonymized before being shared with AI?',
 'Even individually harmless details can be combined with other information to identify a company, client, or individual — a process called re-identification. The policy removes this risk by requiring anonymization.');

INSERT INTO public.answers (question_id, text, is_correct) VALUES
-- Q1
('0000000a-0001-0000-0001-000000000001', 'Share the invoice with an approved AI tool as invoices are not restricted', false),
('0000000a-0001-0000-0001-000000000001', 'Ask AI: "A vendor invoice shows quantity 500, unit price ₹200, and an 18% GST rate. Is a total of ₹1,18,000 correct?" — without sharing the actual invoice', true),
('0000000a-0001-0000-0001-000000000001', 'Skip the AI check and manually calculate without any tool', false),
('0000000a-0001-0000-0001-000000000001', 'Ask a colleague to use their personal AI account to check it', false),
-- Q2
('0000000a-0001-0000-0001-000000000002', 'Because all AI tools are known to sell data to competitors', false),
('0000000a-0001-0000-0001-000000000002', 'Because data shared with AI may be stored on third-party servers, used for training, or exposed in a breach — creating a risk the organization cannot control', true),
('0000000a-0001-0000-0001-000000000002', 'Because AI gives incorrect answers when given real data', false),
('0000000a-0001-0000-0001-000000000002', 'Because the policy will be updated soon and sharing will become permissible', false),
-- Q3
('0000000a-0001-0000-0001-000000000003', 'Do nothing — it is not your responsibility to police how colleagues use AI', false),
('0000000a-0001-0000-0001-000000000003', 'Advise the colleague to delete the chat history and say nothing further', false),
('0000000a-0001-0000-0001-000000000003', 'Report this to your manager or IT Security team, as it is an ongoing policy violation and data exposure risk', true),
('0000000a-0001-0000-0001-000000000003', 'Report to the AI tool''s helpline to ask them to delete the data', false),
-- Q4
('0000000a-0001-0000-0001-000000000004', '"Can you summarize this project spec for Acme Corporation — it is attached"', false),
('0000000a-0001-0000-0001-000000000004', '"We have a project delivery issue with a ₹45,67,000 contract — can you help me write to Reliance Industries about it?"', false),
('0000000a-0001-0000-0001-000000000004', '"A supplier has requested a price increase mid-project citing raw material costs. What factors should a buyer consider when evaluating whether the request is reasonable?"', true),
('0000000a-0001-0000-0001-000000000004', '"Here is our client''s signed NDA — can you summarize the key obligations?"', false),
-- Q5
('0000000a-0001-0000-0001-000000000005', 'Close the browser tab and hope the AI tool deletes it automatically', false),
('0000000a-0001-0000-0001-000000000005', 'Report the incident to IT Security or your manager the same day, providing details of what was shared and which tool was used', true),
('0000000a-0001-0000-0001-000000000005', 'Delete your account on the AI tool to remove the data', false),
('0000000a-0001-0000-0001-000000000005', 'Wait and see whether there are any consequences before deciding whether to report', false),
-- Q6
('0000000a-0001-0000-0001-000000000006', 'Using AI to summarize a supplier NDA to understand the key obligations', false),
('0000000a-0001-0000-0001-000000000006', 'Asking AI: "What are the standard GST rate categories for goods in India?"', true),
('0000000a-0001-0000-0001-000000000006', 'Pasting a BoM to ask AI to check for missing components', false),
('0000000a-0001-0000-0001-000000000006', 'Uploading an employee performance review to get drafting suggestions', false),
-- Q7
('0000000a-0001-0000-0001-000000000007', 'Because AI tools are required by law to report all inputs to regulators', false),
('0000000a-0001-0000-0001-000000000007', 'Because specific details can be combined with other data to re-identify companies, clients, or individuals — and the policy removes that risk', true),
('0000000a-0001-0000-0001-000000000007', 'Because AI gives worse answers with real data than with anonymized data', false),
('0000000a-0001-0000-0001-000000000007', 'Because IT cannot monitor AI use when real data is involved', false);

-- ─────────────────────────────────────────────────────────────────────────────
-- QUIZ QUESTIONS — MODULE 2 (TIER 2 — STANDARD)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.questions (id, module_id, text, explanation) VALUES
('0000000b-0001-0000-0001-000000000001', '0000000b-0001-0000-0000-000000000001',
 'Under the Standard Use policy, which of the following documents may be shared with an approved AI tool?',
 'The Standard policy permits operational documents (invoices, BoMs, specs) with approved tools and data minimization applied. Legal documents and personal data remain off-limits.'),
('0000000b-0001-0000-0001-000000000002', '0000000b-0001-0000-0000-000000000001',
 'An employee wants to use AI to help review a vendor supply agreement. The agreement contains a confidentiality clause. What should they do?',
 'A confidentiality clause in the document means sharing it with a third-party AI tool may breach that obligation. The correct approach is to use the situational method — describe the clause type and ask for general guidance.'),
('0000000b-0001-0000-0001-000000000003', '0000000b-0001-0000-0000-000000000001',
 'What is "data minimization" in the context of sharing documents with AI?',
 'Data minimization means sharing only the portion of a document relevant to your question — not the entire document. This limits exposure even when sharing is permitted.'),
('0000000b-0001-0000-0001-000000000004', '0000000b-0001-0000-0000-000000000001',
 'An AI tool confidently states that the correct GST rate for a specific product category is 5%. You use this rate on an invoice you send to a client. It later turns out the rate changed to 12% eight months ago. Who is responsible?',
 'The employee who sent the invoice is responsible. AI output must always be verified against primary sources before use. The fact that AI stated it confidently does not transfer accountability.'),
('0000000b-0001-0000-0001-000000000005', '0000000b-0001-0000-0000-000000000001',
 'Which of the following is an example of correctly applying the Standard Use policy?',
 'Sharing a product spec section (not the full document) with the company''s approved enterprise AI tool follows both the permitted document type and data minimization rules.'),
('0000000b-0001-0000-0001-000000000006', '0000000b-0001-0000-0000-000000000001',
 'An employee shares a 60-line BoM with an AI tool to ask about one specific component. A better approach would have been to:',
 'Data minimization means extracting or describing only the relevant section rather than sharing the full document. This applies even when the document type is permitted.'),
('0000000b-0001-0000-0001-000000000007', '0000000b-0001-0000-0000-000000000001',
 'Which of the following must be removed from an invoice before sharing it with an AI tool under the Standard Use policy?',
 'Personal data (employee mobile numbers, personal contact details) must be removed even from permitted operational documents before sharing with AI.'),
('0000000b-0001-0000-0001-000000000008', '0000000b-0001-0000-0000-000000000001',
 'Why might a situational question sometimes be a better approach than sharing a document, even when document sharing is permitted?',
 'Situational questions are faster, carry zero confidentiality risk, and often produce equally useful answers. They also force the employee to understand the problem, which generally leads to better AI prompts.');

INSERT INTO public.answers (question_id, text, is_correct) VALUES
-- Q1
('0000000b-0001-0000-0001-000000000001', 'A non-disclosure agreement the company signed with a client', false),
('0000000b-0001-0000-0001-000000000001', 'A product specification sheet for a component being procured', true),
('0000000b-0001-0000-0001-000000000001', 'An employee''s performance appraisal form', false),
('0000000b-0001-0000-0001-000000000001', 'A board resolution authorizing a major acquisition', false),
-- Q2
('0000000b-0001-0000-0001-000000000002', 'Share the full agreement with the company''s approved AI tool since it is on the permitted list', false),
('0000000b-0001-0000-0001-000000000002', 'Use the situational approach: describe the type of clause and ask for general guidance without sharing the document text', true),
('0000000b-0001-0000-0001-000000000002', 'Share only the confidentiality clause itself — the restriction only applies to the full document', false),
('0000000b-0001-0000-0001-000000000002', 'Ask a colleague with legal training to share it with AI on your behalf', false),
-- Q3
('0000000b-0001-0000-0001-000000000003', 'Only sharing documents that are less than 2 years old', false),
('0000000b-0001-0000-0001-000000000003', 'Sharing only the portion of the document that is directly relevant to your question, rather than the full document', true),
('0000000b-0001-0000-0001-000000000003', 'Converting the document to a different file format before sharing', false),
('0000000b-0001-0000-0001-000000000003', 'Ensuring the AI tool compresses the data before processing it', false),
-- Q4
('0000000b-0001-0000-0001-000000000004', 'The AI tool provider, who gave incorrect information', false),
('0000000b-0001-0000-0001-000000000004', 'The employee who sent the invoice — AI output requires verification, and the employee is accountable for the work they submit', true),
('0000000b-0001-0000-0001-000000000004', 'The client, who should have flagged the incorrect rate on receipt', false),
('0000000b-0001-0000-0001-000000000004', 'No one — it was an honest mistake and AI errors are not attributable to employees', false),
-- Q5
('0000000b-0001-0000-0001-000000000005', 'Sharing a full 40-page vendor contract with the company''s AI tool to get a summary', false),
('0000000b-0001-0000-0001-000000000005', 'Pasting the dimensions and material specification section of a product spec sheet into the company''s approved AI tool to understand a tolerance requirement', true),
('0000000b-0001-0000-0001-000000000005', 'Using a personal AI account to check invoice calculations because the company account is slow', false),
('0000000b-0001-0000-0001-000000000005', 'Sharing an employee leave record with AI to draft a schedule', false),
-- Q6
('0000000b-0001-0000-0001-000000000006', 'Shared the BoM in PDF format rather than text', false),
('0000000b-0001-0000-0001-000000000006', 'Shared only the relevant component line and its specifications, rather than the full 60-line BoM', true),
('0000000b-0001-0000-0001-000000000006', 'Asked a manager to approve the share before proceeding', false),
('0000000b-0001-0000-0001-000000000006', 'Added a note to the AI asking it not to store the BoM', false),
-- Q7
('0000000b-0001-0000-0001-000000000007', 'The vendor''s registered company name', false),
('0000000b-0001-0000-0001-000000000007', 'A contact person''s personal mobile number and home address that appears on the invoice', true),
('0000000b-0001-0000-0001-000000000007', 'The invoice number and date', false),
('0000000b-0001-0000-0001-000000000007', 'The GST registration number of the vendor', false),
-- Q8
('0000000b-0001-0000-0001-000000000008', 'Because AI tools refuse to process documents longer than a certain length', false),
('0000000b-0001-0000-0001-000000000008', 'Because it is faster, carries no confidentiality risk, and often produces equally useful answers while also building your own understanding of the problem', true),
('0000000b-0001-0000-0001-000000000008', 'Because AI gives better answers to questions than to documents', false),
('0000000b-0001-0000-0001-000000000008', 'Because the policy does not actually permit document sharing in most cases', false);

-- ─────────────────────────────────────────────────────────────────────────────
-- QUIZ QUESTIONS — MODULE 3 (TIER 3 — OPEN)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.questions (id, module_id, text, explanation) VALUES
('0000000c-0001-0000-0001-000000000001', '0000000c-0001-0000-0000-000000000001',
 'Your organization has an Open AI policy. A colleague shares a competitor''s product brochure (publicly available) with an AI tool to help prepare a competitive analysis. Is this appropriate?',
 'Sharing publicly available information with an approved AI tool is appropriate. Open policy users still need to use approved tools, but publicly available documents carry no confidentiality obligation.'),
('0000000c-0001-0000-0001-000000000002', '0000000c-0001-0000-0000-000000000001',
 'Under an Open AI policy, an employee asks AI to draft a contract clause and sends it to a client without having it reviewed by the legal team. What is the problem with this approach?',
 'Even under an open policy, AI-generated legal content must be reviewed by an accountable human before use. The employee is the author of whatever they send — including AI-generated content.'),
('0000000c-0001-0000-0001-000000000003', '0000000c-0001-0000-0000-000000000001',
 'Before sharing a signed NDA with an AI tool, what should an employee check?',
 'NDAs contain confidentiality obligations that may restrict how the document can be shared — including with third-party AI tools. This must be checked before sharing.'),
('0000000c-0001-0000-0001-000000000004', '0000000c-0001-0000-0000-000000000001',
 'An AI tool confidently cites a specific regulation and states the penalty for non-compliance. The employee includes this in a formal compliance report. The cited regulation turns out to have been amended. What principle was violated?',
 'The output validation principle requires that any regulatory or legal statement from AI be verified against the primary source or by the legal/compliance team before being included in a formal document.'),
('0000000c-0001-0000-0001-000000000005', '0000000c-0001-0000-0000-000000000001',
 'Which of the following is always permitted under the Open AI policy, regardless of document type or tool?',
 'Situational questions — those that describe a scenario without sharing actual data — are always safe under all tiers of the AI policy because they involve no data sharing at all.'),
('0000000c-0001-0000-0001-000000000006', '0000000c-0001-0000-0000-000000000001',
 'An employee uses an AI tool that is not on the organization''s approved list because it has a feature they find useful. Under the Open AI policy, is this permitted?',
 'Open policy does not mean any AI tool. Approved tools have been vetted for enterprise data handling. Using unapproved tools bypasses that vetting and violates the governance pillar of the policy.'),
('0000000c-0001-0000-0001-000000000007', '0000000c-0001-0000-0000-000000000001',
 'What is the correct approach when AI produces an output that you used and that later turns out to contain an error that impacted a client or a business process?',
 'Errors that impact clients or business processes must be reported. The response process determines whether the client needs to be notified and what corrective action is needed. Concealment makes the situation worse.'),
('0000000c-0001-0000-0001-000000000008', '0000000c-0001-0000-0000-000000000001',
 'Why might you choose to use a situational question instead of sharing a legal document with AI, even though your Open policy permits it?',
 'The situational approach eliminates any confidentiality risk from the document, forces clarity about the actual question, and often produces a more focused and useful answer. It is the recommended first approach even under an open policy.');

INSERT INTO public.answers (question_id, text, is_correct) VALUES
-- Q1
('0000000c-0001-0000-0001-000000000001', 'No — sharing any competitor information with AI is prohibited under all policies', false),
('0000000c-0001-0000-0001-000000000001', 'Yes — sharing publicly available documents with an approved AI tool is appropriate under an Open policy', true),
('0000000c-0001-0000-0001-000000000001', 'Only if the colleague gets written approval from the legal team first', false),
('0000000c-0001-0000-0001-000000000001', 'No — competitor information is classified as Restricted regardless of its availability', false),
-- Q2
('0000000c-0001-0000-0001-000000000002', 'Nothing — Open policy permits using AI for all document types including drafting contracts', false),
('0000000c-0001-0000-0001-000000000002', 'AI-generated legal content must be reviewed by a qualified person before use; the employee is accountable for every output they send, including AI-assisted drafts', true),
('0000000c-0001-0000-0001-000000000002', 'AI-generated contract clauses are generally more accurate than human-drafted ones, so no review is needed', false),
('0000000c-0001-0000-0001-000000000002', 'The problem is using AI for contract drafting at all — this is prohibited even under an Open policy', false),
-- Q3
('0000000c-0001-0000-0001-000000000003', 'Whether the NDA was signed more than 12 months ago — older contracts have reduced confidentiality requirements', false),
('0000000c-0001-0000-0001-000000000003', 'Whether the NDA contains a confidentiality clause that may restrict sharing the document''s contents with third parties, including AI tools', true),
('0000000c-0001-0000-0001-000000000003', 'Whether the other party to the NDA is a listed company — if so, additional approval is needed', false),
('0000000c-0001-0000-0001-000000000003', 'Nothing — Open policy permits all document types including NDAs without preconditions', false),
-- Q4
('0000000c-0001-0000-0001-000000000004', 'The employee should not be penalized — AI hallucinations are the AI provider''s responsibility', false),
('0000000c-0001-0000-0001-000000000004', 'The output validation principle — all regulatory and legal statements from AI must be verified against primary sources before inclusion in formal documents', true),
('0000000c-0001-0000-0001-000000000004', 'The data minimization principle — the employee should not have shared the full regulation with AI', false),
('0000000c-0001-0000-0001-000000000004', 'The approved tools principle — if a non-approved tool was used, the AI cannot be trusted', false),
-- Q5
('0000000c-0001-0000-0001-000000000005', 'Sharing legal documents using the organization''s enterprise AI account', false),
('0000000c-0001-0000-0001-000000000005', 'Asking AI a situational question that describes the scenario without sharing any actual document or identifying data', true),
('0000000c-0001-0000-0001-000000000005', 'Sharing publicly available documents using any AI tool, including personal accounts', false),
('0000000c-0001-0000-0001-000000000005', 'Using AI to draft communications that contain company financial data', false),
-- Q6
('0000000c-0001-0000-0001-000000000006', 'Yes — Open policy means employees may use any AI tool that is useful for their work', false),
('0000000c-0001-0000-0001-000000000006', 'No — only tools on the organization''s approved list may be used; the employee should request approval for the new tool', true),
('0000000c-0001-0000-0001-000000000006', 'Yes — as long as the employee uses a personal account and not the company account', false),
('0000000c-0001-0000-0001-000000000006', 'Only if the new tool''s privacy policy is reviewed by the employee personally', false),
-- Q7
('0000000c-0001-0000-0001-000000000007', 'Say nothing unless the client notices and complains', false),
('0000000c-0001-0000-0001-000000000007', 'Report the incident to your manager immediately; work with legal or compliance to determine whether client notification is required', true),
('0000000c-0001-0000-0001-000000000007', 'File a complaint with the AI tool provider for providing incorrect output', false),
('0000000c-0001-0000-0001-000000000007', 'Correct the error quietly without reporting, to avoid drawing attention to AI-related mistakes', false),
-- Q8
('0000000c-0001-0000-0001-000000000008', 'Because the policy only permits legal document sharing for managers and above', false),
('0000000c-0001-0000-0001-000000000008', 'Because the situational approach eliminates confidentiality risk, often produces a more focused answer, and forces you to understand the question before asking it', true),
('0000000c-0001-0000-0001-000000000008', 'Because AI tools cannot accurately analyze legal documents even under an Open policy', false),
('0000000c-0001-0000-0001-000000000008', 'Because the policy only permits situational questions — document sharing with AI is never truly recommended', false);

COMMIT;
