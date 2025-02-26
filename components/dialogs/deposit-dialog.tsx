"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dialogSlideUp, fadeIn } from "@/lib/animations";
import { motion, AnimatePresence } from "framer-motion";

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
    const handleOpenChange = (newOpen: boolean) => {
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
                                <DialogTitle>Deposit Crypto</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        {
                                            id: "wallet",
                                            name: "MoonPay, Coinbase or External Wallet",
                                            icon: <Wallet className="h-6 w-6" />,
                                            onClick: fundWallet
                                        },
                                        {
                                            id: "stripe",
                                            name: "Stripe",
                                            icon: <CreditCard className="h-6 w-6" />,
                                            redirect: redirectUrl
                                        },
                                    ].map((method) => (
                                        <Button
                                            key={method.id}
                                            variant="outline"
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
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
} 