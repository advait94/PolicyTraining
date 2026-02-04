'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, Image as ImageIcon, Save, Trash2, Globe, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function AdminSettingsPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [orgData, setOrgData] = useState<any>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // Load initial data
    useEffect(() => {
        async function loadOrgData() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }

                // Get user's org id
                const { data: userData } = await supabase
                    .from('users')
                    .select('organization_id, role')
                    .eq('id', user.id)
                    .single()

                if (userData?.role !== 'admin' || !userData?.organization_id) {
                    toast.error('Unauthorized access')
                    router.push('/dashboard')
                    return
                }

                // Get Org Details
                const { data: org, error } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', userData.organization_id)
                    .single()

                if (error) throw error
                setOrgData(org)
                if (org.logo_url) setPreviewUrl(org.logo_url)

            } catch (error) {
                console.error('Error loading settings:', error)
                toast.error('Failed to load organization settings')
            } finally {
                setLoading(false)
            }
        }
        loadOrgData()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Constraint Checks
        if (file.size > 2 * 1024 * 1024) { // 2MB
            toast.error('File size must be less than 2MB')
            return
        }
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            toast.error('Only PNG and JPG files are allowed')
            return
        }

        setLogoFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleSave = async () => {
        if (!logoFile || !orgData) return
        setUploading(true)

        try {
            const fileExt = logoFile.name.split('.').pop()
            const fileName = `${orgData.id}/logo.${fileExt}` // Consistent path: {org_id}/logo.ext

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('org-logos')
                .upload(fileName, logoFile, {
                    upsert: true
                })

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('org-logos')
                .getPublicUrl(fileName)

            // Force cache bust if needed, or rely on filename changes if we used unique names
            // For now, simple URL update

            // 3. Update Organization Table
            const { error: dbError } = await supabase
                .from('organizations')
                .update({ logo_url: publicUrl })
                .eq('id', orgData.id)

            if (dbError) throw dbError

            setOrgData({ ...orgData, logo_url: publicUrl })
            setLogoFile(null) // Reset pending file
            toast.success('Organization logo updated successfully')

        } catch (error: any) {
            console.error('Upload failed:', error)
            toast.error(error.message || 'Failed to update logo')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0B0F19] p-8 md:p-12 space-y-8 text-white">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/admin/dashboard')}
                    className="p-2 h-auto text-slate-400 hover:text-white hover:bg-white/10"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-4xl font-bold mb-2">Settings</h1>
                    <p className="text-slate-400">Manage your organization's profile and branding.</p>
                </div>
            </div>

            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-400" />
                        White-Label Branding
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Upload your company logo. This will be displayed on completion certificates alongside the AA Plus Consultants logo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Preview Area */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-full md:w-1/3">
                            <Label className="mb-2 block text-slate-300">Current Logo</Label>
                            <div className="border-2 border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center bg-black/20 h-48 relative overflow-hidden group">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Org Logo"
                                        fill
                                        className="object-contain p-4 transition-transform group-hover:scale-105"
                                        unoptimized // Handle storage URLs
                                    />
                                ) : (
                                    <div className="text-center text-slate-500">
                                        <Globe className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                        <span className="text-sm">No logo uploaded</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                For best results on certificates, please upload a PNG with a transparent background.
                            </p>
                        </div>

                        {/* Upload Controls */}
                        <div className="w-full md:w-2/3 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="logo-upload" className="text-slate-300">Upload New Logo</Label>
                                <div className="flex gap-4">
                                    <Input
                                        id="logo-upload"
                                        type="file"
                                        accept=".png, .jpg, .jpeg"
                                        onChange={handleFileChange}
                                        className="bg-black/20 border-white/10 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded-md hover:file:bg-purple-500 cursor-pointer"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">
                                    Max file size: 2MB. Supported formats: PNG, JPG.
                                </p>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={!logoFile || uploading}
                                    className="bg-purple-600 hover:bg-purple-500 text-white min-w-[120px]"
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                                {logoFile && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => { setLogoFile(null); setPreviewUrl(orgData?.logo_url || null); }}
                                        className="text-slate-400 hover:text-white"
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <span className="text-xl">📞</span>
                        Custom Contact Details
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        These details will slightly replace the default "AA Plus" contact info in the training modules for your employees.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="display_name" className="text-slate-300">Display Name (Organization Name)</Label>
                            <Input
                                id="display_name"
                                value={orgData?.display_name || ''}
                                onChange={(e) => setOrgData({ ...orgData, display_name: e.target.value })}
                                placeholder="e.g. Acme Corp"
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="support_email" className="text-slate-300">Support Email</Label>
                            <Input
                                id="support_email"
                                value={orgData?.support_email || ''}
                                onChange={(e) => setOrgData({ ...orgData, support_email: e.target.value })}
                                placeholder="e.g. support@acme.com"
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="helpline_number" className="text-slate-300">Helpline Number</Label>
                            <Input
                                id="helpline_number"
                                value={orgData?.helpline_number || ''}
                                onChange={(e) => setOrgData({ ...orgData, helpline_number: e.target.value })}
                                placeholder="e.g. +1-800-555-0199"
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="posh_ic_email" className="text-slate-300">POSH / ICC Email</Label>
                            <Input
                                id="posh_ic_email"
                                value={orgData?.posh_ic_email || ''}
                                onChange={(e) => setOrgData({ ...orgData, posh_ic_email: e.target.value })}
                                placeholder="e.g. poshc@acme.com"
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <Button
                            onClick={async () => {
                                setUploading(true)
                                try {
                                    const { error } = await supabase
                                        .from('organizations')
                                        .update({
                                            display_name: orgData.display_name,
                                            support_email: orgData.support_email,
                                            helpline_number: orgData.helpline_number,
                                            posh_ic_email: orgData.posh_ic_email
                                        })
                                        .eq('id', orgData.id)

                                    if (error) throw error
                                    toast.success('Contact details updated')
                                } catch (e: any) {
                                    toast.error(e.message || 'Update failed')
                                } finally {
                                    setUploading(false)
                                }
                            }}
                            disabled={uploading}
                            className="bg-purple-600 hover:bg-purple-500 text-white min-w-[120px]"
                        >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Details
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
