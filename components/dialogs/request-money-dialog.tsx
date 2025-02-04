"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import { Contact } from "@/types/search";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { sepolia } from "@wagmi/core/chains";
import { baseSepolia } from "@wagmi/core/chains";
import { parseEther } from "viem";
import { PaymentRequest } from "@/types/data";
interface RequestMoneyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedContact: Contact | null;
}

export function RequestMoneyDialog({ open, onOpenChange, selectedContact }: RequestMoneyDialogProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedChain, setSelectedChain] = useState<"Base Sepolia" | "Sepolia" | null>(null);
    const [amount, setAmount] = useState("");
    const { toast } = useToast();
    const { user } = usePrivy();

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = async () => {
        if (!selectedContact || !selectedChain || !amount || !user) {
            console.error("Missing required transaction details");
            toast({
                variant: "destructive",
                title: "Error",
                description: "Missing required transaction details. Please check all fields.",
            });
            return;
        };

        const chainId = selectedChain === "Base Sepolia" ? baseSepolia.id : sepolia.id;
        const chain = selectedChain === "Base Sepolia" ? "Base Sepolia" : "Sepolia";

        try {
            const request: Omit<PaymentRequest, "id" | "requested_at" | "cleared" | "amount" | "requester"> & { amount: string } = {
                transaction_type: "wallet",
                payee: selectedContact.id,
                chain_id: chainId,
                chain: selectedChain,
                amount: parseEther(amount).toString() + 'n',
                token_name: selectedChain === "Base Sepolia" ? "ETH" : "ETH",
                token_address: "0x0000000000000000000000000000000000000000"
            };

            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error('Failed to create request');
            }

            toast({
                title: "Success",
                description: "Request sent successfully",
            });

            onOpenChange(false);
            setActiveStep(0);
            setSelectedChain(null);
            setAmount("");
        } catch (error) {
            console.error('Error creating request:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create request. Please try again.",
            });
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-3">
                            {["Base Sepolia", "Sepolia"].map((chain) => (
                                <Button
                                    key={chain}
                                    variant={selectedChain === chain ? "secondary" : "outline"}
                                    className="w-full justify-between h-16 relative"
                                    onClick={() => {
                                        setSelectedChain(chain as "Base Sepolia" | "Sepolia");
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
                                        {chain === "Sepolia" && (
                                            <Image
                                                src="/icons/ethereum-eth-logo.svg"
                                                alt="Ethereum Network Logo"
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                        )}
                                        <div className="text-left">
                                            <p className="font-medium">{chain}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {chain === "Base Sepolia" ? "Base Testnet" : "Ethereum Testnet"}
                                            </p>
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                );
            case 1:
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
                                        selectedChain === "Sepolia" ? "ETH" :
                                            "ETH"}
                                </p>
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleSubmit}
                                disabled={!amount}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle>Request Money</DialogTitle>
                </DialogHeader>
                <Box sx={{ width: '100%' }}>
                    <Stepper activeStep={activeStep}>
                        <Step>
                            <StepLabel>Select Chain</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Enter Amount</StepLabel>
                        </Step>
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