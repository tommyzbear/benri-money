import { privyClient } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const cookieStore = cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        if (!cookieAuthToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

        if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase
            .from('friends')
            .select(`
                friend:friend_id(
                    id,
                    email:email(address),
                    wallet:wallet(address)
                )
            `)
            .eq('account_id', claims.userId);

        if (error) {
            console.error('Error fetching friends:', error);
            return NextResponse.json({ error: 'Error fetching friends' }, { status: 500 });
        }

        // Transform the data to match the expected format
        const friends = data.map(({ friend }) => ({
            id: friend.id,
            email: friend.email[0]?.address,
            wallet: friend.wallet[0]?.address,
            isFriend: true
        }));

        return NextResponse.json({ data: friends });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        if (!cookieAuthToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

        if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { friendId } = await request.json();

        if (!friendId) {
            return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('friends')
            .insert({
                account_id: claims.userId,
                friend_id: friendId,
            });

        if (error) {
            console.error('Error adding friend:', error);
            return NextResponse.json({ error: 'Error adding friend' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 