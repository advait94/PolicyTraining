/**
 * Server Actions invoked from the dashboard inherit this route's function
 * limits, and the page itself is a client component so it can't declare them.
 *
 * Bulk invite is the reason for the ceiling: the client sends the CSV in
 * chunks, but a chunk of a few hundred invites still runs for a while, and the
 * platform default would cut it off mid-run with no report of what landed.
 */
export const maxDuration = 300

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    return children
}
