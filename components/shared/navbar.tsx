'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, User } from 'lucide-react'

export function Navbar({ userDisplayName }: { userDisplayName?: string }) {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-xl shadow-lg shadow-purple-900/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo Area */}
                <Link href="/dashboard" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95 duration-200">
                    <div className="relative w-8 h-8 md:w-10 md:h-10">
                        <Image src="/aaplus_logo.png" alt="AA Plus Architects" fill className="object-contain invert" />
                    </div>
                    <span className="font-outfit font-bold text-xl md:text-2xl text-white tracking-tight">
                        Policy Training <span className="text-purple-400">.</span>
                    </span>
                </Link>

                {/* User Area */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {userDisplayName ? userDisplayName[0].toUpperCase() : <User className="w-3 h-3" />}
                        </div>
                        <span className="text-sm font-medium text-slate-300 max-w-[100px] truncate">
                            {userDisplayName}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full w-9 h-9 p-0 md:w-auto md:p-3 transition-colors"
                    >
                        <LogOut className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Sign Out</span>
                    </Button>
                </div>
            </div>
        </nav>
    )
}
