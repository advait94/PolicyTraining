-- Remove pre-existing slides for the 5 migrated HTML modules.
-- Our migration inserts used IDs starting with '0000000'; all others are old/stale.
DELETE FROM public.slides
WHERE module_id IN (
    'b91198d4-8edc-40fc-b30e-3f5ddaeecd66',  -- Anti-Corruption
    'a0c3c3d3-c9a1-447d-87ac-440c14484c87',  -- Cybersecurity
    '89fa7f59-1df4-4d03-99f6-c302afc0618b',  -- Data Privacy
    '1875f87e-8e89-4bab-80da-72a1925af152',  -- HSE
    '510e88a4-f501-4ba7-acc4-4f687fff65cc'   -- POSH
)
AND id::text NOT LIKE '0000000%';
