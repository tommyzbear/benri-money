"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import Image from "next/image";
import { Contact } from "@/types/search";
import { parseEther } from 'viem';
import { useWallets } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";

const steps = ['Select Type', 'Select Network', 'Enter Amount', 'Confirm'];

type SendOption = "crypto" | "cash" | null;
type Chain = "Base Sepolia" | "Arbitrum Sepolia" | "Arbitrum Goerli" | "Sepolia" | "Optimism Sepolia" | null;

export function SendMoneyDialog({
    open,
    onOpenChange,
    selectedContact,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedContact: Contact | null;
}) {
    const [activeStep, setActiveStep] = useState(0);
    const [sendOption, setSendOption] = useState<SendOption>(null);
    const [selectedChain, setSelectedChain] = useState<Chain>(null);
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { wallets } = useWallets();
    const { toast } = useToast();

    const handleNext = () => {
        if (activeStep === 0 && sendOption === "cash") {
            handleReset();
            return;
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setSendOption(null);
        setSelectedChain(null);
        setAmount("");
        onOpenChange(false);
    };

    const handleSubmit = () => {
        handleNext();
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        if (!selectedContact?.wallet || !amount || !wallets || wallets.length === 0) {
            console.error("Missing required transaction details");
            toast({
                variant: "destructive",
                title: "Error",
                description: "Missing required transaction details. Please check all fields.",
            });
            setIsLoading(false);
            return;
        }

        const wallet = wallets[0];
        const provider = await wallet.getEthereumProvider();
        const transactionRequest = {
            to: selectedContact.wallet,
            value: parseEther(amount),
        };

        try {
            const result = await provider.request({
                method: 'eth_sendTransaction',
                params: [transactionRequest],
            });

            console.log("Transaction sent:", result);
            toast({
                title: "Success",
                description: "Transaction sent successfully!",
            });
            handleReset();
        } catch (error) {
            console.error("Transaction failed:", error);
            toast({
                variant: "destructive",
                title: "Transaction Failed",
                description: "Failed to send transaction. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant={sendOption === "crypto" ? "secondary" : "outline"}
                                className="h-32 flex flex-col items-center justify-center space-y-2"
                                onClick={() => {
                                    setSendOption("crypto");
                                    handleNext();
                                }}
                            >
                                <Wallet className="h-8 w-8" />
                                <span>Send crypto</span>
                                <span className="text-sm text-muted-foreground">DeFi</span>
                            </Button>
                            <Button
                                variant={sendOption === "cash" ? "secondary" : "outline"}
                                className="h-32 flex flex-col items-center justify-center space-y-2"
                                onClick={() => {
                                    setSendOption("cash");
                                    handleNext();
                                }}
                            >
                                <CreditCard className="h-8 w-8" />
                                <span>Send cash</span>
                                <span className="text-sm text-muted-foreground">TradFi</span>
                            </Button>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-3">
                            {["Base Sepolia", "Arbitrum Sepolia", "Arbitrum Goerli", "Sepolia", "Optimism Sepolia"].map((chain) => (
                                <Button
                                    key={chain}
                                    variant={selectedChain === chain ? "secondary" : "outline"}
                                    className="w-full justify-between h-16 relative"
                                    onClick={() => {
                                        setSelectedChain(chain as Chain);
                                        handleNext();
                                    }}
                                >
                                    <div className="flex items-center space-x-3">
                                        {chain === "Base Sepolia" && (
                                            <Image
                                                src="/icons/base-logo.svg"
                                                alt="Base Network Logo"
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        )}
                                        {(chain === "Arbitrum Sepolia" || chain === "Arbitrum Goerli") && (
                                            <Image
                                                src="/icons/arbitrum-arb-logo.svg"
                                                alt="Arbitrum Network Logo"
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        )}
                                        {chain === "Sepolia" && (
                                            <Image
                                                src="/icons/ethereum-eth-logo.svg"
                                                alt="Ethereum Network Logo"
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                        )}
                                        {chain === "Optimism Sepolia" && (
                                            <Image
                                                src="/icons/optimism-ethereum-op-logo.svg"
                                                alt="Optimism Network Logo"
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        )}
                                        <div className="text-left">
                                            <div className="font-medium">{chain}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {chain === "Ethereum" ? "~3 minutes" :
                                                    chain === "Base" ? "~17 sec" :
                                                        chain === "Solana" ? "~36 sec" :
                                                            chain === "Algorand" ? "~19 sec" :
                                                                "~4 minutes"}
                                            </div>
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 py-4">
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="text-4xl w-full bg-transparent border-none focus:outline-none text-center"
                                />
                                <p className="text-center text-sm text-muted-foreground">
                                    {selectedChain === "Base Sepolia" ? "ETH" :
                                        selectedChain === "Arbitrum Sepolia" ? "ETH" :
                                            selectedChain === "Arbitrum Goerli" ? "ETH" :
                                                selectedChain === "Sepolia" ? "ETH" :
                                                    selectedChain === "Optimism Sepolia" ? "ETH" :
                                                        "ETH"}
                                </p>
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleSubmit}
                                disabled={!amount}
                            >
                                Preview
                            </Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                            <h3 className="font-medium">Transaction Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type:</span>
                                    <span className="font-medium">{sendOption}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Network:</span>
                                    <span className="font-medium">{selectedChain}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">{amount} ETH</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Recipient:</span>
                                    <span className="font-medium">{selectedContact?.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Wallet:</span>
                                    <span className="font-medium truncate ml-4">
                                        {selectedContact?.wallet ?
                                            `${selectedContact.wallet.slice(0, 6)}...${selectedContact.wallet.slice(-4)}` :
                                            ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Confirming...' : 'Confirm Transaction'}
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl">
                <Box sx={{ width: '100%' }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
                {renderStepContent()}
                {activeStep > 0 && (
                    <Button variant="outline" onClick={handleBack} className="w-full">
                        Back
                    </Button>
                )}
            </DialogContent>
        </Dialog>
    );
} 