import { privyClient } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const cookieStore = cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        // If no cookie is found, skip any further checks
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

        // Transform the data to match the search results format
        const friends = data.map(({ friend }) => friend);

        return NextResponse.json({ data: friends });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 