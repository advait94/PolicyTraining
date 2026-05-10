CREATE TABLE IF NOT EXISTS public.section_progress (
    user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_slug  TEXT        NOT NULL,
    section_num  INTEGER     NOT NULL,
    read_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, module_slug, section_num)
);

ALTER TABLE public.section_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own section progress"
    ON public.section_progress FOR ALL
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
