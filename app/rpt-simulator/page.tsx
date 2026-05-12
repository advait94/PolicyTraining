import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { RptSimulatorClient } from '@/components/feature/rpt-simulator/rpt-simulator-client'
import { Lock } from 'lucide-react'

export default async function RptSimulatorPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Check if the user's department has RPT Simulator access.
    // Users with no department get access by default.
    const { data: userData } = await supabase
        .from('users')
        .select('department_id, departments(rpt_simulator_enabled)')
        .eq('id', user.id)
        .single()

    const deptRaw = userData?.departments as unknown
    const dept = Array.isArray(deptRaw) ? deptRaw[0] : deptRaw as { rpt_simulator_enabled: boolean } | null
    const isLocked = dept !== null && dept !== undefined && dept.rpt_simulator_enabled === false

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

            {isLocked ? (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
                    <div className="flex flex-col items-center gap-6 max-w-md text-center">
                        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Lock className="w-9 h-9 text-amber-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">Access Restricted</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                The RPT Simulator is not available for your department. Please contact your administrator if you believe this is an error.
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            ) : (
                <RptSimulatorClient />
            )}
        </div>
    )
}
