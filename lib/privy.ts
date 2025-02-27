import { PrivyClient } from "@privy-io/server-auth";
import { cookies } from "next/headers";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    throw new Error("Missing Privy environment variables");
}

const privyClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

const getClaims = async () => {
    const cookieStore = await cookies();
    const cookieAuthToken = cookieStore.get("privy-token");

    if (!cookieAuthToken) {
        throw new Error('Unauthorized');
    }

    const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);

    if (!claims) {
        throw new Error('Unauthorized');
    }

    return claims;
}

const getUser = async () => {
    const claims = await getClaims();
    return await privyClient.getUser(claims.userId);
}

const verifyToken = async (token: string) => {
    return await privyClient.verifyAuthToken(token);
}

export const privy = {
    getClaims,
    getUser,
    verifyToken
}