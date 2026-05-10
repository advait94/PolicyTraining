-- Migration: Health, Safety & Environment module content improvements
-- Changes:
--   1. Update slide 1 (intro) to list all 10 slides including ergonomics and mental health
--   2. Add slide 9: Office Ergonomics & Workstation Safety
--   3. Add slide 10: Mental Health & Wellbeing at Work
--   4. Replace Q1 (HSE acronym — trivial recall) with ergonomics scenario
--   5. Replace Q4 (PPE acronym — trivial recall) with mental health scenario

BEGIN;

-- ============================================================
-- UPDATE SLIDE 1: Reflect expanded 10-slide structure
-- ============================================================

DELETE FROM public.slides WHERE id = '00000004-0001-0001-0000-000000000001';

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000004-0001-0001-0000-000000000001', '1875f87e-8e89-4bab-80da-72a1925af152', 'Introduction - Why HSE Matters', $$> **Training Objectives:** By the end of this training, you will understand HSE fundamentals, recognize all four types of workplace hazards — including those that affect office workers every day — know emergency procedures, and understand your responsibility to your own health and your colleagues'.

## What is HSE?

HSE is a multi-disciplinary area focused on ensuring the **well-being of employees, the safety of operations, and the protection of the environment**. It is a core part of responsible business operations — not just a regulatory requirement.

> **Why HSE is Important:**
> - **Moral Responsibility:** Protecting people from harm is our primary ethical obligation
> - **Legal Compliance:** Non-compliance with safety laws leads to penalties, prosecution, and business closure
> - **Economic Benefits:** Fewer accidents mean lower costs, lower absenteeism, and higher productivity
> - **Company Reputation:** A single serious safety incident can permanently damage stakeholder trust

## Who Needs This Training?

This training applies to every employee — whether you work in the office, on a client site, or in the field. Workplace hazards exist in every environment, and safety is everyone's responsibility.

## What You Will Learn

1. **Legal Framework:** Factories Act and Environmental Protection Act
2. **Workplace Hazards:** Physical, chemical, ergonomic, and psychosocial risks
3. **Fire Safety & PPE:** Prevention, response, and protection
4. **Emergency Procedures:** Evacuation, medical response, near-miss reporting
5. **Environmental Responsibility:** Waste, energy, and e-waste management
6. **Consequences:** Legal, human, and reputational impacts of HSE failures
7. **Best Practices:** Daily safety habits for every employee
8. **Office Ergonomics:** Workstation health, eye strain, and RSI prevention
9. **Mental Health at Work:** Recognizing stress, burnout, and supporting colleagues$$, 1);

-- ============================================================
-- NEW SLIDE 9: Office Ergonomics & Workstation Safety
-- ============================================================

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000004-0009-0001-0000-000000000001', '1875f87e-8e89-4bab-80da-72a1925af152', 'Office Ergonomics & Workstation Safety', $$> **The Office Is a Workplace Too:** Most injuries in office environments are not dramatic accidents — they are slow-building conditions caused by poor posture, inadequate setup, and repetitive movements. Repetitive Strain Injuries (RSIs) and musculoskeletal disorders are among the most common work-related health issues in India, yet most are entirely preventable.

## Your Workstation Setup

A correct setup prevents the most common office health problems before they start.

| Element | Correct Setup |
|---|---|
| **Chair height** | Feet flat on the floor, knees at 90°, thighs parallel to the ground |
| **Screen position** | Top of the screen at eye level, approximately one arm's length away |
| **Keyboard & mouse** | Elbows at 90°, wrists flat and relaxed — not bent upward or downward |
| **Lighting** | Screen positioned away from windows; no glare on your screen |
| **Back support** | Lower back supported by the chair's lumbar support — do not slouch |
| **Documents** | Use a document holder beside your screen to avoid repeatedly looking down |

> **Quick Check:** Can you sit with your back supported and your feet flat without straining? Is the top of your screen at eye level? If not, request a workstation assessment from your manager or facilities team.

## Eye Strain & the 20-20-20 Rule

Prolonged screen time causes **digital eye strain** — blurred vision, dry eyes, and tension headaches are the most common symptoms.

> **The 20-20-20 Rule:** Every **20 minutes**, look at an object at least **20 feet away** for **20 seconds**. This relaxes the eye's focusing muscles and measurably reduces strain.

Additionally: adjust screen brightness to match your environment, increase font size if you are squinting, and blink consciously — screen use dramatically reduces blink rate.

## Recognizing RSI Early

RSI develops gradually from repetitive micro-trauma — typing, mouse use, holding a phone. Catch it early.

- **Tingling or numbness** in fingers, hands, or wrists
- **Aching or stiffness** in forearms, shoulders, or neck
- **Reduced grip strength** or dropping objects unexpectedly
- **Pain that worsens** during or after specific tasks

> **Early Action Is Critical:** Report RSI symptoms to your manager before they become chronic. A simple workstation adjustment or wrist support can prevent months of pain. Waiting until symptoms are severe makes recovery far longer.

## Micro-Breaks & Movement

Sustained static posture — even in a "correct" position — causes fatigue and circulatory problems.

- Stand up, stretch, and walk for **2 minutes every 30-45 minutes**
- Take phone calls standing where possible
- Use stairs instead of elevators when moving between floors

> **The 20-8-2 Rule:** For every 30 minutes, aim for 20 minutes seated, 8 minutes standing, and 2 minutes moving. Even modest movement patterns significantly reduce the long-term health impact of desk work.$$, 9)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- NEW SLIDE 10: Mental Health & Wellbeing at Work
-- ============================================================

INSERT INTO public.slides (id, module_id, title, content, sequence_order)
VALUES ('00000004-0010-0001-0000-000000000001', '1875f87e-8e89-4bab-80da-72a1925af152', 'Mental Health & Wellbeing at Work', $$> **Psychosocial Hazards Are Recognized Workplace Risks:** Workplace stress, burnout, and mental health conditions are not personal weaknesses — they are occupational health hazards recognized under HSE frameworks globally. Addressing them is as much an employer obligation as fixing a physical safety risk.

## Stress vs. Burnout — Know the Difference

> **Stress** is an excess of demands over capacity — it can be short-term and manageable.
>
> **Burnout** is the result of prolonged, unrelieved stress — it leads to complete emotional, physical, and cognitive exhaustion. Recovery from burnout typically takes months, not days. Early intervention prevents stress from becoming burnout.

## Common Signs to Recognize

Whether in yourself or a colleague:

- **Physical:** Persistent fatigue, frequent headaches, difficulty sleeping, getting ill more often than usual
- **Behavioral:** Withdrawal from colleagues and social situations, reduced productivity, increased errors, irritability or sudden mood changes
- **Cognitive:** Difficulty concentrating, forgetting things, inability to "switch off" from work mentally

## Common Workplace Causes

- Excessive workload or consistently unrealistic deadlines
- Lack of control or autonomy over one's own work
- Unclear expectations or poor communication from management
- Conflict with colleagues or a manager
- Significant organizational change without adequate support
- Fear of job insecurity or lack of career clarity

## What You Can Do — For Yourself

1. **Speak to your manager early** — if workload feels unmanageable, raise it before it becomes a crisis
2. **Use your leave** — annual leave exists for your recovery; not taking it is not a sign of dedication
3. **Access the Employee Assistance Programme (EAP)** — confidential, professional counseling support is available to all employees
4. **Set boundaries** — chronic overwork is not a sustainable strategy; protect your recovery time outside work

## What You Can Do — For a Colleague

> **If you notice signs of distress in someone around you:**
> 1. **Check in privately** — "You seem like you've had a tough few weeks — are you okay?"
> 2. **Listen without judgment** — do not offer quick fixes or minimize what they are experiencing
> 3. **Encourage support** — suggest HR, the EAP, or a trusted manager
> 4. **Escalate if necessary** — if you believe someone is at serious risk of harm, report immediately to HR

## Manager Responsibility

Managers have a specific HSE duty around psychosocial wellbeing:

- Conduct regular one-to-ones that include a wellbeing check-in — not just performance updates
- Address unrealistic workloads proactively — not only when someone reaches crisis point
- Recognize and act on early warning signs rather than waiting for formal absence

> **The Business Case:** Organizations that take mental health seriously have lower absenteeism, higher retention, and fewer serious safety incidents. Wellbeing is not a soft HR initiative — it is a measurable safety and performance priority.$$, 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- REPLACE WEAK QUIZ QUESTIONS WITH SCENARIO-BASED ONES
-- ============================================================

-- Q1 replacement: ergonomics scenario (was "What does HSE stand for?" — pure acronym recall)

DELETE FROM public.answers  WHERE question_id = '00000004-0001-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000004-0001-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0001-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152',
        'Your colleague has been complaining of neck and shoulder pain for weeks. You notice their laptop screen is too low and they lean forward constantly while working. What type of hazard is this and what should you do?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000004-0001-0001-0001-000000000003', '00000004-0001-0002-0000-000000000002',
 'A chemical hazard — report it to the safety officer immediately', false),
('00000004-0001-0002-0001-000000000003', '00000004-0001-0002-0000-000000000002',
 'An ergonomic hazard — suggest a workstation adjustment and report to their line manager for an assessment', true),
('00000004-0001-0003-0001-000000000003', '00000004-0001-0002-0000-000000000002',
 'Not a workplace hazard — it is a personal health issue unrelated to work', false),
('00000004-0001-0004-0001-000000000003', '00000004-0001-0002-0000-000000000002',
 'A physical hazard requiring immediate evacuation of the area', false);

-- Q4 replacement: mental health / colleague wellbeing scenario (was "What does PPE stand for?" — pure acronym recall)

DELETE FROM public.answers  WHERE question_id = '00000004-0004-0002-0000-000000000002';
DELETE FROM public.questions WHERE id          = '00000004-0004-0002-0000-000000000002';

INSERT INTO public.questions (id, module_id, text)
VALUES ('00000004-0004-0002-0000-000000000002', '1875f87e-8e89-4bab-80da-72a1925af152',
        'A colleague has been noticeably withdrawn, making repeated errors, and has mentioned feeling overwhelmed for the past month. What is the appropriate response?');

INSERT INTO public.answers (id, question_id, text, is_correct) VALUES
('00000004-0004-0001-0001-000000000003', '00000004-0004-0002-0000-000000000002',
 'Give them space — it is personal and not a workplace matter', false),
('00000004-0004-0002-0001-000000000003', '00000004-0004-0002-0000-000000000002',
 'Check in privately, listen without judgment, and encourage them to seek support from HR or the EAP', true),
('00000004-0004-0003-0001-000000000003', '00000004-0004-0002-0000-000000000002',
 'Tell them to take a day off — they will feel better after rest', false),
('00000004-0004-0004-0001-000000000003', '00000004-0004-0002-0000-000000000002',
 'Wait until it starts visibly affecting your team''s output before raising it', false);

COMMIT;
