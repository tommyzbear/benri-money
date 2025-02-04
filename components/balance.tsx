"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Wallet, Banknote } from "lucide-react";
import { useEffect, useState } from "react";
import { SendMoneyDialog } from "./dialogs/send-money-dialog";
import { useWallets } from "@privy-io/react-auth";
import { getBalance, GetBalanceReturnType } from '@wagmi/core'
import { config } from "@/lib/wallet/config";
import { Chain } from "@wagmi/core/chains";
import { SelectFriendDialog } from "./dialogs/select-friend-dialog";
import { Contact } from "@/types/search";
import { Skeleton } from "./ui/skeleton";

type Balance = {
    chain: Chain
    balance: GetBalanceReturnType
}

export function Balance() {
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [selectFriendDialogOpen, setSelectFriendDialogOpen] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<Contact | null>(null);
    const { wallets, ready } = useWallets()
    const [balances, setBalances] = useState<Balance[]>([])

    useEffect(() => {
        const getWalletBalance = async () => {
            if (wallets.length > 0) {
                const wallet = wallets[0]
                const balances = await Promise.all(config.chains.map((chain) =>
                    getBalance(config, {
                        address: wallet.address as `0x${string}`,
                        chainId: chain.id
                    })
                ))

                const balancesWithChain = config.chains.map((chain, index) => ({
                    chain,
                    balance: balances[index]
                }))

                setBalances(balancesWithChain)
            }
        }
        getWalletBalance()
    }, [wallets])

    const handleFriendSelect = (friend: Contact) => {
        setSelectedFriend(friend);
        setSendDialogOpen(true);
    };

    if (!ready) {
        return (
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-xl font-semibold">Balances</h2>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Fiat Balance Skeleton */}
                        <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-32 mb-1" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-9 w-20" />
                        </div>

                        {/* Web3 Balance Skeleton */}
                        <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-32 mb-1" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>

                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Balances</h2>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Fiat Balance */}
                    <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Banknote className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">Bank Account</p>
                            <p className="text-2xl font-bold">£1,234.56</p>
                            <p className="text-sm text-muted-foreground">Available</p>
                        </div>
                        <Button variant="outline" size="sm">
                            Top Up
                        </Button>
                    </div>

                    {/* Web3 Balance */}
                    <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-full">
                            <Wallet className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">Web3 Wallet</p>
                            {balances.map((b, index) => (
                                <div key={index}>
                                    <p className="text-2xl font-bold">
                                        {Number(b.balance.formatted).toFixed(4)} {b.balance.symbol}
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        on {b.chain.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        className="w-full bg-[#1546a3]"
                        onClick={() => setSelectFriendDialogOpen(true)}
                    >
                        Send Money
                    </Button>
                </div>
            </CardContent>

            <SelectFriendDialog
                open={selectFriendDialogOpen}
                onOpenChange={setSelectFriendDialogOpen}
                onFriendSelect={handleFriendSelect}
            />

            <SendMoneyDialog
                open={sendDialogOpen}
                onOpenChange={setSendDialogOpen}
                selectedContact={selectedFriend}
            />
        </Card>
    );
} 