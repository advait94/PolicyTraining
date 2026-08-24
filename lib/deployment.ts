/**
 * Identifies the deployment that produced the code currently running.
 *
 * Used to spot browsers still running a superseded bundle. A training session
 * can stay open for half an hour — slides, then the quiz — so a deploy landing
 * mid-session leaves that tab executing the old JavaScript until it reloads.
 * That is how a quiz completion arrived with a 150% score twelve minutes after
 * the double-counting fix had already shipped.
 *
 * The commit SHA is preferred over the deployment id because it is reliably
 * present both at build time (baked into the page the browser holds) and at
 * runtime (served by /api/version). Comparing the two is what reveals staleness,
 * so a value that is missing on one side would make every client look stale.
 *
 * Returns 'development' when neither is set, which disables the check locally.
 */
export function getDeploymentId(): string {
    return (
        process.env.VERCEL_GIT_COMMIT_SHA ||
        process.env.VERCEL_DEPLOYMENT_ID ||
        'development'
    )
}

export const DEV_DEPLOYMENT_ID = 'development'
