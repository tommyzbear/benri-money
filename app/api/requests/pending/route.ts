import { privyClient } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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

        const { data, error } = await supabase
            .from('payment_requests')
            .select(`
                *,
                requester:account!payment_requests_requester_fkey (
                    id,
                    wallet:wallet!account_id (
                        address,
                        type,
                        chain_type
                    )
                )
            `)
            .eq('payee', claims.userId)
            .eq('cleared', false);

        if (error) {
            console.error('Error fetching pending requests:', error);
            return NextResponse.json(
                { error: 'Failed to fetch pending requests' },
                { status: 500 }
            );
        }

        // Transform the data to include the requester's wallet address
        const transformedData = data.map(request => {
            return {
                ...request,
                requester: request.requester.id,
                requester_wallet: request.requester.wallet[0].address
            };
        });

        return NextResponse.json({ data: transformedData });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 