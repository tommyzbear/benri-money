"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DepositDialog } from "@/components/dialogs/deposit-dialog";
import { useState } from "react";
import { useFundWallet, useWallets } from "@privy-io/react-auth";

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
    }, []);

    useEffect(() => {
        if (ready && wallets.length > 0) {
            console.log(wallets);
            setPrivyWalletAddress(wallets.find((wallet) => wallet.walletClientType === "privy")?.address);
        }
    }, [ready, wallets]);

    return (
        <div className="flex flex-col">
            <DepositDialog
                open={depositDialogOpen}
                onOpenChange={setDepositDialogOpen}
                redirectUrl={redirectUrl}
                fundWallet={() => fundWallet(privyWalletAddress)}
            />

            <div className="flex flex-1 lg:flex-row lg:mx-auto lg:max-w-7xl lg:pb-8">
                <div className="flex flex-col flex-1 lg:max-w-3xl gap-2">
                    <div className="flex gap-2 h-56">
                        <Button
                            onClick={() => setDepositDialogOpen(true)}
                            className="flex flex-1 h-full border flex-col justify-center items-start text-left bg-primary rounded-4xl p-5 text-primary-foreground"
                        >
                            <h2 className="mt-[35%] text-2xl font-libre italic mb-2">deposit</h2>
                            <p className="text-muted-foreground text-roboto text-sm">
                                cash or cryptocurrencies
                            </p>
                        </Button>

                        <Link
                            href="/withdraw"
                            className="flex flex-1 h-full border flex-col justify-center items-start text-left bg-primary rounded-4xl p-5 text-primary-foreground"
                        >
                            <h2 className="mt-[35%] text-2xl font-libre italic mb-2">withdraw</h2>
                            <p className="text-muted-foreground text-roboto text-sm">
                                to your bank or crypto wallet
                            </p>
                        </Link>
                    </div>
                    <div className="flex gap-2 h-36">
                        <Link
                            href="/convert"
                            className="flex w-32 h-full border flex-col justify-center items-start text-left bg-secondary rounded-7xl p-5 text-secondary-foreground"
                        ></Link>
                        <Link
                            href="/convert"
                            className="flex flex-1 h-full border flex-col justify-center items-start text-left bg-secondary rounded-4xl p-5 text-secondary-foreground"
                        >
                            <h2 className="mt-[20%] text-2xl font-libre italic mb-2">convert</h2>
                            <p className="text-muted-foreground text-roboto text-sm">
                                between cash or cryptocurrencies
                            </p>
                        </Link>
                    </div>

                    {/* Bottom links */}
                    <div className="space-y-2 mt-6 bg-white text-secondary-foreground rounded-4xl">
                        <Link
                            href="/payment-details"
                            className="flex items-center justify-between mx-5 py-5 border-b border-secondary"
                        >
                            <span className="text-lg text-zinc-600">payment details</span>
                            <span className="text-xl">›</span>
                        </Link>

                        <Link href="/history" className="flex items-center justify-between p-5">
                            <span className="text-lg text-zinc-600">history</span>
                            <span className="text-xl">›</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
