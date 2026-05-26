import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const MOBILE_UA_PATTERN = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    if (path !== '/mobile-blocked') {
        const ua = request.headers.get('user-agent') ?? ''
        if (MOBILE_UA_PATTERN.test(ua)) {
            return NextResponse.redirect(new URL('/mobile-blocked', request.url))
        }
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
