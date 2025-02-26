"use client";

import { CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionsStore } from "@/stores/use-transactions-store";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { TransactionCard } from "@/components/transaction-card";
import { format } from "date-fns";
import { ProfileImgMask } from "@/components/profile/profile-img-mask";

export function RecentActivity() {
    const { user, ready } = usePrivy();
    const { toast } = useToast();
    const { transactions, isLoading, error, fetchTransactions } = useTransactionsStore();

    const RecentActivitySkeleton = () => (
        <div className="">
            <Skeleton className="h-6 w-full rounded-none" />
            <div className="space-y-6 p-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-6">
                        <div className="relative">
                            <div className="h-14 w-14">
                                <ProfileImgMask fill="#e5e7eb" className="antialiased" />
                            </div>
                            <Skeleton className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    useEffect(() => {
        const channel = supabase
            .channel("transaction_history")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "transaction_history",
                    filter: `to_account_id=eq.${user?.id}`,
                },
                () => {
                    toast({
                        title: "Received payment",
                        description: "You have received a payment",
                    });
                    fetchTransactions();
                }
            )
            .subscribe();
        return () => {
            channel.unsubscribe();
        };
    }, [user?.id, fetchTransactions, toast]);

    useEffect(() => {
        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load recent activity. Please try again.",
            });
        }
    }, [error, toast]);

    return (
        <div className="flex flex-col gap-0 bg-background rounded-3xl p-0 overflow-hidden min-h-[calc(100vh-40rem)] bg-white">
            <div className="pl-5 pt-2 pb-1 m-0 bg-primary">
                <h3 className="header-text text-primary-foreground">recently</h3>
            </div>
            <CardContent className="p-0 m-0 !border-0 overflow-y-auto max-h-[calc(100vh-10rem)] pb-60">
                {!ready || isLoading ? (
                    <RecentActivitySkeleton />
                ) : (
                    <div className="!border-0">
                        {transactions.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                No recent transactions
                            </div>
                        ) : (
                            <AnimatePresence>
                                {transactions.map((tx, index) => {
                                    const currentDate = new Date(tx.created_at).toDateString();
                                    const previousDate =
                                        index > 0
                                            ? new Date(
                                                transactions[index - 1].created_at
                                            ).toDateString()
                                            : null;

                                    const showDivider = currentDate !== previousDate;

                                    return (
                                        <div key={tx.tx}>
                                            {showDivider && (
                                                <div className="px-5 py-0.5 text-sm text-secondary-foreground bg-secondary border-0">
                                                    <h4 className="text-base font-libre italic">
                                                        {currentDate === new Date().toDateString()
                                                            ? `today, ${format(
                                                                new Date(currentDate),
                                                                "MMM d"
                                                            ).toLowerCase()}`
                                                            : format(
                                                                new Date(currentDate),
                                                                "EEE, MMM d"
                                                            ).toLowerCase()}
                                                    </h4>
                                                </div>
                                            )}
                                            <TransactionCard
                                                tx={tx}
                                                userId={user?.id}
                                                index={index}
                                            />
                                        </div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>
                )}
            </CardContent>
        </div>
    );
}
