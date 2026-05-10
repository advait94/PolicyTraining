import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { RptSimulatorClient } from '@/components/feature/rpt-simulator/rpt-simulator-client'

export default async function RptSimulatorPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0B0F19',
            backgroundImage: `
                radial-gradient(at 0% 0%, rgba(168,85,247,0.15) 0, transparent 50%),
                radial-gradient(at 100% 0%, rgba(34,211,238,0.15) 0, transparent 50%),
                radial-gradient(at 50% 100%, rgba(168,85,247,0.08) 0, transparent 50%)
            `,
            backgroundAttachment: 'fixed',
        }}>
            {/* Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px',
                height: 64,
                background: 'rgba(21,26,41,0.85)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
                <Image
                    src="/aaplus_logo.png"
                    alt="Logo"
                    width={120}
                    height={40}
                    className="h-[40px] w-auto object-contain"
                    style={{ filter: 'invert(80%) sepia(40%) saturate(600%) hue-rotate(5deg) brightness(110%)' }}
                />
                <div className="text-center">
                    <div className="font-semibold text-white text-sm">RPT Simulator</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Related Party Transaction Decision Trainer
                    </div>
                </div>
                <Link
                    href="/dashboard"
                    className="text-sm font-medium transition-opacity hover:opacity-70"
                    style={{ color: '#22D3EE' }}
                >
                    ← Dashboard
                </Link>
            </div>

            <RptSimulatorClient />
        </div>
    )
}
