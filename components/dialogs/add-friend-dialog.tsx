"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { useContactsStore } from "@/stores/use-contacts-store";
import { useState } from "react";
import { motion } from "framer-motion";

interface AddFriendDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contact: Contact | null;
}

export function AddFriendDialog({ open, onOpenChange, contact }: AddFriendDialogProps) {
    const { toast } = useToast();
    const { addFriend } = useContactsStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleAddFriend = async () => {
        setIsLoading(true);
        try {
            await addFriend(contact?.id || "");
            toast({
                title: "Success",
                description: "Friend added successfully",
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Error adding friend:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add friend. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[calc(100vw-2rem)] px-4 p-4 rounded-3xl">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle>Add Friend</DialogTitle>
                </DialogHeader>
                <input type="text" className="w-full p-2 border rounded-md" />
                <div className="p-6 pt-2 space-y-4">
                    <p>
                        Are you sure you want to add {contact?.username || contact?.email} as a
                        friend?
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddFriend} disabled={isLoading}>
                            {isLoading ? (
                                <motion.div
                                    initial={{ scale: 1 }}
                                    animate={{ scale: 0.8 }}
                                    transition={{ repeat: Infinity, duration: 0.5 }}
                                >
                                    Adding...
                                </motion.div>
                            ) : (
                                "Add Friend"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
