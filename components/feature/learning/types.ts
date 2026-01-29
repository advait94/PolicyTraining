export interface SlideData {
    id: string
    title: string
    content: string
    sequence_order: number
}

export interface QuestionData {
    id: string
    text: string
    answers: AnswerData[]
}

export interface AnswerData {
    id: string
    text: string
    is_correct: boolean
}

export interface UserProgressData {
    is_completed: boolean
    quiz_score: number | null
}
