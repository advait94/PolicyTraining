import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PrintButton } from '@/components/feature/certificate/print-button'
import { LinkedInShareButton } from '@/components/feature/certificate/linkedin-share-button'
import QRCode from 'qrcode'

// Params need to be awaited in Next.js 15
export default async function CertificatePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ uid?: string }>
}) {
    const { id } = await params
    const { uid: targetUid } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Determine whose certificate to show
    let viewUserId = user.id
    if (targetUid && targetUid !== user.id) {
        // Admin viewing another user's certificate — verify same org
        const [{ data: adminData }, { data: targetData }] = await Promise.all([
            supabase.from('users').select('organization_id, role').eq('id', user.id).single(),
            supabase.from('users').select('organization_id').eq('id', targetUid).single(),
        ])
        const isSuperAdmin = (await supabase.rpc('is_super_admin')).data
        const sameOrg = adminData?.organization_id === targetData?.organization_id
        if ((adminData?.role === 'admin' && sameOrg) || isSuperAdmin) {
            viewUserId = targetUid
        }
    }

    // Fetch Module & User Progress
    const { data: moduleData } = await supabase
        .from('modules')
        .select('title')
        .eq('id', id)
        .single()

    const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', viewUserId)
        .eq('module_id', id)
        .single()

    const { data: userData } = await supabase
        .from('users')
        .select(`
            display_name,
            organizations (
                logo_url
            )
        `)
        .eq('id', viewUserId)
        .single()

    if (!progress?.is_completed || !moduleData) {
        return <div className="p-8 text-center text-red-500">Certificate not available. Please complete the module first.</div>
    }

    // Lazy Generate Certificate ID if missing
    let certificateId = progress.certificate_id
    if (!certificateId && progress.is_completed) {
        certificateId = crypto.randomUUID()
        // Save back to DB
        await supabase
            .from('user_progress')
            .update({ certificate_id: certificateId })
            .eq('id', progress.id)
    }

    const verifyUrl = `https://www.aaplusconsultants.com/verify.html?id=${certificateId}`
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
        color: { dark: '#1e293b', light: '#ffffff' },
    })

    // Verify data access - organizations is likely returned as an array by the query builder if not 1:1 inferred perfectly
    // or just safe access it. Based on error it is an array.
    const studentName = userData?.display_name || (viewUserId === user.id ? user.email : '') || 'Student'
    const orgData = Array.isArray(userData?.organizations) ? userData.organizations[0] : userData?.organizations
    const orgLogoUrl = orgData?.logo_url

    const completionDate = new Date(progress.completed_at || Date.now())
    const dateStr = completionDate.toLocaleDateString('en-US', {
        dateStyle: 'long'
    })

    // Calculate Validity (1 Year)
    const validTillDate = new Date(completionDate)
    validTillDate.setFullYear(validTillDate.getFullYear() + 1)
    const validTillStr = validTillDate.toLocaleDateString('en-US', {
        dateStyle: 'long'
    })

    return (
        <>
        <style>{`
            @page { size: A4 landscape; margin: 0; }
            .cert-paper { zoom: 0.70; }
            @media print { .cert-paper { zoom: 0.973 !important; } }
        `}</style>
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
            <div className="mb-6 flex gap-3 print:hidden">
                <PrintButton />
                <LinkedInShareButton
                    moduleTitle={moduleData.title}
                    issueYear={completionDate.getFullYear()}
                    issueMonth={completionDate.getMonth() + 1}
                    certId={certificateId}
                />
            </div>

            {/* Paper Container */}
            <div className="cert-paper bg-white w-[11in] h-[8.5in] shadow-2xl relative flex flex-col items-center text-center p-0 overflow-hidden print:shadow-none select-none">

                {/* Decorative Double Border Frame */}
                <div className="absolute inset-4 border-[8px] border-double border-slate-900/10 pointer-events-none z-20"></div>

                {/* Close Button (Screen Only) */}
                <div className="absolute top-6 right-6 print:hidden z-50">
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/dashboard" className="text-slate-400 hover:text-red-500 transition-colors">Close</a>
                    </Button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col items-center w-full h-full py-12 px-20 z-10 relative">

                    {/* 1. Header Section */}
                    <div className="w-full flex flex-col items-center space-y-6 flex-none">

                        {/* Logos Area */}
                        <div className="w-full flex items-center justify-center gap-12 mb-4 h-28">
                            {orgLogoUrl ? (
                                <>
                                    {/* AA Plus Logo */}
                                    <div className="h-full relative flex items-center justify-center">
                                        <img src="/aaplus_logo_colored.png" alt="AA Plus" className="max-h-full w-auto object-contain" />
                                    </div>

                                    {/* Divider */}
                                    <div className="h-12 w-px bg-slate-300"></div>

                                    {/* Org Logo */}
                                    <div className="h-full relative flex items-center justify-center">
                                        <img src={orgLogoUrl} alt="Organization Logo" className="max-h-full w-auto object-contain" />
                                    </div>
                                </>
                            ) : (
                                /* AA Plus Logo Only */
                                <div className="h-full relative flex items-center justify-center">
                                    <img src="/aaplus_logo_colored.png" alt="AA Plus Policy Training" className="max-h-full w-auto object-contain" />
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div className="text-center">
                            <h1 className="text-6xl font-serif text-slate-900 tracking-[0.15em] uppercase font-bold mb-2">
                                Certificate
                            </h1>
                            <p className="text-xl text-slate-500 uppercase tracking-[0.4em] font-light">
                                of Completion
                            </p>
                            <div className="w-24 h-1 bg-slate-900 mx-auto mt-6"></div>
                        </div>
                    </div>

                    {/* 2. Recipient Section - Grows to fill space */}
                    <div className="w-full flex flex-col items-center justify-center flex-1 space-y-4 my-4">
                        <p className="text-lg text-slate-500 italic font-serif">This is to certify that</p>

                        <h2 className="text-5xl font-bold text-slate-900 font-serif border-b-2 border-slate-300 pb-2 px-12 inline-block min-w-[500px] text-center">
                            {studentName}
                        </h2>

                        <p className="text-lg text-slate-500 italic font-serif">
                            Has successfully completed the training module
                        </p>

                        <h3 className="text-3xl font-bold text-[#003366] max-w-3xl leading-tight">
                            {moduleData.title}
                        </h3>
                    </div>

                    {/* 3. Signatures + QR Footer - 3 columns, no extra vertical height */}
                    <div className="w-full grid grid-cols-3 gap-12 items-end pt-6 flex-none mb-3">
                        {/* Authorized Signature */}
                        <div className="flex flex-col items-center">
                            <div className="h-20 w-full relative mb-2 flex items-end justify-center">
                                <img src="/papa_signature.jpg" alt="Authorized Signature" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                            </div>
                            <div className="border-t-2 border-slate-400 w-full"></div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-2">Authorized Signature</p>
                        </div>

                        {/* Date & Validity */}
                        <div className="flex flex-col items-center">
                            <div className="h-20 w-full flex flex-col items-center justify-end mb-2">
                                <p className="text-2xl font-serif text-slate-900 pb-1">{dateStr}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-widest">Valid Till: {validTillStr}</p>
                            </div>
                            <div className="border-t-2 border-slate-400 w-full"></div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-2">Date Completed</p>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center">
                            <div className="h-20 w-full flex items-end justify-center mb-2">
                                <img src={qrDataUrl} alt="Verify certificate" width={76} height={76} className="rounded" />
                            </div>
                            <div className="border-t-2 border-slate-400 w-full"></div>
                            <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-2">Scan to Verify</p>
                        </div>
                    </div>

                    {/* Certificate ID */}
                    <div className="w-full text-center flex-none mt-2">
                        <p className="text-[9px] text-slate-300 uppercase tracking-widest">
                            Certificate ID: <span className="font-mono select-text cursor-text">{certificateId}</span>
                        </p>
                        <p className="text-[9px] text-slate-300 uppercase tracking-widest">
                            AA Plus Policy Training Platform • Proficiency Assessment Verified
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
