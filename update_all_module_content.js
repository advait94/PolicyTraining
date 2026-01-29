
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Hardcoded creds for simplicity as per previous success
const supabaseUrl = 'https://iamactvdegcjfwtmjvaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbWFjdHZkZWdjamZ3dG1qdmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY2OTk4MSwiZXhwIjoyMDg1MjQ1OTgxfQ.a7T_UA1Upo5qI2iXnofqmUc2JBjoeD__PFaupEfFxyY';

const supabase = createClient(supabaseUrl, supabaseKey);

const MAPPING = {
    // slide_sequence -> filename
    // Slide 4: International Anti-Bribery Laws with Indian Impact
    4: 'section2.html',
    // Slide 5: Defining Bribery and Corruption in Practice
    5: 'section3.html',
    // Slide 6: Red Flags and High-Risk Areas
    6: 'section4.html',
    // Slide 7: Our Organizational Policy & Procedures
    7: 'section5.html',
    // Slide 8: Reporting Concerns & Whistleblower Protection
    8: 'section6.html',
    // Slide 9: Consequences of Non-Compliance
    9: 'section7.html',
    // Slide 10: Best Practices for a Robust Compliance Program
    10: 'section8.html'
};

const MODULE_ID = 'b91198d4-8edc-40fc-b30e-3f5ddaeecd66';
const ANTI_CORRUPTION_DIR = path.join(__dirname, 'AntiCorruption');

function extractContentBody(html) {
    // Regex to capture content inside <div class="content-body">...</div>
    // We use [\s\S]*? for non-greedy multiline matching
    const match = html.match(/<div class="content-body">([\s\S]*?)<\/div>/);
    if (match && match[1]) {
        // Dedent the content
        return match[1].split('\n').map(line => line.trim()).join('\n');
    }
    return null;
}

async function updateSlides() {
    console.log('Starting bulk update for module:', MODULE_ID);

    for (const [sequence, filename] of Object.entries(MAPPING)) {
        const filePath = path.join(ANTI_CORRUPTION_DIR, filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filename}`);
            continue;
        }

        const html = fs.readFileSync(filePath, 'utf8');
        const content = extractContentBody(html);

        if (!content) {
            console.warn(`Could not extract content-body from ${filename}`);
            continue;
        }

        console.log(`Updating Slide Seq ${sequence} from ${filename}...`);

        const { data, error } = await supabase
            .from('slides')
            .update({ content: content })
            .eq('module_id', MODULE_ID)
            .eq('sequence_order', parseInt(sequence))
            .select();

        if (error) {
            console.error(`Failed to update slide ${sequence}:`, error);
        } else {
            console.log(`Updated successfully. Rows affected: ${data.length}`);
        }
    }
}

updateSlides();
