import { privy } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export interface Contact {
    id: string;
    email?: string;
    wallet?: string;
    isFriend?: boolean;
    username: string;
    profileImg: string | null;
}

export async function GET(request: Request) {
    try {
        const claims = await privy.getClaims();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json({ data: [] });
        }

        let data: Contact[] = [];

        if (query.toLowerCase().startsWith("0x")) {
            const { data: walletMatches, error: walletError } = await supabase
                .from("account")
                .select(
                    `
                    id,
                    username,
                    profile_img,
                    wallet:wallet!inner(address),
                    email:email!inner(address)
                `
                )
                .neq("id", claims.userId)
                .ilike("wallet.address", `${query}%`)
                .limit(10);

            if (walletError) {
                console.error("Error searching accounts:", walletError);
                return NextResponse.json({ error: "Error searching accounts" }, { status: 500 });
            }

            data = walletMatches?.map((account) => ({
                id: account.id,
                email: account.email[0]?.address,
                wallet: account.wallet[0]?.address,
                username: account.username,
                profileImg: account.profile_img,
                isFriend: false,
            }));
        }

        const { data: emailMatches, error: emailError } = await supabase
            .from("account")
            .select(
                `
                id,
                username,
                profile_img,
                wallet:wallet!inner(address),
                email:email!inner(address)
            `
            )
            .neq("id", claims.userId)
            .ilike("email.address", `${query}%`)
            .limit(10);

        if (emailError) {
            console.error("Error searching accounts:", emailError);
            return NextResponse.json({ error: "Error searching accounts" }, { status: 500 });
        }

        const emailData = emailMatches?.map((account) => ({
            id: account.id,
            email: account.email[0]?.address,
            wallet: account.wallet[0]?.address,
            username: account.username,
            profileImg: account.profile_img,
            isFriend: false,
        }));

        data = [...data, ...emailData.filter((item) => !data.some((d) => d.id === item.id))];

        const { data: friends, error: friendsError } = await supabase
            .from("friends")
            .select("friend_id")
            .eq("account_id", claims.userId)
            .in(
                "friend_id",
                data.map((item) => item.id)
            );

        data = data.map((item) => ({
            ...item,
            isFriend: friends?.some((friend) => friend.friend_id === item.id),
        }));

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
