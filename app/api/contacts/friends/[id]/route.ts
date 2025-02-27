import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { privy } from "@/lib/privy";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const claims = await privy.getClaims();

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