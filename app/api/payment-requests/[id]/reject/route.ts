import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { privyClient } from "@/lib/privy";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        if (!cookieAuthToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

        if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Update the payment request to rejected status
        const { error } = await supabase
            .from('payment_requests')
            .update({
                rejected: true,
            })
            .eq('id', params.id)
            .eq('payee', claims.userId); // Ensure the user is the one being requested

        if (error) {
            console.error('Error rejecting payment request:', error);
            return NextResponse.json({ error: 'Failed to reject payment request' }, { status: 500 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Payment request rejection error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 