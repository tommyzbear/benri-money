import { privy } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { PaymentRequest } from "@/types/data";

export async function POST(request: Request) {
    try {
        const claims = await privy.getClaims();

        const body = (await request.json()) as Omit<PaymentRequest, "id" | "requested_at" | "cleared" | "amount"> & { amount: string };

        const { data: friendData, error: friendError } = await supabase
            .from("friends")
            .select("*")
            .eq("account_id", body.payee)
            .eq("friend_id", claims.userId)
            .single();

        if (friendError || !friendData) {
            return NextResponse.json({ error: 'You must be friends with the payee to request money.' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('payment_requests')
            .insert({
                requester: claims.userId,
                payee: body.payee,
                chain_id: body.chain_id,
                chain: body.chain,
                transaction_type: body.transaction_type,
                amount: body.amount,
                token_name: body.token_name,
                token_address: body.token_address,
                decimals: body.decimals,
            })
            .select()
            .single();

        const { error: messageError } = await supabase
            .from("messages")
            .insert({
                sender: claims.userId,
                receiver: body.payee,
                amount: body.amount,
                message_type: "request",
                payment_request_id: data.id,
            });

        if (error || messageError) {
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