import { privyClient } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Message } from "@/types/data";

export async function GET(request: Request) {
    try {
        const cookieStore = cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        if (!cookieAuthToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

        if (!claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const sender = searchParams.get("sender");
        const receiver = searchParams.get("receiver");

        if (!sender || !receiver) {
            return NextResponse.json(
                { error: "Sender and receiver parameters are required" },
                { status: 400 }
            );
        }

        const { data: messages, error } = await supabase
            .from("messages")
            .select("*")
            .or(`and(sender.eq.${sender},receiver.eq.${receiver}),and(sender.eq.${receiver},receiver.eq.${sender})`)
            .order("sent_at", { ascending: true });

        if (error) {
            console.error("Error fetching messages:", error);
            return NextResponse.json(
                { error: "Failed to fetch messages" },
                { status: 500 }
            );
        }

        return NextResponse.json({ messages });

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const cookieAuthToken = cookieStore.get("privy-token");

        if (!cookieAuthToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

        if (!claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const message: Omit<Message, "id" | "sent_at"> = await request.json();

        // Verify that the sender matches the authenticated user
        if (message.sender !== claims.userId) {
            return NextResponse.json({ error: "Unauthorized sender" }, { status: 403 });
        }

        const { data: newMessage, error } = await supabase
            .from("messages")
            .insert({
                content: message.content,
                sender: message.sender,
                receiver: message.receiver,
                amount: message.amount.toString(10), // Convert BigInt to string for database
                message_type: message.message_type,
            })
            .select()
            .single();

        if (error) {
            console.error("Error inserting message:", error);
            return NextResponse.json(
                { error: "Failed to save message" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: newMessage });

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
