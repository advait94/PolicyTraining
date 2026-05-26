import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ModulePlayer } from '@/components/feature/learning/module-player'

// Auto-assign questions to slide groups by keyword overlap (used when slide_group is NULL in DB).
// Slides are sorted and chunked into groups of 3; each question is scored against each group's
// combined text and assigned to the highest-scoring one. Ties fall back to round-robin so every
// checkpoint always gets at least some questions.
function autoAssignToSlideGroups(
    slides: Array<{ title: string; content: string; sequence_order: number }>,
    questions: Array<{ id: string; text: string; explanation?: string | null; answers: Array<{ id: string; text: string; is_correct: boolean }> }>
): Record<number, typeof questions> {
    const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','have','has','had','do','does','did','will','would','should','could','may','might','must','shall','can','that','this','which','who','what','when','where','how','why','not','it','its','they','their','them','he','she','his','her','we','our','you','your','i','my','me','us','if','as','so','all','any','each','some','such','than','then','there','these','those','about','after','before','between','through','during','under','over','above','below','up','down','out','off','just','also','both','few','more','most','other','same','own','no','nor','yet','while'])
    const tokenize = (t: string) =>
        t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w))

    const sorted = [...slides].sort((a, b) => a.sequence_order - b.sequence_order)
    const numGroups = Math.ceil(sorted.length / 3)

    // One word-set per slide group (slides 0-2 → group 1, 3-5 → group 2, …)
    const groupWords: Set<string>[] = Array.from({ length: numGroups }, (_, g) =>
        new Set(sorted.slice(g * 3, g * 3 + 3).flatMap(s => tokenize(`${s.title} ${s.content}`)))
    )

    const result: Record<number, typeof questions> = {}
    let rr = 0

    for (const q of questions) {
        const qWords = new Set(tokenize(`${q.text} ${q.answers.map(a => a.text).join(' ')}`))
        let best = -1, bestScore = -1
        for (let g = 0; g < numGroups; g++) {
            let hits = 0
            for (const w of qWords) if (groupWords[g].has(w)) hits++
            const score = qWords.size > 0 ? hits / qWords.size : 0
            if (score > bestScore) { bestScore = score; best = g }
        }
        // If no word overlap at all, distribute round-robin so every group gets coverage
        const groupNum = (bestScore === 0 ? rr++ % numGroups : best) + 1
        if (!result[groupNum]) result[groupNum] = []
        result[groupNum].push({ ...q, answers: [...q.answers].sort(() => 0.5 - Math.random()) })
    }

    for (const g of Object.keys(result)) result[+g].sort(() => 0.5 - Math.random())
    return result
}

// No unstable_cache here — slide_group is now admin-editable so questions must be fresh on every load
async function getModuleQuestions(moduleId: string) {
    const supabase = createAdminClient()
    const { data } = await supabase
        .from('questions')
        .select('id, text, explanation, slide_group, answers(id, text, is_correct)')
        .eq('module_id', moduleId)
    return data || []
}

// Params need to be awaited in Next.js 15
export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch Module & Slides
    const { data: moduleData, error } = await supabase
        .from('modules')
        .select(`
      *,
      slides (*)
    `)
        .eq('id', id)
        .single()

    if (error || !moduleData) {
        return <div>Module not found</div>
    }

    // Sort slides just in case
    moduleData.slides.sort((a: any, b: any) => a.sequence_order - b.sequence_order)

    // 2. Fetch Questions — cached 1h (static content), randomize per-request after cache hit
    const allQuestions = await getModuleQuestions(id)

    // Split into quiz pool (slide_group = null) and refresher pool (slide_group set)
    const quizPool = allQuestions.filter((q: any) => q.slide_group == null)
    const refresherPool = allQuestions.filter((q: any) => q.slide_group != null)

    // Quiz questions: same shuffle-and-slice-10 logic as before
    const selectedQuestions = [...quizPool]
        .sort(() => 0.5 - Math.random())
        .slice(0, 10)
        .map((q: any) => ({ ...q, answers: [...q.answers].sort(() => 0.5 - Math.random()) }))

    // Refresher questions: group by slide_group, shuffle within each group
    const refreshersByGroup: Record<number, any[]> = {}
    for (const q of refresherPool) {
        const g = q.slide_group as number
        if (!refreshersByGroup[g]) refreshersByGroup[g] = []
        refreshersByGroup[g].push({ ...q, answers: [...q.answers].sort(() => 0.5 - Math.random()) })
    }
    for (const g of Object.keys(refreshersByGroup)) {
        refreshersByGroup[+g].sort(() => 0.5 - Math.random())
    }

    // Auto-assign quiz-pool questions to slide groups for any checkpoint that has no
    // DB-tagged refreshers. Questions assigned here remain in the quiz pool too.
    const autoGroups = autoAssignToSlideGroups(moduleData.slides, quizPool)
    for (const [g, qs] of Object.entries(autoGroups)) {
        if (!refreshersByGroup[+g]) refreshersByGroup[+g] = qs
    }

    // 3. Fetch User Progress (to resume? or just show completed state)
    const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', id)
        .single()

    // Ensure Module Title is string
    const modTitle: string = moduleData.title || 'Untitled Module'

    return (
        <ModulePlayer
            moduleId={moduleData.id}
            moduleTitle={modTitle}
            slides={moduleData.slides}
            questions={selectedQuestions}
            refreshersByGroup={refreshersByGroup}
            initialProgress={progress}
        />
    )
}
