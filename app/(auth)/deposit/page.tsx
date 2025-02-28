"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DepositDialog } from "@/components/dialogs/deposit-dialog";
import { useState } from "react";
import { useFundWallet, useWallets } from "@privy-io/react-auth";
import { cn } from "@/lib/utils";

export default function DepositPage() {
    const [depositDialogOpen, setDepositDialogOpen] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);
    const { wallets, ready } = useWallets();
    const { fundWallet } = useFundWallet();
    const [privyWalletAddress, setPrivyWalletAddress] = useState<string | undefined>(undefined);

    useEffect(() => {
        const createOnrampSession = async () => {
            const respqonse = await fetch("/api/stripe/onramp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    transaction_details: {
                        destination_currency: "usdc",
                        destination_exchange_amount: "100",
                        destination_network: "polygon",
                        destination_wallet_address: privyWalletAddress,
                    },
                }),
            });
            const data = await respqonse.json();
            setRedirectUrl(data.onrampSession.redirect_url);
        };
        createOnrampSession();
    }, [privyWalletAddress]);

    useEffect(() => {
        if (ready && wallets.length > 0) {
            setPrivyWalletAddress(
                wallets.find((wallet) => wallet.walletClientType === "privy")?.address
            );
        }
    }, [ready, wallets]);

    return (
        <div className="flex flex-col w-full">
            <DepositDialog
                open={depositDialogOpen}
                onOpenChange={setDepositDialogOpen}
                redirectUrl={redirectUrl}
                fundWallet={() => fundWallet(privyWalletAddress ?? "")}
            />

            <div className="flex flex-1 max-w-full lg:flex-row lg:mx-auto lg:max-w-7xl lg:pb-8">
                <div className="flex flex-col flex-1 max-w-full lg:max-w-3xl gap-4">
                    <div className="flex gap-2 h-56">
                        <Button
                            onClick={() => setDepositDialogOpen(true)}
                            className={cn(
                                "flex flex-1 h-full bg-chart-2 flex-col",
                                "justify-center items-start text-left",
                                "rounded-4xl p-5 text-primary",
                                "shadow-primary max-w-full text-chart-2-foreground"
                            )}
                        >
                            <h2 className="mt-[35%] text-2xl font-libre italic mb-2l">deposit</h2>
                            <p className="text-muted-foreground text-roboto text-sm text-wrap">
                                cash or cryptocurrencies
                            </p>
                        </Button>

                        <Button
                            className={cn(
                                "flex flex-1 h-full bg-chart-1 flex-col",
                                "justify-center items-start text-left",
                                "rounded-4xl p-5 text-chart-1-foreground",
                                "shadow-primary max-w-full"
                            )}
                            disabled={true}
                        >
                            <h2 className="mt-[35%] text-2xl font-libre italic mb-2">withdraw</h2>
                            <p className="text-muted-foreground text-roboto text-sm text-wrap">
                                to your bank or crypto wallet (coming soon)
                            </p>
                        </Button>
                    </div>
                    <div className="flex gap-2 h-36">
                        {/* <Link
                            href="/convert"
                            className={cn(
                                "shadow-primary flex w-32 h-full",
                                " flex-col justify-center items-start text-left",
                                " bg-white rounded-7xl p-7 text-secondary-foreground"
                            )}
                        ></Link> */}

                        <Button
                            className={cn(
                                "flex flex-1 h-full flex-col justify-center",
                                "items-start text-left bg-secondary rounded-4xl",
                                "p-5 text-secondary-foreground shadow-primary"
                            )}
                            disabled={true}
                        >
                            <h2 className="mt-[10%] text-2xl font-libre italic mb-2">convert</h2>
                            <p className="text-muted-foreground text-roboto text-sm font-semibold">
                                cash or cryptocurrencies (coming soon)
                            </p>
                        </Button>
                    </div>

                    {/* Bottom links */}
                    <div className="space-y-2 mt-6 bg-white text-secondary-foreground rounded-4xl">
                        <Link
                            href=""
                            className="flex items-center justify-between mx-5 py-5 border-b border-secondary"
                        >
                            <span className="text-lg text-zinc-600">payment details (coming soon)</span>
                            <span className="text-xl">›</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
