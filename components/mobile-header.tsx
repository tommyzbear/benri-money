"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { PendingRequestsDialog } from "./dialogs/pending-requests-dialog";
import { useState } from "react";
import { usePaymentRequestsStore } from "@/stores/use-payment-requests-store";
import { motion, AnimatePresence } from "framer-motion";

export function MobileHeader() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { ready } = usePrivy();
    const { count, pendingRequests, fetchPendingRequests } = usePaymentRequestsStore();

    useEffect(() => {
        if (!ready) return;

        fetchPendingRequests();
        // const interval = setInterval(fetchPendingRequests, 60000);
        // return () => clearInterval(interval);
    }, [ready, fetchPendingRequests]);

    return (
        <header className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Menu className="h-6 w-6" />
            </Button>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Image src="/logo.png" alt="Logo" width={32} height={32} />
            </motion.div>

            <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-white/10"
                onClick={() => count > 0 && setDialogOpen(true)}
            >
                <Bell className="h-6 w-6" />
                <AnimatePresence>
                    {count > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full 
                                     text-xs flex items-center justify-center"
                        >
                            {count > 99 ? '99+' : count}
                        </motion.span>
                    )}
                </AnimatePresence>
            </Button>

            <PendingRequestsDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                requests={pendingRequests}
            />
        </header>
    );
} 