import { NextResponse } from 'next/server'
import { odosClient } from '@/app/services/odos'
import { privyClient } from '@/lib/privy';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        if (!cookieAuthToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

        if (!claims) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
