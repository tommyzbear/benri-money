"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PaymentRequest } from "@/types/data";
import { formatEther } from "viem";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { baseSepolia, sepolia } from "viem/chains";
import { useTransactionsStore } from "@/stores/use-transactions-store";
import { usePaymentRequestsStore } from "@/stores/use-payment-requests-store";

export default function PaymentRequestPage() {
    const params = useParams();
    const { user, ready } = usePrivy();
    const { toast } = useToast();
    const router = useRouter();
    const [request, setRequest] = useState<PaymentRequest & { requester_name: string; requester_img: string, requester_wallet: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const { wallets } = useWallets();
    const { addTransaction } = useTransactionsStore();
    const { clearRequest } = usePaymentRequestsStore();
    useEffect(() => {
        if (!ready) return;

        const fetchRequest = async () => {
            try {
                const response = await fetch(`/api/payment-requests/${params.id}`);
                if (!response.ok) throw new Error('Failed to fetch request');
                const { data } = await response.json();
                setRequest(data);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load payment request, please make sure you have the correct link",
                });
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequest();
    }, [params.id, ready, toast]);

    const handlePay = async () => {
        if (!user || wallets.length === 0) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No wallet connected",
            });
            return;
        }

        if (!request?.requester_wallet) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Requester wallet address not found",
            });
            return;
        }

        const wallet = wallets[0];
        setIsLoading(true);

        try {
            if (request.chain === "Base Sepolia") {
                await wallet.switchChain(baseSepolia.id);
            } else if (request.chain === "Sepolia") {
                await wallet.switchChain(sepolia.id);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Unsupported chain",
                });
                setIsLoading(false);
                return;
            }

            const provider = await wallet.getEthereumProvider();
            const transactionRequest = {
                to: request.requester_wallet,
                value: request.amount,
            };

            const result = await provider.request({
                method: 'eth_sendTransaction',
                params: [transactionRequest],
            });

            // Save transaction using the store
            await addTransaction({
                from_account_id: user.id,
                to_account_id: request.requester,
                from_address: wallet.address,
                to_address: request.requester_wallet,
                amount: request.amount.toString(),
                token_address: request.token_address,
                token_name: request.token_name,
                tx: result,
                transaction_type: "wallet",
                chain_id: request.chain_id,
                chain: request.chain
            });

            // Mark request as cleared
            await clearRequest(request.id);

            toast({
                title: "Success",
                description: `Payment sent successfully!\ntx: ${result}`,
            });
            router.push('/');
        } catch (error) {
            console.error("Transaction failed:", error);
            toast({
                variant: "destructive",
                title: "Transaction Failed",
                description: typeof error === 'object' && error !== null && 'message' in error
                    ? String(error.message)
                    : "Failed to send transaction. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Payment request not found
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Payment Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="text-4xl font-bold">
                            {formatEther(request.amount)} {request.token_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            on {request.chain}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg bg-slate-50 p-4">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                {request.requester_img ? (
                                    <Image
                                        src={request.requester_img}
                                        alt="Requester"
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <span className="text-xl font-semibold text-blue-600">
                                        {request.requester_name?.[0]?.toUpperCase() || 'A'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-medium">{request.requester_name || 'Anonymous'}</p>
                                <p className="text-sm text-muted-foreground">Requested payment</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handlePay}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Pay Now'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
} 