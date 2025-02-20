"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentRequestWithWallet } from "@/types/data";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { baseSepolia, sepolia } from "@wagmi/core/chains";
import { useState } from "react";
import { usePaymentRequestsStore } from "@/stores/use-payment-requests-store";
import { useTransactionsStore } from "@/stores/use-transactions-store";
import { motion } from "framer-motion";
import { PaymentRequest } from "@/types/data";

interface NotificationsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requests: PaymentRequestWithWallet[];
}

export function NotificationsDialog({ open, onOpenChange, requests }: NotificationsDialogProps) {
    const { toast } = useToast();
    const { user } = usePrivy();
    const { wallets } = useWallets();
    const [isLoading, setIsLoading] = useState(false);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const { clearRequest, rejectRequest, fetchPendingRequests } = usePaymentRequestsStore();
    const { addTransaction } = useTransactionsStore();

    const handlePay = async (request: PaymentRequestWithWallet) => {
        if (!user || wallets.length === 0) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No wallet connected",
            });
            return;
        }

        if (!request.requester_wallet) {
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
                method: "eth_sendTransaction",
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
                chain: request.chain,
            });

            // Mark request as cleared
            await clearRequest(request.id);

            toast({
                title: "Success",
                description: `Payment sent successfully!\ntx: ${result}`,
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Transaction failed:", error);
            toast({
                variant: "destructive",
                title: "Transaction Failed",
                description:
                    typeof error === "object" && error !== null && "message" in error
                        ? String(error.message)
                        : "Failed to send transaction. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (request: PaymentRequest) => {
        setRejectingId(request.id);
        try {
            await rejectRequest(request.id);
            toast({
                title: "Success",
                description: "Payment request rejected",
            });
            await fetchPendingRequests();
        } catch (error) {
            console.error("Failed to reject request:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to reject request. Please try again.",
            });
        } finally {
            setRejectingId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl flex flex-col max-h-[80vh] p-0">
                <div className="px-6 py-4 border-b">
                    <DialogHeader>
                        <DialogTitle>Pending Payment Requests</DialogTitle>
                    </DialogHeader>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.id} className="p-4 bg-slate-50 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {(Number(request.amount) / 1e18).toFixed(4)}{" "}
                                            {request.token_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Requested{" "}
                                            {formatDistanceToNow(new Date(request.requested_at), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {request.chain === "Base Sepolia" ? (
                                            <Image
                                                src="/icons/base-logo.svg"
                                                alt="Base Network"
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <Image
                                                src="/icons/ethereum-eth-logo.svg"
                                                alt="Ethereum Network"
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                        )}
                                        <Button
                                            size="sm"
                                            onClick={() => handlePay(request)}
                                            disabled={isLoading}
                                        >
                                            Pay
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleReject(request)}
                                            disabled={isLoading || rejectingId === request.id}
                                        >
                                            {rejectingId === request.id ? (
                                                <motion.div
                                                    initial={{ scale: 1 }}
                                                    animate={{ scale: 0.8 }}
                                                    transition={{ repeat: Infinity, duration: 0.5 }}
                                                >
                                                    Rejecting...
                                                </motion.div>
                                            ) : (
                                                "Reject"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
