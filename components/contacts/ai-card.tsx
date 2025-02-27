"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ProfileImgMask } from "../profile/profile-img-mask";

interface AiCardProps {
    onClick: (e: React.MouseEvent) => void;
}

export function AiCard({ onClick: onContactClick }: AiCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
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
                                    "/educative.svg"
                                }
                                fill="hsl(var(--primary-foreground))"
                                className="antialiased"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-primary text-lg font-medium text-left truncate">
                                Benri AI
                            </h3>
                            <p className="text-sm text-gray-500 text-left truncate">
                                Your personal assistant
                            </p>
                        </div>
                    </div>
                </div>
            </Button>
        </motion.div>
    );
}
