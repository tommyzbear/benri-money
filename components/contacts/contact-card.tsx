"use client";

import { Button } from "@/components/ui/button";
import { Contact } from "@/types/data";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { blo } from "blo";
import { ProfileImgMask } from "../profile/profile-img-mask";

interface ContactCardProps {
    contact: Contact;
    index: number;
    unfriendingId: string | null;
    onContactClick: (e: React.MouseEvent) => void;
    onUnfriendClick: (e: React.MouseEvent) => void;
    onAddFriendClick: (e: React.MouseEvent) => void;
}

export function ContactCard({
    contact,
    index,
    unfriendingId,
    onContactClick,
    onUnfriendClick,
    onAddFriendClick,
}: ContactCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Button
                className="w-full pl-4 pr-3 h-20 rounded-none bg-slate-50 hover:bg-slate-100 shadow-none border-0 outline-0 ring-0"
                onClick={onContactClick}
            >
                <div className="flex items-center w-full">
                    <div className="flex items-center min-w-0 flex-1 gap-2">
                        <div className="flex-shrink-0 mr-4 h-10 w-10">
                            <ProfileImgMask
                                imageUrl={
                                    contact.profileImg === null
                                        ? blo(contact.wallet as `0x${string}`)
                                        : contact.profileImg
                                }
                                fill="hsl(var(--primary-foreground))"
                                className="antialiased"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            {contact.email && (
                                <h3 className="text-primary text-lg font-medium text-left truncate">
                                    {contact.username}
                                </h3>
                            )}
                            {contact.wallet && (
                                <p className="text-sm text-gray-500 text-left truncate">
                                    {`${contact.wallet.slice(0, 6)}...${contact.wallet.slice(-4)}`}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-2 ml-4">
                        {/* <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-background rounded-xl p-1"
                            onClick={onSendClick}
                        >
                            <ChatTeardropDots
                                size={30}
                                weight="fill"
                                className="text-muted-foreground"
                            />
                        </Button> */}
                        {/* <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onSendClick}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onRequestClick}
                        >
                            <HandCoins className="h-4 w-4" />
                        </Button> */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-chart-3 rounded-xl"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (contact.isFriend) {
                                    onUnfriendClick(e);
                                } else {
                                    onAddFriendClick(e);
                                }
                            }}
                            disabled={unfriendingId === contact.id}
                        >
                            {unfriendingId === contact.id ? (
                                <motion.div
                                    initial={{ scale: 1 }}
                                    animate={{ scale: 0.8 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 0.5,
                                    }}
                                >
                                    <X className="h-4 w-4 text-green-500" />
                                </motion.div>
                            ) : (
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <X className="h-4 w-4 text-chart-1-foreground" />
                                </motion.div>
                            )}
                        </Button>
                    </div>
                </div>
            </Button>
        </motion.div>
    );
}
