"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import { Contact } from "@/types/search";
import { usePrivy } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { dialogSlideUp, fadeIn, stepVariants } from "@/lib/animations";
import { motion, AnimatePresence } from "framer-motion";
import { formatEther, parseEther } from "viem";
import Image from "next/image";
import { baseSepolia, sepolia } from "viem/chains";
import { QrCode, Share2 } from "lucide-react";
import { PaymentRequestQR } from "@/components/payment-request-qr";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PaymentRequest, SimplePaymentQrCode } from "@/types/data";
const steps = ['Select Chain', 'Enter Amount', 'Confirm'];

type Chain = "Base Sepolia" | "Sepolia" | null;

const StepperIcon = ({ active, completed, icon }: { active: boolean; completed: boolean; icon: React.ReactNode }) => {
    return (
        <motion.div
            className="relative"
            initial={false}
        >
            <motion.div
                className="absolute inset-0 rounded-full bg-blue-400/80 blur-md"
                initial={false}
                animate={{
                    scale: active ? 1.8 : 0,
                    opacity: active ? 1 : 0
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    opacity: { duration: 0.2 }
                }}
            />

            <motion.div
                className="relative z-10"
                initial={false}
                animate={{
                    scale: active ? 1.2 : 1,
                    color: active ? "rgb(59, 130, 246)" : completed ? "rgb(34, 197, 94)" : "rgb(156, 163, 175)"
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
            >
                {icon}
            </motion.div>
        </motion.div>
    );
};

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
    const [direction, setDirection] = useState(0);
    const [selectedChain, setSelectedChain] = useState<Chain>(null);
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { user } = usePrivy();
    const { toast } = useToast();
    const [showQR, setShowQR] = useState(false);
    const [createdRequest, setCreatedRequest] = useState<SimplePaymentQrCode | null>(null);

    const goToNextStep = () => {
        setDirection(1);
        setStep((prev) => prev + 1);
    };

    const goToPreviousStep = () => {
        setDirection(-1);
        setStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        if (!amount) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter an amount",
            });
            return;
        }
        goToNextStep();
    };

    const handleConfirm = async () => {
        if (!selectedContact || !selectedChain || !amount || !user) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Missing required transaction details",
            });
            return;
        }

        const chainId = selectedChain === "Base Sepolia" ? baseSepolia.id : sepolia.id;

        setIsLoading(true);
        try {
            const response = await fetch('/api/payment-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseEther(amount).toString(),
                    requester: user.id,
                    payee: selectedContact.id,
                    chain_id: chainId,
                    chain: selectedChain,
                    token_name: "ETH",
                    token_address: "0x0000000000000000000000000000000000000000",
                    transaction_type: "wallet"
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create payment request');
            }

            const { data } = await response.json();
            setCreatedRequest(data);
            setShowQR(true);

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

    const resetDialog = () => {
        setStep(0);
        setDirection(0);
        setAmount("");
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetDialog();
        }
        onOpenChange(newOpen);
    };

    const handleShare = async () => {
        if (!createdRequest) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Payment Request',
                    text: `Payment request for ${formatEther(createdRequest.amount)} ${createdRequest.token_name} on ${createdRequest.chain}`,
                    url: window.location.origin + `/pay/${createdRequest.id}`,
                });
            } else {
                // Fallback to copying to clipboard
                await navigator.clipboard.writeText(
                    window.location.origin + `/pay/${createdRequest.id}`
                );
                toast({
                    title: "Link copied",
                    description: "Payment request link copied to clipboard",
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-3">
                            {["Base", "Polygon", "Ethereum"].map((chain) => (
                                <Button
                                    key={chain}
                                    variant={selectedChain === chain ? "secondary" : "outline"}
                                    className="w-full justify-between h-16 relative"
                                    onClick={() => {
                                        setSelectedChain(chain as Chain);
                                        goToNextStep();
                                    }}
                                >
                                    <div className="flex items-center space-x-3">
                                        {chain === "Base" && (
                                            <Image
                                                src="/icons/base-logo.svg"
                                                alt="Base Network Logo"
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        )}
                                        {chain === "Polygon" && (
                                            <Image
                                                src="/icons/polygon-matic-logo.svg"
                                                alt="Polygon Network Logo"
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                        )}
                                        {chain === "Ethereum" && (
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
                                                {chain === "Base" ? "Base Mainnet" : chain === "Polygon" ? "Polygon Mainnet" : "Ethereum Mainnet"}
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
                        <div className="relative">
                            <div className="flex flex-col items-center space-y-2">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="text-4xl w-full bg-transparent border-none focus:outline-none text-center"
                                />
                                <p className="text-center text-sm text-muted-foreground">ETH</p>
                            </div>
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleSubmit}
                        >
                            Continue
                        </Button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 py-4">
                        <div className="space-y-4">
                            <h3 className="font-medium">Request Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Network:</span>
                                    <span className="font-medium">{selectedChain}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">{amount} ETH</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">From:</span>
                                    <span className="font-medium">{selectedContact?.email}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Confirming...' : 'Confirm Request'}
                        </Button>
                    </div>
                );
        }
    };

    return (
        <>
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
                                    <DialogTitle>Request Money</DialogTitle>
                                </DialogHeader>

                                <Box sx={{ width: '100%', mb: 4, mt: 4 }}>
                                    <Stepper
                                        activeStep={step}
                                        alternativeLabel
                                        sx={{
                                            '& .MuiStepConnector-line': {
                                                transition: 'border-color 0.3s ease'
                                            }
                                        }}
                                    >
                                        {steps.map((label, index) => (
                                            <Step
                                                key={label}
                                                sx={{
                                                    '& .MuiStepLabel-root': {
                                                        transition: 'all 0.3s ease'
                                                    }
                                                }}
                                            >
                                                <StepLabel
                                                    StepIconComponent={(props) => (
                                                        <StepperIcon
                                                            active={props.active ?? false}
                                                            completed={props.completed ?? false}
                                                            icon={props.icon}
                                                        />
                                                    )}
                                                >
                                                    <motion.span
                                                        initial={false}
                                                        animate={{
                                                            color: step === index ? "rgb(59, 130, 246)" : "rgb(107, 114, 128)",
                                                            fontWeight: step === index ? 600 : 400
                                                        }}
                                                    >
                                                        {label}
                                                    </motion.span>
                                                </StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </Box>

                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={step}
                                        custom={direction}
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30
                                        }}
                                    >
                                        {renderStepContent()}
                                    </motion.div>
                                </AnimatePresence>

                                {step > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={goToPreviousStep}
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

            <AlertDialog open={showQR} onOpenChange={setShowQR}>
                <AlertDialogContent className="sm:max-w-md rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Payment Request QR Code</AlertDialogTitle>
                    </AlertDialogHeader>

                    {createdRequest && (
                        <div className="space-y-4">
                            <PaymentRequestQR request={createdRequest} />

                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowQR(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={handleShare}
                                    className="flex items-center space-x-2"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Share Request</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 