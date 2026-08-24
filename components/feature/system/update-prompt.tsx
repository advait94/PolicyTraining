'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { isStale, type DeploymentStamp } from '@/lib/deployment'

/** How often an open tab asks whether it is still running the current build. */
const POLL_MS = 3 * 60 * 1000

/**
 * Tells a browser running a superseded bundle to reload.
 *
 * `loaded` is baked into the page when it is served; /api/version reports
 * whichever deployment is live right now. A mismatch means this tab has been
 * left behind by a deploy and is executing code that has since been replaced.
 *
 * Deliberately a prompt rather than an automatic reload: quiz answers live in
 * component state, so reloading unasked would wipe a part-finished attempt and
 * silently restart someone at question one.
 */
export function UpdatePrompt({ loaded }: { loaded: DeploymentStamp }) {
    const [stale, setStale] = useState(false)
    // Read inside the polling callback without making it a dependency, so the
    // interval is installed once rather than torn down and rebuilt on each change.
    const staleRef = useRef(false)

    const check = useCallback(async () => {
        if (staleRef.current) return
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return

        try {
            const res = await fetch('/api/version', { cache: 'no-store' })
            if (!res.ok) return

            const live: DeploymentStamp = await res.json()
            if (!live?.id || !isStale(loaded, live)) return

            staleRef.current = true
            setStale(true)
        } catch {
            // Offline, mid-deploy, or a transient failure — just try again later.
        }
    }, [loaded])

    useEffect(() => {
        if (loaded.source === 'development') return

        const interval = setInterval(check, POLL_MS)
        // Returning to a tab that has been in the background for a while is the
        // most likely moment for it to be out of date, so check then too.
        document.addEventListener('visibilitychange', check)

        return () => {
            clearInterval(interval)
            document.removeEventListener('visibilitychange', check)
        }
    }, [loaded.source, check])

    if (!stale) return null

    return (
        <div
            role="status"
            className="fixed bottom-0 left-0 right-0 z-[200] bg-cyan-600 text-white py-2.5 px-4 shadow-lg
                       flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm"
        >
            <span className="font-medium">
                This page is running an older version of the training.
            </span>
            <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/15 hover:bg-white/25
                           px-3 py-1 font-semibold transition-colors cursor-pointer"
            >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh now
            </button>
            <span className="opacity-80 text-xs">
                A quiz in progress will start again from the first question.
            </span>
        </div>
    )
}
