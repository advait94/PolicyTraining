'use client'

import { useState } from 'react'
import { BookOpen, Lock, LockOpen } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { setModuleAssignment, toggleModuleLock } from '@/app/actions/admin'

interface Module {
    id: string
    title: string
    description: string | null
    sequence_order: number
    isAssigned: boolean
    isLocked: boolean
}

export default function ModuleAccessPanel({ modules, orgId }: { modules: Module[]; orgId: string }) {
    const [moduleList, setModuleList] = useState(modules)
    const [toggling, setToggling] = useState<string | null>(null)
    const [locking, setLocking] = useState<string | null>(null)

    async function handleToggle(moduleId: string, assign: boolean) {
        setToggling(moduleId)
        setModuleList(prev => prev.map(m => m.id === moduleId ? { ...m, isAssigned: assign } : m))

        const result = await setModuleAssignment(moduleId, assign, orgId)
        if (!result.success) {
            setModuleList(prev => prev.map(m => m.id === moduleId ? { ...m, isAssigned: !assign } : m))
        }
        setToggling(null)
    }

    async function handleLockToggle(moduleId: string, lock: boolean) {
        setLocking(moduleId)
        setModuleList(prev => prev.map(m => m.id === moduleId ? { ...m, isLocked: lock } : m))

        const result = await toggleModuleLock(moduleId, lock, orgId)
        if (!result.success) {
            setModuleList(prev => prev.map(m => m.id === moduleId ? { ...m, isLocked: !lock } : m))
        }
        setLocking(null)
    }

    const enabledCount = moduleList.filter(m => m.isAssigned).length
    const lockedCount = moduleList.filter(m => m.isLocked).length

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Module Access</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Control which training modules this organization can access. Lock a module to prevent the org admin from changing it.</p>
                </div>
                <div className="text-right text-sm text-slate-400 space-y-0.5">
                    <div><span className="text-white font-semibold">{enabledCount}</span> / {moduleList.length} enabled</div>
                    {lockedCount > 0 && (
                        <div className="text-amber-400 text-xs"><Lock className="w-3 h-3 inline mr-1" />{lockedCount} locked</div>
                    )}
                </div>
            </div>

            <div className="divide-y divide-white/5">
                {moduleList.map((module) => (
                    <div
                        key={module.id}
                        className={`flex items-center gap-4 px-6 py-4 transition-colors ${module.isLocked ? 'bg-amber-500/5' : module.isAssigned ? 'bg-purple-500/5' : ''}`}
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${module.isAssigned ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-600'}`}>
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm transition-colors ${module.isAssigned ? 'text-white' : 'text-slate-400'}`}>
                                {module.title}
                            </div>
                            {module.description && (
                                <div className="text-xs text-slate-500 mt-0.5 truncate">{module.description}</div>
                            )}
                            {module.isLocked && (
                                <div className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Locked — org admin cannot change this
                                </div>
                            )}
                        </div>

                        {/* Lock / Unlock button */}
                        <button
                            onClick={() => handleLockToggle(module.id, !module.isLocked)}
                            disabled={locking === module.id}
                            title={module.isLocked ? 'Unlock — allow org admin to change' : 'Lock — prevent org admin from changing'}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                                module.isLocked
                                    ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                                    : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            {module.isLocked ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                        </button>

                        <Switch
                            checked={module.isAssigned}
                            disabled={toggling === module.id}
                            onCheckedChange={(checked) => handleToggle(module.id, checked)}
                        />
                    </div>
                ))}

                {moduleList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                        <BookOpen className="w-8 h-8" />
                        <span className="text-sm">No modules found.</span>
                    </div>
                )}
            </div>
        </div>
    )
}
