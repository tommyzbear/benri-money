import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { privy } from "@/lib/privy";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const claims = await privy.getClaims();

        const { data, error } = await supabase
            .from('payment_requests')
            .select(`
                *,
                requester:account!payment_requests_requester_fkey (
                    username,
                    profile_img,
                    id,
                    wallet:wallet!account_id (
                        address,
                        type,
                        chain_type
                    )
                )
            `)
            .eq('id', params.id)
            .eq('payee', claims.userId)
            .single();

        if (error) {
            console.error('Error fetching payment request:', error);
            return NextResponse.json(
                { error: 'Failed to fetch payment request' },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Payment request not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            data: {
                ...data,
                requester_name: data.requester?.username,
                requester_img: data.requester?.profile_img,
                requester: data.requester.id,
                requester_wallet: data.requester.wallet[0].address
            }
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 