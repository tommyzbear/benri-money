import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { privy } from "@/lib/privy";

export async function GET() {
    try {
        const claims = await privy.getClaims();

        const { data: user, error } = await supabase
            .from('account')
            .select('*')
            .eq('id', claims.userId)
            .single();

        if (error) {
            console.error('Error fetching user:', error);
            return NextResponse.json(
                { error: 'Failed to fetch user' },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: user });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 