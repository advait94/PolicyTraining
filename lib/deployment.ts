/**
 * Identifies the deployment that produced the code currently running.
 *
 * Used to spot browsers still running a superseded bundle. A training session
 * can stay open for half an hour — slides, then the quiz — so a deploy landing
 * mid-session leaves that tab executing the old JavaScript until it reloads.
 * That is how a quiz completion arrived with a 150% score twelve minutes after
 * the double-counting fix had already shipped.
 *
 * The stamp carries `source` alongside the id because the two sides of the
 * comparison are read at different moments: one is baked into the page at build
 * time, the other is read by /api/version at request time. If an environment
 * exposed the commit SHA to only one of those, the ids would differ for reasons
 * having nothing to do with staleness and every client would be told, forever,
 * that it was out of date. Callers must therefore compare ids only when the
 * sources match — a mismatch means "cannot tell", never "stale".
 */
export type DeploymentSource = 'git-sha' | 'deployment-id' | 'development'

export type DeploymentStamp = {
    id: string
    source: DeploymentSource
}

export function getDeploymentStamp(): DeploymentStamp {
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
        return { id: process.env.VERCEL_GIT_COMMIT_SHA, source: 'git-sha' }
    }
    if (process.env.VERCEL_DEPLOYMENT_ID) {
        return { id: process.env.VERCEL_DEPLOYMENT_ID, source: 'deployment-id' }
    }
    return { id: 'development', source: 'development' }
}

/**
 * True only when both stamps describe the same kind of identifier, that
 * identifier is a real deployment, and they disagree.
 */
export function isStale(loaded: DeploymentStamp, live: DeploymentStamp): boolean {
    if (loaded.source !== live.source) return false
    if (loaded.source === 'development') return false
    return loaded.id !== live.id
}
