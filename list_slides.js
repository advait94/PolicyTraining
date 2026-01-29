
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iamactvdegcjfwtmjvaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbWFjdHZkZWdjamZ3dG1qdmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY2OTk4MSwiZXhwIjoyMDg1MjQ1OTgxfQ.a7T_UA1Upo5qI2iXnofqmUc2JBjoeD__PFaupEfFxyY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listSlides() {
    console.log('Fetching slides...');

    const { data, error } = await supabase
        .from('slides')
        .select('id, title, sequence_order')
        .eq('module_id', 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66')
        .order('sequence_order', { ascending: true });

    if (error) {
        console.error('Error fetching slides:', error);
    } else {
        data.forEach(slide => {
            console.log(`${slide.sequence_order}. [${slide.id}] ${slide.title}`);
        });
    }
}

listSlides();
