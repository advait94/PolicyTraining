import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

// ... (imports remain)

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
    try {
        const { user_id, module_name } = await req.json();

        if (!user_id || !module_name) {
            return new Response("Missing details", { status: 400 });
        }

        // 1. Get User Profile & Organization Logo
        const { data: user } = await supabase
            .from('users')
            .select(`
                display_name,
                organization_id,
                organizations (
                    logo_url
                )
            `)
            .eq('id', user_id)
            .single();

        const userName = user?.display_name || 'Learner';
        const orgLogoUrl = user?.organizations?.logo_url;

        // 2. Create PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const { width, height } = page.getSize();

        // Load AA Plus Logo (Static Assets)
        // Ideally these should be fetched from a stable URL or bundled
        // For now, we'll try to fetch from the public site or use a placeholder if not available
        // NOTE: In a real edge function, you'd fetchArrayBuffer from a known URL
        const AAPlusLogoUrl = 'https://iamactvdegcjfwtmjvaj.supabase.co/storage/v1/object/public/static-assets/aaplus-logo.png'; // Placeholder

        // Helper to fetch and embed image
        const embedLogo = async (url: string) => {
            try {
                const imgBytes = await fetch(url).then(res => res.arrayBuffer());
                if (url.toLowerCase().endsWith('.png')) return await pdfDoc.embedPng(imgBytes);
                if (url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.jpeg')) return await pdfDoc.embedJpg(imgBytes);
                return null;
            } catch (e) {
                console.error(`Failed to load logo: ${url}`, e);
                return null;
            }
        };

        // Draw AA Plus Logo (Bottom Right)
        // (Assuming we have it, otherwise skip or use text)
        // For reliability in this demo, let's stick to drawing Text if fetching fails or use the passed Org Logo logic only

        // Draw Org Logo (Top Right)
        if (orgLogoUrl) {
            const orgImage = await embedLogo(orgLogoUrl);
            if (orgImage) {
                const logoDims = orgImage.scaleToFit(150, 50); // Max width 150, Max height 50
                page.drawImage(orgImage, {
                    x: width - logoDims.width - 30, // 30px padding from right
                    y: height - logoDims.height - 30, // 30px padding from top
                    width: logoDims.width,
                    height: logoDims.height,
                });
            }
        }

        // Always Draw "Powered by AA Plus Consultants" (Bottom Right) instead of just an image for reliability
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontSize = 30;

        // Certificate Title
        page.drawText('Certificate of Completion', {
            x: 50,
            y: height - 100,
            size: 24,
            font,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Presented to: ${userName}`, {
            x: 50,
            y: height - 150,
            size: fontSize,
            font,
            color: rgb(0, 0, 0.8),
        });

        page.drawText(`For completing: ${module_name}`, {
            x: 50,
            y: height - 200,
            size: 18,
            font,
            color: rgb(0.3, 0.3, 0.3),
        });

        page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
            x: 50,
            y: height - 250,
            size: 12,
            font,
        });

        // "Powered by" Footer
        const footerFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        page.drawText('Powered by AA Plus Consultants', {
            x: width - 200,
            y: 30,
            size: 10,
            font: footerFont,
            color: rgb(0.5, 0.5, 0.5),
        });

        const pdfBytes = await pdfDoc.save();

        // 3. Upload to Storage
        const fileName = `${user_id}/${Date.now()}_certificate.pdf`;
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('certificates')
            .upload(fileName, pdfBytes, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // 4. Get Public URL
        const { data: { publicUrl } } = supabase.storage.from('certificates').getPublicUrl(fileName);

        return new Response(JSON.stringify({ url: publicUrl }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
