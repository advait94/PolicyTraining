'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton() {
    return (
        <Button onClick={() => window.print()} className="gap-2 shadow-lg hover:shadow-xl transition-all">
            <Printer className="w-4 h-4" /> Print Certificate
        </Button>
    )
}
