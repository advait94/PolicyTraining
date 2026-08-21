'use client'

import { useEffect, useRef, useState } from 'react'
import { inviteUser, getAdminBootstrap, getCompanyUsers, bulkInviteUsers, setModuleAssignment, setModuleAllEmployees, getDepartmentsWithAccess, createDepartment, deleteDepartment, updateUserDepartment, setDeptModuleAssignment, bulkAssignDepartment, bulkAssignSelectedUsers, setModuleDeadline, updateUserRole, getReportChartData, revokeUserAccess, setDeptRptAccess as setDeptRptAccessAction, setDeptPoshSimulatorAccess as setDeptPoshSimAction, setDeptBreachSimulatorAccess as setDeptBreachSimAction, setDeptBoardCheckerAccess as setDeptBoardCheckerAction, getAdminModuleQuestions, updateQuestionSlideGroup } from '@/app/actions/admin'
import { PlanGate } from '@/components/feature/plan/plan-gate'
import { type PlanTier, tierAtLeast, isPlanExpired } from '@/lib/plan-utils'
import { MAX_ADMINS_PER_ORG } from '@/lib/org-limits'
import { WelcomeGuideModal } from '@/components/feature/onboarding/welcome-guide-modal'
import { getAuditLog, getBulkCertificates, exportAuditLog } from '@/app/actions/audit'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// recharts is heavy and only renders below the fold on the Reports tab, so both
// chart surfaces are code-split. xlsx is loaded on demand inside its handlers.
const ModuleCompletionChart = dynamic(
    () => import('@/components/feature/reports/module-completion-chart').then(m => m.ModuleCompletionChart),
    { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center"><Loader2 className="animate-spin" /></div> }
)
const ComplianceCharts = dynamic(
    () => import('@/components/feature/reports/compliance-charts').then(m => m.ComplianceCharts),
    { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center"><Loader2 className="animate-spin" /></div> }
)
import { Loader2, UserPlus, FileBarChart, Users, AlertTriangle, GraduationCap, Download, Search, CheckCircle, Clock, LogOut, BookOpen, ChevronDown, ChevronRight, Plus, Trash2, Building2, Calendar, UsersRound, Trophy, Medal, ShieldCheck, Webhook, Activity, UserMinus, Lock, Sparkles, HelpCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { DeadlinePicker } from '@/components/ui/deadline-picker'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
    const router = useRouter()
    const supabase = createClient()

    // Stats State
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [stats, setStats] = useState<any>(null)
    const [users, setUsers] = useState<any[]>([])
    const [loadingStats, setLoadingStats] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [orgs, setOrgs] = useState<{ id: string, name: string }[]>([])

    // Module assignment state
    const [orgModules, setOrgModules] = useState<any[]>([])
    const [departments, setDepartments] = useState<{ id: string, name: string }[]>([])
    const [togglingModule, setTogglingModule] = useState<string | null>(null)
    const [togglingDeptModule, setTogglingDeptModule] = useState<string | null>(null)
    const [togglingAllEmployees, setTogglingAllEmployees] = useState<string | null>(null)
    const [expandedModule, setExpandedModule] = useState<string | null>(null)

    // Department management state
    const [newDeptName, setNewDeptName] = useState('')
    const [creatingDept, setCreatingDept] = useState(false)
    const [deletingDept, setDeletingDept] = useState<string | null>(null)
    const [updatingUserDept, setUpdatingUserDept] = useState<string | null>(null)

    // RPT Simulator access per department
    const [deptRptAccess, setDeptRptAccess] = useState<{ id: string; name: string; rpt_simulator_enabled: boolean }[]>([])
    const [togglingDeptRpt, setTogglingDeptRpt] = useState<string | null>(null)

    // POSH Simulator access per department
    const [deptPoshAccess, setDeptPoshAccess] = useState<{ id: string; name: string; posh_simulator_enabled: boolean }[]>([])
    const [togglingDeptPosh, setTogglingDeptPosh] = useState<string | null>(null)

    // Breach Simulator access per department
    const [deptBreachAccess, setDeptBreachAccess] = useState<{ id: string; name: string; breach_simulator_enabled: boolean }[]>([])
    const [togglingDeptBreach, setTogglingDeptBreach] = useState<string | null>(null)

    // Board Checker access per department
    const [deptBoardAccess, setDeptBoardAccess] = useState<{ id: string; name: string; board_checker_enabled: boolean }[]>([])
    const [togglingDeptBoard, setTogglingDeptBoard] = useState<string | null>(null)

    // Bulk Invite State
    const [bulkPreview, setBulkPreview] = useState<{ name: string, email: string, department_id?: string, departmentName?: string }[]>([])
    const [isBulkUploading, setIsBulkUploading] = useState(false)

    // Bulk assign + deadlines + role state
    const [bulkAssignDeptId, setBulkAssignDeptId] = useState('')
    const [isBulkAssigning, setIsBulkAssigning] = useState(false)
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null)
    const [moduleDeadlines, setModuleDeadlines] = useState<Record<string, string>>({})
    const [savingDeadline, setSavingDeadline] = useState<string | null>(null)
    const [updatingUserRole, setUpdatingUserRole] = useState<string | null>(null)
    const [revokingUser, setRevokingUser] = useState<string | null>(null)

    // Leaderboard state
    const [leaderboardData, setLeaderboardData] = useState<any[]>([])
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
    const [leaderboardLoaded, setLeaderboardLoaded] = useState(false)

    // Audit log state
    const [auditLog, setAuditLog] = useState<any[]>([])
    const [loadingAudit, setLoadingAudit] = useState(false)
    const [auditLoaded, setAuditLoaded] = useState(false)
    const [auditEventFilter, setAuditEventFilter] = useState('')
    const [auditPage, setAuditPage] = useState(0)
    const [auditHasMore, setAuditHasMore] = useState(false)
    const [auditStartDate, setAuditStartDate] = useState('')
    const [auditEndDate, setAuditEndDate] = useState('')
    const [exportingAudit, setExportingAudit] = useState(false)

    // Bulk cert state
    const [bulkCertModuleId, setBulkCertModuleId] = useState('')
    const [bulkCerts, setBulkCerts] = useState<any[]>([])
    const [loadingBulkCerts, setLoadingBulkCerts] = useState(false)

    // AI Policy status
    const [aiPolicyStatus, setAiPolicyStatus] = useState<{ completed: boolean; tier?: 1 | 2 | 3; moduleName?: string } | null>(null)
    const [aiPolicyLoading, setAiPolicyLoading] = useState(true)

    // Welcome guide modal
    const [hasSeenGuide, setHasSeenGuide] = useState<boolean>(true)

    // Help video modal
    const [showHelpVideo, setShowHelpVideo] = useState(false)

    // Question manager state
    const [questionModuleId, setQuestionModuleId] = useState('')
    const [questionsList, setQuestionsList] = useState<{ id: string; text: string; slide_group: number | null; answer_count: number }[]>([])
    const [loadingQuestions, setLoadingQuestions] = useState(false)
    const [updatingQuestionGroup, setUpdatingQuestionGroup] = useState<string | null>(null)

    // Plan tier
    const [planTier, setPlanTier] = useState<PlanTier>('essentials')
    const [planExpired, setPlanExpired] = useState(false)

    // Handle File Upload & Parse
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (evt) => {
            const XLSX = await import('xlsx')
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json(ws) as any[]

            // Normalize map keys to lowercase
            const normalized = data.map(row => {
                const newRow: any = {}
                Object.keys(row).forEach(key => {
                    newRow[key.toLowerCase().trim()] = row[key]
                })
                return newRow
            })

            // Build department name → id lookup (case-insensitive)
            const deptLookup = new Map<string, { id: string, name: string }>()
            departments.forEach(d => deptLookup.set(d.name.toLowerCase().trim(), d))

            // Extract Name/Email/Department
            const validUsers = normalized
                .filter(r => (r.email || r['email address']) && (r.name || r.fullname || r['full name']))
                .map(r => {
                    const deptRaw: string = (r.department || r.dept || '').toString().toLowerCase().trim()
                    const deptMatch = deptRaw ? deptLookup.get(deptRaw) : undefined
                    return {
                        name: r.name || r.fullname || r['full name'],
                        email: r.email || r['email address'],
                        department_id: deptMatch?.id,
                        departmentName: deptMatch?.name ?? (deptRaw || undefined)
                    }
                })

            if (validUsers.length === 0) {
                toast.error('No valid rows found. Ensure columns are "Name" and "Email".')
                return
            }

            setBulkPreview(validUsers)
            toast.success(`Loaded ${validUsers.length} users`)
        }
        reader.readAsBinaryString(file)
    }

    // State for Bulk Org Select
    const [bulkOrganizationId, setBulkOrganizationId] = useState('')

    // Handle Bulk Submit
    const handleBulkSubmit = async () => {
        if (bulkPreview.length === 0) return

        if (isSuperAdmin && !bulkOrganizationId) {
            toast.error('Please select an organization first.')
            return
        }

        setIsBulkUploading(true)
        try {
            const result = await bulkInviteUsers(
                bulkPreview.map(u => ({ name: u.name, email: u.email, department_id: u.department_id })),
                bulkOrganizationId
            )
            if (result.success) {
                toast.success(result.message)
                if (result.details && result.details.failed > 0) {
                    toast.warning(`${result.details.failed} invites failed. Check console.`)
                    console.error('Bulk Failures:', result.details.errors)
                }
                setBulkPreview([])
                // Refresh list
                const newUsers = await getCompanyUsers()
                setUsers(newUsers || [])
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error('Bulk upload failed')
        } finally {
            setIsBulkUploading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    useEffect(() => {
        async function checkAuthAndLoadData() {
            setLoadingStats(true)

            // One server action for the whole mount. Server Actions are queued and
            // executed one at a time by the Next.js router, so fanning this back out
            // into several calls would re-serialize them into N round trips.
            const boot = await getAdminBootstrap()

            if (boot.status === 'unauthenticated') {
                router.push('/login')
                return
            }

            if (boot.status === 'not-admin') {
                setIsAdmin(false)
                toast.error('Unauthorized access. Redirecting...')
                setTimeout(() => router.push('/dashboard'), 2000)
                return
            }

            if (boot.status === 'needs-settings') {
                router.push('/admin/settings?firstTime=true')
                return
            }

            setCurrentUserId(boot.userId)
            setIsSuperAdmin(boot.isSuperAdmin)
            setIsAdmin(true)
            setHasSeenGuide(boot.hasSeenGuide)
            setPlanTier(boot.planTier)
            setPlanExpired(boot.planExpired)
            setOrgs(boot.orgs)

            setStats(boot.stats)
            setUsers(boot.users)
            setOrgModules(boot.modules)
            setDepartments(boot.departments)
            setDeptRptAccess(boot.deptAccess)
            setDeptPoshAccess(boot.deptAccess)
            setDeptBreachAccess(boot.deptAccess)
            setDeptBoardAccess(boot.deptAccess)
            setAiPolicyStatus(boot.aiPolicy)
            setAiPolicyLoading(false)
            const dlMap: Record<string, string> = {}
            boot.deadlines.forEach((d) => { dlMap[d.module_id] = d.due_date })
            setModuleDeadlines(dlMap)
            setLoadingStats(false)
        }
        checkAuthAndLoadData()
    }, [])

    useEffect(() => {
        if (!selectAllCheckboxRef.current) return
        const filtered = users.filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        const allSelected = filtered.length > 0 && filtered.every(u => selectedUserIds.has(u.id))
        const someSelected = filtered.some(u => selectedUserIds.has(u.id))
        selectAllCheckboxRef.current.indeterminate = someSelected && !allSelected
    }, [users, searchTerm, selectedUserIds])

    if (isAdmin === false) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-8">
                <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md max-w-md w-full text-center p-8">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Unauthorized Access</h2>
                    <p className="text-slate-400">Redirecting you to the learner dashboard...</p>
                </Card>
            </div>
        )
    }

    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
        )
    }

    if (planExpired) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-10">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Plan Expired</h2>
                    <p className="text-slate-400">
                        Your organization&apos;s plan has expired. Access to the admin dashboard is suspended.
                    </p>
                    <p className="text-slate-500 text-sm">
                        Contact{' '}
                        <a href="mailto:praveen@aaplusconsultants.com" className="text-red-400 underline hover:text-red-300">
                            praveen@aaplusconsultants.com
                        </a>{' '}
                        to renew your plan.
                    </p>
                </div>
            </div>
        )
    }

    // Admin seat usage. The server enforces the cap; this only keeps the UI
    // honest so admins aren't offered a seat that will be rejected. Superadmins
    // invite into other organizations, where the local user list says nothing
    // useful — they get the server's answer instead.
    const orgAdminCount = users.filter(u => u.role === 'admin').length
    const adminSeatsFull = !isSuperAdmin && orgAdminCount >= MAX_ADMINS_PER_ORG

    // Invite Form Handler
    async function handleInvite(formData: FormData) {
        const result = await inviteUser(null, formData)
        if (result.success) {
            toast.success(result.message)
            // Ideally refresh users list here
            const newUsers = await getCompanyUsers()
            setUsers(newUsers || [])
        } else {
            toast.error(result.message)
        }
    }

    async function handleToggleModule(moduleId: string, assign: boolean) {
        setTogglingModule(moduleId)
        setOrgModules(prev => prev.map(m => m.id === moduleId ? { ...m, isAssigned: assign } : m))
        const result = await setModuleAssignment(moduleId, assign)
        if (!result.success) {
            setOrgModules(prev => prev.map(m => m.id === moduleId ? { ...m, isAssigned: !assign } : m))
            toast.error(result.message || 'Failed to update module assignment')
        } else {
            toast.success(assign ? 'Module enabled for your organization' : 'Module disabled for your organization')
        }
        setTogglingModule(null)
    }

    async function handleToggleDeptModule(moduleId: string, departmentId: string, assign: boolean) {
        const key = `${moduleId}:${departmentId}`
        setTogglingDeptModule(key)
        setOrgModules(prev => prev.map(m => {
            if (m.id !== moduleId) return m
            const newDeptIds = assign
                ? [...(m.deptIds || []), departmentId]
                : (m.deptIds || []).filter((id: string) => id !== departmentId)
            return { ...m, deptIds: newDeptIds }
        }))
        const result = await setDeptModuleAssignment(moduleId, departmentId, assign)
        if (!result.success) {
            setOrgModules(prev => prev.map(m => {
                if (m.id !== moduleId) return m
                const revert = assign
                    ? (m.deptIds || []).filter((id: string) => id !== departmentId)
                    : [...(m.deptIds || []), departmentId]
                return { ...m, deptIds: revert }
            }))
            toast.error(result.message || 'Failed to update department assignment')
        }
        setTogglingDeptModule(null)
    }

    async function handleToggleAllEmployees(moduleId: string, value: boolean) {
        setTogglingAllEmployees(moduleId)
        setOrgModules(prev => prev.map(m => m.id === moduleId ? { ...m, allEmployees: value } : m))
        const result = await setModuleAllEmployees(moduleId, value)
        if (!result.success) {
            setOrgModules(prev => prev.map(m => m.id === moduleId ? { ...m, allEmployees: !value } : m))
            toast.error(result.message || 'Failed to update')
        } else {
            toast.success(value ? 'Module visible to all employees' : 'Module restricted to departments')
        }
        setTogglingAllEmployees(null)
    }

    async function handleCreateDepartment() {
        if (!newDeptName.trim()) return
        setCreatingDept(true)
        const result = await createDepartment(newDeptName.trim())
        if (result.success) {
            toast.success(`Department "${newDeptName}" created`)
            setNewDeptName('')
            const fresh = await getDepartmentsWithAccess()
            if (fresh) {
                setDepartments(fresh.departments)
                setDeptRptAccess(fresh.rpt)
                setDeptPoshAccess(fresh.posh)
                setDeptBreachAccess(fresh.breach)
                setDeptBoardAccess(fresh.board)
            }
        } else {
            toast.error(result.message || 'Failed to create department')
        }
        setCreatingDept(false)
    }

    async function handleDeleteDepartment(id: string, name: string) {
        setDeletingDept(id)
        const result = await deleteDepartment(id)
        if (result.success) {
            toast.success(`Department "${name}" deleted`)
            setDepartments(prev => prev.filter(d => d.id !== id))
            setUsers(prev => prev.map(u => u.department_id === id ? { ...u, department_id: null, department_name: null } : u))
        } else {
            toast.error(result.message || 'Failed to delete department')
        }
        setDeletingDept(null)
    }

    async function handleToggleDeptRpt(departmentId: string, enabled: boolean) {
        setTogglingDeptRpt(departmentId)
        setDeptRptAccess(prev => prev.map(d => d.id === departmentId ? { ...d, rpt_simulator_enabled: enabled } : d))
        const result = await setDeptRptAccessAction(departmentId, enabled)
        if (!result.success) {
            setDeptRptAccess(prev => prev.map(d => d.id === departmentId ? { ...d, rpt_simulator_enabled: !enabled } : d))
            toast.error(result.message || 'Failed to update RPT access')
        } else {
            toast.success(enabled ? 'RPT Simulator enabled for department' : 'RPT Simulator disabled for department')
        }
        setTogglingDeptRpt(null)
    }

    async function handleToggleDeptPosh(departmentId: string, enabled: boolean) {
        setTogglingDeptPosh(departmentId)
        setDeptPoshAccess(prev => prev.map(d => d.id === departmentId ? { ...d, posh_simulator_enabled: enabled } : d))
        const result = await setDeptPoshSimAction(departmentId, enabled)
        if (!result.success) {
            setDeptPoshAccess(prev => prev.map(d => d.id === departmentId ? { ...d, posh_simulator_enabled: !enabled } : d))
            toast.error(result.message || 'Failed to update POSH Simulator access')
        } else {
            toast.success(enabled ? 'POSH Simulator enabled for department' : 'POSH Simulator disabled for department')
        }
        setTogglingDeptPosh(null)
    }

    async function handleToggleDeptBreach(departmentId: string, enabled: boolean) {
        setTogglingDeptBreach(departmentId)
        setDeptBreachAccess(prev => prev.map(d => d.id === departmentId ? { ...d, breach_simulator_enabled: enabled } : d))
        const result = await setDeptBreachSimAction(departmentId, enabled)
        if (!result.success) {
            setDeptBreachAccess(prev => prev.map(d => d.id === departmentId ? { ...d, breach_simulator_enabled: !enabled } : d))
            toast.error(result.message || 'Failed to update Breach Simulator access')
        } else {
            toast.success(enabled ? 'Breach Simulator enabled for department' : 'Breach Simulator disabled for department')
        }
        setTogglingDeptBreach(null)
    }

    async function handleToggleDeptBoard(departmentId: string, enabled: boolean) {
        setTogglingDeptBoard(departmentId)
        setDeptBoardAccess(prev => prev.map(d => d.id === departmentId ? { ...d, board_checker_enabled: enabled } : d))
        const result = await setDeptBoardCheckerAction(departmentId, enabled)
        if (!result.success) {
            setDeptBoardAccess(prev => prev.map(d => d.id === departmentId ? { ...d, board_checker_enabled: !enabled } : d))
            toast.error(result.message || 'Failed to update Board Checker access')
        } else {
            toast.success(enabled ? 'Board Checker enabled for department' : 'Board Checker disabled for department')
        }
        setTogglingDeptBoard(null)
    }

    async function handleUpdateUserDepartment(userId: string, departmentId: string | null) {
        setUpdatingUserDept(userId)
        const result = await updateUserDepartment(userId, departmentId)
        if (result.success) {
            const deptName = departments.find(d => d.id === departmentId)?.name || null
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, department_id: departmentId, department_name: deptName } : u))
            toast.success('Department updated')
        } else {
            toast.error(result.message || 'Failed to update department')
        }
        setUpdatingUserDept(null)
    }

    async function handleBulkAssign() {
        if (!bulkAssignDeptId) return
        setIsBulkAssigning(true)
        const deptName = departments.find(d => d.id === bulkAssignDeptId)?.name || ''
        if (selectedUserIds.size > 0) {
            const result = await bulkAssignSelectedUsers(Array.from(selectedUserIds), bulkAssignDeptId)
            if (result.success) {
                setUsers(prev => prev.map(u => selectedUserIds.has(u.id) ? { ...u, department_id: bulkAssignDeptId, department_name: deptName } : u))
                setSelectedUserIds(new Set())
                toast.success(`${selectedUserIds.size} user${selectedUserIds.size !== 1 ? 's' : ''} moved to ${deptName}`)
            } else {
                toast.error(result.message || 'Failed to assign users')
            }
        } else {
            const result = await bulkAssignDepartment(bulkAssignDeptId)
            if (result.success) {
                setUsers(prev => prev.map(u => u.department_id ? u : { ...u, department_id: bulkAssignDeptId, department_name: deptName }))
                toast.success(`All unassigned users moved to ${deptName}`)
            } else {
                toast.error(result.message || 'Failed to bulk assign')
            }
        }
        setIsBulkAssigning(false)
    }

    async function handleSetDeadline(moduleId: string, dueDate: string) {
        setSavingDeadline(moduleId)
        const result = await setModuleDeadline(moduleId, dueDate || null)
        if (result.success) {
            setModuleDeadlines(prev => ({ ...prev, [moduleId]: dueDate }))
            toast.success(dueDate ? 'Deadline saved' : 'Deadline cleared')
        } else {
            toast.error(result.message || 'Failed to save deadline')
        }
        setSavingDeadline(null)
    }

    async function handleUpdateUserRole(userId: string, role: string) {
        setUpdatingUserRole(userId)
        const result = await updateUserRole(userId, role)
        if (result.success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
            toast.success('Role updated')
        } else {
            toast.error(result.message || 'Failed to update role')
        }
        setUpdatingUserRole(null)
    }

    async function handleRevokeAccess(userId: string, userName: string) {
        if (!confirm(`Remove ${userName} from your organization? They will lose access immediately but their account will not be deleted.`)) return
        setRevokingUser(userId)
        const result = await revokeUserAccess(userId)
        if (result.success) {
            setUsers(prev => prev.filter(u => u.id !== userId))
            toast.success(`${userName} has been removed from the organization.`)
        } else {
            toast.error(result.message || 'Failed to revoke access')
        }
        setRevokingUser(null)
    }

    async function loadAuditPage(
        page: number,
        opts: { start?: string; end?: string; event?: string } = {}
    ) {
        setLoadingAudit(true)
        const result = await getAuditLog({
            page,
            pageSize: 100,
            startDate: opts.start ?? (auditStartDate || undefined),
            endDate: opts.end ?? (auditEndDate || undefined),
            eventType: opts.event ?? (auditEventFilter || undefined),
        })
        if (result) {
            setAuditLog(result.data)
            setAuditHasMore(result.hasMore)
            setAuditPage(result.page)
        }
        setLoadingAudit(false)
    }

    async function handleExportAudit() {
        setExportingAudit(true)
        try {
            const rows = await exportAuditLog({
                startDate: auditStartDate || undefined,
                endDate: auditEndDate || undefined,
                eventType: auditEventFilter || undefined,
            })
            if (!rows?.length) { toast.error('No audit data to export'); return }
            const XLSX = await import('xlsx')
            const exportRows = rows.map((e: any) => ({
                Timestamp: new Date(e.createdAt).toLocaleString('en-IN'),
                Employee: e.userName,
                Email: e.userEmail,
                Module: e.moduleTitle,
                Event: e.eventType,
                Detail: e.eventType === 'quiz_completed' && e.metadata?.score != null
                    ? `Score: ${e.metadata.score}% — ${e.metadata.passed ? 'Passed' : 'Failed'}`
                    : e.slideTitle || '',
            }))
            const ws = XLSX.utils.json_to_sheet(exportRows)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail')
            XLSX.writeFile(wb, `audit_log_${new Date().toISOString().slice(0, 10)}.xlsx`)
            toast.success(`Exported ${rows.length} records`)
        } catch {
            toast.error('Export failed')
        } finally {
            setExportingAudit(false)
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.has(u.id))
    const someFilteredSelected = filteredUsers.some(u => selectedUserIds.has(u.id))

    function toggleSelectAll() {
        if (allFilteredSelected) {
            setSelectedUserIds(prev => {
                const next = new Set(prev)
                filteredUsers.forEach(u => next.delete(u.id))
                return next
            })
        } else {
            setSelectedUserIds(prev => {
                const next = new Set(prev)
                filteredUsers.forEach(u => next.add(u.id))
                return next
            })
        }
    }

    function toggleUserSelected(userId: string) {
        setSelectedUserIds(prev => {
            const next = new Set(prev)
            if (next.has(userId)) next.delete(userId)
            else next.add(userId)
            return next
        })
    }

    return (
        <div className="min-h-screen bg-[#0B0F19] p-8 md:p-12 space-y-8">

            <WelcomeGuideModal role="admin" hasSeenGuide={hasSeenGuide} />

            {/* Help Video Modal */}
            <Dialog open={showHelpVideo} onOpenChange={setShowHelpVideo}>
                <DialogContent className="bg-[#151A29] border-white/10 text-white max-w-4xl w-full p-0 overflow-hidden">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-blue-400" />
                            Admin How-To Guide
                        </DialogTitle>
                    </DialogHeader>
                    <div className="px-6 pb-6">
                        <video
                            controls
                            className="w-full rounded-lg bg-black"
                            src="/guides/AA_Plus_Admin_How-To_Guide.mp4"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-slate-400">Manage users and monitor training compliance.</p>
                </div>
                <div className="flex gap-4">
                    {isSuperAdmin && (
                        <Button
                            variant="outline"
                            onClick={() => router.push('/superadmin')}
                            className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10 rounded-lg"
                        >
                            <span className="mr-2">🛡️</span>
                            Switch to Superadmin
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard')}
                        className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 rounded-lg"
                    >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        My Training
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/admin/posh-policy')}
                        className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                        <span className="mr-2">📋</span>
                        POSH Policy
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/admin/settings')}
                        className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                        <span className="mr-2">⚙️</span>
                        Settings
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setShowHelpVideo(true)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
                    >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Help
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-[#151A29] border border-white/10 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">Overview</TabsTrigger>
                    <TabsTrigger value="people" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">People</TabsTrigger>
                    <TabsTrigger value="modules" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">Modules</TabsTrigger>
                    <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6" onClick={async () => { if (leaderboardLoaded) return; setLoadingLeaderboard(true); const d = await getReportChartData(); setLeaderboardData(d?.deptBreakdown?.sort((a: any, b: any) => b.overallRate - a.overallRate) ?? []); setLeaderboardLoaded(true); setLoadingLeaderboard(false) }}>🏆 Leaderboard</TabsTrigger>
                    <TabsTrigger value="audit" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6" onClick={async () => { if (auditLoaded) return; await loadAuditPage(0); setAuditLoaded(true) }}>Audit Trail</TabsTrigger>
                    <TabsTrigger value="reports" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">Reports</TabsTrigger>
                    <TabsTrigger value="questions" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-6">Questions</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-8">
                    {/* AI Policy Banner */}
                    {!aiPolicyLoading && aiPolicyStatus !== null && (
                        <>
                            {!aiPolicyStatus?.completed ? (
                                <Card className="bg-amber-500/10 border-amber-500/30 backdrop-blur-md">
                                    <CardContent className="flex items-center justify-between p-5 flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold">Set Up Your AI Usage Policy</p>
                                                <p className="text-slate-400 text-sm">Answer 4 quick questions to assign the right AI Best Practices training module to your employees.</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => router.push('/admin/ai-policy')}
                                            className="bg-amber-600 hover:bg-amber-500 text-white whitespace-nowrap"
                                        >
                                            Set Up AI Policy
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                                    <CardContent className="flex items-center justify-between p-4 flex-wrap gap-4">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                            <span className="text-slate-300 text-sm">
                                                AI Policy:
                                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    aiPolicyStatus.tier === 1 ? 'bg-amber-500/20 text-amber-300' :
                                                    aiPolicyStatus.tier === 2 ? 'bg-blue-500/20 text-blue-300' :
                                                    'bg-emerald-500/20 text-emerald-300'
                                                }`}>
                                                    {aiPolicyStatus.tier === 1 ? 'Restricted Use' :
                                                     aiPolicyStatus.tier === 2 ? 'Standard Use' : 'Responsible Use'}
                                                </span>
                                                {aiPolicyStatus.moduleName && (
                                                    <span className="text-slate-500 ml-2">— {aiPolicyStatus.moduleName}</span>
                                                )}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push('/admin/ai-policy')}
                                            className="text-slate-400 hover:text-white text-xs h-7"
                                        >
                                            Update Policy
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Invite & Stats */}
                        <div className="lg:col-span-1 space-y-8">
                            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-white">
                                            <UserPlus className="w-5 h-5 text-purple-400" />
                                            Invite Users
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-slate-400">Add new members to your organization.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="single" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 bg-black/20 mb-4">
                                            <TabsTrigger value="single">Single Invite</TabsTrigger>
                                            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="single">
                                            <form action={handleInvite} className="space-y-3">
                                                {isSuperAdmin && (
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="organizationId" className="text-slate-300 text-xs">Target Organization <span className="text-red-400">*</span></Label>
                                                        <select
                                                            id="organizationId"
                                                            name="organizationId"
                                                            required
                                                            className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        >
                                                            <option value="" disabled className="bg-[#151A29]">Select an organization</option>
                                                            {orgs.map((org: any) => (
                                                                <option key={org.id} value={org.id} className="bg-[#151A29]">{org.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="fullName" className="text-slate-300 text-xs">Full Name <span className="text-red-400">*</span></Label>
                                                    <Input id="fullName" name="fullName" placeholder="Jane Smith" required className="bg-black/20 border-white/10 text-white h-9" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="email" className="text-slate-300 text-xs">Email Address <span className="text-red-400">*</span></Label>
                                                    <Input id="email" name="email" type="email" placeholder="jane@company.com" required className="bg-black/20 border-white/10 text-white h-9" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="role" className="text-slate-300 text-xs">Role</Label>
                                                    <select
                                                        id="role"
                                                        name="role"
                                                        defaultValue="learner"
                                                        className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    >
                                                        <option value="learner" className="bg-[#151A29]">Learner</option>
                                                        <option value="manager" className="bg-[#151A29]">Manager</option>
                                                        <option value="admin" disabled={adminSeatsFull} className="bg-[#151A29]">
                                                            Admin{adminSeatsFull ? ' — no seats left' : ''}
                                                        </option>
                                                    </select>
                                                    {!isSuperAdmin && (
                                                        <p className={`text-xs ${adminSeatsFull ? 'text-amber-400' : 'text-slate-500'}`}>
                                                            {orgAdminCount} of {MAX_ADMINS_PER_ORG} admin seats used
                                                            {adminSeatsFull ? ' — change an existing admin to another role to free one.' : '.'}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="departmentId" className="text-slate-300 text-xs">Department <span className="text-slate-500">(optional)</span></Label>
                                                    <select
                                                        id="departmentId"
                                                        name="departmentId"
                                                        className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    >
                                                        <option value="" className="bg-[#151A29]">— No department —</option>
                                                        {departments.map(d => (
                                                            <option key={d.id} value={d.id} className="bg-[#151A29]">{d.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white mt-1">Send Invitation</Button>
                                            </form>
                                        </TabsContent>

                                        <TabsContent value="bulk" className="space-y-4">
                                            {/* Instructions card */}
                                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                                                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Required File Format</p>
                                                <div className="overflow-x-auto rounded-md border border-white/10 text-xs">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-white/5">
                                                            <tr>
                                                                <th className="px-3 py-2 text-slate-400">Column</th>
                                                                <th className="px-3 py-2 text-slate-400">Header Name</th>
                                                                <th className="px-3 py-2 text-slate-400">Required?</th>
                                                                <th className="px-3 py-2 text-slate-400">Notes</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-slate-300">
                                                            <tr className="border-t border-white/5">
                                                                <td className="px-3 py-2 font-medium">A</td>
                                                                <td className="px-3 py-2 font-mono text-cyan-400">Name</td>
                                                                <td className="px-3 py-2 text-green-400">Required</td>
                                                                <td className="px-3 py-2 text-slate-400">Full name of the employee</td>
                                                            </tr>
                                                            <tr className="border-t border-white/5">
                                                                <td className="px-3 py-2 font-medium">B</td>
                                                                <td className="px-3 py-2 font-mono text-cyan-400">Email</td>
                                                                <td className="px-3 py-2 text-green-400">Required</td>
                                                                <td className="px-3 py-2 text-slate-400">Work email address</td>
                                                            </tr>
                                                            <tr className="border-t border-white/5">
                                                                <td className="px-3 py-2 font-medium">C</td>
                                                                <td className="px-3 py-2 font-mono text-cyan-400">Department</td>
                                                                <td className="px-3 py-2 text-slate-400">Optional</td>
                                                                <td className="px-3 py-2 text-slate-400">Must exactly match a department name</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {departments.length > 0 && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-slate-400">Available departments:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {departments.map(d => (
                                                                <span key={d.id} className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">{d.name}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {isSuperAdmin && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="bulkOrganizationId" className="text-slate-300">Target Organization</Label>
                                                    <select
                                                        id="bulkOrganizationId"
                                                        name="bulkOrganizationId"
                                                        required
                                                        value={bulkOrganizationId}
                                                        onChange={(e) => setBulkOrganizationId(e.target.value)}
                                                        className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <option value="" disabled className="bg-[#151A29]">Select an organization</option>
                                                        {orgs.map((org: any) => (
                                                            <option key={org.id} value={org.id} className="bg-[#151A29]">
                                                                {org.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                                                <Input
                                                    type="file"
                                                    accept=".csv, .xlsx, .xls"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={handleFileUpload}
                                                />
                                                <div className="space-y-2 pointer-events-none">
                                                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto text-purple-400">
                                                        <FileBarChart className="w-5 h-5" />
                                                    </div>
                                                    <p className="text-sm text-slate-300 font-medium">Click or drag file to upload</p>
                                                    <p className="text-xs text-slate-500">CSV or Excel — columns: Name, Email, Department (optional)</p>
                                                </div>
                                            </div>

                                            {bulkPreview.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-400 flex justify-between">
                                                        <span>Preview ({bulkPreview.length} users)</span>
                                                        <button onClick={() => setBulkPreview([])} className="text-red-400 hover:text-red-300">Clear</button>
                                                    </div>
                                                    <div className="max-h-40 overflow-y-auto rounded-md border border-white/10 text-xs">
                                                        <table className="w-full text-left text-slate-300">
                                                            <thead className="bg-white/5 sticky top-0">
                                                                <tr>
                                                                    <th className="p-2">Name</th>
                                                                    <th className="p-2">Email</th>
                                                                    <th className="p-2">Department</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {bulkPreview.slice(0, 10).map((u, i) => (
                                                                    <tr key={i} className="border-t border-white/5">
                                                                        <td className="p-2 truncate max-w-[90px]">{u.name}</td>
                                                                        <td className="p-2 truncate max-w-[130px]">{u.email}</td>
                                                                        <td className="p-2 truncate max-w-[100px]">
                                                                            {u.department_id
                                                                                ? <span className="text-green-400">{u.departmentName}</span>
                                                                                : u.departmentName
                                                                                    ? <span className="text-yellow-400" title="Department not found">{u.departmentName} ⚠</span>
                                                                                    : <span className="text-slate-500">—</span>
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {bulkPreview.length > 10 && (
                                                                    <tr><td colSpan={3} className="p-2 text-center text-slate-500">...and {bulkPreview.length - 10} more</td></tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <Button onClick={handleBulkSubmit} disabled={isBulkUploading} className="w-full bg-green-600 hover:bg-green-500 text-white">
                                                        {isBulkUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                                        {isBulkUploading ? 'Processing...' : `Invite ${bulkPreview.length} Users`}
                                                    </Button>
                                                </div>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>

                            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white"><Users className="w-5 h-5 text-blue-400" /> Organization Size</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingStats ? <Loader2 className="animate-spin text-slate-500" /> : (
                                        <div className="text-4xl font-bold text-white">{stats?.totalEmployees || 0}<span className="text-lg text-slate-400 font-normal ml-2">Employees</span></div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Analytics */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white"><FileBarChart className="w-5 h-5 text-cyan-400" /> Training Completion</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingStats ? <div className="h-[300px] flex items-center justify-center"><Loader2 className="animate-spin" /></div> : (
                                        <ModuleCompletionChart data={stats?.moduleStats || []} />
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white"><AlertTriangle className="w-5 h-5 text-red-400" /> At Risk Certifications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingStats ? <Loader2 className="animate-spin" /> : (
                                        <div className="space-y-4">
                                            {stats?.expiredCertifications?.length === 0 ? <div className="text-slate-500">No expired certifications.</div> : stats?.expiredCertifications?.map((user: any, idx: number) => (
                                                <div key={idx} className="flex justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                                    <div className="flex gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"><GraduationCap className="w-5 h-5" /></div>
                                                        <div><div className="text-white font-medium">{user.display_name}</div><div className="text-sm text-slate-400">{user.email}</div></div>
                                                    </div>
                                                    <div className="text-right"><div className="text-sm text-slate-300">{user.module_title}</div><div className="text-xs text-red-400">Expired: {new Date(user.completed_at).toLocaleDateString()}</div></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* PEOPLE TAB */}
                <TabsContent value="people">
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
                            <div>
                                <CardTitle className="text-white">People</CardTitle>
                                <CardDescription className="text-slate-400">Manage employees and assign them to departments.</CardDescription>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                {selectedUserIds.size > 0 && (
                                    <span className="text-xs text-cyan-400 font-medium">{selectedUserIds.size} selected</span>
                                )}
                                {/* Bulk assign */}
                                {departments.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={bulkAssignDeptId}
                                            onChange={e => setBulkAssignDeptId(e.target.value)}
                                            className="text-xs bg-black/30 border border-white/10 text-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        >
                                            <option value="">{selectedUserIds.size > 0 ? 'Assign selected to…' : 'Bulk assign unassigned…'}</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                        <Button
                                            size="sm"
                                            disabled={!bulkAssignDeptId || isBulkAssigning}
                                            onClick={handleBulkAssign}
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-8"
                                        >
                                            {isBulkAssigning ? <Loader2 className="w-3 h-3 animate-spin" /> : <UsersRound className="w-3 h-3" />}
                                            <span className="ml-1">{selectedUserIds.size > 0 ? `Assign ${selectedUserIds.size}` : 'Assign'}</span>
                                        </Button>
                                    </div>
                                )}
                                <div className="relative w-56">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        placeholder="Search people..."
                                        className="pl-9 bg-black/20 border-white/10 text-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-white/10 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-slate-300 font-medium">
                                        <tr>
                                            <th className="p-4 w-10">
                                                <input
                                                    ref={selectAllCheckboxRef}
                                                    type="checkbox"
                                                    checked={allFilteredSelected}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 rounded border-white/20 bg-black/30 accent-cyan-500 cursor-pointer"
                                                    title="Select all"
                                                />
                                            </th>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4">Department</th>
                                            <th className="p-4">Modules</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className={`hover:bg-white/5 transition-colors ${selectedUserIds.has(user.id) ? 'bg-cyan-500/5' : ''}`}>
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUserIds.has(user.id)}
                                                        onChange={() => toggleUserSelected(user.id)}
                                                        className="w-4 h-4 rounded border-white/20 bg-black/30 accent-cyan-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-4 text-white font-medium">{user.name}</td>
                                                <td className="p-4 text-slate-400">{user.email}</td>
                                                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>{user.role}</span></td>
                                                <td className="p-4">
                                                    {updatingUserDept === user.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                                    ) : (
                                                        <select
                                                            value={user.department_id || ''}
                                                            onChange={(e) => handleUpdateUserDepartment(user.id, e.target.value || null)}
                                                            className="text-xs bg-black/30 border border-white/10 text-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                        >
                                                            <option value="" className="bg-[#151A29] text-slate-500">— No department —</option>
                                                            {departments.map(d => (
                                                                <option key={d.id} value={d.id} className="bg-[#151A29]">{d.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                                <td className="p-4 text-slate-300">{user.modules_completed}</td>
                                                <td className="p-4">
                                                    {user.modules_completed > 0 ? (
                                                        <span className="flex items-center text-green-400 gap-1"><CheckCircle className="w-3 h-3" /> Active</span>
                                                    ) : (
                                                        <span className="flex items-center text-slate-500 gap-1"><Clock className="w-3 h-3" /> Pending</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {user.id !== currentUserId && (
                                                            updatingUserRole === user.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                                            ) : (
                                                                <select
                                                                    value={user.role || 'learner'}
                                                                    onChange={e => handleUpdateUserRole(user.id, e.target.value)}
                                                                    className="text-xs bg-black/30 border border-white/10 text-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                                >
                                                                    <option value="learner">Learner</option>
                                                                    <option value="manager">Manager</option>
                                                                    <option value="admin" disabled={adminSeatsFull && user.role !== 'admin'}>
                                                                        Admin{adminSeatsFull && user.role !== 'admin' ? ' — no seats left' : ''}
                                                                    </option>
                                                                </select>
                                                            )
                                                        )}
                                                        {user.role !== 'admin' && (
                                                            revokingUser === user.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleRevokeAccess(user.id, user.name)}
                                                                    className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                                    title="Revoke access"
                                                                >
                                                                    <UserMinus className="w-3.5 h-3.5" />
                                                                </Button>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-slate-500">No users found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MODULES TAB */}
                <TabsContent value="modules" className="space-y-6">
                    {/* Department Management Card — business+ */}
                    <PlanGate required="business" tierOverride={planTier} expiredOverride={planExpired}>
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Building2 className="w-5 h-5 text-cyan-400" />
                                Departments
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Create departments to control which modules each group of employees can access.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Quick-add presets */}
                            {(() => {
                                const PRESET_DEPARTMENTS = [
                                    { name: 'Board Members', description: 'Directors and board-level governance roles' },
                                    { name: 'CS / Legal Team', description: 'Company Secretaries, in-house counsel, and legal staff' },
                                    { name: 'Finance & Accounts', description: 'CFO, accountants, treasury, and financial reporting' },
                                    { name: 'Human Resources', description: 'HR managers, payroll, and talent acquisition' },
                                    { name: 'Compliance & Risk', description: 'Dedicated compliance officers and risk managers' },
                                    { name: 'Internal Audit', description: 'Internal auditors and assurance professionals' },
                                    { name: 'Procurement & Supply Chain', description: 'Purchase officers and vendor management teams' },
                                    { name: 'Operations', description: 'Plant managers, operations leads, and project teams' },
                                    { name: 'IT & Technology', description: 'IT managers, developers, and system administrators' },
                                    { name: 'Sales & Marketing', description: 'Sales teams, business development, and marketing' },
                                    { name: 'Executive Management', description: 'CEO, COO, MD, and senior leadership' },
                                ]
                                const existingNames = new Set(departments.map(d => d.name))
                                const available = PRESET_DEPARTMENTS.filter(p => !existingNames.has(p.name))
                                if (available.length === 0) return null
                                return (
                                    <div className="space-y-2">
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Quick Add Common Departments</p>
                                        <div className="flex flex-wrap gap-2">
                                            {available.map(preset => (
                                                <button
                                                    key={preset.name}
                                                    title={preset.description}
                                                    onClick={async () => {
                                                        setCreatingDept(true)
                                                        const result = await createDepartment(preset.name)
                                                        if (result.success) {
                                                            const fresh = await getDepartmentsWithAccess()
                                                            if (fresh) {
                                                                setDepartments(fresh.departments)
                                                                setDeptRptAccess(fresh.rpt)
                                                                setDeptPoshAccess(fresh.posh)
                                                                setDeptBreachAccess(fresh.breach)
                                                                setDeptBoardAccess(fresh.board)
                                                            }
                                                        } else {
                                                            toast.error(result.message || 'Failed to create department')
                                                        }
                                                        setCreatingDept(false)
                                                    }}
                                                    disabled={creatingDept}
                                                    className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-colors rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    {preset.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* Divider */}
                            <div className="border-t border-white/5" />

                            {/* Custom department input */}
                            <div className="space-y-2">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Add Custom Department</p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Research & Development"
                                        value={newDeptName}
                                        onChange={(e) => setNewDeptName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateDepartment()}
                                        className="bg-black/20 border-white/10 text-white"
                                    />
                                    <Button
                                        onClick={handleCreateDepartment}
                                        disabled={creatingDept || !newDeptName.trim()}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white shrink-0"
                                    >
                                        {creatingDept ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        <span className="ml-1">Add</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Active departments */}
                            {departments.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Departments ({departments.length})</p>
                                    <div className="flex flex-wrap gap-2">
                                        {departments.map(dept => (
                                            <div key={dept.id} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                                                <span className="text-sm text-slate-300">{dept.name}</span>
                                                <button
                                                    onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                                    disabled={deletingDept === dept.id}
                                                    className="text-slate-600 hover:text-red-400 transition-colors ml-1"
                                                >
                                                    {deletingDept === dept.id
                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                        : <Trash2 className="w-3 h-3" />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {departments.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-2">No departments yet. Use the quick-add buttons above or type a custom name.</p>
                            )}
                        </CardContent>
                    </Card>
                    </PlanGate>

                    {/* Module Assignments Card */}
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <BookOpen className="w-5 h-5 text-purple-400" />
                                Module Assignments
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Enable modules for your organisation, then assign them to specific departments. A module must be enabled AND assigned to at least one department to be visible to employees.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingStats ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                </div>
                            ) : orgModules.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">No modules found.</div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-slate-500 px-4 pb-2 border-b border-white/5">
                                        <span>{orgModules.filter(m => m.isAssigned).length} of {orgModules.length} modules enabled</span>
                                        <span className="text-slate-600">Click a module to assign departments</span>
                                    </div>
                                    {orgModules.map((module) => (
                                        <div key={module.id} className={`rounded-xl border transition-colors ${module.isAIPolicyModule ? 'bg-indigo-500/5 border-indigo-500/20' : module.isLocked ? 'bg-amber-500/5 border-amber-500/20' : module.isAssigned ? 'bg-purple-500/5 border-purple-500/20' : 'bg-white/5 border-white/5'}`}>
                                            {/* Module row */}
                                            <div className="flex items-center justify-between p-4">
                                                <button
                                                    className="flex items-center gap-4 flex-1 text-left"
                                                    onClick={() => !module.isLocked && module.isAssigned && setExpandedModule(expandedModule === module.id ? null : module.id)}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${module.isAIPolicyModule ? 'bg-indigo-500/20 text-indigo-400' : module.isAssigned ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-600'}`}>
                                                        {module.isAIPolicyModule ? <ShieldCheck className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`font-medium transition-colors ${module.isAssigned ? 'text-white' : 'text-slate-400'}`}>
                                                            {module.title}
                                                        </div>
                                                        {module.isAIPolicyModule ? (
                                                            <div className="text-xs mt-0.5 text-indigo-400 flex items-center gap-1">
                                                                <ShieldCheck className="w-3 h-3" /> Managed by AI Policy
                                                            </div>
                                                        ) : module.isLocked ? (
                                                            <div className="text-xs mt-0.5 text-amber-500 flex items-center gap-1">
                                                                <Lock className="w-3 h-3" /> Locked by administrator
                                                            </div>
                                                        ) : module.isAssigned && (
                                                            <div className="text-xs mt-0.5">
                                                                {module.allEmployees
                                                                    ? <span className="text-blue-400">Visible to all employees</span>
                                                                    : module.deptIds?.length === 0
                                                                        ? <span className="text-yellow-500">No departments assigned — invisible to all</span>
                                                                        : <span className="text-green-400">{module.deptIds.length} department{module.deptIds.length !== 1 ? 's' : ''} assigned</span>
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                    {!module.isLocked && module.isAssigned && (
                                                        expandedModule === module.id
                                                            ? <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                                                            : <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                                                    )}
                                                </button>
                                                <Switch
                                                    checked={module.isAssigned}
                                                    disabled={togglingModule === module.id || module.isLocked || module.isAIPolicyModule}
                                                    onCheckedChange={(checked) => handleToggleModule(module.id, checked)}
                                                    className="ml-4"
                                                />
                                            </div>

                                            {/* Department assignment panel */}
                                            {!module.isLocked && module.isAssigned && expandedModule === module.id && (
                                                <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                                                    {/* Deadline picker — business+ (nudges) */}
                                                    <PlanGate required="business" tierOverride={planTier} expiredOverride={planExpired}>
                                                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 border border-white/10">
                                                        <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-slate-300">Completion Deadline</p>
                                                            <p className="text-xs text-slate-500 mt-0.5">Employees will see a badge and receive email reminders</p>
                                                        </div>
                                                        <DeadlinePicker
                                                            value={moduleDeadlines[module.id] || ''}
                                                            onChange={val => handleSetDeadline(module.id, val)}
                                                            disabled={savingDeadline === module.id}
                                                        />
                                                        {moduleDeadlines[module.id] && (
                                                            <button
                                                                onClick={() => handleSetDeadline(module.id, '')}
                                                                className="text-xs text-red-400 hover:text-red-300"
                                                                title="Clear deadline"
                                                            >✕</button>
                                                        )}
                                                        {savingDeadline === module.id && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
                                                    </div>
                                                    </PlanGate>
                                                    {/* All Employees toggle */}
                                                    <div className={`flex items-center justify-between px-3 py-3 rounded-lg border transition-colors ${module.allEmployees ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
                                                        <div>
                                                            <p className={`text-sm font-medium ${module.allEmployees ? 'text-blue-300' : 'text-slate-300'}`}>All Employees</p>
                                                            <p className="text-xs text-slate-500 mt-0.5">Visible to everyone in the organisation, regardless of department</p>
                                                        </div>
                                                        <Switch
                                                            checked={!!module.allEmployees}
                                                            disabled={togglingAllEmployees === module.id}
                                                            onCheckedChange={(checked) => handleToggleAllEmployees(module.id, checked)}
                                                        />
                                                    </div>

                                                    {/* Per-department toggles — corporate+ */}
                                                    {!module.allEmployees && (
                                                        departments.length === 0 ? (
                                                            <p className="text-sm text-slate-500">Create departments above to assign this module to specific groups.</p>
                                                        ) : (
                                                            <PlanGate required="corporate" tierOverride={planTier} expiredOverride={planExpired}>
                                                            <div className="space-y-2">
                                                                <p className="text-xs text-slate-500">Or restrict to specific departments:</p>
                                                                {departments.map(dept => {
                                                                    const isAssigned = (module.deptIds || []).includes(dept.id)
                                                                    const key = `${module.id}:${dept.id}`
                                                                    return (
                                                                        <div key={dept.id} className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${isAssigned ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/5'}`}>
                                                                            <span className={`text-sm ${isAssigned ? 'text-green-300' : 'text-slate-400'}`}>{dept.name}</span>
                                                                            <Switch
                                                                                checked={isAssigned}
                                                                                disabled={togglingDeptModule === key}
                                                                                onCheckedChange={(checked) => handleToggleDeptModule(module.id, dept.id, checked)}
                                                                            />
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                            </PlanGate>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {/* RPT Simulator Access Card — professional+ */}
                    <PlanGate required="professional" tierOverride={planTier} expiredOverride={planExpired}>
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Lock className="w-5 h-5 text-amber-400" />
                                RPT Simulator Access
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Control which departments can access the RPT Simulator. Enabled by default — toggle off to restrict a department.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {deptRptAccess.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    No departments yet. Create departments above to control RPT Simulator access.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {deptRptAccess.map(dept => (
                                        <div
                                            key={dept.id}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${dept.rpt_simulator_enabled ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${dept.rpt_simulator_enabled ? 'bg-green-400' : 'bg-red-400'}`} />
                                                <span className={`text-sm font-medium ${dept.rpt_simulator_enabled ? 'text-slate-200' : 'text-slate-400'}`}>
                                                    {dept.name}
                                                </span>
                                                {!dept.rpt_simulator_enabled && (
                                                    <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Restricted</span>
                                                )}
                                            </div>
                                            <Switch
                                                checked={dept.rpt_simulator_enabled}
                                                disabled={togglingDeptRpt === dept.id}
                                                onCheckedChange={(checked) => handleToggleDeptRpt(dept.id, checked)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    </PlanGate>

                    {/* POSH Simulator Access Card — professional+ */}
                    <PlanGate required="professional" tierOverride={planTier} expiredOverride={planExpired}>
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Lock className="w-5 h-5 text-pink-400" />
                                POSH Simulator Access
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Control which departments can access the POSH Complaint Flow Simulator. Enabled by default — toggle off to restrict a department.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {deptPoshAccess.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    No departments yet. Create departments above to control POSH Simulator access.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {deptPoshAccess.map(dept => (
                                        <div
                                            key={dept.id}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${dept.posh_simulator_enabled ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${dept.posh_simulator_enabled ? 'bg-green-400' : 'bg-red-400'}`} />
                                                <span className={`text-sm font-medium ${dept.posh_simulator_enabled ? 'text-slate-200' : 'text-slate-400'}`}>
                                                    {dept.name}
                                                </span>
                                                {!dept.posh_simulator_enabled && (
                                                    <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Restricted</span>
                                                )}
                                            </div>
                                            <Switch
                                                checked={dept.posh_simulator_enabled}
                                                disabled={togglingDeptPosh === dept.id}
                                                onCheckedChange={(checked) => handleToggleDeptPosh(dept.id, checked)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    </PlanGate>

                    {/* Breach Simulator Access Card — professional+ */}
                    <PlanGate required="professional" tierOverride={planTier} expiredOverride={planExpired}>
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Lock className="w-5 h-5 text-blue-400" />
                                Breach Response Simulator Access
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Control which departments can access the Data Breach Response Simulator. Enabled by default — toggle off to restrict a department.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {deptBreachAccess.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    No departments yet. Create departments above to control Breach Simulator access.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {deptBreachAccess.map(dept => (
                                        <div
                                            key={dept.id}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${dept.breach_simulator_enabled ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${dept.breach_simulator_enabled ? 'bg-green-400' : 'bg-red-400'}`} />
                                                <span className={`text-sm font-medium ${dept.breach_simulator_enabled ? 'text-slate-200' : 'text-slate-400'}`}>
                                                    {dept.name}
                                                </span>
                                                {!dept.breach_simulator_enabled && (
                                                    <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Restricted</span>
                                                )}
                                            </div>
                                            <Switch
                                                checked={dept.breach_simulator_enabled}
                                                disabled={togglingDeptBreach === dept.id}
                                                onCheckedChange={(checked) => handleToggleDeptBreach(dept.id, checked)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    </PlanGate>

                    {/* Board Checker Access Card — corporate+ */}
                    <PlanGate required="corporate" tierOverride={planTier} expiredOverride={planExpired}>
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Lock className="w-5 h-5 text-amber-400" />
                                Board Composition Checker Access
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Control which departments can access the Board Composition Checker. Enabled by default — toggle off to restrict a department.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {deptBoardAccess.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    No departments yet. Create departments above to control Board Checker access.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {deptBoardAccess.map(dept => (
                                        <div
                                            key={dept.id}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${dept.board_checker_enabled ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${dept.board_checker_enabled ? 'bg-green-400' : 'bg-red-400'}`} />
                                                <span className={`text-sm font-medium ${dept.board_checker_enabled ? 'text-slate-200' : 'text-slate-400'}`}>
                                                    {dept.name}
                                                </span>
                                                {!dept.board_checker_enabled && (
                                                    <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Restricted</span>
                                                )}
                                            </div>
                                            <Switch
                                                checked={dept.board_checker_enabled}
                                                disabled={togglingDeptBoard === dept.id}
                                                onCheckedChange={(checked) => handleToggleDeptBoard(dept.id, checked)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    </PlanGate>
                </TabsContent>

                {/* LEADERBOARD TAB — professional+ */}
                <TabsContent value="leaderboard" className="space-y-6">
                    <PlanGate required="professional" tierOverride={planTier} expiredOverride={planExpired}>
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                                Department Compliance Leaderboard
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Departments ranked by overall training completion rate across all assigned modules.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingLeaderboard ? (
                                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
                            ) : leaderboardData.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">No department data available yet.</div>
                            ) : (
                                <div className="space-y-3">
                                    {leaderboardData.map((dept: any, idx: number) => {
                                        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null
                                        const rate: number = dept.overallRate ?? 0
                                        const barColor = rate >= 80 ? '#22c55e' : rate >= 50 ? '#f59e0b' : '#ef4444'
                                        return (
                                            <div key={dept.dept} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="w-8 text-center text-lg font-bold">
                                                    {medal ?? <span className="text-slate-500 text-sm">#{idx + 1}</span>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-white font-medium truncate">{dept.dept}</span>
                                                        <span className="text-sm font-semibold ml-4 shrink-0" style={{ color: barColor }}>
                                                            {rate}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700"
                                                            style={{ width: `${rate}%`, background: barColor }}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">{dept.total} employee{dept.total !== 1 ? 's' : ''}</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    </PlanGate>
                </TabsContent>

                {/* AUDIT TRAIL TAB — professional+ */}
                <TabsContent value="audit" className="space-y-6">
                    <PlanGate required="professional" tierOverride={planTier} expiredOverride={planExpired}>
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader className="space-y-3">
                            <div className="flex flex-row items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-cyan-400" />
                                        Compliance Audit Trail
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Timestamped log of every slide view, quiz attempt, and attestation. 100 records per page.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Button
                                        size="sm" variant="ghost"
                                        className="text-slate-400 hover:text-white text-xs"
                                        onClick={() => loadAuditPage(auditPage)}
                                    >
                                        {loadingAudit ? <Loader2 className="w-3 h-3 animate-spin" /> : '↻'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-white/10 text-slate-300 hover:text-white text-xs gap-1.5"
                                        disabled={exportingAudit}
                                        onClick={handleExportAudit}
                                    >
                                        {exportingAudit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                        Export .xlsx
                                    </Button>
                                </div>
                            </div>
                            {/* Filters row */}
                            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-white/5">
                                <select
                                    value={auditEventFilter}
                                    onChange={e => setAuditEventFilter(e.target.value)}
                                    className="text-xs bg-black/30 border border-white/10 text-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                >
                                    <option value="">All event types</option>
                                    <option value="slide_viewed">Slide Views</option>
                                    <option value="quiz_started">Quiz Started</option>
                                    <option value="quiz_completed">Quiz Completed</option>
                                    <option value="attestation_signed">Attestations</option>
                                </select>
                                <span className="text-slate-600 text-xs">From</span>
                                <Input
                                    type="date"
                                    value={auditStartDate}
                                    onChange={e => setAuditStartDate(e.target.value)}
                                    className="h-7 w-36 bg-black/20 border-white/10 text-white text-xs"
                                />
                                <span className="text-slate-600 text-xs">to</span>
                                <Input
                                    type="date"
                                    value={auditEndDate}
                                    onChange={e => setAuditEndDate(e.target.value)}
                                    className="h-7 w-36 bg-black/20 border-white/10 text-white text-xs"
                                />
                                <Button
                                    size="sm"
                                    className="h-7 px-3 text-xs bg-cyan-600 hover:bg-cyan-500 text-white"
                                    onClick={() => loadAuditPage(0, { start: auditStartDate, end: auditEndDate, event: auditEventFilter })}
                                >
                                    Apply
                                </Button>
                                {(auditStartDate || auditEndDate || auditEventFilter) && (
                                    <button
                                        className="text-xs text-slate-500 hover:text-slate-300"
                                        onClick={() => {
                                            setAuditStartDate('')
                                            setAuditEndDate('')
                                            setAuditEventFilter('')
                                            loadAuditPage(0, { start: '', end: '', event: '' })
                                        }}
                                    >
                                        ✕ Clear
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingAudit ? (
                                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>
                            ) : (
                                <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10 text-left">
                                                <th className="pb-3 pr-4 text-slate-400 font-medium">Timestamp</th>
                                                <th className="pb-3 pr-4 text-slate-400 font-medium">Employee</th>
                                                <th className="pb-3 pr-4 text-slate-400 font-medium">Module</th>
                                                <th className="pb-3 pr-4 text-slate-400 font-medium">Event</th>
                                                <th className="pb-3 text-slate-400 font-medium">Detail</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditLog.map((entry: any) => {
                                                const eventBadge: Record<string, { label: string; color: string }> = {
                                                    slide_viewed:       { label: 'Slide Viewed',       color: '#6366f1' },
                                                    quiz_started:       { label: 'Quiz Started',       color: '#f59e0b' },
                                                    quiz_completed:     { label: 'Quiz Completed',     color: '#22c55e' },
                                                    attestation_signed: { label: 'Attestation Signed', color: '#a855f7' },
                                                }
                                                const badge = eventBadge[entry.eventType] ?? { label: entry.eventType, color: '#64748b' }
                                                return (
                                                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                                                        <td className="py-2.5 pr-4 text-slate-400 whitespace-nowrap text-xs">
                                                            {new Date(entry.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                                        </td>
                                                        <td className="py-2.5 pr-4">
                                                            <div className="text-white text-xs font-medium truncate max-w-[140px]">{entry.userName}</div>
                                                            <div className="text-slate-500 text-xs truncate max-w-[140px]">{entry.userEmail}</div>
                                                        </td>
                                                        <td className="py-2.5 pr-4 text-slate-300 text-xs truncate max-w-[160px]">{entry.moduleTitle}</td>
                                                        <td className="py-2.5 pr-4">
                                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: badge.color + '33', color: badge.color, border: `1px solid ${badge.color}44` }}>
                                                                {badge.label}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 text-slate-400 text-xs">
                                                            {entry.eventType === 'quiz_completed' && entry.metadata?.score != null
                                                                ? `Score: ${entry.metadata.score}% — ${entry.metadata.passed ? '✅ Passed' : '❌ Failed'}`
                                                                : entry.eventType === 'slide_viewed' && entry.slideTitle
                                                                    ? entry.slideTitle
                                                                    : '—'}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                            {auditLog.length === 0 && (
                                                <tr><td colSpan={5} className="py-12 text-center text-slate-500">No events found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                    <span className="text-xs text-slate-500">
                                        Page {auditPage + 1} — showing {auditLog.length} records
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm" variant="outline"
                                            className="border-white/10 text-slate-300 hover:text-white text-xs h-7"
                                            disabled={auditPage === 0 || loadingAudit}
                                            onClick={() => loadAuditPage(auditPage - 1)}
                                        >
                                            ← Prev
                                        </Button>
                                        <Button
                                            size="sm" variant="outline"
                                            className="border-white/10 text-slate-300 hover:text-white text-xs h-7"
                                            disabled={!auditHasMore || loadingAudit}
                                            onClick={() => loadAuditPage(auditPage + 1)}
                                        >
                                            Next →
                                        </Button>
                                    </div>
                                </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    </PlanGate>
                </TabsContent>

                {/* REPORTS TAB */}
                <TabsContent value="reports" className="space-y-6">
                    {/* Bulk Certificate Download — corporate+ */}
                    <PlanGate required="corporate" tierOverride={planTier} expiredOverride={planExpired}>
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Download className="w-5 h-5 text-green-400" />
                                Bulk Certificate Export
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Select a module to view all completion certificates and download a consolidated PDF.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <select
                                    value={bulkCertModuleId}
                                    onChange={e => { setBulkCertModuleId(e.target.value); setBulkCerts([]) }}
                                    className="bg-black/30 border border-white/10 text-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                >
                                    <option value="">Select a module…</option>
                                    {orgModules.filter((m: any) => m.isAssigned).map((m: any) => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                                <Button
                                    disabled={!bulkCertModuleId || loadingBulkCerts}
                                    onClick={async () => {
                                        setLoadingBulkCerts(true)
                                        const data = await getBulkCertificates(bulkCertModuleId)
                                        setBulkCerts(data ?? [])
                                        setLoadingBulkCerts(false)
                                    }}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-sm"
                                >
                                    {loadingBulkCerts ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                                    Fetch Completions
                                </Button>
                            </div>

                            {bulkCerts.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <span className="text-sm text-slate-400">{bulkCerts.length} employee{bulkCerts.length !== 1 ? 's' : ''} completed this module</span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-white/10 text-slate-300 hover:text-white text-xs"
                                                onClick={() => {
                                                    const headers = ['Name', 'Email', 'Score', 'Completed Date', 'Attestation', 'Certificate ID']
                                                    const rows = bulkCerts.map((c: any) => [
                                                        c.userName,
                                                        c.userEmail,
                                                        `${c.quizScore ?? ''}%`,
                                                        c.completedAt ? new Date(c.completedAt).toLocaleDateString('en-IN') : '',
                                                        c.attestationAccepted ? 'Signed' : 'Pending',
                                                        c.certificateId ?? '',
                                                    ])
                                                    // RFC-4180 escaping (double inner quotes) + UTF-8 BOM so Excel
                                                    // renders ₹, names and commas correctly.
                                                    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
                                                    const csv = '﻿' + [headers, ...rows].map(r => r.map(esc).join(',')).join('\r\n')
                                                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
                                                    const url = URL.createObjectURL(blob)
                                                    const a = document.createElement('a')
                                                    a.href = url
                                                    a.download = `certificates-export.csv`
                                                    a.click()
                                                    URL.revokeObjectURL(url)
                                                }}
                                            >
                                                <Download className="w-3 h-3 mr-1" />
                                                Export CSV
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-500 text-white text-xs"
                                                onClick={() => {
                                                    bulkCerts.forEach((cert: any, i: number) => {
                                                        setTimeout(() => {
                                                            window.open(`/certificate/${cert.moduleId}?uid=${cert.userId}`, '_blank')
                                                        }, i * 350)
                                                    })
                                                }}
                                            >
                                                <Download className="w-3 h-3 mr-1" />
                                                Open All Certs ({bulkCerts.length})
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto rounded-lg border border-white/10">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-white/10 bg-white/5">
                                                    <th className="p-3 text-left text-slate-400 font-medium">Employee</th>
                                                    <th className="p-3 text-left text-slate-400 font-medium">Score</th>
                                                    <th className="p-3 text-left text-slate-400 font-medium">Completed</th>
                                                    <th className="p-3 text-left text-slate-400 font-medium">Attestation</th>
                                                    <th className="p-3 text-left text-slate-400 font-medium">Certificate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bulkCerts.map((cert: any) => (
                                                    <tr key={cert.userId} className="border-b border-white/5 hover:bg-white/[0.03]">
                                                        <td className="p-3">
                                                            <div className="text-white text-sm font-medium">{cert.userName}</div>
                                                            <div className="text-slate-500 text-xs">{cert.userEmail}</div>
                                                        </td>
                                                        <td className="p-3 text-slate-300">{cert.quizScore ?? '—'}%</td>
                                                        <td className="p-3 text-slate-300 text-xs">
                                                            {cert.completedAt ? new Date(cert.completedAt).toLocaleDateString('en-IN') : '—'}
                                                        </td>
                                                        <td className="p-3">
                                                            {cert.attestationAccepted
                                                                ? <span className="flex items-center gap-1 text-green-400 text-xs"><ShieldCheck className="w-3.5 h-3.5" /> Signed</span>
                                                                : <span className="text-slate-500 text-xs">Pending</span>}
                                                        </td>
                                                        <td className="p-3">
                                                            <a
                                                                href={`/certificate/${cert.moduleId}?uid=${cert.userId}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-purple-400 hover:text-purple-300 text-xs underline"
                                                            >
                                                                View
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    </PlanGate>

                    <ComplianceCharts />
                </TabsContent>

                {/* QUESTIONS TAB */}
                <TabsContent value="questions" className="space-y-6">
                    <Card className="bg-[#151A29]/80 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <BookOpen className="w-5 h-5 text-purple-400" />
                                Question Manager
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Assign questions to slide checkpoints so learners see relevant refresher questions after every 3 slides.
                                Questions set to <strong className="text-slate-300">Final Quiz Only</strong> appear only at the end. Questions assigned to a checkpoint appear as a mid-module knowledge check and are excluded from the final quiz.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Module selector */}
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-slate-400 shrink-0">Select module:</label>
                                <select
                                    value={questionModuleId}
                                    onChange={async (e) => {
                                        const mid = e.target.value
                                        setQuestionModuleId(mid)
                                        setQuestionsList([])
                                        if (!mid) return
                                        setLoadingQuestions(true)
                                        const qs = await getAdminModuleQuestions(mid)
                                        setQuestionsList(qs)
                                        setLoadingQuestions(false)
                                    }}
                                    className="flex-1 max-w-sm text-sm bg-black/30 border border-white/10 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                >
                                    <option value="">— Pick a module —</option>
                                    {orgModules.map((m: any) => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                                {loadingQuestions && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                            </div>

                            {/* Checkpoint legend */}
                            {questionModuleId && !loadingQuestions && (
                                <div className="flex flex-wrap gap-3 text-xs">
                                    {[
                                        { label: 'Final Quiz Only', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
                                        { label: 'After slides 1–3', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
                                        { label: 'After slides 4–6', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                                        { label: 'After slides 7–9', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                                        { label: 'After slides 10–12', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
                                    ].map(({ label, color }) => (
                                        <span key={label} className={`px-2 py-1 rounded-full border ${color}`}>{label}</span>
                                    ))}
                                </div>
                            )}

                            {/* Question list */}
                            {questionsList.length > 0 && (
                                <div className="rounded-md border border-white/10 overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white/5 text-slate-300 font-medium">
                                            <tr>
                                                <th className="p-4">#</th>
                                                <th className="p-4">Question</th>
                                                <th className="p-4 text-center">Answers</th>
                                                <th className="p-4">Checkpoint assignment</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {questionsList.map((q, idx) => {
                                                const groupColors: Record<number, string> = {
                                                    1: 'text-cyan-300',
                                                    2: 'text-purple-300',
                                                    3: 'text-amber-300',
                                                    4: 'text-green-300',
                                                }
                                                return (
                                                    <tr key={q.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="p-4 text-slate-500 tabular-nums">{idx + 1}</td>
                                                        <td className="p-4 text-white max-w-lg">
                                                            <span className="line-clamp-2">{q.text}</span>
                                                        </td>
                                                        <td className="p-4 text-center text-slate-400">{q.answer_count}</td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                {updatingQuestionGroup === q.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                                                ) : (
                                                                    <select
                                                                        value={q.slide_group ?? ''}
                                                                        onChange={async (e) => {
                                                                            const raw = e.target.value
                                                                            const val = raw === '' ? null : parseInt(raw, 10)
                                                                            setUpdatingQuestionGroup(q.id)
                                                                            const res = await updateQuestionSlideGroup(q.id, val)
                                                                            if (res.success) {
                                                                                setQuestionsList(prev => prev.map(x =>
                                                                                    x.id === q.id ? { ...x, slide_group: val } : x
                                                                                ))
                                                                                toast.success('Saved')
                                                                            } else {
                                                                                toast.error('Failed to save')
                                                                            }
                                                                            setUpdatingQuestionGroup(null)
                                                                        }}
                                                                        className={`text-xs bg-black/30 border border-white/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 ${q.slide_group ? groupColors[q.slide_group] ?? 'text-slate-300' : 'text-slate-400'}`}
                                                                    >
                                                                        <option value="">Final Quiz Only</option>
                                                                        <option value="1">After slides 1–3</option>
                                                                        <option value="2">After slides 4–6</option>
                                                                        <option value="3">After slides 7–9</option>
                                                                        <option value="4">After slides 10–12</option>
                                                                    </select>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {questionModuleId && !loadingQuestions && questionsList.length === 0 && (
                                <p className="text-slate-500 text-sm text-center py-8">No questions found for this module.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div >
    )
}
