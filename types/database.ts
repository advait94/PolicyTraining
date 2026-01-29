export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            tenants: {
                Row: {
                    id: string
                    name: string
                    code: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string
                    created_at?: string
                }
            }
            users: {
                Row: {
                    id: string
                    tenant_id: string
                    display_name: string | null
                    role: 'admin' | 'learner'
                    created_at: string
                }
                Insert: {
                    id: string
                    tenant_id: string
                    display_name?: string | null
                    role?: 'admin' | 'learner'
                    created_at?: string
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    display_name?: string | null
                    role?: 'admin' | 'learner'
                    created_at?: string
                }
            }
            modules: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    sequence_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    sequence_order: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    sequence_order?: number
                    created_at?: string
                }
            }
            slides: {
                Row: {
                    id: string
                    module_id: string
                    title: string
                    content: string
                    sequence_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    module_id: string
                    title: string
                    content: string
                    sequence_order: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    module_id?: string
                    title?: string
                    content?: string
                    sequence_order?: number
                    created_at?: string
                }
            }
            questions: {
                Row: {
                    id: string
                    module_id: string
                    text: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    module_id: string
                    text: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    module_id?: string
                    text?: string
                    created_at?: string
                }
            }
            answers: {
                Row: {
                    id: string
                    question_id: string
                    text: string
                    is_correct: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    question_id: string
                    text: string
                    is_correct?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    question_id?: string
                    text?: string
                    is_correct?: boolean
                    created_at?: string
                }
            }
            user_progress: {
                Row: {
                    id: string
                    user_id: string
                    module_id: string
                    is_completed: boolean
                    quiz_score: number | null
                    certificate_id: string | null
                    completed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    module_id: string
                    is_completed?: boolean
                    quiz_score?: number | null
                    certificate_id?: string | null
                    completed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    module_id?: string
                    is_completed?: boolean
                    quiz_score?: number | null
                    certificate_id?: string | null
                    completed_at?: string | null
                }
            }
        }
    }
}
