
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Hardcoded creds
const supabaseUrl = 'https://iamactvdegcjfwtmjvaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbWFjdHZkZWdjamZ3dG1qdmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY2OTk4MSwiZXhwIjoyMDg1MjQ1OTgxfQ.a7T_UA1Upo5qI2iXnofqmUc2JBjoeD__PFaupEfFxyY';
const supabase = createClient(supabaseUrl, supabaseKey);

const PUBLIC_DIR = path.join(__dirname, 'public');

const MODULE_SLUGS = {
    '510e88a4-f501-4ba7-acc4-4f687fff65cc': 'posh',
    '89fa7f59-1df4-4d03-99f6-c302afc0618b': 'data-privacy',
    '1875f87e-8e89-4bab-80da-72a1925af152': 'hse',
    'a0c3c3d3-c9a1-447d-87ac-440c14484c87': 'infosec',
    'b91198d4-8edc-40fc-b30e-3f5ddaeecd66': 'anticorruption' // We will skip specific generation for this if we move existing folder, but keeping for reference
};

const BASE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <img src="../aaplus_logo_colored.png" alt="Logo" class="sidebar-logo" style="max-height: 40px;">
            <a href="/dashboard" class="back-link">← Dashboard</a>
            <h2>{{MODULE_NAME}}</h2>
        </div>
        <ul class="toc-nav">
            {{NAV_ITEMS}}
        </ul>
    </nav>

    <main class="main-content">
        <div class="content-header">
            <div class="breadcrumb">Section {{CURRENT_INDEX}} of {{TOTAL_SECTIONS}}</div>
            <h1>{{SECTION_TITLE}}</h1>
        </div>

        <div class="content-body">
            {{CONTENT}}
        </div>

        <div class="navigation-footer">
            {{PREV_LINK}}
            {{NEXT_LINK}}
        </div>
    </main>
</body>
</html>
`;

async function generateStaticAll() {
    // 1. Move AntiCorruption folder first
    const sourceAC = path.join(__dirname, 'AntiCorruption');
    const destAC = path.join(PUBLIC_DIR, 'anticorruption');

    // Copy/Move logic for AC
    if (fs.existsSync(sourceAC)) {
        if (!fs.existsSync(destAC)) fs.mkdirSync(destAC, { recursive: true });
        // Recursive copy
        fs.cpSync(sourceAC, destAC, { recursive: true });
        console.log('Moved AntiCorruption to public/anticorruption');
    }

    // copy styles.css to public root so all can share if needed, or put in each folder
    // The AC index.html refers to "styles.css".
    // We will copy AntiCorruption/styles.css to public/styles.css for shared use
    const sourceStyles = path.join(sourceAC, 'styles.css');
    if (fs.existsSync(sourceStyles)) {
        fs.copyFileSync(sourceStyles, path.join(PUBLIC_DIR, 'styles.css'));
    }

    // 2. Generate for others
    for (const [moduleId, slug] of Object.entries(MODULE_SLUGS)) {
        if (slug === 'anticorruption') continue; // Skip AC as we used the prototype folder

        console.log(`Generating static site for: ${slug}`);
        const moduleDir = path.join(PUBLIC_DIR, slug);
        if (!fs.existsSync(moduleDir)) fs.mkdirSync(moduleDir, { recursive: true });

        // Fetch Module Title
        const { data: moduleData } = await supabase.from('modules').select('title').eq('id', moduleId).single();
        const moduleTitle = moduleData?.title || 'Training Module';

        // Fetch slides
        const { data: slides } = await supabase
            .from('slides')
            .select('*')
            .eq('module_id', moduleId)
            .order('sequence_order');

        if (!slides || slides.length === 0) {
            console.log(`No slides for ${slug}`);
            continue;
        }

        // Generate Navbar HTML
        const navItemsHtml = slides.map((s, idx) => {
            const fileName = idx === 0 ? 'index.html' : `section${idx + 1}.html`;
            return `<li><a href="${fileName}"><span class="toc-num">${idx + 1}</span> ${s.title}</a></li>`;
        }).join('\n');

        // Generate Pages
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            const currentIndex = i + 1;
            const fileName = i === 0 ? 'index.html' : `section${currentIndex}.html`;
            const filePath = path.join(moduleDir, fileName);

            let pageHtml = BASE_TEMPLATE
                .replace('{{TITLE}}', slide.title)
                .replace('{{MODULE_NAME}}', moduleTitle)
                .replace('{{NAV_ITEMS}}', navItemsHtml.replace(`href="${fileName}"`, `href="${fileName}" class="active"`)) // simplistic active class
                .replace('{{CURRENT_INDEX}}', currentIndex)
                .replace('{{TOTAL_SECTIONS}}', slides.length)
                .replace('{{SECTION_TITLE}}', slide.title)
                .replace('{{CONTENT}}', slide.content || '<p>No content available.</p>');

            // Nav Links
            const prevLink = i === 0 ?
                '<a href="/dashboard" class="nav-btn prev-btn">← Back to Dashboard</a>' :
                `<a href="${i === 1 ? 'index.html' : 'section' + i + '.html'}" class="nav-btn prev-btn">← Previous</a>`;

            const nextLink = i === slides.length - 1 ?
                '<a href="/dashboard" class="nav-btn next-btn">Finish Module →</a>' :
                `<a href="section${currentIndex + 1}.html" class="nav-btn next-btn">Next →</a>`;

            pageHtml = pageHtml
                .replace('{{PREV_LINK}}', prevLink)
                .replace('{{NEXT_LINK}}', nextLink);

            fs.writeFileSync(filePath, pageHtml);
        }
    }
    console.log('Static generation complete.');
}

generateStaticAll();
