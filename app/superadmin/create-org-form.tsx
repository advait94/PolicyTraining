'use client'

import { useActionState } from 'react'
import { createOrganization } from './actions'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'

const initialState = {
    message: '',
    error: '',
    success: false
}

export function CreateOrganizationForm() {
    const [state, formAction, isPending] = useActionState(createOrganization, initialState)

    useEffect(() => {
        if (state.success && state.message) {
            toast.success(state.message)
        } else if (state.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <form action={formAction} className="space-y-5">
            <div className="space-y-2">
                <label htmlFor="name" className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Organization Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Admin Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="admin@acme.com"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center w-full px-4 py-3 mt-4 text-sm font-bold text-white uppercase tracking-wider bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 shadow-lg shadow-purple-900/20 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                    </>
                ) : (
                    'Create Organization'
                )}
            </button>

            {state.success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                    {state.message}
                </div>
            )}
        </form>
    )
}
