'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Download, Save, RefreshCw, Shield } from 'lucide-react'
import { PlanGate } from '@/components/feature/plan/plan-gate'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface PolicyDetails {
    companyName: string
    effectiveDate: string
    registeredAddress: string
    presidingOfficer: string
    member1: string
    member2: string
    externalMember: string
    iccEmail: string
    supportEmail: string
    helpline: string
}

const DEFAULT_DETAILS: PolicyDetails = {
    companyName: '',
    effectiveDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    registeredAddress: '',
    presidingOfficer: '',
    member1: '',
    member2: '',
    externalMember: '',
    iccEmail: '',
    supportEmail: '',
    helpline: '',
}

export default function PoshPolicyPage() {
    const router = useRouter()
    const supabase = createClient()
    const policyRef = useRef<HTMLDivElement>(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [orgId, setOrgId] = useState<string | null>(null)
    const [details, setDetails] = useState<PolicyDetails>(DEFAULT_DETAILS)

    const set = (field: keyof PolicyDetails, value: string) =>
        setDetails(prev => ({ ...prev, [field]: value }))

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const { data: userData } = await supabase
                .from('users')
                .select('role, organization_id')
                .eq('id', user.id)
                .single()

            if (userData?.role !== 'admin') { router.push('/dashboard'); return }

            const { data: org } = await supabase
                .from('organizations')
                .select('id, display_name, posh_ic_email, support_email, helpline_number, posh_details')
                .eq('id', userData.organization_id)
                .single()

            if (org) {
                setOrgId(org.id)
                const saved = org.posh_details || {}
                setDetails({
                    companyName: saved.companyName || org.display_name || '',
                    effectiveDate: saved.effectiveDate || DEFAULT_DETAILS.effectiveDate,
                    registeredAddress: saved.registeredAddress || '',
                    presidingOfficer: saved.presidingOfficer || '',
                    member1: saved.member1 || '',
                    member2: saved.member2 || '',
                    externalMember: saved.externalMember || '',
                    iccEmail: saved.iccEmail || org.posh_ic_email || '',
                    supportEmail: saved.supportEmail || org.support_email || '',
                    helpline: saved.helpline || org.helpline_number || '',
                })
            }
            setLoading(false)
        }
        load()
    }, [])

    const handleSave = async () => {
        if (!orgId) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from('organizations')
                .update({ posh_details: details })
                .eq('id', orgId)
            if (error) throw error
            toast.success('POSH details saved')
        } catch (e: any) {
            toast.error(e.message || 'Save failed')
        } finally {
            setSaving(false)
        }
    }

    const handleDownloadPDF = () => {
        const content = policyRef.current?.innerHTML
        if (!content) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) { toast.error('Allow pop-ups to download the PDF'); return }

        printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>POSH Policy – ${details.companyName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.7;
    color: #000;
    margin: 2.5cm 3cm;
  }
  h1 { font-size: 16pt; text-align: center; text-transform: uppercase; margin-bottom: 6pt; }
  h2 { font-size: 13pt; margin-top: 20pt; margin-bottom: 4pt; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 2pt; }
  h3 { font-size: 12pt; margin-top: 12pt; margin-bottom: 4pt; }
  p { margin-bottom: 8pt; }
  ul, ol { margin-left: 20pt; margin-bottom: 8pt; }
  li { margin-bottom: 4pt; }
  .center { text-align: center; }
  .meta { font-size: 11pt; color: #333; text-align: center; margin-bottom: 20pt; }
  .divider { border: none; border-top: 2px solid #000; margin: 16pt 0; }
  .field { color: ${details.companyName ? '#000' : '#cc0000'}; }
  @media print {
    body { margin: 2cm 2.5cm; }
    h2 { page-break-after: avoid; }
  }
</style>
</head>
<body>
${content}
</body>
</html>`)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => { printWindow.print() }, 400)
    }

    const f = (val: string, fallback = '[NOT SET]') => val.trim() || fallback

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        )
    }

    return (
        <PlanGate required="professional">
        <div className="min-h-screen bg-[#0B0F19] p-8 md:p-12 text-white">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => router.push('/admin/dashboard')} className="p-2 h-auto text-slate-400 hover:text-white hover:bg-white/10">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-6 h-6 text-purple-400" />
                        <h1 className="text-3xl font-bold text-white">POSH Policy Generator</h1>
                    </div>
                    <p className="text-slate-400">Fill in your organization's details to generate a compliant POSH policy under the Sexual Harassment of Women at Workplace Act, 2013.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleSave} disabled={saving} variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Details
                    </Button>
                    <Button onClick={handleDownloadPDF} className="bg-purple-600 hover:bg-purple-500 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8">
                {/* LEFT: Configuration Form */}
                <div className="space-y-6">
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white text-base">Organization Details</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">Auto-filled from your settings. Edit as needed.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-xs">Company / Display Name <span className="text-red-400">*</span></Label>
                                <Input value={details.companyName} onChange={e => set('companyName', e.target.value)} placeholder="e.g. Acme Corp Pvt. Ltd." className="bg-black/20 border-white/10 text-white h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-xs">Policy Effective Date</Label>
                                <Input value={details.effectiveDate} onChange={e => set('effectiveDate', e.target.value)} placeholder="e.g. 1st January 2025" className="bg-black/20 border-white/10 text-white h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-xs">Registered Office Address</Label>
                                <Input value={details.registeredAddress} onChange={e => set('registeredAddress', e.target.value)} placeholder="e.g. 123, MG Road, Bangalore – 560001" className="bg-black/20 border-white/10 text-white h-9 text-sm" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white text-base">Internal Complaints Committee (ICC)</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">Names of ICC members who will handle complaints.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-xs">Presiding Officer (Senior Woman Employee)</Label>
                                <Input value={details.presidingOfficer} onChange={e => set('presidingOfficer', e.target.value)} placeholder="Full name & designation" className="bg-black/20 border-white/10 text-white h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-xs">ICC Member 1</Label>
                                <Input value={details.member1} onChange={e => set('member1', e.target.value)} placeholder="Full name & designation" className="bg-black/20 border-white/10 text-white h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-xs">ICC Member 2</Label>
                                <Input value={details.member2} onChange={e => set('member2', e.target.value)} placeholder="Full name & designation" className="bg-black/20 border-white/10 text-white h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-xs">External Member (NGO / Legal Expert)</Label>
                                <Input value={details.externalMember} onChange={e => set('externalMember', e.target.value)} placeholder="Name, Organization" className="bg-black/20 border-white/10 text-white h-9 text-sm" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white text-base">Contact Details</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">Auto-filled from Settings. Used in the Contact section of the policy.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-xs">ICC / POSH Email <span className="text-red-400">*</span></Label>
                                <Input value={details.iccEmail} onChange={e => set('iccEmail', e.target.value)} placeholder="posh@company.com" className="bg-black/20 border-white/10 text-white h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-xs">Support Email</Label>
                                <Input value={details.supportEmail} onChange={e => set('supportEmail', e.target.value)} placeholder="hr@company.com" className="bg-black/20 border-white/10 text-white h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-300 text-xs">Helpline Number</Label>
                                <Input value={details.helpline} onChange={e => set('helpline', e.target.value)} placeholder="+91-XXXXX-XXXXX" className="bg-black/20 border-white/10 text-white h-9 text-sm" />
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-xs text-slate-500 text-center">Fields left blank will appear in red in the generated policy as placeholders to fill manually.</p>
                </div>

                {/* RIGHT: Policy Preview */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-slate-300 font-medium">Policy Preview</h2>
                        <Button onClick={handleDownloadPDF} className="bg-purple-600 hover:bg-purple-500 text-white" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download as PDF
                        </Button>
                    </div>

                    {/* Document Preview */}
                    <div className="rounded-xl border border-white/10 bg-white overflow-y-auto max-h-[calc(100vh-180px)]">
                        <div ref={policyRef} className="text-black font-serif text-sm leading-relaxed p-12 space-y-0" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                            {/* Title */}
                            <div className="text-center mb-8">
                                <h1 className="text-xl font-bold uppercase tracking-wide mb-2">Prevention of Sexual Harassment (POSH)</h1>
                                <h1 className="text-xl font-bold uppercase tracking-wide mb-4">at Workplace Policy</h1>
                                <hr className="border-black border-2 mb-4" />
                                <p className="text-base font-semibold">{f(details.companyName, 'YOUR COMPANY NAME')}</p>
                                {details.registeredAddress && <p className="text-sm text-gray-600">{details.registeredAddress}</p>}
                                <p className="text-sm mt-2"><strong>Effective Date:</strong> {f(details.effectiveDate)}</p>
                            </div>

                            <hr className="border-gray-300 my-6" />

                            {/* 1. Preamble */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">1. Preamble</h2>
                                <p>{f(details.companyName)} ("<strong>the Company</strong>") is committed to providing a safe, respectful, and dignified working environment for all its employees. The Company believes that every employee has the right to work in an environment free from sexual harassment.</p>
                                <p className="mt-2">In compliance with the <em>Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013</em> (the "<strong>POSH Act</strong>") and the rules framed thereunder, the Company has formulated this Policy for Prevention, Prohibition and Redressal of Sexual Harassment at Workplace (the "<strong>Policy</strong>").</p>
                            </section>

                            {/* 2. Objective */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">2. Objective</h2>
                                <p>The objective of this Policy is to:</p>
                                <ol className="list-[lower-alpha] ml-6 mt-2 space-y-1">
                                    <li>Prohibit, prevent and address sexual harassment of women at the workplace;</li>
                                    <li>Provide a safe and secure work environment for all employees;</li>
                                    <li>Provide a robust and time-bound mechanism for redressal of complaints; and</li>
                                    <li>Create awareness and foster a culture of respect and dignity at the workplace.</li>
                                </ol>
                            </section>

                            {/* 3. Scope */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">3. Scope and Application</h2>
                                <p>This Policy applies to:</p>
                                <ol className="list-[lower-alpha] ml-6 mt-2 space-y-1">
                                    <li>All employees of {f(details.companyName)} — permanent, contractual, temporary, trainees, interns, and apprentices;</li>
                                    <li>Persons visiting the Company's workplace in the course of business;</li>
                                    <li>All work-related interactions, whether at the workplace, client sites, official tours, conferences, or off-site events; and</li>
                                    <li>Digital communications (email, messaging platforms, video calls) made in the course of employment.</li>
                                </ol>
                            </section>

                            {/* 4. Definitions */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">4. Definitions</h2>
                                <p>For the purpose of this Policy:</p>
                                <div className="space-y-2 mt-2">
                                    <p><strong>(a) "Aggrieved Woman"</strong> means any woman employee — whether employed directly or through an agent, for remuneration or on a voluntary basis — including a co-worker, contract worker, probationer, trainee, apprentice, or intern.</p>
                                    <p><strong>(b) "Employee"</strong> means any person employed at the workplace on a regular, temporary, ad hoc, or daily wage basis, directly or through an agent, with or without the knowledge of the principal employer, whether for remuneration or not.</p>
                                    <p><strong>(c) "Internal Complaints Committee (ICC)"</strong> means the committee constituted by the Company pursuant to Section 4 of the POSH Act to receive and redress complaints of sexual harassment.</p>
                                    <p><strong>(d) "Presiding Officer"</strong> means the senior woman employee of the Company designated to preside over the ICC.</p>
                                    <p><strong>(e) "Respondent"</strong> means the person against whom the aggrieved woman has made a complaint of sexual harassment.</p>
                                    <p><strong>(f) "Sexual Harassment"</strong> includes any one or more of the following unwelcome acts or behaviors (whether directly or by implication): (i) physical contact and advances; (ii) a demand or request for sexual favors; (iii) making sexually colored remarks; (iv) showing pornography; (v) any other unwelcome physical, verbal, or non-verbal conduct of a sexual nature.</p>
                                    <p><strong>(g) "Workplace"</strong> includes any place visited by the employee arising out of or during the course of employment, including transportation provided by the employer for the purpose of commuting.</p>
                                </div>
                            </section>

                            {/* 5. Prohibited Conduct */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">5. Prohibited Conduct — What Constitutes Sexual Harassment</h2>
                                <p>The following conduct, whether in person or through electronic means, may constitute sexual harassment and is strictly prohibited:</p>
                                <ol className="list-[lower-alpha] ml-6 mt-2 space-y-1">
                                    <li>Unwelcome sexual advances (verbal, non-verbal, or physical);</li>
                                    <li>Requests or demands for sexual favors, implicitly or explicitly;</li>
                                    <li>Sexually colored remarks, jokes, slurs, or offensive comments;</li>
                                    <li>Display, sharing, or sending of sexually explicit or suggestive material, including images, videos, or messages;</li>
                                    <li>Unwelcome physical contact, including touching, patting, pinching, or brushing;</li>
                                    <li>Intimidation, threats, or stalking of a sexual nature;</li>
                                    <li>Unwelcome sexual gestures, looks, or actions;</li>
                                    <li>Creating a hostile, intimidating, or offensive work environment due to gender-based or sexual conduct;</li>
                                    <li>Implied or explicit promise of preferential treatment in exchange for sexual favors; and</li>
                                    <li>Any conduct that violates a person's dignity or creates an intimidating or offensive environment.</li>
                                </ol>
                            </section>

                            {/* 6. ICC */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">6. Internal Complaints Committee (ICC)</h2>
                                <h3 className="font-bold mt-3 mb-2">6.1 Constitution</h3>
                                <p>The Company has constituted an Internal Complaints Committee with the following members:</p>
                                <div className="mt-3 border border-gray-300 rounded">
                                    <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f0f0f0' }}>
                                                <th className="border border-gray-300 px-3 py-2 text-left">Role</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left">Name &amp; Designation</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2">Presiding Officer</td>
                                                <td className="border border-gray-300 px-3 py-2">{f(details.presidingOfficer, '[PRESIDING OFFICER NAME & DESIGNATION]')}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2">ICC Member</td>
                                                <td className="border border-gray-300 px-3 py-2">{f(details.member1, '[ICC MEMBER 1 NAME & DESIGNATION]')}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2">ICC Member</td>
                                                <td className="border border-gray-300 px-3 py-2">{f(details.member2, '[ICC MEMBER 2 NAME & DESIGNATION]')}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2">External Member</td>
                                                <td className="border border-gray-300 px-3 py-2">{f(details.externalMember, '[EXTERNAL MEMBER – NGO / LEGAL EXPERT]')}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="mt-2 text-sm">The term of each member of the ICC shall be three (3) years from the date of appointment.</p>
                                <h3 className="font-bold mt-4 mb-2">6.2 Functions of the ICC</h3>
                                <ol className="list-[lower-alpha] ml-6 space-y-1">
                                    <li>Receive written complaints of sexual harassment from aggrieved women;</li>
                                    <li>Conduct inquiries in a time-bound, fair, and confidential manner;</li>
                                    <li>Submit an annual report to the Employer and the District Officer; and</li>
                                    <li>Recommend appropriate remedial action to the Employer.</li>
                                </ol>
                            </section>

                            {/* 7. Complaint Procedure */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">7. Complaint Procedure</h2>
                                <h3 className="font-bold mt-3 mb-2">7.1 How to File a Complaint</h3>
                                <ol className="list-[lower-alpha] ml-6 space-y-1">
                                    <li>An aggrieved woman must submit a written complaint to the ICC within <strong>3 months</strong> from the date of the incident (or the last incident in a series). The ICC may extend this period for reasons to be recorded in writing.</li>
                                    <li>Where the aggrieved woman is unable to write the complaint, the Presiding Officer shall render reasonable assistance to enable her to do so.</li>
                                    <li>If the aggrieved woman is unable to make the complaint due to physical incapacity, mental incapacity, or death, her legal heir or a person duly authorized by her may file the complaint on her behalf.</li>
                                    <li>Complaints may be submitted to the ICC at: <strong>{f(details.iccEmail, '[ICC EMAIL]')}</strong></li>
                                </ol>
                                <h3 className="font-bold mt-4 mb-2">7.2 Conciliation</h3>
                                <p>Before initiating a formal inquiry, the ICC may, at the written request of the aggrieved woman, take steps to settle the matter through conciliation. No monetary settlement shall be made the basis of conciliation.</p>
                            </section>

                            {/* 8. Inquiry */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">8. Inquiry Procedure</h2>
                                <ol className="list-[lower-alpha] ml-6 space-y-2">
                                    <li>The ICC shall provide a copy of the complaint to the Respondent within <strong>7 working days</strong> of receipt.</li>
                                    <li>The Respondent shall submit a written reply within <strong>10 working days</strong> of receiving the complaint.</li>
                                    <li>Both parties shall be given an equal opportunity to present their case, examine witnesses, and produce documentary evidence.</li>
                                    <li>The inquiry shall be completed within <strong>60 days</strong> from the date of receipt of the complaint.</li>
                                    <li>A party may be accompanied by a colleague or union representative, but shall not be represented by a legal practitioner during proceedings before the ICC.</li>
                                    <li>The identity of the aggrieved woman, Respondent, witnesses, and details of the complaint shall be kept strictly confidential throughout the inquiry.</li>
                                </ol>
                            </section>

                            {/* 9. Remedies */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">9. Remedies and Penalties</h2>
                                <h3 className="font-bold mt-3 mb-2">9.1 Where the allegation is proved, the ICC may recommend to the Employer:</h3>
                                <ol className="list-[lower-alpha] ml-6 space-y-1">
                                    <li>Written warning to the Respondent;</li>
                                    <li>Withholding of promotion, pay increment, or performance bonus;</li>
                                    <li>Transfer of the Respondent to another department or location;</li>
                                    <li>Suspension without pay for a specified period; or</li>
                                    <li>Termination of employment, in cases of grave misconduct.</li>
                                </ol>
                                <h3 className="font-bold mt-4 mb-2">9.2</h3>
                                <p>The Employer shall act on the recommendations of the ICC within <strong>60 days</strong> of receipt of the inquiry report.</p>
                                <h3 className="font-bold mt-4 mb-2">9.3 False Complaints</h3>
                                <p>If the ICC concludes that a complaint was made with malicious intent or is demonstrably false, it may recommend disciplinary action against the complainant. However, no disciplinary action shall be taken merely because the complainant could not prove the allegation.</p>
                            </section>

                            {/* 10. Protection */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">10. Protection Against Retaliation</h2>
                                <ol className="list-[lower-alpha] ml-6 space-y-1">
                                    <li>The Company shall not permit any retaliation, adverse employment action, or victimization against the complainant or any witness for having reported a complaint, participated in an inquiry, or assisted in any proceeding under this Policy.</li>
                                    <li>Any act of retaliation shall itself be treated as a violation of this Policy and shall attract disciplinary action.</li>
                                </ol>
                            </section>

                            {/* 11. Confidentiality */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">11. Confidentiality</h2>
                                <ol className="list-[lower-alpha] ml-6 space-y-1">
                                    <li>All proceedings, identities of parties, and the outcome of the inquiry shall be kept strictly confidential.</li>
                                    <li>No information relating to the complaint or the inquiry shall be published, communicated to the media, or disclosed to any third party without the prior written approval of the Employer.</li>
                                    <li>Breach of confidentiality shall be treated as misconduct and may attract disciplinary action.</li>
                                </ol>
                            </section>

                            {/* 12. Employer obligations */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">12. Employer's Obligations</h2>
                                <p>In compliance with the POSH Act, {f(details.companyName)} shall:</p>
                                <ol className="list-[lower-alpha] ml-6 mt-2 space-y-1">
                                    <li>Provide a safe working environment free from sexual harassment;</li>
                                    <li>Display the penal consequences of sexual harassment and the order constituting the ICC prominently at the workplace;</li>
                                    <li>Organise regular workshops, awareness programs, and sensitization sessions for employees;</li>
                                    <li>Treat sexual harassment as misconduct under the Company's service rules and disciplinary framework; and</li>
                                    <li>Submit an annual report to the District Officer as required under the POSH Act.</li>
                                </ol>
                            </section>

                            {/* 13. Annual Report */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">13. Annual Report</h2>
                                <p>The ICC shall prepare an Annual Report containing:</p>
                                <ol className="list-[lower-alpha] ml-6 mt-2 space-y-1">
                                    <li>The number of complaints of sexual harassment received during the year;</li>
                                    <li>The number of complaints disposed of;</li>
                                    <li>The number of cases pending for more than 90 days;</li>
                                    <li>The number of awareness programs and workshops conducted; and</li>
                                    <li>The nature of action taken by the Employer on the ICC's recommendations.</li>
                                </ol>
                            </section>

                            {/* 14. Contact */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">14. Contact Information</h2>
                                <p>For complaints, queries, or concerns related to this Policy, please contact:</p>
                                <div className="mt-3 ml-4 space-y-1">
                                    <p><strong>ICC Email:</strong> {f(details.iccEmail, '[ICC EMAIL]')}</p>
                                    {details.supportEmail && <p><strong>HR / Support Email:</strong> {details.supportEmail}</p>}
                                    {details.helpline && <p><strong>Helpline Number:</strong> {details.helpline}</p>}
                                </div>
                            </section>

                            {/* 15. Review */}
                            <section className="mb-6">
                                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-3">15. Policy Review and Amendment</h2>
                                <p>This Policy shall be reviewed periodically, and amendments will be made in compliance with changes in applicable law or as deemed necessary by the Company's management. Employees will be informed of any material changes.</p>
                            </section>

                            {/* Footer */}
                            <hr className="border-black border-2 my-6" />
                            <div className="space-y-2">
                                <p>This Policy is effective from <strong>{f(details.effectiveDate)}</strong>.</p>
                                <p className="mt-6 font-bold">For {f(details.companyName)}</p>
                                <p className="mt-8">_______________________________</p>
                                <p>Authorized Signatory</p>
                                <p className="text-gray-600 text-xs mt-4">Generated by Policy Training Platform | {new Date().toLocaleDateString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </PlanGate>
    )
}
