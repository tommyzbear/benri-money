"use client";

import { useState, useEffect, useCallback } from "react";
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { config } from "@/lib/wallet/config";
import { SwapCard } from "@/components/defi/swap-card";
import { StakingCard } from "@/components/defi/staking-card";
import { BalanceCard } from "@/components/defi/balance-card";
import { useWalletStore } from "@/stores/use-wallet-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TokenDeposits } from "@/components/defi/token-deposits";

export default function DeFiPage() {
    const { ready } = usePrivy();
    const { wallets } = useWallets();
    const { fetchBalances, balances, totalBalance } = useWalletStore();
    const [activeWallet, setActiveWallet] = useState<ConnectedWallet | undefined>();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Function to refresh data (balances and deposits)
    const refreshData = useCallback(() => {
        // Increment refresh trigger to force effects to run
        setRefreshTrigger((prev) => prev + 1);

        // Refresh wallet balances
        if (activeWallet?.address) {
            fetchBalances(activeWallet.address);
        }
    }, [activeWallet, fetchBalances]);

    useEffect(() => {
        if (!ready || !wallets.length) return;

        const privyWallet = wallets.find((w) => w.walletClientType === "privy");
        setActiveWallet(privyWallet);

        if (privyWallet?.address) {
            fetchBalances(privyWallet.address);
        }
    }, [ready, wallets, fetchBalances]);

    return (
        <div
            className={cn(
                "container mx-auto p-0 max-w-4xl mb-12",
                "h-[calc(100vh-16rem)] md:h-auto overflow-y-auto",
                "rounded-3xl md:rounded-none"
            )}
        >
            <div className="flex flex-col md:flex-row gap-4">
                <BalanceCard
                    chains={config.chains}
                    balances={balances}
                    totalBalance={totalBalance}
                    className="flex-1"
                />

                <Tabs defaultValue="swap" className="flex-1">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="swap">Swap</TabsTrigger>
                        <TabsTrigger value="stake">Stake</TabsTrigger>
                    </TabsList>

                    <TabsContent value="swap">
                        <SwapCard
                            wallet={activeWallet}
                            chains={config.chains}
                            onTransactionSuccess={refreshData}
                        />
                    </TabsContent>

                    <TabsContent value="stake">
                        <StakingCard
                            wallet={activeWallet}
                            chains={config.chains}
                            onTransactionSuccess={refreshData}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            <div className="mt-8">
                <TokenDeposits
                    wallet={activeWallet}
                    chains={config.chains}
                    refreshTrigger={refreshTrigger}
                    onTransactionSuccess={refreshData}
                />
            </div>
        </div>
    );
}
