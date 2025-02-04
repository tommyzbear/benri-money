"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { TransactionHistory } from "@/types/data";
import { formatDistanceToNow } from "date-fns";
import { usePrivy } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { formatEther } from "viem";
import { Skeleton } from "@/components/ui/skeleton";

function RecentActivitySkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
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

export function RecentActivity() {
    const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, ready } = usePrivy();
    const { toast } = useToast();

    useEffect(() => {
        if (!ready) return;

        const fetchTransactions = async () => {
            try {
                const response = await fetch('/api/transactions');
                if (!response.ok) {
                    throw new Error('Failed to fetch transactions');
                }
                const { data } = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load recent activity. Please try again.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [ready, toast]);

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (!ready) {
        return <RecentActivitySkeleton />;
    }

    if (loading) {
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
                        transactions.map((tx) => (
                            <div
                                key={tx.tx}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
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
                                    href={tx.chain === "Base Sepolia" ? `https://sepolia.basescan.org/tx/${tx.tx}` : `https://sepolia.etherscan.io/tx/${tx.tx}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    View
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 