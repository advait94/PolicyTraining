// Per-organization limits shared between the server actions that enforce them
// and the admin UI that reflects them. The server is the source of truth — the
// UI uses these only to disable controls and show remaining capacity early.

export const MAX_ADMINS_PER_ORG = 3

// Roles an admin may assign from the dashboard. Mirrors the users_role_check
// constraint (see supabase/migrations/20260510000021_add_manager_role.sql).
export const ASSIGNABLE_ROLES = ['learner', 'manager', 'admin'] as const

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]

export function isAssignableRole(role: string): role is AssignableRole {
    return (ASSIGNABLE_ROLES as readonly string[]).includes(role)
}
