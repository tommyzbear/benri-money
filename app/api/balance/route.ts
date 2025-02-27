import {
    getWalletTokens,
    getTokenPrices,
    getEthBalanceTokenData,
    TokenData,
    literalChainToAlchemyChain,
} from "@/services/alchemy";
import { privy } from "@/lib/privy";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        await privy.getClaims();

        const { searchParams } = new URL(request.url);
        const address = searchParams.get("address");
        const chain = searchParams.get("chain");

        if (!address || !chain) {
            return NextResponse.json(
                { error: "Wallet address and chain are required" },
                { status: 400 }
            );
        }

        const [walletTokens, ethBalance] = await Promise.all([
            getWalletTokens(address, literalChainToAlchemyChain[chain]),
            getEthBalanceTokenData(address, literalChainToAlchemyChain[chain]),
        ]);

        const prices = await getTokenPrices(
            walletTokens.map((t) => t.contractAddress),
            literalChainToAlchemyChain[chain]
        );

        const tokenData = walletTokens
            .map((token) => {
                const price = prices.find((p) => p.address === token.contractAddress)?.price || 0;
                if (price === 0) return null;
                const balance = Number(token.balance) / token.divisor;
                const value = balance * price;

                return {
                    contractAddress: token.contractAddress,
                    symbol: token.symbol,
                    balance: balance.toString(),
                    price: price.toString(),
                    value: value.toString(),
                    logo: token.logo,
                    decimals: token.decimals,
                } as TokenData;
            })
            .filter((t) => t !== null);

        return NextResponse.json({
            tokens: [...tokenData, ethBalance],
        });
    } catch (error) {
        console.error("Portfolio API error:", error);
        return NextResponse.json({ error: "Failed to fetch portfolio data" }, { status: 500 });
    }
}
