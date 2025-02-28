"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/data";
import { base, Chain } from "viem/chains";
import { dialogSlideUp, fadeIn } from "@/lib/animations";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWalletStore } from "@/stores/use-wallet-store";
import { TokenData } from "@/services/alchemy";
import { parseUnits } from "viem";
import { config } from "@/lib/wallet/config";

export function RequestMoneyDialog({
    open,
    onOpenChange,
    selectedContact,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedContact: Contact | null;
}) {
    const [step, setStep] = useState(0);
    const [selectedChain, setSelectedChain] = useState<Chain>(base);
    const [amount, setAmount] = useState<string>("");
    const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = usePrivy();
    const { toast } = useToast();
    const { balances } = useWalletStore();

    const handleSubmit = async () => {
        if (!amount || !selectedToken) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter an amount and select a token",
            });
            return;
        }
        setStep(1);
    };

    const handleConfirm = async () => {
        if (!selectedContact || !selectedChain || !amount || !user || !selectedToken) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Missing required transaction details",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/payment-requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: parseUnits(amount, selectedToken.decimals).toString(),
                    requester: user.id,
                    payee: selectedContact.id,
                    chain_id: selectedChain.id,
                    chain: selectedChain.name,
                    token_name: selectedToken.symbol,
                    token_address: selectedToken.contractAddress || "0x0000000000000000000000000000000000000000",
                    transaction_type: "wallet",
                    decimals: selectedToken.decimals,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create payment request");
            }

            toast({
                title: "Success",
                description: "Payment request sent successfully!",
            });
            handleReset();
        } catch (error) {
            console.error("Failed to create payment request:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create payment request. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setStep(0);
        setAmount("");
        onOpenChange(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            handleReset();
        }
        onOpenChange(newOpen);
    };

    const renderStepContent = () => {
        const noBalances = !balances[selectedChain.name] || balances[selectedChain.name].length === 0;

        switch (step) {
            case 0:
                return (
                    <div className="space-y-4 py-4">
                        {noBalances ? (
                            <div className="p-4 bg-slate-50 rounded-lg text-center">
                                <p className="text-muted-foreground mb-2">
                                    No tokens available on {selectedChain.name}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="text-4xl w-full bg-transparent border-none focus:outline-none text-center"
                                    />

                                    <div className="mt-2">
                                        <Select
                                            value={selectedToken?.contractAddress || (selectedToken?.symbol ? `native-${selectedToken.symbol}` : "")}
                                            onValueChange={(value) => {
                                                const token = balances[selectedChain.name]?.find(
                                                    t => t.contractAddress === value ||
                                                        (t.contractAddress === "" && value === `native-${t.symbol}`)
                                                );
                                                if (token) {
                                                    setSelectedToken(token);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select token" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {balances[selectedChain.name]?.map((token) => (
                                                    <SelectItem
                                                        key={token.contractAddress || `native-${token.symbol}`}
                                                        value={token.contractAddress || `native-${token.symbol}`}
                                                    >
                                                        <div className="flex justify-between w-full">
                                                            <span>{token.symbol}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={handleSubmit}
                                    disabled={!amount || !selectedToken}
                                >
                                    Preview
                                </Button>
                            </div>
                        )}
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                            <h3 className="font-medium">Request Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Network:</span>
                                    <span className="font-medium">{selectedChain.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Token:</span>
                                    <span className="font-medium">{selectedToken?.symbol}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">
                                        {amount} {selectedToken?.symbol}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">From:</span>
                                    <span className="font-medium">{selectedContact?.email}</span>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full" onClick={handleConfirm} disabled={isLoading}>
                            {isLoading ? "Confirming..." : "Confirm Request"}
                        </Button>
                    </div>
                );
        }
    };

    return (
        <AnimatePresence mode="wait">
            {open && (
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <motion.div
                        className="fixed inset-0 bg-black/40 z-50"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={fadeIn}
                    />
                    <DialogContent className="sm:max-w-md rounded-3xl border-none bg-gradient-to-b from-white to-slate-50/95 backdrop-blur-sm">
                        <motion.div
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={dialogSlideUp}
                        >
                            <DialogHeader className="text-left p-4">
                                <div className="flex justify-between items-center">
                                    <DialogTitle>Request Money</DialogTitle>

                                    <Select
                                        value={selectedChain.id.toString()}
                                        onValueChange={(value) => {
                                            const chain = config.chains.find(c => c.id.toString() === value);
                                            if (chain) {
                                                setSelectedChain(chain);
                                                setSelectedToken(balances[chain.name].find(t => t.symbol === "USDC") || null);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-auto min-w-[120px] h-8 px-3 text-sm bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Select network">
                                                {selectedChain.name}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {config.chains.map((chain) => (
                                                <SelectItem
                                                    key={chain.id}
                                                    value={chain.id.toString()}
                                                    className="text-sm"
                                                >
                                                    {chain.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </DialogHeader>

                            {renderStepContent()}

                            {step > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(0)}
                                        className="w-full mt-4"
                                    >
                                        Back
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
