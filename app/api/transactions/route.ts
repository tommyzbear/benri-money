import { privyClient } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TransactionHistory } from "@/types/data";

export async function POST(request: Request) {
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

        const transaction: Omit<TransactionHistory, "id" | "amount" | "created_at"> & { amount: string } = await request.json();

        const { data, error } = await supabase
            .from('transaction_history')
            .insert({
                from_account_id: transaction.from_account_id,
                to_account_id: transaction.to_account_id,
                from_address: transaction.from_address,
                to_address: transaction.to_address,
                amount: transaction.amount, // Convert BigInt to string for storage
                token_address: transaction.token_address,
                tx: transaction.tx,
                transaction_type: transaction.transaction_type,
                chain_id: transaction.chain_id,
                chain: transaction.chain,
                token_name: transaction.token_name
            })
            .select()
            .single();

        if (error) {
            console.error('Error inserting transaction:', error);
            return NextResponse.json(
                { error: 'Failed to save transaction' },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error processing transaction:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
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
            .from('transaction_history')
            .select('*')
            .or(`from_account_id.eq.${claims.userId},to_account_id.eq.${claims.userId}`)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching transactions:', error);
            return NextResponse.json(
                { error: 'Failed to fetch transactions' },
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