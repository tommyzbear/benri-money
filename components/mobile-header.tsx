"use client";

import { useHeaderStore } from "@/stores/use-header-store";
import { Mail, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { NotificationsDialog } from "./dialogs/notifications-dialog";
import { useState } from "react";
import { usePaymentRequestsStore } from "@/stores/use-payment-requests-store";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ProfileMask = () => (
    <div className="w-16 h-16 bg-neutral-500 rounded-lg p-1 fill-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 60 60"
            // fill="rgb(255, 255, 255)"
        >
            <path d="M 60 60 C 51.148 57.459 40.902 55.984 30 55.984 C 19.098 55.984 8.852 57.459 0 60 C 2.541 51.148 4.016 40.902 4.016 30 C 4.016 19.098 2.541 8.852 0 0 C 8.852 2.541 19.098 4.016 30 4.016 C 40.902 4.016 51.148 2.541 60 0 C 57.459 8.852 55.984 19.098 55.984 30 C 55.984 40.902 57.459 51.148 60 60 Z"></path>
        </svg>
    </div>
);

interface MobileHeaderProps {
    className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { user, ready } = usePrivy();
    const { pendingRequests, fetchPendingRequests } = usePaymentRequestsStore();
    const { type } = useHeaderStore();

    useEffect(() => {
        if (!ready) return;
        fetchPendingRequests();
    }, [ready, fetchPendingRequests]);

    useEffect(() => {
        const channel = supabase
            .channel("payment_requests")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "payment_requests",
                    filter: `payee=eq.${user?.id}`,
                },
                () => {
                    toast({
                        title: "New payment request",
                        description: "You have received a new payment request",
                    });
                    fetchPendingRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, fetchPendingRequests]);

    const headerCardContent = () => {
        switch (type) {
            case "balance":
                return (
                    <div className="flex flex-col justify-start items-center relative">
                        <div>
                            <h1 className="text-2xl font-serif italic text-white">
                                big balance here
                            </h1>
                        </div>
                    </div>
                );
            case "balance-sm":
                return <h1 className="text-2xl font-serif italic text-white">balance-sm here</h1>;
            case "profile":
                return (
                    <div className="flex flex-col justify-start items-center relative">
                        <div className="relative w-full h-full">
                            <ProfileMask />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif italic text-white">
                                morning, yhigorrr
                            </h1>
                            <p className="text-zinc-400">@yhigorrbroke</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={cn(
                "mt-14 w-full z-5 transition-all duration-300",
                type === "balance-sm" ? "h-14" : "h-40",
                className
            )}
        >
            <header className="flex h-full flex-row gap-2">
                <div
                    className={cn(
                        "flex items-center gap-4 flex-1",
                        "bg-primary rounded-4xl",
                        "p-4 shadow-md h-full"
                    )}
                >
                    {headerCardContent()}
                </div>

                <div className="flex flex-col gap-2 w-14 h-full p-0">
                    <Button
                        className="p-4 flex justify-center items-center h-14 w-full rounded-3xl shadow-lg bg-primary hover:bg-zinc-200/20 relative"
                        onClick={() => setDialogOpen(true)}
                    >
                        <Mail className="h-[100%] w-[100%] text-primary-foreground" />
                        {pendingRequests.length === 0 && (
                            <div className="absolute top-[25%] right-[25%] h-2 w-2 bg-red-500 rounded-full z-10" />
                        )}
                    </Button>
                    <Button
                        className={cn(
                            "px-4 flex-1 w-full rounded-4xl bg-primary hover:bg-zinc-200/20 transition-all duration-300 overflow-hidden",
                            type === "balance-sm"
                                ? "h-0 py-0 pointer-events-none"
                                : "h-full py-4 pointer-events-auto"
                        )}
                    >
                        <Settings className="h-[100%] w-[100%] text-primary-foreground" />
                    </Button>
                </div>
            </header>

            <NotificationsDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                requests={pendingRequests}
            />
        </div>
    );
}
