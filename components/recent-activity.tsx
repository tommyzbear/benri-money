"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { usePrivy } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { formatEther } from "viem";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionsStore } from "@/stores/use-transactions-store";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export function RecentActivity() {
    const { user, ready } = usePrivy();
    const { toast } = useToast();
    const { transactions, isLoading, error, fetchTransactions } = useTransactionsStore();

    useEffect(() => {
        if (!ready) return;
        fetchTransactions();
    }, [ready, fetchTransactions]);

    useEffect(() => {
        const channel = supabase
            .channel("transaction_history")
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "transaction_history",
                filter: `to_account_id=eq.${user?.id}`
            }, (payload) => {
                toast({
                    title: "Received payment",
                    description: "You have received a payment",
                });
                fetchTransactions();
            })
            .subscribe();
        return () => {
            channel.unsubscribe();
        }
    }, [supabase, user?.id, fetchTransactions]);

    useEffect(() => {
        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load recent activity. Please try again.",
            });
        }
    }, [error, toast]);

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (!ready || isLoading) {
        return <RecentActivitySkeleton />;
    }

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-semibold">Recent Activity</h2>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                            No recent transactions
                        </div>
                    ) : (
                        <AnimatePresence>
                            {transactions.map((tx, index) => (
                                <motion.div
                                    key={tx.tx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 bg-gradient-to-br 
                                             from-slate-50 to-white rounded-xl border border-slate-100"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {tx.from_account_id === user?.id ? 'Sent' : 'Received'}{' '}
                                            {formatEther(BigInt(tx.amount))} {tx.token_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {tx.from_account_id === user?.id
                                                ? `To: ${formatAddress(tx.to_address)}`
                                                : `From: ${formatAddress(tx.from_address)}`}
                                        </p>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <span>{tx.chain}</span>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                    <a
                                        href={tx.chain === "Base Sepolia"
                                            ? `https://sepolia.basescan.org/tx/${tx.tx}`
                                            : `https://sepolia.etherscan.io/tx/${tx.tx}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        View
                                    </a>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function RecentActivitySkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div className="space-y-1">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-32" />
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 