"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import Image from "next/image";
import { Contact } from "@/types/data";
import { parseEther } from "viem";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { base, mainnet, polygon } from "viem/chains";
import { dialogSlideUp, fadeIn, stepVariants } from "@/lib/animations";
import { motion, AnimatePresence } from "framer-motion";
import { useTransactionsStore } from "@/stores/use-transactions-store";
import { cn } from "@/lib/utils";

const steps = ["Select Type", "Select Network", "Enter Amount", "Confirm"];

type SendOption = "crypto" | "cash" | null;
type Chain = "Base" | "Polygon" | "Ethereum" | null;

const StepperIcon = ({
    active,
    completed,
    icon,
}: {
    active: boolean;
    completed: boolean;
    icon: React.ReactNode;
}) => {
    return (
        <motion.div className="relative" initial={false}>
            <motion.div
                className="absolute inset-0 rounded-full bg-blue-400/80 blur-md"
                initial={false}
                animate={{
                    scale: active ? 1.8 : 0,
                    opacity: active ? 1 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    opacity: { duration: 0.2 },
                }}
            />

            <motion.div
                className="relative z-10"
                initial={false}
                animate={{
                    scale: active ? 1.2 : 1,
                    color: active
                        ? "rgb(59, 130, 246)"
                        : completed
                        ? "rgb(34, 197, 94)"
                        : "rgb(156, 163, 175)",
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                }}
            >
                {icon}
            </motion.div>
        </motion.div>
    );
};

export function SendMoneyDialog({
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
    const [sendOption, setSendOption] = useState<SendOption>(null);
    const [selectedChain, setSelectedChain] = useState<Chain>(null);
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { wallets } = useWallets();
    const { toast } = useToast();
    const { user } = usePrivy();
    const { addTransaction } = useTransactionsStore();

    const goToNextStep = () => {
        setDirection(1);
        setStep((prev) => prev + 1);
    };

    const goToPreviousStep = () => {
        setDirection(-1);
        setStep((prev) => prev - 1);
    };

    const handleSubmit = () => {
        goToNextStep();
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
        const chainId =
            selectedChain === "Base"
                ? base.id
                : selectedChain === "Polygon"
                ? polygon.id
                : mainnet.id;
        const chain =
            selectedChain === "Base"
                ? "Base"
                : selectedChain === "Polygon"
                ? "Polygon"
                : "Ethereum";
        const token =
            selectedChain === "Base"
                ? base.nativeCurrency
                : selectedChain === "Polygon"
                ? polygon.nativeCurrency
                : mainnet.nativeCurrency;

        try {
            if (selectedChain === "Base") {
                await wallet.switchChain(base.id);
            } else if (selectedChain === "Polygon") {
                await wallet.switchChain(polygon.id);
            } else if (selectedChain === "Ethereum") {
                await wallet.switchChain(mainnet.id);
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
                to: selectedContact.wallet,
                value: parseEther(amount),
            };

            const result = await provider.request({
                method: "eth_sendTransaction",
                params: [transactionRequest],
            });

            await addTransaction({
                from_account_id: user?.id || "",
                to_account_id: selectedContact.id,
                from_address: wallet.address,
                to_address: selectedContact.wallet,
                amount: parseEther(amount).toString(),
                token_address: "0x0000000000000000000000000000000000000000",
                token_name: token.name,
                tx: result,
                transaction_type: "wallet",
                chain_id: chainId,
                chain: chain,
            });

            toast({
                title: "Success",
                description: `Transaction sent successfully!\ntx: ${result}`,
            });
            handleReset();
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

    const handleReset = () => {
        setStep(0);
        setSendOption(null);
        setSelectedChain(null);
        setAmount("");
        onOpenChange(false);
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant={sendOption === "crypto" ? "secondary" : "outline"}
                                className="h-32 flex flex-col items-center justify-center space-y-2"
                                onClick={() => {
                                    setSendOption("crypto");
                                    goToNextStep();
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
                                    goToNextStep();
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
                            {["Base Sepolia", "Sepolia"].map((chain) => (
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
                                        {chain === "Base Sepolia" && (
                                            <Image
                                                src="/icons/base-logo.svg"
                                                alt="Base Network Logo"
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        )}
                                        {(chain === "Arbitrum Sepolia" ||
                                            chain === "Arbitrum Goerli") && (
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
                                                {chain === "Ethereum"
                                                    ? "~3 minutes"
                                                    : chain === "Base"
                                                    ? "~17 sec"
                                                    : chain === "Solana"
                                                    ? "~36 sec"
                                                    : chain === "Algorand"
                                                    ? "~19 sec"
                                                    : "~4 minutes"}
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
                                    {selectedChain === "Base"
                                        ? "ETH"
                                        : selectedChain === "Polygon"
                                        ? "ETH"
                                        : selectedChain === "Ethereum"
                                        ? "ETH"
                                        : "ETH"}
                                </p>
                            </div>
                            <Button className="w-full" onClick={handleSubmit} disabled={!amount}>
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
                                        {selectedContact?.wallet
                                            ? `${selectedContact.wallet.slice(
                                                  0,
                                                  6
                                              )}...${selectedContact.wallet.slice(-4)}`
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full" onClick={handleConfirm} disabled={isLoading}>
                            {isLoading ? "Confirming..." : "Confirm Transaction"}
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    const resetDialog = () => {
        setStep(0);
        setDirection(0);
        setSendOption(null);
        setSelectedChain(null);
        setAmount("");
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetDialog();
        }
        onOpenChange(newOpen);
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
                    <DialogContent
                        className={cn(
                            "max-w-[calc(100vw-2rem)] sm:max-w-md rounded-3xl",
                            "border-none bg-gradient-to-b from-white",
                            "to-slate-50/95 backdrop-blur-sm"
                        )}
                    >
                        <motion.div
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={dialogSlideUp}
                        >
                            <DialogHeader className="text-left p-4">
                                <DialogTitle>Send Money</DialogTitle>
                            </DialogHeader>

                            <Box sx={{ width: "100%", mb: 4, mt: 4 }}>
                                <Stepper
                                    activeStep={step}
                                    alternativeLabel
                                    sx={{
                                        "& .MuiStepConnector-line": {
                                            transition: "border-color 0.3s ease",
                                        },
                                    }}
                                >
                                    {steps.map((label, index) => (
                                        <Step
                                            key={label}
                                            sx={{
                                                "& .MuiStepLabel-root": {
                                                    transition: "all 0.3s ease",
                                                },
                                            }}
                                        >
                                            <StepLabel
                                                StepIconComponent={(props) => (
                                                    <StepperIcon
                                                        active={props.active}
                                                        completed={props.completed}
                                                        icon={props.icon}
                                                    />
                                                )}
                                            >
                                                <motion.span
                                                    initial={false}
                                                    animate={{
                                                        color:
                                                            step === index
                                                                ? "rgb(59, 130, 246)"
                                                                : "rgb(107, 114, 128)",
                                                        fontWeight: step === index ? 600 : 400,
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
                                        damping: 30,
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
    );
}
