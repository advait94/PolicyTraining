-- Migration: Replace 6 recall-heavy questions in "Mastering Company Law & Compliances"
-- This module is for ALL employees (general awareness), not CS professionals.
-- Removing: max directors number, Section 173 meeting intervals, Form MGT-7 filing days,
--           Section 166 number recall, Turquand's Rule (too technical), Section 447 imprisonment years.
-- Replacing with: scenarios a general employee can encounter and act on.

BEGIN;

DO $$
DECLARE
    mod_id UUID;
    q_id   UUID;
BEGIN
    SELECT id INTO mod_id
    FROM public.modules
    WHERE title = 'Mastering Company Law & Compliances';

    IF mod_id IS NULL THEN
        RAISE EXCEPTION 'Module "Mastering Company Law & Compliances" not found';
    END IF;

    -- ----------------------------------------------------------------
    -- DELETE Q3: "What is the maximum number of directors allowed..."
    -- ----------------------------------------------------------------
    DELETE FROM public.answers WHERE question_id IN (
        SELECT id FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%maximum number of directors%'
    );
    DELETE FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%maximum number of directors%';

    INSERT INTO public.questions (module_id, text)
    VALUES (mod_id, 'A director approves a large vendor contract with a company secretly owned by their spouse, without disclosing this to the Board. Under the Companies Act, 2013, this is best described as:')
    RETURNING id INTO q_id;
    INSERT INTO public.answers (question_id, text, is_correct) VALUES
        (q_id, 'Acceptable practice as long as the pricing is at market rate', false),
        (q_id, 'A breach of director duties — directors must disclose conflicts of interest and must not use their position for personal or related-party benefit', true),
        (q_id, 'Only a problem if the contract value exceeds ₹1 Crore', false),
        (q_id, 'The MD''s responsibility to catch, not a legal violation by the director', false);

    -- ----------------------------------------------------------------
    -- DELETE Q4: "Under Section 173, maximum days between Board Meetings"
    -- ----------------------------------------------------------------
    DELETE FROM public.answers WHERE question_id IN (
        SELECT id FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%Section 173%'
    );
    DELETE FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%Section 173%';

    INSERT INTO public.questions (module_id, text)
    VALUES (mod_id, 'Your company reported ₹8 Crore in net profits this year. A colleague says the company is now legally required to spend money on social causes. Is this correct?')
    RETURNING id INTO q_id;
    INSERT INTO public.answers (question_id, text, is_correct) VALUES
        (q_id, 'No — CSR spending is voluntary in India', false),
        (q_id, 'No — the CSR requirement only applies to government-owned companies', false),
        (q_id, 'Yes — companies with net profit of ₹5 Crore or more must spend 2% of their average net profits on CSR activities under Section 135', true),
        (q_id, 'Yes — but only if shareholders pass a resolution approving it each year', false);

    -- ----------------------------------------------------------------
    -- DELETE Q5: "Form MGT-7 must be filed within how many days"
    -- ----------------------------------------------------------------
    DELETE FROM public.answers WHERE question_id IN (
        SELECT id FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%MGT-7%'
    );
    DELETE FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%MGT-7%';

    INSERT INTO public.questions (module_id, text)
    VALUES (mod_id, 'A company was incorporated 40 years ago. Its founder passed away, and most original investors have since sold their shares. Can the company still honor contracts it signed 20 years ago?')
    RETURNING id INTO q_id;
    INSERT INTO public.answers (question_id, text, is_correct) VALUES
        (q_id, 'No — the company''s obligations lapse when its founder dies', false),
        (q_id, 'No — contracts must be renewed when majority ownership changes', false),
        (q_id, 'Yes — due to perpetual succession, a company continues to exist and remains bound by its commitments regardless of changes in ownership or management', true),
        (q_id, 'Only if the current Board passes a resolution confirming the old contracts', false);

    -- ----------------------------------------------------------------
    -- DELETE Q7: "Which section of the Companies Act deals with Director Duties?"
    -- ----------------------------------------------------------------
    DELETE FROM public.answers WHERE question_id IN (
        SELECT id FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%Which section%Director Duties%'
    );
    DELETE FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%Which section%Director Duties%';

    INSERT INTO public.questions (module_id, text)
    VALUES (mod_id, 'Your company is considering bidding on a large construction project, but construction services are not listed in the company''s Memorandum of Association Objects Clause. What is the legal risk?')
    RETURNING id INTO q_id;
    INSERT INTO public.answers (question_id, text, is_correct) VALUES
        (q_id, 'No risk — companies can pursue any profitable opportunity', false),
        (q_id, 'The contract may be void as Ultra Vires — acting beyond the MOA Objects Clause has no legal force and cannot be ratified even by shareholders', true),
        (q_id, 'The contract is valid as long as the Board of Directors approves it', false),
        (q_id, 'The risk only arises if a competitor formally challenges the contract', false);

    -- ----------------------------------------------------------------
    -- DELETE Q9: "Doctrine of Indoor Management (Turquand's Rule) protects which party?"
    -- ----------------------------------------------------------------
    DELETE FROM public.answers WHERE question_id IN (
        SELECT id FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%Indoor Management%'
    );
    DELETE FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%Indoor Management%';

    INSERT INTO public.questions (module_id, text)
    VALUES (mod_id, 'A manager in your team has consistently directed procurement to a supplier owned by their sibling, without ever disclosing this relationship to management. Which of the following best describes this situation?')
    RETURNING id INTO q_id;
    INSERT INTO public.answers (question_id, text, is_correct) VALUES
        (q_id, 'A minor issue that only needs flagging if the amounts involved are large', false),
        (q_id, 'A conflict of interest — undisclosed related-party relationships violate employee and director duties and should be reported, regardless of whether pricing appears fair', true),
        (q_id, 'Acceptable as long as the supplier provides good quality services', false),
        (q_id, 'Only a problem if the manager is also a shareholder in the supplier company', false);

    -- ----------------------------------------------------------------
    -- DELETE Q10: "Under Section 447, the maximum imprisonment for corporate fraud is:"
    -- ----------------------------------------------------------------
    DELETE FROM public.answers WHERE question_id IN (
        SELECT id FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%Section 447%'
    );
    DELETE FROM public.questions WHERE module_id = mod_id
        AND text LIKE '%Section 447%';

    INSERT INTO public.questions (module_id, text)
    VALUES (mod_id, 'An employee discovers that the company''s financial statements have been falsified to hide significant losses from shareholders and regulators. What should they do?')
    RETURNING id INTO q_id;
    INSERT INTO public.answers (question_id, text, is_correct) VALUES
        (q_id, 'Raise it quietly with the same manager who oversees the accounts', false),
        (q_id, 'Ignore it — the statutory auditor will find it during the annual audit', false),
        (q_id, 'Report it immediately through the whistleblower channel or directly to the Audit Committee or Company Secretary — corporate fraud is a serious non-compoundable offence under the Companies Act', true),
        (q_id, 'Wait to see if the losses recover in the next quarter before escalating', false);

END $$;

COMMIT;
