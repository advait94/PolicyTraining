import { NextResponse } from 'next/server'
import { getDeploymentStamp } from '@/lib/deployment'

// Must always report the deployment answering *now*, never a cached value from
// the deployment the caller is trying to detect it has fallen behind.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    return NextResponse.json(
        getDeploymentStamp(),
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
}
