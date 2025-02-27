"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { useContactsStore } from "@/stores/use-contacts-store";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Plus, Check } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileImgMask } from "../profile/profile-img-mask";
import { cn } from "@/lib/utils";

interface AddFriendDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function SearchContactSkeleton() {
    return (
        <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border bg-white"
                >
                    <div className="flex flex-col gap-1.5">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </motion.div>
            ))}
        </div>
    );
}

function SearchContactCard({
    result,
    index,
    onAdd,
    isLoading,
}: {
    result: Contact;
    index: number;
    onAdd: () => void;
    isLoading: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
                delay: index * 0.05,
                duration: 0.2,
            }}
            key={result.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50"
        >
            <div className="flex items-center gap-4">
                <ProfileImgMask
                    fill="hsl(var(--primary-foreground))"
                    className="antialiased h-9 w-9"
                />
                <div className="flex flex-col">
                    <span className="font-medium">{result.username}</span>
                    <span className="text-sm text-gray-500">{result.email}</span>
                </div>
            </div>
            <Button
                size="sm"
                onClick={onAdd}
                disabled={isLoading || result.isFriend}
                className={cn(
                    "rounded-full",
                    result.isFriend
                        ? "bg-green-300 text-green-600 hover:bg-green-100 cursor-default"
                        : "bg-secondary text-primary shadow-none border-0"
                )}
            >
                {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : result.isFriend ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <Plus className="h-4 w-4" />
                )}
            </Button>
        </motion.div>
    );
}

export function AddFriendDialog({ open, onOpenChange }: AddFriendDialogProps) {
    const { toast } = useToast();
    const [isAddingFriend, setIsAddingFriend] = useState(false);
    const [addingFriendId, setAddingFriendId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const { searchResults, isSearching, friends, setSearchQuery, addFriend } = useContactsStore();

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setInputValue("");
            setSearchQuery("");
            useContactsStore.setState({ searchResults: [] });
        }
        onOpenChange(open);
    };

    const debouncedSearch = useDebounce((value: string) => {
        setSearchQuery(value);
    }, 300);

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setInputValue(value);
            debouncedSearch(value);
        },
        [debouncedSearch]
    );

    const handleAddFriend = async (friendId: string) => {
        setIsAddingFriend(true);
        setAddingFriendId(friendId);
        try {
            await addFriend(friendId);
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
            setIsAddingFriend(false);
            setAddingFriendId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-full max-w-[calc(100vw-2rem)] p-0 rounded-3xl [&>button]:hidden overflow-hidden">
                <div className="flex flex-col items-center w-full p-4">
                    <div className="w-full max-w-md bg-white rounded-full overflow-hidden relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search for friends to add..."
                            className="pl-8 h-full w-full"
                            onChange={handleSearch}
                            value={inputValue}
                        />
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="search-results-container"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                                height: { duration: 0.2 },
                                opacity: { duration: 0.1 },
                            }}
                            style={{ pointerEvents: "none" }}
                            className="w-full max-w-md"
                        >
                            <div
                                style={{ pointerEvents: "auto" }}
                                className={`max-h-[40vh] overflow-y-auto rounded-2xl ${
                                    searchResults?.length > 0 || (isSearching && inputValue)
                                        ? "bg-white mt-4"
                                        : ""
                                }`}
                            >
                                {isSearching && inputValue ? (
                                    <SearchContactSkeleton />
                                ) : searchResults && searchResults.length > 0 ? (
                                    <div className="">
                                        {searchResults.map((result, index) => (
                                            <SearchContactCard
                                                key={result.id}
                                                result={result}
                                                index={index}
                                                isLoading={
                                                    isAddingFriend && result.id === addingFriendId
                                                }
                                                onAdd={() => {
                                                    handleAddFriend(result.id);
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : inputValue && !isSearching ? (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-center text-gray-500 pt-4"
                                    >
                                        No results found
                                    </motion.p>
                                ) : null}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
