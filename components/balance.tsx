"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Wallet, Banknote } from "lucide-react";
import { useEffect, useState } from "react";
import { SendMoneyDialog } from "./dialogs/send-money-dialog";
import { useWallets } from "@privy-io/react-auth";
import { SelectFriendDialog } from "./dialogs/select-friend-dialog";
import { Contact } from "@/types/search";
import { Skeleton } from "./ui/skeleton";
import { useWalletStore } from "@/stores/use-wallet-store";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@radix-ui/react-separator";

export function Balance() {
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [selectFriendDialogOpen, setSelectFriendDialogOpen] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<Contact | null>(null);
    const { wallets, ready } = useWallets();
    const { balances, isLoading, error, fetchBalances } = useWalletStore();
    const { toast } = useToast();

    useEffect(() => {
        if (wallets.length > 0) {
            fetchBalances(wallets[0].address);
        }
    }, [wallets, fetchBalances]);

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
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Fiat Balance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start space-x-4 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100"
                    >
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
                    </motion.div>

                    {/* Web3 Balance */}
                    <AnimatePresence>
                        {Object.entries(balances).map(([chain, balances], index) => (
                            <motion.div
                                key={chain}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start space-x-4 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100"
                            >
                                <div className="p-2 bg-purple-100 rounded-full">
                                    <Wallet className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1" key={chain}>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {chain} Wallet
                                    </p>
                                    {balances.map((balance, index) => (
                                        <>
                                            <p className="text-2xl font-bold" key={index}>
                                                {Number(balance.formatted).toFixed(4)} {balance.symbol}
                                            </p>
                                        </>
                                    ))}
                                    <p className="text-sm text-muted-foreground">Available</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
                                 hover:to-indigo-700 rounded-xl h-12 text-lg font-medium shadow-lg 
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