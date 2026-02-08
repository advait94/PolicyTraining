import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/auth/claim-invite
 * 
 * Retrieves a magic link from the safe_link_tokens table.
 * This endpoint requires a POST request to prevent scanners from consuming tokens.
 * 
 * Body: { tokenId: string }
 * Returns: { success: true, magicLink: string } or { error: string }
 */
export async function POST(request: NextRequest) {
    try {
        const { tokenId } = await request.json()

        if (!tokenId) {
            return NextResponse.json(
                { error: 'Missing token ID' },
                { status: 400 }
            )
        }

        // Use service role to access the safe_link_tokens table
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Fetch the token
        const { data: token, error: fetchError } = await supabase
            .from('safe_link_tokens')
            .select('*')
            .eq('id', tokenId)
            .single()

        if (fetchError || !token) {
            return NextResponse.json(
                { error: 'Invalid or expired invitation link' },
                { status: 404 }
            )
        }

        // Check if already used
        if (token.used) {
            return NextResponse.json(
                { error: 'This invitation link has already been used' },
                { status: 410 }
            )
        }

        // Check if expired
        const expiresAt = new Date(token.expires_at)
        if (expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'This invitation link has expired' },
                { status: 410 }
            )
        }

        // Mark as used
        await supabase
            .from('safe_link_tokens')
            .update({ used: true })
            .eq('id', tokenId)

        // Return the magic link
        return NextResponse.json({
            success: true,
            magicLink: token.magic_link
        })

    } catch (error: any) {
        console.error('[claim-invite] Error:', error)
        return NextResponse.json(
            { error: 'An error occurred processing your request' },
            { status: 500 }
        )
    }
}
