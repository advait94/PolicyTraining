-- ============================================================
-- CS Training — 5 Module Seed
-- Run in: Supabase Dashboard > SQL Editor > Paste & Run
-- Modules:
--   1. Mastering Company Law & Compliances
--   2. Advanced Board Governance
--   3. Comprehensive Company Law — CS/Legal Training
--   4. Labour Code Compliance
--   5. Training on Related Party Transactions
-- ============================================================

DO $$
DECLARE
  mod1_id uuid;
  mod2_id uuid;
  mod3_id uuid;
  mod4_id uuid;
  mod5_id uuid;
  _qid    uuid;
BEGIN

-- Safety: idempotent delete before re-seeding
DELETE FROM modules WHERE title IN (
  'Mastering Company Law & Compliances',
  'Advanced Board Governance',
  'Comprehensive Company Law — CS/Legal Training',
  'Labour Code Compliance — The New Era of Indian Labour Law',
  'Training on Related Party Transactions'
);

-- ============================================================
-- MODULE 1: Mastering Company Law & Compliances
-- ============================================================
INSERT INTO modules (title, description, sequence_order) VALUES (
  'Mastering Company Law & Compliances',
  'From Foundation to Governance under the Companies Act, 2013. Covering corporate personas, constitutional documents, management hierarchy, statutory filings, and real-world case laws.',
  100
) RETURNING id INTO mod1_id;

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod1_id, 'History of Company Law in India', $md$
## The Shift: Companies Act 1956 → 2013

The Companies Act, 2013 was a landmark overhaul of Indian corporate law, replacing the outdated 1956 Act.

| Feature | Companies Act, 1956 | Companies Act, 2013 |
|---|---|---|
| Sections | 658 — Rigid Framework | 470 — Rule-Based & Flexible |
| Approach | Government Approval Based | Self-Regulation Based |
| CSR | No obligation | Mandatory (Section 135) |
| One Person Company | Not recognised | Introduced |
| Independent Directors | Weak norms | Strict norms |

### Why the Change?

The 2013 Act shifted the philosophy from **government controlling businesses** to **businesses self-regulating with high transparency**. It was heavily influenced by major corporate scandals that demanded better governance.

### Key Introductions in the 2013 Act

**One Person Company (OPC)**
A new category allowing a single individual to incorporate a company with limited liability.

**Key Managerial Personnel (KMP)**
Formally recognised the MD/CEO, Company Secretary, and CFO as legally accountable officers.

**Mandatory CSR**
India became the first country to legally mandate Corporate Social Responsibility spending.

**Stricter Fraud Provisions**
Section 447 introduced rigorous imprisonment for corporate fraud — a non-compoundable offence.

> 💡 **Key insight:** The 2013 Act shifted philosophy from government controlling businesses to businesses self-regulating with high transparency — driven by major corporate scandals demanding better governance.
$md$, 1);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod1_id, 'What is a Company?', $md$
## The Three Pillars of a Company

A company is a **"Juristic Person"** — legally distinct from its founders, directors, and shareholders.

### Separate Legal Entity
A company can own property, sue, and be sued in its own name. It exists independently of its members.

### Perpetual Succession
*"Members may come and go, but the company survives."*
If a shareholder passes away, the company does not die — shares are simply transferred.

### Limited Liability
Personal assets of shareholders are protected from business debts. A shareholder can only lose what they invested — no more.

---

## Landmark Case: Salomon v. Salomon & Co Ltd (1897)

**Facts:** Mr. Salomon incorporated a company holding almost all shares and was also a secured creditor. The company went bankrupt; unsecured creditors claimed Salomon and the company were the same person.

**Ruling:** The House of Lords rejected the creditors' claim. Salomon as a secured creditor had legal priority completely separate from his status as a shareholder.

> ⚖️ This officially separated the identity of the owner from the identity of the business — the bedrock of corporate law globally.
$md$, 2);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod1_id, 'Types of Companies', $md$
## By Liability

**Limited by Shares** *(Most Common)*
Shareholder liability is limited to the unpaid amount on their shares.

**Limited by Guarantee**
Members guarantee to contribute a set amount if wound up. Common for NGOs, clubs, and charitable organisations.

**Unlimited Liability** *(Rare)*
Members are personally liable for the company's debts without any cap.

---

## By Control Structure

| Type | Definition | Compliance Note |
|---|---|---|
| **Holding Company** | Controls another entity by owning majority shares or controlling the board. | Transactions with subsidiaries attract Related Party Transaction rules |
| **Subsidiary Company** | Controlled by the Holding company — wholly-owned (100%) or partially. | Separate compliance obligations apply |
| **Associate Company** | Another company holds at least 20% voting power — significant influence but not control. | Must be disclosed in annual reports |

---

## By Size & Purpose

**Small Company**
Paid-up capital < ₹4 Cr AND Turnover < ₹40 Cr. Enjoys lesser compliance burden — the law scales with the business.

**Section 8 Company**
Formed for charitable objects (Commerce, Art, Science, Sports). Cannot declare dividends; profits are reinvested.

**Dormant Company**
Registered for a future project or to hold an asset/IP, with no significant accounting transactions.

> 💡 Understanding these structures is vital for Related Party Transactions. How we interact with a subsidiary is legally different from how we interact with an independent vendor.
$md$, 3);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod1_id, 'MOA & AOA — The Company Constitution', $md$
## Memorandum of Association (MOA)

The MOA is the **boundary wall** of the company — it defines what the company is and what it can legally do.

### Key Clauses

- **Name Clause** — e.g., "XYZ Private Limited" — must be unique and approved by the Registrar of Companies.
- **Registered Office Clause** — Determines which Registrar of Companies (RoC) has jurisdiction.
- **Objects Clause** — The exact business activities permitted. Any activity outside this clause is legally void.
- **Capital Clause** — Maximum authorised share capital the company can issue.

### Doctrine of Ultra Vires

**Case: Ashbury Railway Carriage and Iron Co v. Riche (1875)**

The company's MOA allowed it to "make and sell railway carriages." It signed a contract to finance and build a railway line. The court ruled the contract **void** — even with unanimous shareholder consent.

> ⚖️ We cannot legally engage in business totally unrelated to our registered objectives without first amending the MOA.

---

## Articles of Association (AOA)

If the MOA is **what we do**, the AOA is **how we do it**. It defines internal rules, procedures, and governance protocols. The AOA is subordinate to both the MOA and the Companies Act.

### Key Contents
- Rules for issuing, transferring, and forfeiting shares
- How Board meetings and Shareholder meetings are conducted, quorum rules, voting procedures
- Appointment, powers, remuneration, and retirement of Directors

---

## Constructive Notice vs. Indoor Management

**Doctrine of Constructive Notice**
The public is legally presumed to have read and understood our MOA and AOA — ignorance of our public documents is no defence.

**Doctrine of Indoor Management (Turquand's Rule)**
**Case: Royal British Bank v. Turquand (1856)**
Directors borrowed money from a bank without the required shareholder resolution. The company tried to avoid repaying.
**Ruling:** The company had to pay — the bank had the right to assume the internal resolution was duly passed.

> ⚖️ Outsiders dealing in good faith can assume our internal procedures were correctly followed — they are not required to audit our minute books.
$md$, 4);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod1_id, 'Board of Directors & Key Managerial Personnel', $md$
## Board Composition — Section 149

| Company Type | Minimum Directors | Special Requirements |
|---|---|---|
| One Person Company (OPC) | 1 | — |
| Private Company | 2 | — |
| Public Company | 3 | Women Director (for listed / large public cos.) |

- **Maximum:** 15 directors (extendable via Special Resolution)
- At least **one Resident Director** must stay in India for a minimum of **182 days** per calendar year

---

## Director Duties — Section 166

> ⚠️ Being a director is not just a title — it is a **legal trust**. Directors cannot use company information for personal gain and must immediately disclose any conflict of interest.

1. **Act in accordance with the AOA** — Directors must act within the company's constitutional documents at all times.
2. **Good faith for company objects** — Act in good faith to promote the company's objects and members' long-term interests.
3. **Due care, skill & diligence** — Exercise duties with the care a reasonably prudent person would exercise in a similar position.
4. **Avoid conflicts of interest** — Avoid direct or indirect conflicts. Cannot assign their directorial office to another person.

---

## Key Managerial Personnel (KMP)

KMPs bridge the Board and staff. Mandatory for listed companies and public companies with paid-up capital > ₹10 Cr. As **'Officers in Default'**, they bear personal liability for compliance failures.

- **Managing Director (MD) / CEO** — Principal executive who runs day-to-day operations with authority delegated by the Board.
- **Company Secretary (CS)** — The Compliance Officer. Ensures all statutory obligations under the Companies Act are met.
- **Chief Financial Officer (CFO)** — Responsible for financial reporting, accuracy, and statutory filings related to accounts.

---

## Fiduciary Duty

The 2013 Act now requires directors to act for the benefit of members, employees, the community, and the environment.

> ⚖️ A director must now consider environmental and social impact of decisions — not just the balance sheet.
$md$, 5);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod1_id, 'Board Meetings & General Meetings', $md$
## Board Meetings — Section 173

| Rule | Requirement |
|---|---|
| First meeting | Within 30 days of incorporation |
| Minimum frequency | 4 meetings per year |
| Maximum gap | 120 days between two consecutive meetings |
| Quorum | 1/3rd of total director strength OR 2 directors — whichever is higher |

Video conferencing is legally recognised for establishing quorum.

> 💡 The 120-day rule ensures management oversight is continuous — not just an annual event. Breaching this gap is a compliance violation.

---

## General Meetings — Shareholder Democracy

### Annual General Meeting (AGM)
- Held once a year — within **6 months** from the closure of the financial year
- Approves financials, declares dividends, appoints auditors

### Extraordinary General Meeting (EGM)
- Called for urgent special business that cannot wait for the AGM
- Can be requisitioned by shareholders holding **10%+ voting power**

### Notice Requirement
Minimum **21 clear days' notice** must be given to shareholders before any general meeting.

---

## Landmark Case: LIC of India v. Escorts Ltd (1986)

**Facts:** LIC (a major shareholder) tried to call an EGM to remove directors. Management tried to block them.

**Ruling:** The Supreme Court ruled in favour of LIC.

> ⚖️ Management runs the company, but they serve at the pleasure of the shareholders. If shareholders call a valid meeting to change management, the board must comply.
$md$, 6);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod1_id, 'Annual Filings, Registers & MCA21', $md$
## Annual Filing Requirements

> ⚠️ **Critical:** Missing filing deadlines results in cumulative daily penalties and can block the company from making other filings entirely.

| Form | Purpose | Deadline |
|---|---|---|
| **AOC-4** | Balance Sheet, P&L, and Board Report | Within 30 days of AGM |
| **MGT-7** | Annual Return — shareholders, directors, meetings | Within 60 days of AGM |
| **ADT-1** | Auditor Appointment notification | Within 15 days of appointment |

---

## Mandatory Statutory Registers

- **Register of Members (MGT-1)** — Complete list of all shareholders. Must be kept at the Registered Office.
- **Register of Directors & KMP** — Details including DIN, addresses, and shareholdings.
- **Register of Contracts with Related Parties** — All related party contracts must be recorded. Tampering is a criminal offence.
- **Minutes Books** — Official records of all Board and General Meeting proceedings — the legal memory of the company.

---

## MCA21 Portal — 100% Digital

- **Online Filing Only** — All forms, returns, and applications are filed online on MCA21.
- **Digital Signature Certificate (DSC)** — Required to legally sign all e-forms.
- **Director Identification Number (DIN)** — A unique, lifelong ID for any director.

> 💡 **Full transparency:** Anyone can pay ₹100 to view our public filings — investors, journalists, regulators, and competitors have easy access to our compliance status.

---

## Auditors, CSR & Penalties

**Statutory Audit** — Mandatory for 100% of companies regardless of size. Audit firms must rotate every 10 years.

**CSR Mandate — Section 135**
Applicable if: Net Worth ≥ ₹500 Cr OR Turnover ≥ ₹1000 Cr OR Net Profit ≥ ₹5 Cr.
Must spend **2% of average net profits** of the last 3 years on Schedule VII activities.

**Section 447 — Fraud**
Rigorous imprisonment from **6 months to 10 years**. Fines up to 3× the amount involved. Non-compoundable.
$md$, 7);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod1_id, 'Landmark Cases & Everyday Scenarios', $md$
## Lifting the Corporate Veil

Courts will ignore the "separate entity" rule if the corporate structure is used as a sham or for illegal purposes.

**Case: Daimler Co Ltd v. Continental Tyre & Rubber Co (1916)**
During WWI, a UK-registered company entirely controlled by German residents sued to collect a debt. The court lifted the veil and declared it an "alien enemy" company, freezing its rights.

> ⚖️ You cannot use the company structure to hide illegal acts, evade taxes, or commit fraud. Courts will 'lift the veil' and hold you personally responsible.

### Indian Scenarios for Lifting the Veil

- **Tax Evasion** — Creating dummy companies purely to split income and avoid tax
- **Defrauding Workers** — Creating a subsidiary to transfer assets and deny workers their statutory bonuses
- **Statutory Lifting** — Sections 34 & 35: Misstatements in the Prospectus hold directors personally liable

---

## Oppression & Mismanagement

**Case: Tata Consultancy Services v. Cyrus Mistry (2021)**

Cyrus Mistry was removed as Chairman and alleged "oppression" of minority shareholders. The Supreme Court ruled that a mere corporate dispute or a board's lack of confidence in a Chairman does not constitute "oppression."

> ⚖️ Oppression requires a continuous, harsh, and burdensome pattern of unfair conduct — not just disagreement with a business decision.

---

## Everyday Compliance Scenarios

**Scenario 1:** A director wants to lease a warehouse owned by his wife to the company.
✅ Must disclose interest under Section 184 and follow Related Party Transaction rules under Section 188.

**Scenario 2:** A Board Meeting is needed, but one director can only join on Zoom from abroad.
✅ Valid. Video conferencing is legally recognised for establishing quorum under the Companies Act.

**Scenario 3:** The company forgot to file Form AOC-4 last month. What now?
✅ File immediately with additional late fees to avoid compounding penalties and potential strike-off proceedings.

> 🎓 **Key takeaway:** Compliance is not just for the legal team — it happens in every contract we sign. Every employee is a compliance stakeholder.
$md$, 8);

-- Module 1 Quiz Questions
INSERT INTO questions (module_id, text) VALUES (mod1_id, 'The Companies Act, 2013 replaced the Companies Act of which year?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '1932', false), (_qid, '1956', true), (_qid, '1972', false), (_qid, '1984', false);

INSERT INTO questions (module_id, text) VALUES (mod1_id, 'Which landmark case established the principle of a company being a separate legal entity distinct from its owners?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Daimler Co v. Continental Tyre', false), (_qid, 'LIC v. Escorts Ltd', false), (_qid, 'Salomon v. Salomon & Co Ltd', true), (_qid, 'Ashbury Railway v. Riche', false);

INSERT INTO questions (module_id, text) VALUES (mod1_id, 'What is the maximum number of directors allowed on a company board before a Special Resolution is needed to increase it?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '10', false), (_qid, '12', false), (_qid, '15', true), (_qid, '20', false);

INSERT INTO questions (module_id, text) VALUES (mod1_id, 'Under Section 173, what is the maximum number of days allowed between two consecutive Board Meetings?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '60 days', false), (_qid, '90 days', false), (_qid, '120 days', true), (_qid, '180 days', false);

INSERT INTO questions (module_id, text) VALUES (mod1_id, 'Form MGT-7 (Annual Return) must be filed within how many days of the AGM?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '15 days', false), (_qid, '30 days', false), (_qid, '45 days', false), (_qid, '60 days', true);

INSERT INTO questions (module_id, text) VALUES (mod1_id, 'The Doctrine of Ultra Vires means that a company cannot act beyond the scope of its:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Articles of Association', false), (_qid, 'Objects Clause in the MOA', true), (_qid, 'Board Resolution', false), (_qid, 'Share Capital', false);

INSERT INTO questions (module_id, text) VALUES (mod1_id, 'Which section of the Companies Act, 2013 deals with Director Duties?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Section 135', false), (_qid, 'Section 149', false), (_qid, 'Section 166', true), (_qid, 'Section 173', false);

INSERT INTO questions (module_id, text) VALUES (mod1_id, 'CSR spending under Section 135 is mandatory when a company''s net profit equals or exceeds:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '₹1 Crore', false), (_qid, '₹5 Crore', true), (_qid, '₹10 Crore', false), (_qid, '₹50 Crore', false);

INSERT INTO questions (module_id, text) VALUES (mod1_id, 'The Doctrine of Indoor Management (Turquand''s Rule) protects which party?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Company directors', false), (_qid, 'Shareholders', false), (_qid, 'Outsiders dealing with the company in good faith', true), (_qid, 'Statutory auditors', false);

INSERT INTO questions (module_id, text) VALUES (mod1_id, 'Under Section 447, the maximum imprisonment for corporate fraud is:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '2 years', false), (_qid, '5 years', false), (_qid, '7 years', false), (_qid, '10 years', true);


-- ============================================================
-- MODULE 2: Advanced Board Governance
-- ============================================================
INSERT INTO modules (title, description, sequence_order) VALUES (
  'Advanced Board Governance',
  'Navigating Committees, Independence, and Complex Transactions. Covers Audit & NRC committees, Independent Director duties, Related Party Transaction approval matrices, SEBI LODR obligations, and Insider Trading regulations.',
  200
) RETURNING id INTO mod2_id;

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod2_id, 'Board Committees — The Inner Circle', $md$
## Why Board Committees?

A full Board of Directors cannot micromanage every financial and operational detail of a company. Committees solve this by creating specialized sub-groups that focus on specific risk areas and bring well-considered recommendations back to the main Board.

> 💡 Statutory Mandate: The Companies Act strictly dictates which committees **must** exist based on the company's size and public/listed status. These are not optional governance choices.

---

## The Audit Committee (Section 177)

The Audit Committee is the most powerful sub-group on the Board — the financial and ethical watchdog of the organisation.

**Composition**
- Minimum **3 directors**
- The **majority must be Independent Directors**
- The chairperson must be an independent director with financial expertise

**Core Mandate**

| Function | Description |
|---|---|
| Auditor Oversight | Recommends the appointment, re-appointment, and remuneration of statutory auditors |
| Financial Review | Examines financial statements and the auditor's report before Board approval |
| RPT Approval | Approves all Related Party Transactions — the gatekeeper against fund siphoning |
| Vigil Mechanism | Acts as the primary point of contact for whistleblowers under Section 177(9) |

> ⚠️ An Audit Committee that rubber-stamps management decisions is a compliance failure — and a liability for independent directors on that committee.

---

## Nomination & Remuneration Committee (NRC) (Section 178)

The NRC governs who sits on the Board and how much they are paid — preventing unchecked self-dealing by management.

**Composition**
- Minimum **3 non-executive directors**
- At least **half must be independent**

**Core Mandate**
1. Formulate criteria for determining qualifications, positive attributes, and independence of a director
2. Recommend the **remuneration policy** for KMPs and senior management — ensuring pay is linked to performance
3. Evaluate the **performance of every director** and the Board as a whole

---

## Other Mandatory Committees

**Stakeholders Relationship Committee**
- Resolves grievances of shareholders and debenture holders
- Ensures minority shareholders have a formal channel of redress

**Corporate Social Responsibility (CSR) Committee**
- Formulates the CSR policy and recommends the amount of expenditure to the Board
- Monitors CSR activities to ensure the mandatory **2% of average net profits** is effectively utilised
- Applicable to companies with Net Worth ≥ ₹500 Cr, Turnover ≥ ₹1000 Cr, or Net Profit ≥ ₹5 Cr

> 💡 **Board Insight:** Each committee produces minutes that are tabled at the full Board meeting. As a Board Member, you approve committee recommendations — you are not absolved of responsibility simply because a committee reviewed the matter first.
$md$, 1);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod2_id, 'Independent Directors — The Watchdogs', $md$
## Who is an Independent Director? (Section 149)

An Independent Director is a **non-executive director** who brings an outside perspective — free from management influence or financial dependency on the company.

**The Definition**
A director who does not have any **material pecuniary (financial) relationship** with the company, its promoters, or its subsidiaries — directly or indirectly.

**Disqualifications — Cannot be:**

| Disqualification | Reason |
|---|---|
| A recent former employee | Would be loyal to management that employed them |
| A relative of promoters | Family ties compromise independence |
| A major supplier or customer | Financial dependency creates a conflict |
| A partner in an audit/law firm serving the company | Professional dependency |

---

## Schedule IV: Code for Independent Directors

The Companies Act 2013 includes **Schedule IV** — a specific statutory behavioural code exclusively for Independent Directors. This is binding law, not a best-practice guideline.

**Key Duties under Schedule IV**

1. **Safeguard minority shareholders** — Ensure the interests of all stakeholders, especially minorities, are not sacrificed for the promoter group's benefit
2. **Objectively evaluate management performance** — Provide a candid, unfiltered view of whether management is delivering on the company's stated objectives
3. **Mediate in conflict situations** — When management and shareholders are in dispute, the Independent Directors must facilitate resolution, not take sides

---

## The Separate Meeting

**The Mandate:** Independent Directors must convene **at least once a year** — without the presence of any non-independent directors or any member of management.

**The Agenda**

| Item | Purpose |
|---|---|
| Performance of non-independent directors | Candid peer assessment without management present |
| Performance of the Chairperson | Evaluating whether the Board leadership is effective |
| Information flow from management | Assessing quality, quantity, and timeliness of data provided to the Board |

---

## Liability & Protection

**The Safe Harbor**
An Independent Director is only personally liable for acts where:
- The act occurred **with their knowledge** (through Board processes), OR
- They **failed to act diligently** upon receiving information

> ⚠️ "I didn't know" is a weak defence if information was available in board papers you were expected to have read. Diligence is a legal duty, not an optional commitment. Independent Directors who miss meetings or fail to question management do so at personal legal risk.
$md$, 2);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod2_id, 'Related Party Transactions — Walking the Tightrope', $md$
## Introduction to Section 188 — RPTs

**The Principle:** There is nothing inherently illegal about a company doing business with a related party.

**The Risk:** Related Party Transactions (RPTs) are the **easiest mechanism to siphon money** out of a company and defraud minority shareholders. A promoter can transfer wealth from the listed company to a privately held entity through inflated contracts.

**The Rule:** All RPTs must be **highly transparent** and go through a strict, graduated approval matrix.

---

## Identifying the Counterparty (Section 2(76))

A "related party" is broadly defined:

**Individuals**
- Directors and KMPs
- Their relatives: Spouse, parents, siblings, children and their spouses

**Entities**
| Entity Type | Why Related |
|---|---|
| Firm where a director/relative is a partner | Director has financial interest |
| Private company where a director is a member/director | Director has control or influence |
| Holding, Subsidiary, or Associate companies | Part of the same group |

> 💡 The definition is intentionally wide. If in doubt, assume a party is "related" and seek Audit Committee clearance.

---

## Arm's Length & Ordinary Course

Section 188 approval requirements are **NOT triggered** if the transaction meets **both** of these conditions simultaneously:

**Condition 1 — Ordinary Course of Business**
Is this what the company normally does in the regular conduct of its business?

**Condition 2 — Arm's Length Basis**
Is the price, terms, and conditions **exactly the same** as if the company were dealing with a total stranger?
*Any discount, extended credit period, or favourable term for a related party breaks arm's length.*

> ⚠️ If even **one condition fails**, the transaction requires formal approval. Both must be satisfied to be exempt.

---

## Who Approves What?

| Level | Approver | When Required |
|---|---|---|
| **Level 1** | Audit Committee | All RPTs. Omnibus (advance blanket) approval is permitted for repetitive transactions |
| **Level 2** | Full Board of Directors | RPTs that are NOT at arm's length OR NOT in the ordinary course. **Interested director must leave the room** |
| **Level 3** | Shareholders (Special Resolution) | If the transaction value crosses the Materiality Threshold (typically >10% of annual turnover) |

---

## Consequences of Voidable Contracts

**The 3-Month Ratification Window**
If a director enters into an RPT without obtaining the required approval, the transaction must be **ratified** by the Board or Shareholders within 3 months.

**If Not Ratified Within 3 Months:**
1. The contract becomes **voidable at the option of the Board** — it can be annulled
2. The director who entered the transaction must **indemnify the company** for all losses
3. The director can be **disqualified** from the Board and faces heavy fines
$md$, 3);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod2_id, 'SEBI LODR, Insider Trading & Board Scenarios', $md$
## SEBI LODR Regulations

**Applicability:** Mandatory for all **listed companies**.

**Stricter Than the Companies Act**
SEBI's Listing Obligations and Disclosure Requirements (LODR) Regulations frequently **override the Companies Act** where they are stricter:
- Stricter RPT definitions (more entities classified as related)
- Mandatory Risk Management Committees for the top 1000 listed companies
- Stricter board composition requirements

> ⚖️ As a Board Member of a listed company, you are governed by **two overlapping frameworks**: the Companies Act and SEBI LODR. Where they conflict, the stricter standard applies.

---

## Material Disclosures (Regulation 30)

**Disclosure Timelines**

| Event | Deadline |
|---|---|
| Most material events | Within **24 hours** of occurrence |
| Board meeting outcomes (dividends, fundraising) | Within **30 minutes** of the meeting's closure |

---

## Insider Trading (PIT Regulations)

**Unpublished Price Sensitive Information (UPSI)**
Information not yet public that, once disclosed, would likely affect the stock price.

**Trading Window Closure**
Designated Persons — **Directors, KMPs, and Finance team members** — cannot buy or sell company shares when the window is closed.

| Window Status | Period |
|---|---|
| Typically Closed | From the end of each quarter until **48 hours after** financial results are declared |

**Contra-Trade Rule**
If you purchase company shares, you **cannot sell them for 6 months** — designed to prevent short-term speculation using privileged information.

> ⚠️ As a Board Member, you are always a "Designated Person." Trades outside the window constitute insider trading. Maintain a personal compliance calendar.

---

## Board Scenario: The Overlapping Director

**The Situation:**
Director A sits on the Board of our company **and** on the Board of Company X. We are voting on a major supply contract worth ₹50 crore with Company X.

**The Legal Requirement (Section 184):**
1. Director A must **disclose their interest** at the beginning of the Board meeting
2. Director A **cannot vote** on this agenda item
3. Director A must **physically or virtually leave the meeting** while this item is discussed and voted upon

> ⚖️ Even if Director A's vote would not change the outcome, their presence during deliberation of a conflicted matter is a procedural violation.

---

## Board Scenario: The Urgent RPT

**The Situation:**
The company urgently needs a specialised software patch. The only vendor who can deliver in 24 hours is a firm owned by the CEO's daughter. There is no time to call a full Board Meeting.

**The Correct Action:**
- The transaction can only proceed if the **Audit Committee grants an immediate ad-hoc approval** (if within pre-approved omnibus limits) AND the terms are strictly at arm's length
- If the transaction **exceeds omnibus limits**, it **cannot proceed** until Board approval is obtained — no exceptions

> 💡 **Board Principle:** The governance framework exists precisely for high-pressure moments when shortcuts are tempting. A Board that bends its own rules "just this once" has no rules at all.
$md$, 4);

-- Module 2 Quiz Questions
INSERT INTO questions (module_id, text) VALUES (mod2_id, 'Under Section 177, what is the minimum number of directors required on an Audit Committee?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '2', false), (_qid, '3', true), (_qid, '4', false), (_qid, '5', false);

INSERT INTO questions (module_id, text) VALUES (mod2_id, 'The Nomination & Remuneration Committee must have at least how many non-executive directors, and what proportion must be independent?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '2 directors, all independent', false), (_qid, '3 directors, at least half independent', true), (_qid, '3 directors, all independent', false), (_qid, '4 directors, majority independent', false);

INSERT INTO questions (module_id, text) VALUES (mod2_id, 'Under Schedule IV, Independent Directors must convene a separate meeting at least:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Once every 6 months', false), (_qid, 'Once a year', true), (_qid, 'Twice a year', false), (_qid, 'Once every 2 years', false);

INSERT INTO questions (module_id, text) VALUES (mod2_id, 'For a Related Party Transaction to be exempt from Section 188 approval, it must satisfy:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Only the arm''s length condition', false), (_qid, 'Only the ordinary course of business condition', false), (_qid, 'Both arm''s length AND ordinary course of business conditions', true), (_qid, 'Either arm''s length OR ordinary course of business', false);

INSERT INTO questions (module_id, text) VALUES (mod2_id, 'When a Board member has a conflict of interest in a Related Party Transaction, what must they do?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Abstain from voting only', false), (_qid, 'Disclose the interest and abstain from voting', false), (_qid, 'Disclose the interest and leave the meeting while that item is discussed', true), (_qid, 'Submit a written objection to the Company Secretary', false);

INSERT INTO questions (module_id, text) VALUES (mod2_id, 'If an RPT entered without approval is not ratified within 3 months, which consequence applies?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'The contract is automatically void from inception', false), (_qid, 'The contract is voidable and the director must indemnify the company for losses', true), (_qid, 'The director is automatically disqualified from the Board', false), (_qid, 'The transaction must be disclosed to SEBI', false);

INSERT INTO questions (module_id, text) VALUES (mod2_id, 'Under SEBI LODR Regulation 30, board meeting outcomes must be disclosed to the stock exchange within:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '30 minutes of the meeting''s closure', true), (_qid, '2 hours of the meeting''s closure', false), (_qid, '24 hours of the meeting''s closure', false), (_qid, '48 hours of the meeting''s closure', false);

INSERT INTO questions (module_id, text) VALUES (mod2_id, 'The Trading Window under SEBI''s PIT Regulations is typically closed from:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'The start of the financial year until results are declared', false), (_qid, 'The end of each quarter until 48 hours after financial results are declared', true), (_qid, '30 days before and after each Board meeting', false), (_qid, 'The date of any material event until 24 hours after disclosure', false);

INSERT INTO questions (module_id, text) VALUES (mod2_id, 'The Contra-Trade Rule under SEBI''s PIT Regulations prohibits a Designated Person from:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Buying shares during the open trading window', false), (_qid, 'Trading in competitor company shares', false), (_qid, 'Selling shares within 6 months of buying them', true), (_qid, 'Holding more than 1% of the company''s shares', false);

INSERT INTO questions (module_id, text) VALUES (mod2_id, 'If a time-critical RPT exceeds the pre-approved omnibus limits of the Audit Committee and no Board meeting can be convened, the correct course of action is:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Proceed and ratify at the next Board meeting within 3 months', false), (_qid, 'Obtain the CEO''s written approval as an emergency measure', false), (_qid, 'The transaction cannot proceed — urgency does not override Section 188', true), (_qid, 'Obtain Audit Committee verbal approval and document it later', false);


-- ============================================================
-- MODULE 3: Comprehensive Company Law — CS/Legal Training
-- ============================================================
INSERT INTO modules (title, description, sequence_order) VALUES (
  'Comprehensive Company Law — CS/Legal Training',
  'An in-depth training module for Company Secretaries and Legal professionals covering compliance philosophy, corporate personas, constitutional documents, board & KMP governance, statutory filings, audits, penalties, and landmark case laws under the Companies Act, 2013.',
  300
) RETURNING id INTO mod3_id;

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod3_id, 'Why Compliance? History & Evolution of Company Law', $md$
## Why Compliance Matters

> *"Compliance is the backbone of Corporate Sustainability."*

Compliance is not a back-office function — it is the foundation upon which a company's long-term existence, reputation, and social license to operate are built.

---

## Four Pillars of Compliance

### 1. Legal and Operational Longevity

- **License to Operate:** Continuous compliance with the Companies Act ensures the Registrar of Companies (RoC) does not strike off the company name.
- **Avoidance of Value Erosion:** Heavy penalties and compounding fees for non-compliance drain financial resources.
- **Director Continuity:** Strict adherence to filing and meeting norms prevents the disqualification of directors.

### 2. Building "Trust Capital" (Social Sustainability)

- **Transparency with Stakeholders:** Regular filings (AOC-4, MGT-7) provide shareholders, creditors, and the public with a "True and Fair" view of the company's health.
- **Investor Confidence:** Institutional investors and ESG funds prioritize companies with a clean compliance track record, lowering the cost of capital.
- **Brand Reputation:** A "Compliant" status acts as a badge of honour in the market.

### 3. Risk Mitigation & Internal Control

- **Early Warning Systems:** Mandatory audits and internal controls act as "health checks," identifying financial irregularities before they become catastrophic.
- **Conflict Management:** Compliance with Section 184 and Section 188 prevents internal fraud.
- **Data Integrity:** Modern compliance through the MCA21 V3 Portal ensures corporate records are digitized and tamper-proof.

### 4. Ethical Framework & CSR

- **Institutionalising Ethics:** Compliance moves a company from "Profit at any cost" to "Profit with Principle."
- **Mandatory Social Contribution:** Section 135 (CSR) mandates that large companies contribute to the social fabric.
- **Whistleblower Mechanisms:** Mandatory Vigil Mechanisms protect employees who report wrongdoing.

---

## The 1956 vs. 2013 Paradigm Shift

| Dimension | Companies Act, 1956 | Companies Act, 2013 |
|---|---|---|
| Philosophy | Government Control & Approval-Based | Self-Regulation & Disclosure-Based |
| Orientation | Procedural | Governance (Heavy penalties for transparency failures) |
| Era | Post-colonial, regulated economy | Digital, globalised, socially conscious era |
| Sections | 658 | 470 |

> ⚖️ **Key Insight for CS Teams:** The 2013 Act shifted liability significantly onto KMPs and "Officers in Default." As a Company Secretary, you are the first line of regulatory accountability.
$md$, 1);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod3_id, 'Corporate Personas — Classification of Companies', $md$
## The Legal Persona — Separate Legal Entity

**Landmark Case: Salomon v. Salomon & Co Ltd (1897)**

Mr. Salomon incorporated his leather business. He owned 20,001 shares; his family owned 6. He was also a secured creditor. When the company failed, unsecured creditors argued that Mr. Salomon and the company were the same person.

**Ruling:** The House of Lords held that the company was a distinct legal entity. Mr. Salomon, as a separate person and secured creditor, had priority over unsecured creditors.

> ⚖️ This case is the bedrock of corporate law globally — a company is legally distinct from those who own and run it.

---

## Classification by Liability

| Type | Section | Description | Common Use |
|---|---|---|---|
| **Limited by Shares** | 2(22) | Liability limited to unpaid amount on shares held. | Most commercial companies |
| **Limited by Guarantee** | 2(21) | Members contribute a fixed amount only upon winding up | NGOs, clubs, charities |
| **Unlimited Company** | 2(92) | No cap on member liability — personal assets can be used to clear debts | Rare in modern practice |

---

## Classification by Number of Members

| Type | Members | Key Restrictions |
|---|---|---|
| **One Person Company (OPC)** | 1 natural person | Single member; nominee required |
| **Private Company** | Min 2, Max 200 | Restricts share transfer; no public invitation to subscribe |
| **Public Company** | Min 7, no maximum | Shares freely transferable; can invite public subscription |

> ⚠️ **CS Compliance Point:** If a Private Company crosses 200 members, the Company Secretary must advise either reducing membership or converting to a public company.

---

## Classification by Control or Ownership

| Type | Section | Definition |
|---|---|---|
| **Holding Company** | 2(46) | Controls the composition of another company's Board, or exercises >50% of total voting power |
| **Subsidiary Company** | 2(87) | Controlled by the Holding company — wholly-owned (100%) or partially |
| **Associate Company** | 2(6) | Another company holds at least 20% voting power — significant influence but not control |

---

## Concept of "Piercing the Corporate Veil"

Courts will ignore the separate entity principle if the corporate structure is used as a sham.

**Case: Daimler Co Ltd v. Continental Tyre & Rubber Co (1916)**
During WWI, a UK-registered company entirely controlled by German residents sued to collect a debt. The court "lifted the veil" and declared it an "alien enemy" company.

| Trigger | Case Reference |
|---|---|
| Tax evasion via dummy companies | Sir Dinshaw Maneckjee Petit |
| Denying workers statutory benefits via subsidiary | Associated Clothiers Ltd |
| Misstatement in Prospectus | Section 34 & 35, CA 2013 |
$md$, 2);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod3_id, 'Constitutional Documents — MOA & AOA', $md$
## MOA — The External Boundary

The Memorandum of Association (MOA) is the most fundamental document of a company — often called the "Charter" or "Constitution." It defines the company's relationship with the **outside world** and sets the **External Boundary**.

Anything a company does beyond the scope of its MOA is **Ultra Vires** (beyond powers) and is legally **void**.

---

## Key Clauses of the MOA

| Clause | Purpose |
|---|---|
| **Name Clause** | Ensures the name is unique and not identical to existing registered entities |
| **Registered Office Clause** | Determines the jurisdiction of the Registrar of Companies (RoC) |
| **Objects Clause** | Defines exactly what the company can do — the "Hard Border" |
| **Liability Clause** | States whether liability of members is limited or unlimited |
| **Capital Clause** | Maximum authorised share capital the company can issue |

---

## The Objects Clause — The "Hard Border"

**Case: Ashbury Railway Carriage and Iron Co v. Riche (1875)**
The company's MOA authorised "making, selling, or lending railway carriages." It contracted to build a complete railway line. The court ruled the contract **void** — even unanimous shareholder ratification could not save it.

> ⚖️ Ultra Vires the MOA = void from inception. Cannot be ratified. This is the hardest limit in company law.

---

## Altering the MOA — The Formal Process

| Step | Action |
|---|---|
| 1 | Board Resolution proposing the amendment |
| 2 | Special Resolution — 75% shareholder approval in a General Meeting |
| 3 | File Form MGT-14 with the RoC within 30 days |
| 4 | Name/Object changes require specific Central Government approval |

---

## AOA — The Internal Rulebook

The Articles of Association (AOA) defines the relationship between the company and its members, and among the members themselves.

| Area | What the AOA Governs |
|---|---|
| **Share Capital** | Allotment, calls on shares, forfeiture for non-payment |
| **Transfer & Transmission** | Rules for selling shares (Transfer) or passing them after death/insolvency |
| **General Meetings** | How AGMs/EGMs are conducted, 21-day notice requirement, voting rights |
| **Board of Directors** | Appointment, remuneration, powers, and Board meeting proceedings |

---

## MOA vs. AOA — The Hierarchy

| Rule | Application |
|---|---|
| **Conflict: MOA vs. AOA** | MOA **prevails** |
| **Ultra Vires the AOA** | Can be **ratified** by shareholders |
| **Ultra Vires the MOA** | **Cannot be ratified at all** |

---

## Doctrine of Indoor Management (Turquand's Rule)

**Case: Royal British Bank v. Turquand (1856)**
Directors were authorised to borrow money by shareholder resolution. They borrowed from a bank without actually passing the resolution. The company was held liable — the bank was not required to verify the internal process.

> ⚖️ Outsiders dealing in good faith are protected by Turquand's Rule. The company cannot use its own internal procedural failure as a shield against a third-party claim.
$md$, 3);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod3_id, 'Management Hierarchy — Board, KMP & Shareholders', $md$
## Board Composition (Section 149)

| Company Type | Minimum | Maximum |
|---|---|---|
| One Person Company (OPC) | 1 | — |
| Private Company | 2 | 15 |
| Public Company | 3 | 15 |

> **Note:** A company can exceed 15 directors only after passing a **Special Resolution** (75% shareholder approval).

---

## Mandatory Categories of Directors

### A. Resident Director
Every company must have at least one director who stayed in India for **not less than 182 days** during the financial year.

### B. Woman Director
Mandatory for every Listed Company and every Public Company with Paid-up share capital of ₹100 Crore or more, OR Turnover of ₹300 Crore or more.

### C. Independent Directors
Non-executive directors with no material relationship with the company. They act as "watchdogs" for minority shareholders.

---

## Limits on Directorships (Section 165)

| Limit Type | Cap |
|---|---|
| Total directorships (all companies) | **20 companies** |
| Public company directorships (within those 20) | **10 public companies** |

---

## Key Managerial Personnel (KMP) (Section 203)

Mandatory for every listed company and every public company with paid-up share capital ≥ ₹10 Crore:

| KMP Role | Core Responsibility |
|---|---|
| **CEO / Managing Director** | Principal executive; runs day-to-day operations |
| **Company Secretary (CS)** | Compliance officer; bridge between Board and Regulators (MCA/RoC) |
| **CFO** | Responsible for "True and Fair" view of financial statements |

> ⚠️ **"Officer in Default":** KMPs are the **first** to be held personally liable (fines/prosecution) if the company fails to comply with the Act. As CS, you are always an Officer in Default for compliance failures.

---

## Board Meetings (Section 173)

| Rule | Requirement |
|---|---|
| **First meeting** | Within 30 days of incorporation |
| **Annual frequency** | Minimum 4 meetings per calendar year |
| **Maximum gap** | 120 days between two consecutive meetings |
| **Quorum** | 1/3rd of total Board strength OR 2 directors — whichever is higher |

---

## General Meetings

| Meeting Type | Frequency | Purpose |
|---|---|---|
| **AGM** | Once a year | Adopt financials, declare dividends, appoint auditors; within 6 months of financial year-end |
| **EGM** | As needed | Urgent matters that cannot wait for the AGM |

**Notice Requirement:** Minimum **21 clear days'** notice to shareholders before any general meeting.

**Case: LIC of India v. Escorts Ltd (1986)**
The Supreme Court affirmed: a company cannot resist its shareholders' statutory right to call a meeting to appoint or remove directors. **Ultimate power resides with shareholders in a General Meeting.**
$md$, 4);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod3_id, 'Statutory Compliances, Audits & MCA21', $md$
## Annual Financial Compliances

> ⚠️ **Critical:** Missing filing deadlines results in cumulative daily penalties (₹100/day) and can block the company from making other filings entirely.

| Form | Purpose | Deadline |
|---|---|---|
| **AOC-4** | Balance Sheet, P&L, and Board's Report (Section 134) | Within **30 days** of AGM |
| **MGT-7** | Annual Return — shareholders, directors, charges, meetings | Within **60 days** of AGM |
| **ADT-1** | Auditor Appointment notification | Within **15 days** of appointment |

---

## Audit & Auditors (Sections 139–148)

### Mandatory Rotation of Auditors
| Type | Maximum Tenure | Cooling-off Period |
|---|---|---|
| Individual Auditor | 1 term of **5 years** | 5 years before re-appointment |
| Audit Firm | 2 terms of **5 years each** (10 years total) | 5 years before re-appointment |

### Powers and Duties of Auditors

| Duty / Right | Description |
|---|---|
| Right of Access | Access to books of accounts and vouchers at all times |
| **Duty to Report Fraud (Section 143(12))** | Fraud of ₹1 Crore or more must be reported to the Central Government within **60 days** |

### Prohibited Services (Section 144)
An auditor **cannot** provide these services to their audit client:
- Accounting and bookkeeping, Internal Audit, Investment advisory or banking services

### Secretarial Audit (Section 204)
Applicable to listed and large public companies. Conducted by **Company Secretary in Practice** — covers compliance with all applicable laws, not just financial.

---

## Corporate Social Responsibility (Section 135)

### Eligibility — The "5-1000-500" Rule
A company must spend if it meets **any one** of these in the preceding financial year:

| Threshold | Amount |
|---|---|
| Net Worth | ₹500 Crore or more |
| Turnover | ₹1,000 Crore or more |
| Net Profit | ₹5 Crore or more |

Must spend at least **2% of average net profits** of the 3 immediately preceding financial years on **Schedule VII** activities.

> ⚠️ Non-transfer of unspent CSR amounts now attracts monetary penalties — it is no longer sufficient to simply "explain" the shortfall.
$md$, 5);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod3_id, 'Penalties, Ethics, Case Laws & Operational Scenarios', $md$
## "Officer in Default" (Section 2(60))

The law does not just penalise the "company" as an abstract entity — it targets the **Officer who is in Default**:

- Whole-time Directors and KMPs (CEO, CS, CFO)
- Any director aware of the contravention through Board proceedings but who **did not object**
- The person specifically charged by the Board with compliance responsibility

> ⚠️ As Company Secretary, you are almost always an "Officer in Default" for compliance failures — even if you were not the primary decision-maker.

---

## Fraud: The "Nuclear Option" (Section 447)

If any person is found guilty of fraud involving at least ₹10 Lakhs or 1% of turnover:

| Consequence | Amount |
|---|---|
| **Imprisonment** | Minimum 6 months, up to **10 years** |
| **Fine** | Minimum = the amount involved; Maximum = 3× the amount involved |
| **Public Interest** | If fraud involves public interest, minimum imprisonment is **3 years** |

Section 447 is **non-compoundable** — it cannot be settled by paying a penalty. It goes to trial.

---

## Key Case Laws

- **Salomon v. Salomon & Co Ltd (1897)** — Separate Legal Entity: the company is legally distinct from its owners.
- **Daimler Co Ltd v. Continental Tyre (1916)** — Lifting the Veil: courts can look through the corporate structure when warranted.
- **Ashbury Railway Carriage v. Riche (1875)** — Ultra Vires: an act outside the Objects Clause is void and cannot be ratified.
- **Royal British Bank v. Turquand (1856)** — Indoor Management: outsiders dealing in good faith are protected.
- **LIC of India v. Escorts Ltd (1986)** — Shareholder Supremacy: management serves at the pleasure of shareholders.
- **Tata Consultancy Services v. Cyrus Mistry (2021)** — Oppression requires a continuous, harsh pattern of conduct — not just disagreement.

---

## Operational Scenarios for CS/Legal Teams

**Scenario 1 — Private Company Membership Limit Breach**
A private company reaches 210 shareholders.
**CS Action:** Advise the Board that Section 2(68) has been breached. Options: reduce membership to ≤200 or initiate conversion to a public company.

**Scenario 2 — Financial Statement Correction Before Filing**
The CFO has prepared AOC-4 but the auditor identifies an error.
**CS Action:** The Board must approve the corrected financial statements before filing. Filing incorrect statements makes both the CFO and CS Officers in Default.

**Scenario 3 — Auditor's Duty on Fraud Discovery**
The auditor discovers a potential fraud of ₹2 Crore during the audit.
**CS Action:** Under Section 143(12), the auditor must report to the Central Government (via Form ADT-4) within 60 days. Ensure the company cooperates and does not impede the auditor's reporting.

> 🎓 **Key Takeaway for CS Professionals:** The Companies Act places personal legal accountability on you at every stage. Your role is the company's first and most critical compliance firewall.
$md$, 6);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod3_id, 'Final Simulation — The Year-End Close Challenge', $md$
## Capstone Simulation: The Year-End Close Challenge

You are the **Company Secretary of "Visionary Tech Pvt Ltd"**. Today is **September 15, 2026**.

**Situation:**
- The Financial Year ended **March 31, 2026**
- Accounts are finalised and ready
- The AGM has **not yet been held**
- Four decisions are waiting on your desk

Work through each task. Every decision has a real legal consequence.

---

## Reference: Key Deadlines

| Obligation | Deadline |
|---|---|
| AGM | Within **6 months** of financial year-end → by **Sept 30, 2026** |
| AOC-4 (Financial Statements) | Within **30 days** of AGM |
| MGT-7 (Annual Return) | Within **60 days** of AGM |
| CSR unspent transfer | Within **6 months** of financial year-end |

---

## How Scoring Works

| Score | Result | Outcome |
|---|---|---|
| **4 / 4** | Compliance Champion | You saved the company ₹5 Lakhs in potential penalties |
| **2 – 3 / 4** | At Risk | You missed critical deadlines. Review and re-attempt |
| **0 – 1 / 4** | Disqualified | Your actions led to an investigation under Section 447 |

> Work through the assessment questions below. Select the correct action for each scenario.
$md$, 7);

-- Module 3 Quiz Questions (10 knowledge + 4 simulation = 14 total, 10 randomly selected)
INSERT INTO questions (module_id, text) VALUES (mod3_id, 'The Doctrine of Ultra Vires implies that:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'A company can do anything its directors agree upon', false), (_qid, 'Any act outside the scope of the Memorandum of Association is void', true), (_qid, 'Shareholders can ratify any illegal act of the Board', false), (_qid, 'The internal rules of the company have been violated', false);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'Which document acts as the Internal Rulebook defining how board meetings are conducted and shares are transferred?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Memorandum of Association (MOA)', false), (_qid, 'Annual Return (MGT-7)', false), (_qid, 'Articles of Association (AOA)', true), (_qid, 'Board''s Report (Section 134)', false);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'Under Section 165, the maximum number of Public Companies in which a person can hold directorship simultaneously is:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '5', false), (_qid, '10', true), (_qid, '15', false), (_qid, '20', false);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'Form AOC-4 (Financial Statements) must be filed with the RoC within how many days of the AGM?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '15 days', false), (_qid, '30 days', true), (_qid, '60 days', false), (_qid, '90 days', false);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'Under Section 143(12), if an auditor discovers a fraud of ₹1 Crore or more, they must report it to the Central Government within:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '15 days', false), (_qid, '30 days', false), (_qid, '60 days', true), (_qid, '90 days', false);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'An act that is Ultra Vires the Articles of Association (AOA) can be:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Ratified by shareholders in a General Meeting', true), (_qid, 'Ratified by the Board of Directors alone', false), (_qid, 'Never ratified under any circumstance', false), (_qid, 'Automatically valid if done in good faith', false);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'The Mandatory Auditor Rotation period for an Audit Firm (two terms combined) at a listed company is:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '5 years', false), (_qid, '7 years', false), (_qid, '10 years', true), (_qid, '15 years', false);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'Under Section 447 (Fraud), the minimum imprisonment when the fraud involves public interest is:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '6 months', false), (_qid, '1 year', false), (_qid, '2 years', false), (_qid, '3 years', true);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'The Secretarial Audit under Section 204 is conducted by which professional?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'A Chartered Accountant (CA)', false), (_qid, 'A Cost Accountant (CMA)', false), (_qid, 'A Company Secretary in Practice (CS)', true), (_qid, 'Any qualified legal professional', false);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'In LIC of India v. Escorts Ltd (1986), the Supreme Court ruled that:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Institutional investors cannot interfere in Board decisions', false), (_qid, 'A company cannot resist a valid shareholder requisition for a General Meeting', true), (_qid, 'Directors owe fiduciary duty only to major shareholders', false), (_qid, 'The Board can refuse an EGM requisition if it believes it is against business interests', false);

-- Simulation Questions (4 scenario-based tasks)
INSERT INTO questions (module_id, text) VALUES (mod3_id, 'SIMULATION TASK 1 — THE TIMELINE DECISION: Current Date: Sept 15, 2026. The Financial Year ended March 31, 2026. The Board proposes to hold the AGM on October 15th. As Company Secretary, what is your decision?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Approve — October 15th is within a reasonable timeframe after the financial year.', false),
  (_qid, 'Reject — The AGM must be held by September 30th (within 6 months of FY-end). October triggers daily penalties.', true);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'SIMULATION TASK 2 — THE RELATED PARTY TRAP: A director presents a contract to procure laptops from his son''s electronics shop. The price is 5% above the standard market rate. As Company Secretary, what do you do?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Sign the contract — The 5% premium is minor and unlikely to attract scrutiny.', false),
  (_qid, 'Flag for Board Approval — The transaction is not at arm''s length and requires a formal Board Resolution and entry in the Register of Contracts.', true);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'SIMULATION TASK 3 — THE FILING SPRINT: The AGM was held on September 25th. It is now October 20th — 25 days after the AGM. Which statutory form must be filed immediately (before its deadline expires first)?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'MGT-7 — Annual Return (due within 60 days of AGM = by Nov 24th)', false),
  (_qid, 'AOC-4 — Financial Statements (due within 30 days of AGM = by Oct 25th)', true),
  (_qid, 'ADT-1 — Auditor Appointment (due within 15 days of appointment)', false);

INSERT INTO questions (module_id, text) VALUES (mod3_id, 'SIMULATION TASK 4 — THE AUDIT ERROR: The Statutory Auditor flags that Visionary Tech Pvt Ltd crossed the ₹5 Crore net profit threshold this year, making CSR mandatory — but no CSR spending was done and the financial year has now ended. What is the correct action?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Ignore for this year — it is the first year of eligibility and regulators typically allow a grace period.', false),
  (_qid, 'Transfer the unspent 2% amount to a designated Government Fund immediately — failure attracts a penalty of twice the unspent amount or ₹1 Crore, whichever is less.', true);


-- ============================================================
-- MODULE 4: Labour Code Compliance
-- ============================================================
INSERT INTO modules (title, description, sequence_order) VALUES (
  'Labour Code Compliance — The New Era of Indian Labour Law',
  'A practical guide to India''s 4 Labour Codes (effective April 1, 2026): the Code on Wages, Industrial Relations Code, Social Security Code, and OSH Code. Covers the 50% Wage Rule, fixed-term employment, gig worker rights, workplace safety, penalties, and the 6-step compliance action plan.',
  400
) RETURNING id INTO mod4_id;

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod4_id, 'The New Era of Indian Labour Law — Overview', $md$
## The Big Picture

India's labour law framework has undergone its most significant reform in decades. **29 fragmented central labour laws** — many dating back to the colonial era — have been consolidated into **4 streamlined Labour Codes**.

| Before | After |
|---|---|
| 29 central labour laws | 4 Labour Codes |
| 84 physical registers | 8 mandatory digital registers |
| "Police" inspection model | "Facilitator" model |
| Piecemeal, contradictory rules | Unified, consistent standards |

---

## Effective Dates

- **November 21, 2025:** Core provisions became self-operative
- **April 1, 2026:** Full nationwide implementation across all states

> ⚠️ These are **not proposed changes** — they are current law. All employers and employees are governed by these codes today.

---

## The 4 Labour Codes at a Glance

| Code | Focus Area |
|---|---|
| **Code on Wages, 2019** | Minimum wages, equal pay, overtime, salary structure |
| **Industrial Relations Code, 2020** | Hiring flexibility, strikes, retrenchment, fixed-term contracts |
| **Social Security Code, 2020** | PF, ESIC, gratuity, coverage for gig & platform workers |
| **OSH & Working Conditions Code, 2020** | Workplace safety, health checks, appointment letters, night shifts |

---

## The "Facilitator" Model — What It Means for You

The old model treated businesses as suspects requiring constant policing. The new model:

- **Compliance first:** Employers are given a **30-day notice** to rectify most violations before legal action is taken
- **Compounding:** First-time offences can be settled by paying **50–75% of the maximum fine**, avoiding criminal prosecution
- **Digital first:** All records, licenses, and filings are unified on the **Shram Suvidha Portal** — one portal for everything

> 💡 The shift from 84 registers to 8 digital ones eliminates inspector harassment and creates a transparent, auditable compliance trail.
$md$, 1);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod4_id, 'Code on Wages, 2019 — Pay, Overtime & the 50% Rule', $md$
## Universal Applicability — No Employee Left Behind

The Code on Wages applies to **every establishment in India** — from sole proprietorships to multinational corporations — with **zero employee threshold**.

---

## Statutory Floor Wage

- The **Central Government sets a Floor Wage** based on the minimum living standards required
- **No state can fix minimum wages below this floor** — states can go higher, but never lower
- This creates a true national minimum beneath which no worker can legally be paid

---

## Gender Neutrality

**Strict prohibition of discrimination** based on gender — including **transgender identity** — in:
- Recruitment processes
- Wages paid for similar or same work

> ⚖️ Paying a woman less than a man for the same role is a legal violation under the Code on Wages.

---

## Overtime

Mandatory payment at **twice the normal rate** for work beyond regular hours. This applies to **all employees regardless of their wage level** — there is no "senior employee" exemption.

---

## The Critical "50% Wage Rule"

### New Definition of "Wages"
Under the Code, **"Wages"** consists of:
- Basic Pay
- Dearness Allowance (DA)
- Retaining Allowance

### The Cap on Allowances
All other components of your pay (HRA, travel allowance, food allowance, special allowances, bonuses) **must not exceed 50% of your total remuneration**.

### What Happens if the Cap is Breached?
If allowances exceed 50%, the **excess is automatically reclassified as "Wages"** for all statutory calculations.

| Calculation | Impact of Higher Wage Base |
|---|---|
| Provident Fund (PF) | Higher employer + employee PF contribution |
| Gratuity | Higher gratuity payout on exit |
| Leave Encashment | Higher value per day of leave |

> 💡 **Example:** If your total CTC is ₹1,00,000/month and your Basic is ₹35,000 (35%), allowances are ₹65,000 (65%). The excess ₹15,000 is reclassified as Wages — increasing your PF, Gratuity, and Leave base.

> ⚠️ **For HR & Finance:** This rule can increase employer costs by **10–15%** on restructured CTCs. All existing salary structures must be audited for compliance.

---

## Key Compliance Actions — Wages Code

1. **Salary Audit:** Recalculate CTC structures to ensure Basic + DA meets the 50% threshold
2. **Payroll Automation:** Engage payroll providers to automatically apply the 50% rule
3. **Settlement Speed:** Full & Final settlement must be completed within **2 working days** of an employee's exit
$md$, 2);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod4_id, 'Industrial Relations Code, 2020 — Flexibility & Workers'' Rights', $md$
## What This Code Governs

The Industrial Relations (IR) Code modernises the rules around **hiring, firing, and the relationship between workers and employers** during disputes.

---

## Operational Flexibility for Larger Establishments

| Action | Old Threshold | New Threshold |
|---|---|---|
| Layoffs | 100 workers | **300 workers** |
| Retrenchments | 100 workers | **300 workers** |
| Closures | 100 workers | **300 workers** |

> 💡 Companies with fewer than 300 workers now have significantly more flexibility in restructuring without government prior approval — while workers retain full legal protections on compensation.

---

## Fixed-Term Employment (FTE) — Formalised Contracts

Fixed-Term Employment is now a legally recognised, standardised contract type.

**Key principle: Full Parity**
A Fixed-Term Employee receives the **same wages and benefits** as a permanent employee doing the same work — including:
- Same pay scales and increments
- Same hours of work and leave entitlements
- Same statutory benefits (PF, ESIC, etc.)

**Gratuity for FTE (under Social Security Code):**
The qualifying period for gratuity is reduced from **5 years to 1 year** for Fixed-Term Employees.

> ⚠️ FTE is not a way to avoid permanent employment costs — the parity requirement ensures the compensation is equivalent.

---

## Strike Regulations — 14-Day Notice

A **mandatory 14-day prior notice** is now required before any strike in all establishments.

> **Important:** "Mass Casual Leave" — where a large group of employees simultaneously take casual leave as a coordinated protest — now falls **within the legal definition of a strike**. The 14-day notice requirement applies.

---

## Worker Re-Skilling Fund

When a worker is retrenched, the employer must contribute **15 days of wages** per retrenched worker to a dedicated **Worker Re-Skilling Fund**.

> 💡 This is a new cost that must be factored into any restructuring or retrenchment exercise.
$md$, 3);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod4_id, 'Social Security Code & OSH Code — Benefits, Safety & Inclusion', $md$
## Social Security Code, 2020 — Who is Covered Now

The biggest change in the Social Security Code is the **expansion of coverage to workers who were previously invisible to the law**.

### Newly Covered Categories

| Category | Who This Includes |
|---|---|
| **Gig Workers** | Delivery partners, freelancers, app-based task workers |
| **Platform Workers** | Workers on aggregator platforms (ride-hailing, food delivery, etc.) |
| **Unorganised Workers** | Domestic workers, street vendors, construction labourers |

### Aggregator Contribution
Platforms must contribute **1–2% of their annual turnover** to a dedicated **Social Security Fund** for these workers.

---

## Key Social Security Benefits — Summary

| Benefit | Key Change |
|---|---|
| **Provident Fund (PF)** | Broader coverage; 50% Wage Rule increases the contribution base |
| **ESIC (Health Insurance)** | Now **pan-India**; establishments with fewer than 10 employees can **voluntarily opt in** |
| **Gratuity** | Fixed-Term Employees: qualifying period reduced from **5 years to 1 year** |

---

## OSH & Working Conditions Code, 2020

### Mandatory Appointment Letters

Every employer must issue a formal **Appointment Letter** to every employee — detailing designation, wage details, working hours, and leave entitlements.

> ⚠️ Employing a person without an Appointment Letter is a violation under this Code.

### Women's Empowerment at Work

- Women are permitted to work in **all establishments and during night hours (7 PM to 6 AM)**
- Night shift work requires **explicit written consent** from the woman employee
- The employer must provide **safety and transport measures** for night shift workers

### Mandatory Health Check-Ups

Free annual health check-ups are **mandatory** for:
- Employees **over 40 years of age**
- Employees in **hazardous roles** (regardless of age)

---

## Compliance Actions — Social Security & OSH

| Action | Responsible Team |
|---|---|
| Issue / update Appointment Letters for all staff | HR |
| Update leave policy — new eligibility threshold is **180 days** (reduced from 240) | HR |
| Schedule annual health checks for employees over 40 or in hazardous roles | HR / Admin |
| Audit night shift protocols for women employees | HR / Operations |
| Register on Shram Suvidha Portal for unified digital licensing | HR / Legal |
$md$, 4);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod4_id, 'Compliance Action Plan, Penalties & Workplace Scenarios', $md$
## Compliance Thresholds — At a Glance

| Rule | Old Standard | New Standard |
|---|---|---|
| Retrenchment without govt. permission | < 100 workers | < **300 workers** |
| Gratuity eligibility (FTE) | 5 years | **1 year** |
| Leave eligibility threshold | 240 days worked | **180 days worked** |
| Full & Final settlement deadline | 30–45 days (informal) | **2 working days** |
| Mandatory strike notice | 14 days (industrial only) | **14 days (all establishments)** |
| Physical compliance registers | 84 registers | **8 digital registers** |

---

## The 6-Step Compliance Action Plan

**Step 1: Salary Audit** — Recalculate all CTC structures to ensure Basic + DA is at least **50% of total remuneration**.

**Step 2: Document Overhaul** — Issue updated Appointment Letters to all staff reflecting the new leave policy (180-day threshold).

**Step 3: Settlement Re-engineering** — Redesign Finance and HR workflows to process **Full & Final settlement within 2 working days** of exit.

**Step 4: Digital Migration** — Register on the **Shram Suvidha Portal** for unified licensing. Transition all records to the **8 prescribed digital registers**.

**Step 5: Workplace Standards Audit** — Review night shift protocols for women employees; schedule annual health check-ups for all eligible employees.

**Step 6: Contractor Management** — Principal employers are legally liable if contractors fail to pay their workers. Review all Contractor SLAs to include wage compliance clauses and indemnity provisions.

---

## Penalties

| Violation | Penalty |
|---|---|
| Wage non-payment or underpayment | Up to **₹50,000** |
| Safety/OSH violations | Up to **₹2,00,000** |
| First-time offence compounding | Pay **50–75% of maximum fine** to settle without prosecution |
| Opportunity to rectify | **30 days' notice** given before formal action on most defaults |

---

## What Every Employee Is Entitled To

- A formal Appointment Letter
- Wages calculated on a compliant 50% wage base
- Overtime at **2× your normal rate** for extra hours worked
- A Full & Final settlement within **2 working days** of leaving
- Annual health check-ups if you are over 40 or in a hazardous role
- Equal wages if you are on a Fixed-Term contract doing the same work as a permanent employee

> 🎓 **Key Takeaway:** The 4 Labour Codes set the baseline for how every person in this organisation is hired, paid, protected, and separated.
$md$, 5);

-- Module 4 Quiz Questions
INSERT INTO questions (module_id, text) VALUES (mod4_id, 'The 4 Labour Codes replaced how many fragmented central labour laws?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '14', false), (_qid, '21', false), (_qid, '29', true), (_qid, '44', false);

INSERT INTO questions (module_id, text) VALUES (mod4_id, 'Under the Code on Wages, 2019, what is the minimum employee threshold for an establishment to be covered?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '10 employees', false), (_qid, '20 employees', false), (_qid, '100 employees', false), (_qid, 'Zero — it applies to every establishment', true);

INSERT INTO questions (module_id, text) VALUES (mod4_id, 'Under the 50% Wage Rule, which components constitute "Wages" for statutory calculations?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'HRA + Travel Allowance + Food Allowance', false), (_qid, 'Basic Pay + Dearness Allowance + Retaining Allowance', true), (_qid, 'Basic Pay + all allowances combined', false), (_qid, 'CTC minus employer PF contribution', false);

INSERT INTO questions (module_id, text) VALUES (mod4_id, 'The Industrial Relations Code, 2020 raised the threshold for requiring government permission before retrenchment from 100 workers to:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '150 workers', false), (_qid, '200 workers', false), (_qid, '250 workers', false), (_qid, '300 workers', true);

INSERT INTO questions (module_id, text) VALUES (mod4_id, 'Under the Social Security Code, 2020, a Fixed-Term Employee becomes eligible for gratuity after how long?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '6 months of service', false), (_qid, '1 year of service', true), (_qid, '3 years of service', false), (_qid, '5 years of service', false);

INSERT INTO questions (module_id, text) VALUES (mod4_id, 'Under the OSH Code, 2020, free mandatory annual health check-ups must be provided to:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'All employees regardless of age', false), (_qid, 'Only employees in hazardous roles', false), (_qid, 'Employees over 40 years of age OR in hazardous roles', true), (_qid, 'Only employees who specifically request them', false);

INSERT INTO questions (module_id, text) VALUES (mod4_id, 'The Full & Final settlement for a departing employee must be completed within how many working days under the new codes?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '2 working days', true), (_qid, '7 working days', false), (_qid, '15 working days', false), (_qid, '30 working days', false);

INSERT INTO questions (module_id, text) VALUES (mod4_id, 'Under the IR Code, "mass casual leave" taken as a coordinated group protest is legally classified as:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'A legitimate employee right requiring no prior notice', false), (_qid, 'A strike, requiring 14 days'' mandatory prior notice', true), (_qid, 'A lockout triggered by management', false), (_qid, 'An exempt action if fewer than 50 employees participate', false);

INSERT INTO questions (module_id, text) VALUES (mod4_id, 'If a contractor working at your premises fails to pay their workers, who bears the legal liability under the OSH Code?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Only the contractor is liable', false), (_qid, 'The workers must file a personal claim in court', false), (_qid, 'The Principal Employer (your company) is liable for the unpaid wages', true), (_qid, 'The Shram Suvidha Portal absorbs the liability', false);

INSERT INTO questions (module_id, text) VALUES (mod4_id, 'For a first-time non-compliance offence, how can an employer settle the matter without criminal prosecution under the new codes?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'By filing a written apology with the Labour Commissioner', false), (_qid, 'By compounding the offence — paying 50–75% of the maximum fine', true), (_qid, 'By upgrading to digital registers within 30 days', false), (_qid, 'First-time offences are automatically exempt from penalties', false);


-- ============================================================
-- MODULE 5: Training on Related Party Transactions
-- ============================================================
INSERT INTO modules (title, description, sequence_order) VALUES (
  'Training on Related Party Transactions',
  'A comprehensive guide to RPT compliance under the Companies Act 2013, SEBI LODR, and Ind AS 24. Covers the identification of related parties, the three-level approval matrix, cross-functional RACI responsibilities, red flags for tunnelling and fraud, and the consequences of non-compliance.',
  500
) RETURNING id INTO mod5_id;

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod5_id, 'The Regulatory Landscape — From Permissive to Stringent', $md$
## The Transformation of RPT Law in India

The regulatory framework for Related Party Transactions (RPTs) has undergone a dramatic transformation in India, moving from a "permissive" regime to one of the most stringent and transparent systems in the global corporate landscape.

---

## Historical Context: The 1956 vs. 2013 Shift

| Feature | Old Regime (1956) | New Regime (2013) |
|---|---|---|
| **Definitions** | Narrow — only directors and immediate relatives | Broad — KMPs, entities, associates, and influence-based relationships |
| **Scrutiny** | Many transactions needed only a simple Board approval | Mandatory Audit Committee approval for all RPTs |
| **Disclosure** | Minimal detail in financial statements | Full disclosure in Board's Report (AOC-2) and Notes to Accounts (Ind AS 24) |

### The Catalyst: The Satyam Scandal (2009)

The Satyam Computer Services scandal was India's **"Enron moment."** The fraud involved:
- Inflating cash balances by ₹7,136 crore
- Siphoning funds through a web of related companies controlled by the promoters
- Using fictitious invoices and shell entities as conduits

This collapse was the primary catalyst for the Companies Act, 2013, which introduced **Section 188** to close these loopholes permanently.

---

## Core Philosophy: Arm's Length vs. Conflict of Interest

**Legitimate Business**
Transactions done in the *Ordinary Course of Business* and at *Arm's Length* (market price). These are commercially justified and transparent.

**Corporate Abuse ("Tunnelling")**
Transactions used to transfer wealth out of a company to promoters or favoured individuals at the expense of other shareholders — often through inflated contracts or below-market asset sales.

> ⚖️ The law does not presume guilt. It demands **proof of fairness** — documented arm's length pricing and procedural compliance.

---

## The Regulatory Architecture: The Three Pillars

| Pillar | Framework | Scope |
|---|---|---|
| **1** | Companies Act, 2013 (Section 188) | Sets the legal foundation; defines "Related Party"; mandates Board/Shareholder approval based on financial thresholds |
| **2** | SEBI LODR Regulations (Regulation 23) | Applies to listed companies; stricter than the Act; requires *prior* Audit Committee approval for ALL RPTs |
| **3** | Accounting Standards (Ind AS 24) | Mandates disclosure in Annual Report so investors can see total volume of business done with related entities |

> 💡 Where the Companies Act and SEBI LODR conflict, the **stricter standard always applies**.
$md$, 1);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod5_id, 'Identifying Related Parties & Covered Transactions', $md$
## Why Identification is the First Control

Before a Purchase Order is raised or a payment is processed, the **first check** is: *"Is the counterparty a Related Party?"*

Failure at this stage means the entire approval process is bypassed — which is precisely how tunnelling occurs undetected.

---

## Who is a Related Party? (Section 2(76))

The definition is intentionally broad. If in doubt, **assume the party is related** and seek Audit Committee clearance.

### Individuals

| Person | Why Related |
|---|---|
| Directors | Direct control/influence over the company |
| Key Managerial Personnel (KMP) | CEO, CFO, Company Secretary — officers in default |
| Their Relatives | Spouse, parents, siblings, children, and their spouses |

> ⚠️ "Relative" under Section 2(77) includes siblings. A vendor owned by the CFO's brother is a related party transaction — even if the CFO has no formal role in procurement.

### Entities

| Entity Type | Why Related |
|---|---|
| Firm where a Director/Manager (or relative) is a partner | Financial interest of a director |
| Private Company where a Director is a member or director | Director has control or significant influence |
| Public Company where a Director holds >2% shares (with relatives) | Significant economic interest |
| Holding, Subsidiary, or Associate companies | Part of the same corporate group |
| Any person on whose advice the Board is accustomed to act | Influence-based relationship — even without a formal title |

---

## What Transactions are Covered? (Section 188(1))

| Transaction Type | Examples |
|---|---|
| **Supply Chain** | Sale, purchase, or supply of any goods or materials |
| **Assets** | Buying, selling, or disposing of property of any kind |
| **Services** | Consultancy, maintenance, IT support, legal fees |
| **Leasing** | Leasing of property of any kind (office, warehouse, equipment) |
| **Agency** | Appointment of any agent for purchase or sale of goods/services |
| **Employment** | Appointment of related party to an office or place of profit |

---

## The Exemption: Arm's Length + Ordinary Course

Section 188 approval is **NOT triggered** if the transaction satisfies **both** of these conditions simultaneously:

**Condition 1 — Ordinary Course of Business**
Is this what the company normally does in the regular conduct of its business?

**Condition 2 — Arm's Length Basis**
Are the price, terms, and conditions **exactly the same** as if dealing with a total stranger?
*Any discount, extended credit period, or favourable term for the related party breaks arm's length.*

> ⚠️ If **even one condition fails**, the transaction requires formal approval. Both must be satisfied simultaneously for the exemption to apply.
$md$, 2);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod5_id, 'Cross-Functional Roles & the RACI Matrix', $md$
## RPT Compliance is a Cross-Functional Responsibility

RPT compliance is not owned by a single department. Because RPTs impact financial reporting, legal standing, and operational procurement, several divisions must work in a synchronised **"closed-loop" system.**

---

## The Five Divisions & Their Roles

### 1. Procurement & Supply Chain — "First Line of Defence"

- **Vendor Onboarding:** Identifying if a new vendor is a "Related Party" through mandatory disclosure forms
- **Arm's Length Documentation:** Maintaining comparative quotations or market benchmarking to prove the price is fair
- **Contract Management:** Ensuring no Purchase Order (PO) is issued to a related party without verifying an existing Audit Committee Omnibus Approval is in place

### 2. Finance & Accounts — "The Gatekeeper"

- **Payment Verification:** Blocking payments to related parties if the transaction exceeds approved financial thresholds
- **Threshold Monitoring:** Tracking cumulative spend per related party to prevent breaching the Materiality limit without advance notice
- **Financial Reporting:** Ensuring compliance with Ind AS 24 for disclosing RPTs in the Annual Report

### 3. Legal & Secretarial — "The Governance Framework"

- **Policy Drafting:** Formulating the company's RPT Policy as required by the Companies Act and SEBI
- **Board & Committee Management:** Placing RPT proposals before the Audit Committee and Board of Directors for prior approval
- **Statutory Filings:** Maintaining the Register of Contracts (Form MBP-4) and filing disclosures with the Registrar of Companies

### 4. Internal Audit & Compliance — "Independent Assurance"

- **Periodic Review:** Conducting quarterly audits of RPTs to ensure they were actually executed at arm's length
- **Omnibus Review:** Reviewing transactions processed under Omnibus Approvals to ensure they stayed within permitted limits

### 5. IT / ERP Team — "Systemic Controls"

- **ERP Hard-Coding:** Tagging vendors as "Related Parties" in the ERP so the system automatically triggers a specialised approval workflow
- **Automated Alerts:** Setting system alerts when a vendor's total billing approaches the 10% consolidated turnover limit

---

## RPT Compliance Responsibility Matrix (RACI)

| Phase / Task | Procurement | Finance | Legal/Sec. | Internal Audit | IT/ERP |
|---|---|---|---|---|---|
| 1. Identifying Related Party (Vendor Onboarding) | R | C | **A** | I | I |
| 2. Benchmarking for Arm's Length Price | R | **A** | I | C | I |
| 3. Drafting RPT Policy & Thresholds | I | C | **R/A** | C | I |
| 4. Obtaining Audit Committee/Board Approval | C | C | **R/A** | I | I |
| 5. Tagging RP Vendors in ERP System | C | I | I | I | **R/A** |
| 6. Monitoring Transaction Thresholds | I | R | **A** | C | R |
| 7. Quarterly Review of Omnibus Approvals | C | R | **A** | R | I |
| 8. Statutory Disclosures (AOC-2, Ind AS 24) | I | R | **R/A** | C | I |

> ⚖️ The Legal/Secretarial team is **Accountable** for governance, but Finance and Procurement own the day-to-day operational controls. A failure by any one division compromises the entire chain.
$md$, 3);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod5_id, 'Approval Framework & Reporting Obligations', $md$
## The Three-Level Approval Matrix

---

### Level 1: Audit Committee (The First Filter)

**Scope:** ALL RPTs, without exception, require prior Audit Committee approval.

**Omnibus Approval** *(For Repetitive Procurement)*
For regular, recurring transactions, the Audit Committee can grant a **"blanket" approval valid for one financial year**, subject to:
- A defined maximum value per transaction (e.g., ₹1 Crore per transaction)
- Quarterly reviews to confirm transactions stayed within limits and scope

> 💡 Omnibus approval does NOT mean unlimited approval. The Finance team must ensure the ERP blocks any single invoice that exceeds the omnibus limit, even if the vendor is already on the approved list.

---

### Level 2: Board Approval

**Scope:** Required if the transaction is NOT in the "Ordinary Course of Business" OR NOT at "Arm's Length."

**The Recusal Requirement**
A director with an interest in the transaction being voted upon must **disclose the interest and leave the meeting** while that specific item is discussed and voted — not merely abstain from voting.

---

### Level 3: Shareholder Approval (The Materiality Test)

| Transaction Type | Threshold Requiring Shareholder Vote |
|---|---|
| Goods / Materials | >10% of Turnover or ₹100 Crore (whichever is **lower**) |
| Services | >10% of Turnover or ₹50 Crore (whichever is **lower**) |
| **Material RPT (SEBI LODR — Listed Cos.)** | >10% of Annual Consolidated Turnover or ₹1,000 Crore (whichever is **lower**) |

> ⚠️ For SEBI LODR Material RPTs, related parties **cannot vote** on the shareholder resolution.

---

## Reporting & Record-Keeping Obligations

### A. Register of Contracts (Form MBP-4)
Finance and Secretarial teams must maintain a **Register of Contracts** for all agreements with related parties. This is a primary document reviewed by statutory auditors and regulators.

### B. Board's Report (Form AOC-2)
Every RPT during the financial year must be disclosed in the Board's Report with a justification.

### C. Notes to Accounts (Ind AS 24 / AS 18)
Finance must ensure that all RPTs — including those under omnibus approval — are disclosed in the Notes to Accounts.

---

## The "Urgency Does Not Override Section 188" Rule

If a transaction exceeds omnibus limits and no Board meeting can be convened in time:
- The transaction **cannot proceed** — urgency is not a legal exception
- Post-facto ratification is possible but must occur within **3 months**, and the director bears personal liability for any losses in the interim

> ⚠️ "We were in a hurry" is not a defence. The governance framework exists precisely for high-pressure moments.
$md$, 4);

INSERT INTO slides (module_id, title, content, sequence_order) VALUES (mod5_id, 'Red Flags, Consequences & Compliance Checklist', $md$
## Red Flags — "Stop and Verify" Triggers

---

### A. Vendor Onboarding Red Flags

| Red Flag | Why It Matters |
|---|---|
| **Common Addresses** | Vendor's registered office is the same as a Director's residence or another group company's office |
| **New/Paper Companies** | Vendor has no prior track record; incorporated weeks before a major contract is awarded |
| **Shared Key Personnel** | Vendor's authorised signatory is a known relative of a company employee or KMP |
| **Incomplete Disclosures** | Vendor refuses to provide a "List of Directors" or "Ultimate Beneficial Owner (UBO)" details |

---

### B. Commercial & Procurement Red Flags

| Red Flag | Why It Matters |
|---|---|
| **Non-Competitive Bidding** | Only one quote received, or competing quotes look similar in format (indicating they were created by the same person) |
| **Atypical Terms** | 100% advance payment granted, or credit terms significantly more generous than the industry standard |
| **Price Anomalies** | Contract price significantly higher (or lower) than the last purchase price or market benchmark without justification |
| **Vague Scope of Work** | SOW is generic ("Consultancy Services") with no clear deliverables or man-hour logs |

---

### C. Financial & Payment Red Flags

| Red Flag | Why It Matters |
|---|---|
| **Round-Tripping** | Payments made to a vendor are followed by a loan or investment from that same vendor back into a promoter-controlled entity |
| **Split Invoicing** | Breaking a large contract into multiple small invoices to stay below the Audit Committee's ₹1 Crore omnibus limit |
| **Change in Bank Details** | Payment requested to a personal bank account or third-party account rather than the vendor's registered corporate account |

---

## Consequences of Non-Compliance

| Company Type | Penalty |
|---|---|
| Listed Company | Up to ₹25 Lakh for the company; ₹5 Lakh for the officer in default |
| Unlisted Company | Up to ₹5 Lakh |

The director involved can be removed from the Board and barred from future directorships.

---

## What to Do if an Unapproved RPT is Discovered

1. **Freeze Payment** — Immediately stop any pending disbursements to that vendor
2. **Report to CS/Legal** — Notify the Company Secretary to assess whether the Board can ratify it within 3 months
3. **Document the Gap** — Create a Deviation Report explaining why the related-party relationship was not caught during onboarding
4. **System Fix** — Ask IT to tag the vendor as "Related Party" in the ERP to prevent recurrence

---

## Compliance Checklist

- [ ] Does the new vendor form include a "Related Party Disclosure" section?
- [ ] Is there a Transfer Pricing report or market valuation for the RPT?
- [ ] Is the PO being raised only after Audit Committee/Board approval?
- [ ] Has the contract been entered in the Register of Contracts (MBP-4)?
- [ ] Is the vendor tagged as "Related Party" in the ERP?
- [ ] Is Finance presenting a summary of all RPTs to the Audit Committee every quarter?
- [ ] Is Finance monitoring cumulative spend and alerting Legal/Secretarial at least 60 days before a threshold is breached?
$md$, 5);

-- Module 5 Quiz Questions
INSERT INTO questions (module_id, text) VALUES (mod5_id, 'An IT vendor is owned by the brother of our company''s CFO. Under the Companies Act, 2013, is this a Related Party Transaction?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'No — only the CFO himself is a related party, not his family members', false), (_qid, 'Yes — the CFO is a KMP, and his brother is a "Relative" under Section 2(77)', true), (_qid, 'Only if the brother lives in the same household as the CFO', false), (_qid, 'Only if the contract value exceeds ₹1 Crore', false);

INSERT INTO questions (module_id, text) VALUES (mod5_id, 'Our company needs to buy raw materials worth ₹50 Lakh from a Director''s private firm. The price is exactly the market rate. Does this require Audit Committee approval?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'No, because it is at Arm''s Length', false), (_qid, 'No, because it is under the ₹1 Crore omnibus threshold', false), (_qid, 'Yes — ALL RPTs require prior Audit Committee approval, regardless of value or arm''s length status', true), (_qid, 'Only if the company is listed on a stock exchange', false);

INSERT INTO questions (module_id, text) VALUES (mod5_id, 'What is "Omnibus Approval" in the context of RPT procurement?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'A lifetime approval for a vendor to supply goods without further review', false), (_qid, 'A one-year blanket approval by the Audit Committee for repetitive transactions of a common nature, with defined value limits', true), (_qid, 'Approval given by the Procurement Head instead of the Board when urgency requires it', false), (_qid, 'An approval that covers all departments simultaneously', false);

INSERT INTO questions (module_id, text) VALUES (mod5_id, 'Under SEBI LODR, a transaction is classified as "Material" (requiring a mandatory shareholder vote) if it exceeds:') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, '₹100 Crore', false), (_qid, '5% of the company''s annual net profit', false), (_qid, '10% of annual consolidated turnover or ₹1,000 Crore — whichever is lower', true), (_qid, '₹500 Crore or 10% of net worth — whichever is higher', false);

INSERT INTO questions (module_id, text) VALUES (mod5_id, 'If the Procurement team finds that a related party is the only vendor capable of providing a specialised service, what must they document?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Nothing — if there is no other choice, the approval requirement is automatically waived', false), (_qid, 'A letter from the relevant Director confirming the urgency', false), (_qid, 'A Sole Source Justification and evidence of market benchmarking to prove arm''s length pricing', true), (_qid, 'A Board resolution approving the sole-source selection', false);

INSERT INTO questions (module_id, text) VALUES (mod5_id, 'For a Related Party Transaction to be exempt from the Section 188 approval requirement, which conditions must be satisfied?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Only the arm''s length condition', false), (_qid, 'Only the ordinary course of business condition', false), (_qid, 'Either arm''s length OR ordinary course of business — one is sufficient', false), (_qid, 'Both arm''s length AND ordinary course of business — simultaneously', true);

INSERT INTO questions (module_id, text) VALUES (mod5_id, 'If a time-critical RPT with a related party exceeds the Audit Committee''s pre-approved omnibus limits and no Board meeting can be convened in time, what is the correct course of action?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Proceed with the transaction and ratify it at the next Board meeting within 3 months', false), (_qid, 'Obtain the CEO''s written approval as an emergency measure', false), (_qid, 'The transaction cannot proceed — urgency does not override Section 188', true), (_qid, 'Obtain verbal Audit Committee approval and document it retroactively', false);

INSERT INTO questions (module_id, text) VALUES (mod5_id, 'Which of the following is a financial red flag indicating potential RPT abuse?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'A vendor submitting three competitive quotes', false), (_qid, 'A vendor requesting payment to a third-party personal bank account instead of their registered corporate account', true), (_qid, 'A vendor offering a credit period of 30 days, consistent with industry standard', false), (_qid, 'A vendor providing a detailed Scope of Work with deliverables and timelines', false);

INSERT INTO questions (module_id, text) VALUES (mod5_id, 'Under the RPT Compliance RACI Matrix, which division is "Accountable" for obtaining Audit Committee and Board approval?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'Procurement & Supply Chain', false), (_qid, 'Finance & Accounts', false), (_qid, 'Legal & Secretarial', true), (_qid, 'Internal Audit', false);

INSERT INTO questions (module_id, text) VALUES (mod5_id, 'If an RPT entered without approval is not ratified by the Board within 3 months, what is the consequence for the director who entered into the transaction?') RETURNING id INTO _qid;
INSERT INTO answers (question_id, text, is_correct) VALUES
  (_qid, 'The contract becomes automatically void, but the director faces no personal liability', false), (_qid, 'The contract is voidable and the director must personally indemnify the company for all losses', true), (_qid, 'The director must pay a fixed penalty of ₹1 Lakh to the Registrar of Companies', false), (_qid, 'The transaction is deemed approved by default if no objection is raised within 3 months', false);

END $$;
