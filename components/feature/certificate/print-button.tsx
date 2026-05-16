'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all print:hidden"
            style={{ background: '#1e293b' }}
        >
            <Printer className="w-4 h-4" /> Print Certificate
        </button>
    )
}
