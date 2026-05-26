-- Add slide_group to questions so refresher questions can be tied to specific slide checkpoints.
-- slide_group = 1 → shown after slides 1-3 (covers content from those slides)
-- slide_group = 2 → shown after slides 4-6, etc.
-- slide_group = NULL → final-quiz-only question (default, no behaviour change)
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS slide_group INTEGER DEFAULT NULL;
