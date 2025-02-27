import { privy } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const claims = await privy.getClaims();

        const { data, error } = await supabase
            .from('payment_requests')
            .update({ cleared: true })
            .eq('id', params.id)
            .eq('payee', claims.userId)
            .select()
            .single();

        if (error) {
            console.error('Error clearing request:', error);
            return NextResponse.json(
                { error: 'Failed to clear request' },
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