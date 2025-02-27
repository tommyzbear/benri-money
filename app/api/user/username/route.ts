import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { privy } from "@/lib/privy";

export async function PUT(request: Request) {
    try {
        const claims = await privy.getClaims();

        const { username } = await request.json();

        if (!username || username.trim().length === 0) {
            return NextResponse.json(
                { error: 'Username must be at least 1 character long' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('account')
            .update({ username })
            .eq('id', claims.userId);

        if (error) {
            console.error('Error updating username:', error);
            return NextResponse.json(
                { error: 'Failed to update username' },
                { status: 500 }
            );
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 