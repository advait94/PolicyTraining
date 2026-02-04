import { CreateOrganizationForm } from './create-org-form'
import { createClient } from '@/lib/supabase/server'

export default async function SuperAdminPage() {
    const supabase = await createClient()

    // Fetch all organizations for display
    const { data: orgs } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
                <p className="text-slate-400">Global overview of all organizations.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Create Org Card */}
                <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                            <span className="text-xl">🏢</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white">Onboard New Client</h3>
                    </div>
                    <CreateOrganizationForm />
                </div>

                {/* Stats / List Card */}
                <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                            <span className="text-xl">📋</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white">Existing Organizations ({orgs?.length || 0})</h3>
                    </div>

                    <div className="divide-y divide-white/10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {orgs?.map((org) => (
                            <div key={org.id} className="py-4 flex justify-between items-center text-sm group hover:bg-white/5 px-2 rounded-lg transition-colors relative">
                                <div>
                                    <a href={`/superadmin/organizations/${org.id}`} className="absolute inset-0 z-10" aria-label={`View ${org.name}`}></a>
                                    <div className="font-medium text-white group-hover:text-purple-300 transition-colors">{org.name}</div>
                                    <div className="text-slate-500 text-xs font-mono mt-1">{org.id}</div>
                                </div>
                                <span className="px-2 py-1 bg-white/10 border border-white/5 rounded text-xs text-slate-300 font-mono">
                                    {org.slug}
                                </span>
                            </div>
                        ))}
                        {(!orgs || orgs.length === 0) && (
                            <div className="py-8 text-center text-slate-500">
                                No organizations found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
