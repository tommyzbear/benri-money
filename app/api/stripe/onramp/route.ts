import { privyClient } from "@/lib/privy";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { OnrampSessionResource, stripe } from "@/app/services/stripe";

export async function POST(request: Request) {
    const forwarded = request.headers.get('x-forwarded-for');
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

        const req = await request.json();
        const { transaction_details } = req;

        // Create an OnrampSession with the order amount and currency
        const onrampSession = await new OnrampSessionResource(stripe).create({
            transaction_details: {
                destination_currency: transaction_details["destination_currency"],
                destination_exchange_amount: transaction_details["destination_exchange_amount"],
                destination_network: transaction_details["destination_network"],
            },
            customer_ip_address: forwarded ? forwarded.split(',')[0].trim() : req.connection.remoteAddress,
        });

        return NextResponse.json({ onrampSession });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 