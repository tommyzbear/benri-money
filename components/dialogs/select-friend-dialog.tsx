"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Contact } from "@/types/search";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { blo } from "blo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SelectFriendDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFriendSelect: (friend: Contact) => void;
}

export function SelectFriendDialog({ open, onOpenChange, onFriendSelect }: SelectFriendDialogProps) {
    const [friends, setFriends] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await fetch('/api/contacts/friends');
                if (!response.ok) {
                    throw new Error('Failed to fetch friends');
                }
                const { data } = await response.json();
                setFriends(data);
            } catch (error) {
                console.error('Error fetching friends:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load friends. Please try again.",
                });
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchFriends();
        }
    }, [open, toast]);

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const filteredFriends = friends.filter(friend =>
        friend.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.wallet?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Select Friend</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search friends..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : filteredFriends.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                            No friends found
                        </div>
                    ) : (
                        filteredFriends.map((friend) => (
                            <Button
                                key={friend.id}
                                variant="ghost"
                                className="w-full justify-start p-4 h-auto hover:bg-slate-50"
                                onClick={() => {
                                    onFriendSelect(friend);
                                    onOpenChange(false);
                                }}
                            >
                                <div className="flex items-center space-x-3">
                                    <Image
                                        src={blo(friend.wallet as `0x${string}`)}
                                        alt={friend.wallet}
                                        width={40}
                                        height={40}
                                    />
                                    <div className="text-left">
                                        <p className="font-medium">
                                            {friend.email}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatAddress(friend.wallet)}
                                        </p>
                                    </div>
                                </div>
                            </Button>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 