"use client";

import { useState, useEffect } from "react";
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { config } from "@/lib/wallet/config";
import { SwapCard } from "@/components/defi/swap-card";
import { StakingCard } from "@/components/defi/staking-card";
import { useWalletStore } from "@/stores/use-wallet-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { formatValue } from "@/lib/utils";
import { NetworkIcon } from "@/components/network-icon";

export default function DeFiPage() {
    const { ready } = usePrivy();
    const { wallets } = useWallets();
    const { fetchBalances, balances, totalBalance } = useWalletStore();
    const [activeWallet, setActiveWallet] = useState<ConnectedWallet | undefined>();

    useEffect(() => {
        if (!ready || !wallets.length) return;

        const privyWallet = wallets.find(w => w.walletClientType === "privy");
        setActiveWallet(privyWallet);

        if (privyWallet?.address) {
            fetchBalances(privyWallet.address);
        }
    }, [ready, wallets, fetchBalances]);

    return (
        <div className="container mx-auto px-4 max-w-4xl">
            {/*Balance Card*/}
            <Card className="mb-4">
                <CardContent className="pt-6">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="holdings">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                    <span className="font-libre italic text-lg">Current Holdings</span>
                                    <span className="hidden lg:block font-semibold">{formatValue(totalBalance || 0)}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-4">
                                    {config.chains.map((chain) => (
                                        <div key={chain.id} className="space-y-2">
                                            <div className="flex items-center gap-2 px-2">
                                                <NetworkIcon chain={chain.name} className="h-5 w-5" />
                                                <span className="font-semibold text-sm">{chain.name}</span>
                                            </div>
                                            <div className="space-y-1">
                                                {balances[chain.name]?.map((token) => (
                                                    <div
                                                        key={token.contractAddress}
                                                        className="flex justify-between items-center py-2 px-4 rounded-lg hover:bg-secondary/50"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm">{token.symbol}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-sm">
                                                                {formatValue(Number(token.value))}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {Number(token.balance).toFixed(4)} {token.symbol}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {/*Defi Hub*/}
            <Tabs defaultValue="swap" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="swap">Swap</TabsTrigger>
                    <TabsTrigger value="stake">Stake</TabsTrigger>
                </TabsList>

                <TabsContent value="swap">
                    <SwapCard wallet={activeWallet} chains={config.chains} />
                </TabsContent>

                <TabsContent value="stake">
                    <StakingCard wallet={activeWallet} chains={config.chains} />
                </TabsContent>
            </Tabs>
        </div>
    );
} 