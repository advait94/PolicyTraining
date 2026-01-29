import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ModulePlayer } from '@/components/feature/learning/module-player'

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

    // 2. Fetch Questions (Fetch ALL allowed questions, then randomize 10 server-side)
    const { data: allQuestions } = await supabase
        .from('questions')
        .select(`
      id,
      text,
      answers (id, text, is_correct)
    `)
        .eq('module_id', id)

    // Randomize & Pick 10
    const shuffled = (allQuestions || []).sort(() => 0.5 - Math.random())
    const selectedQuestions = shuffled.slice(0, 10).map((q: any) => ({
        ...q,
        answers: q.answers.sort(() => 0.5 - Math.random()) // Randomize answers too
    }))

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
        <div className="container mx-auto py-8 px-4">
            <ModulePlayer
                moduleId={moduleData.id}
                moduleTitle={modTitle}
                slides={moduleData.slides}
                questions={selectedQuestions}
                initialProgress={progress}
            />
        </div>
    )
}
