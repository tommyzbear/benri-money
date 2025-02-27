import { privy } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const claims = await privy.getClaims();

        const { searchParams } = new URL(request.url);
        const friendId = searchParams.get('friendId');

        if (!friendId) {
            return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('friends')
            .select('*')
            .eq('account_id', friendId)
            .eq('friend_id', claims.userId)
            .single();

        if (error) {
            console.error('Error verifying friend:', error);
            return NextResponse.json(
                { error: 'Failed to verify friend status' },
                { status: 500 }
            );
        }

        return NextResponse.json({ isFriend: !!data });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 