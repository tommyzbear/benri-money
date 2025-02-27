import { NextResponse } from 'next/server'
import { odosClient } from '@/services/odos'
import { privy } from '@/lib/privy';

export async function POST(request: Request) {
    try {
        await privy.getClaims();

        const body = await request.json()
        const { chainId, inputToken, outputToken, userAddr } = body

        // Input validation
        if (!chainId || !inputToken || !outputToken || !userAddr) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        const quote = await odosClient.getQuote(
            chainId,
            [inputToken],
            [outputToken],
            userAddr,
            1
        )

        if (!quote) {
            return NextResponse.json(
                { error: 'Failed to get quote' },
                { status: 500 }
            )
        }

        return NextResponse.json(quote)
    } catch (error) {
        console.error('Error in quote endpoint:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
