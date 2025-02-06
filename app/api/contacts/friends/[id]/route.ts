import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { privyClient } from "@/lib/privy";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        if (!cookieAuthToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

        if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await supabase
            .from('friends')
            .delete()
            .eq('account_id', claims.userId)
            .eq('friend_id', params.id);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Friend removal error", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 