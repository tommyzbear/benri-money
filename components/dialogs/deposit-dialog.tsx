"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import { dialogSlideUp, fadeIn, stepVariants } from "@/lib/animations";
import { motion, AnimatePresence } from "framer-motion";

const steps = ['Select Type', 'Select Method'];

type DepositOption = "crypto" | "cash" | null;
type CryptoMethod = "wallet" | "moonpay" | "coinbase" | "stripe" | null;

// Reusing the same StepperIcon component
const StepperIcon = ({ active, completed, icon }: { active: boolean; completed: boolean; icon: React.ReactNode }) => {
    return (
        <motion.div className="relative" initial={false}>
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

export function DepositDialog({
    open,
    onOpenChange,
    redirectUrl,
    fundWallet,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    redirectUrl?: string;
    fundWallet: () => Promise<void>;
}) {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(0);
    const [depositOption, setDepositOption] = useState<DepositOption>(null);
    const [cryptoMethod, setCryptoMethod] = useState<CryptoMethod>(null);

    const goToNextStep = () => {
        setDirection(1);
        setStep((prev) => prev + 1);
    };

    const goToPreviousStep = () => {
        setDirection(-1);
        setStep((prev) => prev - 1);
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant={depositOption === "crypto" ? "secondary" : "outline"}
                                className="h-32 flex flex-col items-center justify-center space-y-2"
                                onClick={() => {
                                    setDepositOption("crypto");
                                    goToNextStep();
                                }}
                            >
                                <Wallet className="h-8 w-8" />
                                <span>Deposit Crypto</span>
                                <span className="text-sm text-muted-foreground">DeFi</span>
                            </Button>
                            <Button
                                variant={depositOption === "cash" ? "secondary" : "outline"}
                                className="h-32 flex flex-col items-center justify-center space-y-2"
                                onClick={() => {
                                    setDepositOption("cash");
                                }}
                            >
                                <CreditCard className="h-8 w-8" />
                                <span>Deposit Cash</span>
                                <span className="text-sm text-muted-foreground">TradFi</span>
                            </Button>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: "wallet", name: "MoonPay, Coinbase or External Wallet", icon: <Wallet className="h-6 w-6" />, onClick: fundWallet },
                                { id: "stripe", name: "Stripe", icon: <CreditCard className="h-6 w-6" />, redirect: redirectUrl },
                            ].map((method) => (
                                <Button
                                    key={method.id}
                                    variant={cryptoMethod === method.id ? "secondary" : "outline"}
                                    className="w-full justify-start h-16 relative"
                                    onClick={() => {
                                        if (method.redirect) {
                                            window.location.href = method.redirect;
                                        }
                                        if (method.onClick) {
                                            method.onClick();
                                        }
                                    }}
                                >
                                    <div className="flex items-center space-x-3">
                                        {method.icon}
                                        <span>{method.name}</span>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const resetDialog = () => {
        setStep(0);
        setDirection(0);
        setDepositOption(null);
        setCryptoMethod(null);
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
                    <DialogContent className="sm:max-w-md rounded-3xl border-none bg-gradient-to-b from-white to-slate-50/95 backdrop-blur-sm">
                        <motion.div
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={dialogSlideUp}
                        >
                            <DialogHeader className="text-left p-4">
                                <DialogTitle>Deposit</DialogTitle>
                            </DialogHeader>

                            <Box sx={{ width: '100%', mb: 4, mt: 4 }}>
                                <Stepper activeStep={step} alternativeLabel>
                                    {steps.map((label, index) => (
                                        <Step key={label}>
                                            <StepLabel
                                                StepIconComponent={(props) => (
                                                    <StepperIcon
                                                        active={props.active || false}
                                                        completed={props.completed || false}
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
    );
} 