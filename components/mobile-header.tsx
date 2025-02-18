"use client";

import { Mail, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { PendingRequestsDialog } from "./dialogs/pending-requests-dialog";
import { useState } from "react";
import { usePaymentRequestsStore } from "@/stores/use-payment-requests-store";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ProfileMask = () => (
    <svg width="0" height="0" className="hidden">
        <defs>
            <mask id="profileMask">
                <rect width="100%" height="100%" fill="white" />
                <path
                    d="M0 32 C0 14.3 14.3 0 32 0 S64 14.3 64 32 S49.7 64 32 64 S0 49.7 0 32"
                    fill="black"
                    transform="translate(0,0) scale(1)"
                />
            </mask>
        </defs>
    </svg>
);

interface MobileHeaderProps {
    className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { user, ready } = usePrivy();
    const { pendingRequests, fetchPendingRequests } = usePaymentRequestsStore();

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

    return (
        <div className={cn("p-4", className)}>
            <header className="flex flex-row gap-2">
                <div className="flex items-center gap-4 flex-1 bg-zinc-800 rounded-3xl p-4 shadow-lg">
                    <div className="flex flex-col justify-start items-center relative">
                        <div className="relative w-full h-full">
                            <ProfileMask />
                            <div
                                className="w-full h-full bg-white"
                                style={{
                                    maskImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 0H56C60.4183 0 64 3.58172 64 8V56C64 60.4183 60.4183 64 56 64H8C3.58172 64 0 60.4183 0 56V8C0 3.58172 3.58172 0 8 0Z' fill='black'/%3E%3C/svg%3E")`,
                                    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 0H56C60.4183 0 64 3.58172 64 8V56C64 60.4183 60.4183 64 56 64H8C3.58172 64 0 60.4183 0 56V8C0 3.58172 3.58172 0 8 0Z' fill='black'/%3E%3C/svg%3E")`,
                                    maskSize: "contain",
                                    WebkitMaskSize: "contain",
                                    maskRepeat: "no-repeat",
                                    WebkitMaskRepeat: "no-repeat",
                                    maskPosition: "center",
                                    WebkitMaskPosition: "center",
                                }}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif italic text-white">
                                morning, yhigorrr
                            </h1>
                            <p className="text-zinc-400">@yhigorrbroke</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 bg-zinc-800 rounded-3xl p-4 shadow-lg">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-14 w-14 rounded-2xl bg-zinc-200/10 hover:bg-zinc-200/20"
                    >
                        <Mail className="h-6 w-6 text-white" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-14 w-14 rounded-2xl bg-zinc-200/10 hover:bg-zinc-200/20"
                    >
                        <Settings className="h-6 w-6 text-white" />
                    </Button>
                </div>
            </header>

            <PendingRequestsDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                requests={pendingRequests}
            />
        </div>
    );
}
