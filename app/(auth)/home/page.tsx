"use client";
import { RecentActivity } from "@/components/recent-activity";
import { useEffect } from "react";
import { useWalletStore } from "@/stores/use-wallet-store";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Balance } from "@/components/balance";
import { useTransactionsStore } from "@/stores/use-transactions-store";

export default function HomePage() {
    const { ready } = usePrivy();
    const { wallets, ready: walletsReady } = useWallets();
    const { totalBalance, fetchBalances } = useWalletStore();
    const { fetchTransactions } = useTransactionsStore();

    useEffect(() => {
        if (!ready) return;

        fetchTransactions();
    }, [ready, fetchTransactions]);

    useEffect(() => {
        if (!walletsReady) return;
        if (totalBalance === undefined) {
            fetchBalances(wallets.find((wallet) => wallet.walletClientType === "privy")?.address ?? wallets[0].address);
        }
    }, [fetchBalances, wallets, walletsReady, totalBalance]);

    return (
        <div className="flex flex-row lg:mx-auto lg:max-w-7xl">
            <div className="flex-1 lg:max-w-xl mx-auto hidden lg:block">
                <Balance />
            </div>
            <div className="flex-1 lg:max-w-xl mx-auto">
                <RecentActivity />
            </div>
        </div>
    );
}
