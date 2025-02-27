"use client";

import { CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { User } from "@privy-io/react-auth";

import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionsStore } from "@/stores/use-transactions-store";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { TransactionCard } from "@/components/transaction-card";
import { format } from "date-fns";
import { ProfileImgMask } from "@/components/profile/profile-img-mask";
import { TransactionHistory } from "@/types/data";
import { cn } from "@/lib/utils";

type TransactionGroup = {
    date: string;
    transactions: TransactionHistory[];
};

// New component for the date header
const DateHeader = ({ date }: { date: string }) => (
    <div className="px-5 py-0.5 text-sm text-secondary-foreground bg-tertiary border-0 sticky top-0 z-10">
        <h4 className="text-base font-libre italic">
            {date === new Date().toDateString()
                ? `today, ${format(new Date(date), "MMM d").toLowerCase()}`
                : format(new Date(date), "EEE, MMM d").toLowerCase()}
        </h4>
    </div>
);

// New component for transaction group
const TransactionGroup = ({
    group,
    groupIndex,
    user,
}: {
    group: TransactionGroup;
    groupIndex: number;
    user: User;
}) => (
    <div key={group.date} className="relative">
        <DateHeader date={group.date} />
        {group.transactions.map((tx, index) => (
            <TransactionCard
                key={tx.tx}
                tx={tx}
                userId={user?.id}
                index={groupIndex * group.transactions.length + index}
            />
        ))}
    </div>
);

export function RecentActivity() {
    const { user, ready } = usePrivy();
    const { toast } = useToast();
    const { transactions, isLoading, error, fetchTransactions } = useTransactionsStore();

    // Simple grouping function
    const groupedTransactions = transactions.reduce<TransactionGroup[]>((groups, tx) => {
        const date = new Date(tx.created_at).toDateString();
        const existingGroup = groups.find((group) => group.date === date);

        if (existingGroup) {
            existingGroup.transactions.push(tx);
        } else {
            groups.push({ date, transactions: [tx] });
        }

        return groups;
    }, []);

    const RecentActivitySkeleton = () => (
        <div className="">
            <Skeleton className="h-6 w-full rounded-none" />
            <div className="space-y-8 p-6">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex items-center gap-5">
                        <div className="relative">
                            <div className="h-12 w-12">
                                <ProfileImgMask fill="#e5e7eb" className="antialiased" />
                            </div>
                            <Skeleton className="absolute top-1/2 -translate-y-1/2 -left-2 h-5 w-5 rounded-full" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-48" />
                                <div className="h-4 flex justify-between items-center gap-2">
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
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
        <div
            className={cn(
                "flex flex-col gap-0 bg-background rounded-3xl",
                "p-0 overflow-hidden min-h-[calc(100vh-40rem)] bg-white"
            )}
        >
            <div className="pl-5 pt-2 pb-1 m-0 bg-chart-4">
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
                                {groupedTransactions.map(
                                    (group, index) =>
                                        user && (
                                            <TransactionGroup
                                                key={group.date}
                                                group={group}
                                                groupIndex={index}
                                                user={user}
                                            />
                                        )
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                )}
            </CardContent>
        </div>
    );
}
