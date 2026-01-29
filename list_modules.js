
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iamactvdegcjfwtmjvaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbWFjdHZkZWdjamZ3dG1qdmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY2OTk4MSwiZXhwIjoyMDg1MjQ1OTgxfQ.a7T_UA1Upo5qI2iXnofqmUc2JBjoeD__PFaupEfFxyY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listModules() {
    console.log('Fetching modules...');

    const { data, error } = await supabase
        .from('modules')
        .select('id, title');

    if (error) {
        console.error('Error fetching modules:', error);
    } else {
        data.forEach(m => {
            console.log(`[${m.id}] ${m.title}`);
        });
    }
}

listModules();
