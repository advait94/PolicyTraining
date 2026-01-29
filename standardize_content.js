
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Hardcoded creds
const supabaseUrl = 'https://iamactvdegcjfwtmjvaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbWFjdHZkZWdjamZ3dG1qdmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY2OTk4MSwiZXhwIjoyMDg1MjQ1OTgxfQ.a7T_UA1Upo5qI2iXnofqmUc2JBjoeD__PFaupEfFxyY';
const supabase = createClient(supabaseUrl, supabaseKey);

const DOCS_DIR = path.join(__dirname, 'docs');

const MODULES = {
    '510e88a4-f501-4ba7-acc4-4f687fff65cc': 'Comprehensive Training PPT on POSH Act_content.txt',
    '89fa7f59-1df4-4d03-99f6-c302afc0618b': 'Data Privacy and Protection Training_content.txt',
    '1875f87e-8e89-4bab-80da-72a1925af152': 'Health Safety Environment training PPT_content.txt',
    'a0c3c3d3-c9a1-447d-87ac-440c14484c87': 'Information and Cyber Security Training_content.txt'
};

function convertToRichHTML(text) {
    const lines = text.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        // SKIP slide headers in the content body as they are handled by logic
        if (line.startsWith('Slide ')) return;

        if (line.match(/^Title:/) || line.match(/^Subtitle:/)) {
            // Skip title/subtitle lines as they are usually header info
            return;
        }

        // Headers
        if (line.match(/^[A-Z][a-zA-Z\s&]+:/) && !line.includes('Slide')) {
            html += `<h3>${line}</h3>`;
            return;
        }

        // Detect Definitions / Important Info for Info Cards
        if (line.startsWith('Definition:') || line.includes('What is') || line.includes('Zero Tolerance')) {
            html += `
            <div class="info-card primary">
                <div class="info-icon">📘</div>
                <div>
                    <h3>Definition / Key Concept</h3>
                    <p>${line}</p>
                </div>
            </div>`;
            return;
        }

        // Detect Warnings / Penalties
        if (line.includes('Penalty') || line.includes('Consequences') || line.includes('Warning')) {
            html += `
            <div class="info-card warning">
                <div class="info-icon">⚠️</div>
                <div>
                    <h3>Important Notice</h3>
                    <p>${line}</p>
                </div>
            </div>`;
            return;
        }

        // Detect Lists (Bullets)
        if (line.match(/^[•\-\d+\.]/)) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${line.replace(/^[•\-\d+\.]\s*/, '')}</li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            // Regular paragraphs
            if (!line.startsWith('<')) {
                html += `<p>${line}</p>`;
            }
        }
    });

    if (inList) html += '</ul>';

    // Wrap common groupings in grid for aesthetics if many short items exist (heuristic)
    // For now, simpler robust conversion is better than complex heuristic failure
    return html;
}

// Optimized helper for more specific content chunks extraction logic could go here
// But for now we treat the text file as a stream of content for the whole module
// constraint: the text files are monolithic. We need to split by "Slide X:"

function splitBySlides(fullText) {
    // Regex matches "Slide 1:", "Slide 2:", etc.
    const slideBlocks = fullText.split(/Slide \d+:/g);
    // Remove empty first element if any
    if (slideBlocks[0].trim() === '') slideBlocks.shift();
    return slideBlocks;
}

async function processModules() {
    for (const [moduleId, filename] of Object.entries(MODULES)) {
        console.log(`Processing module: ${moduleId} (${filename})`);
        const filePath = path.join(DOCS_DIR, filename);

        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        const fullText = fs.readFileSync(filePath, 'utf8');
        const slideContents = splitBySlides(fullText);

        // We assume sequence corresponds to array index + 1 (or + offset) based on DB
        // Fetch existing slides to map IDs
        const { data: slides, error } = await supabase
            .from('slides')
            .select('id, sequence_order')
            .eq('module_id', moduleId)
            .order('sequence_order', { ascending: true });

        if (error) {
            console.error('Error fetching slides:', error);
            continue;
        }

        // Update each slide
        for (let i = 0; i < slides.length && i < slideContents.length; i++) {
            const slide = slides[i];
            const rawContent = slideContents[i]; // Corresponding text block
            const richHtml = convertToRichHTML(rawContent);

            if (!richHtml) continue;

            const { error: updateError } = await supabase
                .from('slides')
                .update({ content: richHtml })
                .eq('id', slide.id);

            if (updateError) {
                console.error(`Failed to update slide ${slide.id}:`, updateError);
            } else {
                console.log(`Updated slide ${slide.id} (Seq: ${slide.sequence_order})`);
            }
        }
    }
}

processModules();
