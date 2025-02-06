"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect } from "react";
import { Contact } from "@/types/search";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { blo } from "blo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useContactsStore } from "@/stores/use-contacts-store";
import { motion, AnimatePresence } from "framer-motion";
import { dialogSlideUp, fadeIn } from "@/lib/animations";

interface SelectFriendDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFriendSelect: (friend: Contact) => void;
}

export function SelectFriendDialog({ open, onOpenChange, onFriendSelect }: SelectFriendDialogProps) {
    const {
        friends,
        searchResults,
        searchQuery,
        isLoading,
        error,
        setSearchQuery,
        fetchFriends
    } = useContactsStore();
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchFriends();
        }
    }, [open, fetchFriends]);

    useEffect(() => {
        if (error) {
            toast({
                title: "Error",
                description: error,
                variant: "destructive",
            });
        }
    }, [error, toast]);

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const displayContacts = searchQuery ? searchResults : friends;

    return (
        <AnimatePresence mode="wait">
            {open && (
                <Dialog open={open} onOpenChange={onOpenChange}>
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
                                <DialogTitle>Select Friend</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by email or wallet address"
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <motion.div
                                    className="space-y-2 overflow-y-auto"
                                    layout
                                    style={{
                                        minHeight: 200,
                                        maxHeight: 400,
                                        paddingRight: "8px"
                                    }}
                                >
                                    <AnimatePresence mode="wait">
                                        {isLoading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                layout
                                            >
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className="flex items-center space-x-3 p-2">
                                                        <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
                                                        <div className="space-y-2 flex-1">
                                                            <div className="h-4 w-48 bg-slate-200 animate-pulse rounded" />
                                                            <div className="h-3 w-32 bg-slate-200 animate-pulse rounded" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="content"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                layout
                                            >
                                                {displayContacts.map((friend, index) => (
                                                    <motion.div
                                                        key={friend.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        layout
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full p-2 h-auto bg-slate-50 hover:bg-slate-100"
                                                            onClick={() => {
                                                                onFriendSelect(friend);
                                                                onOpenChange(false);
                                                            }}
                                                        >
                                                            <div className="flex items-center w-full">
                                                                <div className="flex items-center space-x-3 flex-1">
                                                                    <Image
                                                                        src={blo(friend.wallet as `0x${string}`)}
                                                                        alt={friend.wallet}
                                                                        width={40}
                                                                        height={40}
                                                                    />
                                                                    <div className="text-left flex-1">
                                                                        <p className="font-medium">
                                                                            {friend.email}
                                                                        </p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {formatAddress(friend.wallet)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Button>
                                                    </motion.div>
                                                ))}

                                                {displayContacts.length === 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        layout
                                                        className="text-left py-4 text-muted-foreground"
                                                    >
                                                        {searchQuery ? "No results found" : "No friends yet"}
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
} 