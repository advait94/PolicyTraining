import { createClient } from '@supabase/supabase-js';
import { parseContentFile } from '../lib/content-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    const docsDir = path.join(process.cwd(), 'docs');
    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('_content.txt'));

    console.log(`Found ${files.length} content files.`);

    for (const [index, file] of files.entries()) {
        const filePath = path.join(docsDir, file);
        console.log(`Parsing ${file}...`);
        const moduleData = parseContentFile(filePath);

        // 1. Create Module
        const { data: moduleRecord, error: moduleError } = await supabase
            .from('modules')
            .insert({
                title: moduleData.title,
                description: `Training module for ${moduleData.title}`,
                sequence_order: index + 1
            })
            .select()
            .single();

        if (moduleError) {
            console.error(`Error creating module ${moduleData.title}:`, moduleError);
            continue;
        }

        console.log(`Created Module: ${moduleRecord.title} (${moduleRecord.id})`);

        // 2. Create Slides
        const slidesPayload = moduleData.slides.map(slide => ({
            module_id: moduleRecord.id,
            title: slide.title,
            content: slide.content,
            sequence_order: slide.sequence_order
        }));

        const { error: slidesError } = await supabase
            .from('slides')
            .insert(slidesPayload);

        if (slidesError) {
            console.error(`Error adding slides for ${moduleData.title}:`, slidesError);
        } else {
            console.log(`  Added ${slidesPayload.length} slides.`);
        }

        // 3. Questions (Placeholder - require manual or separate parsing)
        // We will just create 10 placeholder questions per module for now
        // as the text file format for questions is not yet defined/analyzed.
        const questionsPayload = Array.from({ length: 10 }).map((_, qIndex) => ({
            module_id: moduleRecord.id,
            text: `Question ${qIndex + 1} for ${moduleRecord.title} (Placeholder)`
        }));

        const { data: questionRecords, error: qError } = await supabase
            .from('questions')
            .insert(questionsPayload)
            .select();

        if (qError) {
            console.error(`Error adding questions:`, qError);
        } else if (questionRecords) {
            // Add answers
            const answersPayload = [];
            for (const q of questionRecords) {
                answersPayload.push(
                    { question_id: q.id, text: 'Correct Answer', is_correct: true },
                    { question_id: q.id, text: 'Wrong Answer 1', is_correct: false },
                    { question_id: q.id, text: 'Wrong Answer 2', is_correct: false },
                    { question_id: q.id, text: 'Wrong Answer 3', is_correct: false }
                );
            }
            await supabase.from('answers').insert(answersPayload);
            console.log(`  Added 10 placeholder questions with answers.`);
        }
    }

    console.log('Seeding complete.');
}

seed().catch(err => console.error(err));
