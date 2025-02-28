import { privy } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const claims = await privy.getClaims();

        const { data, error } = await supabase
            .from("friends")
            .select(
                `
                friend:friend_id(
                    id,
                    username,
                    profile_img,
                    email:email(address),
                    wallet:wallet(address)
                )
            `
            )
            .eq("account_id", claims.userId)
            .returns<
                {
                    friend: {
                        id: string;
                        username: string;
                        profile_img: string | null;
                        email: Array<{ address: string }>;
                        wallet: Array<{ address: string }>;
                    };
                }[]
            >();

        if (error) {
            console.error("Error fetching friends:", error);
            return NextResponse.json({ error: "Error fetching friends" }, { status: 500 });
        }

        const { data: addedUserAsFriend, error: addedUserAsFriendError } = await supabase
            .from("friends")
            .select('*')
            .eq("friend_id", claims.userId);

        if (addedUserAsFriendError) {
            console.error("Error fetching friends:", addedUserAsFriendError);
            return NextResponse.json({ error: "Error fetching friends" }, { status: 500 });
        }

        // Transform the data to match the expected format
        const friends = data.map(({ friend }) => ({
            id: friend.id,
            username: friend.username,
            profileImg: friend.profile_img,
            email: friend.email[0]?.address,
            wallet: friend.wallet[0]?.address,
            isFriend: true,
            beFriended: addedUserAsFriend.some((f) => f.account_id === friend.id),
        }));

        return NextResponse.json({ data: friends });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const claims = await privy.getClaims();

        if (!claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { friendId } = await request.json();

        if (!friendId) {
            return NextResponse.json({ error: "Friend ID is required" }, { status: 400 });
        }

        const { error } = await supabase.from("friends").insert({
            account_id: claims.userId,
            friend_id: friendId,
        });

        if (error) {
            console.error("Error adding friend:", error);
            return NextResponse.json({ error: "Error adding friend" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
