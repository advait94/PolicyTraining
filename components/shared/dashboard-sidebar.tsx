'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Scale, Users } from 'lucide-react'

const BASE_NAV = [
    { label: 'Training Hub', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'RPT Simulator', href: '/rpt-simulator', icon: Scale, exact: false },
]

const MANAGER_NAV = [
    { label: 'Training Hub', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Team Overview', href: '/manager/dashboard', icon: Users, exact: false },
    { label: 'RPT Simulator', href: '/rpt-simulator', icon: Scale, exact: false },
]

export function DashboardSidebar({ role }: { role?: string }) {
    const pathname = usePathname()
    const navItems = role === 'manager' ? MANAGER_NAV : BASE_NAV

    return (
        <aside
            className="fixed left-0 top-0 h-screen z-40 flex flex-col"
            style={{
                width: 220,
                background: 'rgba(11, 15, 25, 0.85)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5" style={{ height: 64, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="relative w-7 h-7 flex-shrink-0">
                    <Image src="/aaplus_logo.png" alt="AA Plus" fill className="object-contain invert" />
                </div>
                <span className="font-bold text-white text-[15px] tracking-tight leading-tight">
                    Policy<span className="text-purple-400">.</span>
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <div className="text-[10px] uppercase tracking-widest font-semibold px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Menu
                </div>
                {navItems.map(({ label, href, icon: Icon, exact }) => {
                    const active = exact ? pathname === href : pathname.startsWith(href)
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all"
                            style={{
                                padding: '10px 12px',
                                background: active
                                    ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.1))'
                                    : 'transparent',
                                border: active
                                    ? '1px solid rgba(168,85,247,0.3)'
                                    : '1px solid transparent',
                                color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                            }}
                        >
                            <Icon
                                size={16}
                                style={{ color: active ? '#22D3EE' : 'rgba(255,255,255,0.35)', flexShrink: 0 }}
                            />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>AA Plus Consultants</div>
            </div>
        </aside>
    )
}
