"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import Image from "next/image";
import { Contact } from "@/types/data";
import { Chain, parseEther, parseUnits } from "viem";
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { base } from "viem/chains";
import { dialogSlideUp, fadeIn, stepVariants } from "@/lib/animations";
import { motion, AnimatePresence } from "framer-motion";
import { useTransactionsStore } from "@/stores/use-transactions-store";
import { cn } from "@/lib/utils";
import { config } from "@/lib/wallet/config";
import { encodeFunctionData, erc20Abi } from "viem";
import { TokenData } from "@/services/alchemy";
import { useWalletStore } from "@/stores/use-wallet-store";

const steps = ["Select Network", "Select Token", "Enter Amount", "Confirm"];

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
    const [selectedChain, setSelectedChain] = useState<Chain>(base);
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { wallets, ready } = useWallets();
    const [privyWallet, setPrivyWallet] = useState<ConnectedWallet | undefined>(undefined);
    const { toast } = useToast();
    const { user } = usePrivy();
    const { addTransaction } = useTransactionsStore();
    const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
    const { balances } = useWalletStore();

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

    useEffect(() => {
        if (ready) {
            setPrivyWallet(wallets.find((wallet) => wallet.walletClientType === "privy"));
        }
    }, [ready, wallets]);

    const handleConfirm = async () => {
        setIsLoading(true);
        if (!selectedContact?.wallet || !amount || !privyWallet || !selectedToken) {
            console.error("Missing required transaction details");
            toast({
                variant: "destructive",
                title: "Error",
                description: "Missing required transaction details. Please check all fields.",
            });
            setIsLoading(false);
            return;
        }

        const chainId = selectedChain.id;
        const chain = selectedChain.name;

        try {
            await privyWallet?.switchChain(chainId);
            const provider = await privyWallet?.getEthereumProvider();

            let result;
            if (selectedToken.contractAddress === "") {
                // Native token transfer
                result = await provider.request({
                    method: "eth_sendTransaction",
                    params: [{
                        to: selectedContact.wallet,
                        value: parseEther(amount),
                    }],
                });
            } else {
                // ERC20 token transfer
                const data = encodeFunctionData({
                    abi: erc20Abi,
                    functionName: 'transfer',
                    args: [selectedContact.wallet as `0x${string}`, parseUnits(amount, selectedToken.decimals)],
                });

                result = await provider.request({
                    method: "eth_sendTransaction",
                    params: [{
                        to: selectedToken.contractAddress,
                        data,
                    }],
                });
            }

            console.log(
                {
                    to_profile_img: selectedContact.profileImg || undefined,
                    from_account_id: user?.id || "",
                    to_account_id: selectedContact.id,
                    from_address: privyWallet?.address,
                    to_address: selectedContact.wallet,
                    amount: parseUnits(amount, selectedToken.decimals).toString(),
                    token_address: selectedToken.contractAddress || "0x0000000000000000000000000000000000000000",
                    token_name: selectedToken.symbol,
                    tx: result,
                    transaction_type: "wallet",
                    chain_id: chainId,
                    chain: chain,
                    decimals: selectedToken.decimals,
                }
            )

            await addTransaction({
                to_profile_img: selectedContact.profileImg || undefined,
                from_account_id: user?.id || "",
                to_account_id: selectedContact.id,
                from_address: privyWallet?.address,
                to_address: selectedContact.wallet,
                amount: parseUnits(amount, selectedToken.decimals).toString(),
                token_address: selectedToken.contractAddress || "0x0000000000000000000000000000000000000000",
                token_name: selectedToken.symbol,
                tx: result,
                transaction_type: "wallet",
                chain_id: chainId,
                chain: chain,
                decimals: selectedToken.decimals,
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
                description: typeof error === "object" && error !== null && "message" in error
                    ? String(error.message)
                    : "Failed to send transaction. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setStep(0);
        setSelectedChain(base);
        setSelectedToken(null);
        setAmount("");
        onOpenChange(false);
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-3">
                            {config.chains.map((chain) => (
                                <Button
                                    key={chain.name}
                                    variant={selectedChain === chain ? "secondary" : "outline"}
                                    className="w-full justify-between h-16 relative"
                                    onClick={() => {
                                        setSelectedChain(chain);
                                        goToNextStep();
                                    }}
                                >
                                    <div className="flex items-center space-x-3">
                                        {chain.name === "Base" && (
                                            <Image
                                                src="/icons/base-logo.svg"
                                                alt="Base Network Logo"
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        )}
                                        {chain.name === "Polygon" && (
                                            <Image
                                                src="/icons/polygon-matic-logo.svg"
                                                alt="Polygon Network Logo"
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        )}
                                        {chain.name === "Ethereum" && (
                                            <Image
                                                src="/icons/ethereum-eth-logo.svg"
                                                alt="Ethereum Network Logo"
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                        )}
                                        <div className="text-left">
                                            <div className="font-medium">{chain.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {chain.name === "Ethereum"
                                                    ? "~3 minutes"
                                                    : chain.name === "Base"
                                                        ? "~<5 sec"
                                                        : chain.name === "Polygon"
                                                            ? "~<5 sec"
                                                            : "~3 minutes"}
                                            </div>
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
                        <div className="grid grid-cols-1 gap-3">
                            {balances[selectedChain.name]?.map((token) => (
                                <Button
                                    key={token.contractAddress}
                                    variant={selectedToken?.contractAddress === token.contractAddress ? "secondary" : "outline"}
                                    className="w-full justify-between h-16 relative"
                                    onClick={() => {
                                        setSelectedToken(token);
                                        goToNextStep();
                                    }}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-left">
                                                <div className="font-medium">{token.symbol}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Balance: {Number(token.balance).toFixed(4)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-muted-foreground">
                                            {Number(token.value).toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD'
                                            })}
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
                                    {selectedToken?.symbol}
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
                                    <span className="text-muted-foreground">Recipient:</span>
                                    <span className="font-medium">{selectedContact?.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Wallet:</span>
                                    <span className="font-medium truncate ml-4">
                                        {selectedContact?.wallet
                                            ? `${selectedContact.wallet.slice(0, 6)}...${selectedContact.wallet.slice(-4)}`
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
        setSelectedChain(base);
        setSelectedToken(null);
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
                                <Stepper activeStep={step} alternativeLabel>
                                    {steps.map((label, index) => (
                                        <Step key={label}>
                                            <StepLabel
                                                StepIconComponent={(props) => (
                                                    <StepperIcon
                                                        active={!!props.active}
                                                        completed={!!props.completed}
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
