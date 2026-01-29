import fs from 'fs';
import path from 'path';

export interface SlideData {
    title: string;
    content: string;
    sequence_order: number;
}

export interface ModuleData {
    title: string;
    slides: SlideData[];
}

export function parseContentFile(filePath: string): ModuleData {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    let moduleTitle = '';
    // Attempt to find module title from first line or filename
    if (lines.length > 0) {
        moduleTitle = lines[0].trim();
    } else {
        moduleTitle = path.basename(filePath, '_content.txt');
    }

    const slides: SlideData[] = [];
    let currentSlide: Partial<SlideData> | null = null;
    let currentContentLines: string[] = [];
    let slideCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // specific Format Detection: "Slide X: Title"
        // Regex looking for "Slide" followed by number and colon
        const slideMatch = line.match(/^Slide\s+(\d+):\s*(.*)/i);

        if (slideMatch) {
            // Save previous slide if exists
            if (currentSlide) {
                currentSlide.content = currentContentLines.join('\n').trim();
                slides.push(currentSlide as SlideData);
            }

            // Start new slide
            slideCount++;
            currentContentLines = [];
            currentSlide = {
                title: slideMatch[2] || `Slide ${slideMatch[1]}`, // Use captured title or fallback
                sequence_order: parseInt(slideMatch[1], 10),
            };
        } else {
            // Add content to current slide
            if (currentSlide) {
                // Skip the main Title line if it's strictly just the module title repeated? 
                // But usually content follows.
                currentContentLines.push(line);
            }
        }
    }

    // Push final slide
    if (currentSlide) {
        currentSlide.content = currentContentLines.join('\n').trim();
        slides.push(currentSlide as SlideData);
    }

    return {
        title: moduleTitle,
        slides,
    };
}
