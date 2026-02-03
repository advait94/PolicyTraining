import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
    try {
        const { user_id, module_name } = await req.json();

        if (!user_id || !module_name) {
            return new Response("Missing details", { status: 400 });
        }

        // 1. Get User Profile
        const { data: user } = await supabase.from('users').select('display_name').eq('id', user_id).single();
        const userName = user?.display_name || 'Learner';

        // 2. Create PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const { width, height } = page.getSize();

        // Draw Text
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontSize = 30;

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
