"use client";
import { RecentActivity } from "@/components/recent-activity";
import { formatValue } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Textfit } from "react-textfit";
import { useEffect, useState } from "react";
import { useWalletStore } from "@/stores/use-wallet-store";
import { useWallets } from "@privy-io/react-auth";
import { Balance } from "@/components/balance";

export default function HomePage() {
    const [isTextScaled, setIsTextScaled] = useState(false);
    const { wallets, ready: walletsReady } = useWallets();
    const { totalBalance, fetchBalances } = useWalletStore();

    useEffect(() => {
        if (!walletsReady) return;
        fetchBalances(wallets.find((wallet) => wallet.walletClientType === "privy")?.address ?? wallets[0].address);
    }, [fetchBalances, wallets, walletsReady]);

    return (
        <div className="flex flex-row min-h-screen lg:mx-auto">
            <div className="flex-1 lg:max-w-2xl mx-auto hidden lg:block">
                <Balance />
            </div>
            <div className="flex-1 lg:max-w-2xl mx-auto">
                <RecentActivity />
            </div>
        </div>
    );
}
