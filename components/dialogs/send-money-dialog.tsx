"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import { Contact } from "@/types/data";
import { Chain, parseEther, parseUnits } from "viem";
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { useToast } from "@/hooks/use-toast";
import { base, mainnet, polygon } from "viem/chains";
import { dialogSlideUp, fadeIn, stepVariants } from "@/lib/animations";
import { motion, AnimatePresence } from "framer-motion";
import { useTransactionsStore } from "@/stores/use-transactions-store";
import { cn } from "@/lib/utils";
import { encodeFunctionData, erc20Abi } from "viem";
import { TokenData } from "@/services/alchemy";
import { useWalletStore } from "@/stores/use-wallet-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DepositDialog } from "@/components/dialogs/deposit-dialog";
import { useFundWallet } from "@privy-io/react-auth";

// Simplified steps - now we only have two steps
const steps = ["Enter Amount", "Confirm"];

const supportedChains = [base, polygon, mainnet]; // Import polygon and mainnet from viem/chains

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
    // Default to Base chain
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
    const [showDepositDialog, setShowDepositDialog] = useState(false);
    const { fundWallet } = useFundWallet();
    // Find USDC token in balances when component mounts or balances change
    useEffect(() => {
        if (balances[selectedChain.name]?.length > 0) {
            // Try to find USDC token
            const usdcToken = balances[selectedChain.name].find(
                token => token.symbol === "USDC"
            );
            
            // Set USDC as default if available, otherwise use the first token
            if (usdcToken) {
                setSelectedToken(usdcToken);
            } else if (balances[selectedChain.name][0]) {
                setSelectedToken(balances[selectedChain.name][0]);
            }
        } else if (open) {
            // If there are no balances, show a toast notification
            toast({
                title: "No funds available",
                description: "You need to deposit funds before sending money.",
                variant: "destructive",
            });
        }
    }, [balances, selectedChain.name, open, toast]);

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
        setAmount("");
        onOpenChange(false);
        // Don't reset selectedToken to keep USDC as default
    };

    const handleFundWallet = async () => {
        // Close the send money dialog and open deposit dialog
        onOpenChange(false);
        setShowDepositDialog(true);
    };

    const renderStepContent = () => {
        // Check if there are no balances for the selected chain
        const noBalances = !balances[selectedChain.name] || balances[selectedChain.name].length === 0;
        
        switch (step) {
            case 0: // Amount entry step with token dropdown
                return (
                    <div className="space-y-4 py-4">
                        {/* Chain selection dropdown  */}


                        {noBalances ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg text-center">
                                    <p className="text-muted-foreground mb-2">
                                        You don't have any tokens on {selectedChain.name}.
                                    </p>
                                    <Button 
                                        className="w-full" 
                                        onClick={handleFundWallet}
                                    >
                                        Deposit Now
                                    </Button>
                                </div>
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
                                    
                                    {/* Token selection dropdown */}
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
                                                <SelectValue placeholder="Select token">
                                                    {selectedToken ? (
                                                        <div className="flex justify-between w-full">
                                                            <span>{selectedToken.symbol}</span>
                                                            <span className="text-muted-foreground ml-2">
                                                                Balance: {Number(selectedToken.balance).toFixed(4)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        "Select token"
                                                    )}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {balances[selectedChain.name]?.map((token) => (
                                                    <SelectItem 
                                                        key={token.contractAddress || `native-${token.symbol}`} 
                                                        value={token.contractAddress || `native-${token.symbol}`}
                                                    >
                                                        <div className="flex justify-between w-full">
                                                            <span>{token.symbol}</span>
                                                            <span className="text-muted-foreground ml-2">
                                                                Balance: {Number(token.balance).toFixed(4)}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {/* Show deposit button if balance is low */}
                                    {selectedToken && Number(selectedToken.balance) < 0.0001 && (
                                        <div className="mt-3">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full text-xs" 
                                                onClick={handleFundWallet}
                                            >
                                                Low Balance - Deposit More
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <Button className="w-full" onClick={handleSubmit} disabled={!amount || !selectedToken}>
                                    Preview
                                </Button>
                            </div>
                        )}
                    </div>
                );
            case 1: // Confirmation step
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
        setAmount("");
        // Don't reset selectedToken to keep USDC as default
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetDialog();
        }
        onOpenChange(newOpen);
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
                                    <div className="flex justify-between items-center">
                                        <DialogTitle>Send Money</DialogTitle>
                                        
                                        {/* Chain selection dropdown in the header row */}
                                        <Select
                                            value={selectedChain.id.toString()}
                                            onValueChange={(value) => {
                                                const chain = supportedChains.find(c => c.id.toString() === value);
                                                if (chain) {
                                                    setSelectedChain(chain);
                                                    // Reset selected token when chain changes
                                                    setSelectedToken(null);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-auto min-w-[120px] h-8 px-3 text-sm bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Select network">
                                                    {selectedChain.name}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {supportedChains.map((chain) => (
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
            
            {/* Add the DepositDialog component */}
            <DepositDialog
                open={showDepositDialog}
                onOpenChange={(open) => setShowDepositDialog(open)}
                fundWallet={() =>
                    fundWallet(
                        wallets.find((wallet) => wallet.walletClientType === "privy")?.address ?? "",
                        {
                            asset: "USDC",
                            amount: "10",
                            chain: base,
                        }
                    )
                }
            />
        </>
    );
}
