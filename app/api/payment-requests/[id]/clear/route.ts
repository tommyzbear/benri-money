import { privyClient } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
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