-- Migration: Remove old placeholder questions from the 5 migrated modules
-- The cleanup migration (20260510000007) removed old slides but NOT old questions.
-- Any questions seeded before the 20260510000006 migration used random UUIDs
-- (not the structured '0000000x-...' format). Those are still in the DB and are
-- the placeholder questions appearing in the quiz.
-- This migration removes them and their answers.

BEGIN;

-- Delete answers belonging to old questions for all 5 modules
DELETE FROM public.answers
WHERE question_id IN (
    SELECT q.id FROM public.questions q
    WHERE q.module_id IN (
        'b91198d4-8edc-40fc-b30e-3f5ddaeecd66',  -- Anti-Corruption
        'a0c3c3d3-c9a1-447d-87ac-440c14484c87',  -- Cybersecurity
        '89fa7f59-1df4-4d03-99f6-c302afc0618b',  -- Data Privacy
        '1875f87e-8e89-4bab-80da-72a1925af152',  -- HSE
        '510e88a4-f501-4ba7-acc4-4f687fff65cc'   -- POSH
    )
    AND q.id::text NOT LIKE '0000000%'
);

-- Delete the old questions themselves
DELETE FROM public.questions
WHERE module_id IN (
    'b91198d4-8edc-40fc-b30e-3f5ddaeecd66',
    'a0c3c3d3-c9a1-447d-87ac-440c14484c87',
    '89fa7f59-1df4-4d03-99f6-c302afc0618b',
    '1875f87e-8e89-4bab-80da-72a1925af152',
    '510e88a4-f501-4ba7-acc4-4f687fff65cc'
)
AND id::text NOT LIKE '0000000%';

COMMIT;
