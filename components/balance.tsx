"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Wallet, Banknote, Eye, EyeClosed } from "lucide-react";
import { useEffect, useState } from "react";
import { SendMoneyDialog } from "./dialogs/send-money-dialog";
import { useFundWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { SelectFriendDialog } from "./dialogs/select-friend-dialog";
import { Contact } from "@/types/data";
import { Skeleton } from "./ui/skeleton";
import { useWalletStore } from "@/stores/use-wallet-store";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useBalanceVisibilityStore } from "@/stores/use-balance-visibility-store";
import { formatValue } from "@/lib/utils";
import { TokenData } from "@/app/services/alchemy";
import { DepositDialog } from "./dialogs/deposit-dialog";
import { NetworkIcon } from "./network-icon";

const balancesSum = (balances: TokenData[]) => {
    return balances.reduce((acc, balance) => acc + Number(balance.value), 0);
}

export function Balance() {
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [selectFriendDialogOpen, setSelectFriendDialogOpen] = useState(false);
    const [depositDialogOpen, setDepositDialogOpen] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);
    const [privyWalletAddress, setPrivyWalletAddress] = useState<string | undefined>(undefined);
    const [selectedFriend, setSelectedFriend] = useState<Contact | null>(null);
    const { wallets, ready } = useWallets();
    const { fundWallet } = useFundWallet();
    const { balances, isLoading, error, totalBalance } = useWalletStore();
    const { toast } = useToast();
    const { showBalances, toggleBalances } = useBalanceVisibilityStore();

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
            setPrivyWalletAddress(wallets.find((wallet) => wallet.walletClientType === "privy")?.address);
        }
    }, [ready, wallets]);

    useEffect(() => {
        if (error) {
            toast({
                title: "Failed to fetch wallet balances",
                description: error,
                variant: "destructive",
            });
        }
    }, [error, toast]);

    const handleFriendSelect = (friend: Contact) => {
        setSelectedFriend(friend);
        setSendDialogOpen(true);
    };

    if (!ready || isLoading || error) {
        return <BalanceSkeleton />;
    }

    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Balances</h2>
                {!showBalances ? (
                    <EyeClosed onClick={toggleBalances} />
                ) : (
                    <Eye onClick={toggleBalances} />
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Fiat Balance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between space-x-4 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100"
                    >
                        <div className="p-2 bg-primary rounded-full">
                            <Banknote className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                            <p className="text-2xl font-bold">
                                {showBalances ? formatValue(totalBalance?.toString() ?? "0") : "••••••"}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setDepositDialogOpen(true)}>
                            Top Up
                        </Button>
                    </motion.div>

                    {/* Web3 Balance */}
                    <AnimatePresence>
                        {Object.entries(balances).map(([chain, balances], index) => (
                            <motion.div
                                key={`${chain}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between space-x-4 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100"
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    <NetworkIcon chain={chain} className="w-10 h-10" />
                                </div>

                                <div className="flex-1 flex flex-col justify-center" key={chain}>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {chain} Wallet
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {showBalances ? formatValue(balancesSum(balances).toString() ?? "0") : "••••••"}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <Button
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 
                                 hover:to-primary/60 rounded-xl h-12 text-lg font-medium shadow-lg 
                                 hover:shadow-xl transition-all duration-200"
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

            <DepositDialog
                open={depositDialogOpen}
                onOpenChange={setDepositDialogOpen}
                redirectUrl={redirectUrl}
                fundWallet={() => fundWallet(privyWalletAddress ?? "")}
            />
        </Card>
    );
}

const BalanceSkeleton = () => {
    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-32 mb-1" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            {i === 1 && <Skeleton className="h-9 w-20" />}
                        </div>
                    ))}
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </CardContent>
        </Card>
    );
}