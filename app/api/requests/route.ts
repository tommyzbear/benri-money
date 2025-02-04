import { privyClient } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PaymentRequest } from "@/types/data";

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

        const body = (await request.json()) as Omit<PaymentRequest, "id" | "requested_at" | "cleared" | "amount"> & { amount: string };

        const chainIds = {
            "Base Sepolia": 84532,
            "Sepolia": 11155111
        };

        const { data, error } = await supabase
            .from('payment_requests')
            .insert({
                requester: claims.userId,
                payee: body.payee,
                chain_id: body.chain_id,
                chain: body.chain,
                transaction_type: body.transaction_type,
                amount: body.amount.slice(0, -1).toString(),
                token_name: body.token_name,
                token_address: body.token_address,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating request:', error);
            return NextResponse.json(
                { error: 'Failed to create request' },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 