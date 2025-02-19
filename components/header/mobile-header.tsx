"use client";

import { useEffect, useState } from "react";
import { Mail, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Textfit } from "react-textfit";

import { cn, formatValue, getGreetingsByHour } from "@/lib/utils";
import { ProfileImgMask } from "../profile/profile-img-mask";

import { usePaymentRequestsStore } from "@/stores/use-payment-requests-store";
import { useHeaderStore } from "@/stores/use-header-store";
import { useWalletStore } from "@/stores/use-wallet-store";
import { useUserStore } from "@/stores/use-user-store";

import { UploadProfileImageDialog } from "@/components/dialogs/upload-profile-image-dialog";
import { SetUsernameDialog } from "@/components/dialogs/set-username-dialog";
import { NotificationsDialog } from "../dialogs/notifications-dialog";

interface MobileHeaderProps {
    className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
    const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
    const [uploadProfileImageDialogOpen, setUploadProfileImageDialogOpen] = useState(false);
    const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
    const { user, ready } = usePrivy();
    const { pendingRequests, fetchPendingRequests } = usePaymentRequestsStore();
    const { type } = useHeaderStore();
    const { totalBalance } = useWalletStore();
    const { user: userStore, fetchUser } = useUserStore();

    useEffect(() => {
        if (!ready) return;
        fetchUser();
        fetchPendingRequests();
    }, [ready, fetchPendingRequests, fetchUser]);

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
                    <div className="flex flex-col justify-start items-center relative w-full h-full">
                        <div className="flex flex-col h-full w-full">
                            <div className="w-full flex justify-start items-center">
                                <h3 className="font-libre italic text-white text-lg text-left">
                                    balance
                                </h3>
                            </div>
                            <div className="h-full w-full flex items-center">
                                <Textfit
                                    mode="single"
                                    forceSingleModeWidth={true}
                                    min={20}
                                    max={40}
                                    className="font-libre font-bold not-italic text-white w-full truncate"
                                >
                                    {formatValue(totalBalance.toString())}
                                </Textfit>
                            </div>
                        </div>
                    </div>
                );
            case "balance-sm":
                return <h1 className="text-2xl font-serif italic text-white">balance-sm here</h1>;
            case "profile":
                return (
                    <div className="w-full h-full flex flex-row justify-start items-center relative gap-6">
                        <div className="relative w-fit h-full mb-auto">
                            <Button
                                className="w-20 h-20 bg-neutral-600 rounded-lg p-2"
                                onClick={() => setUploadProfileImageDialogOpen(true)}
                            >
                                <ProfileImgMask />
                            </Button>
                            {/* <Pencil className="w-4 h-4" /> */}
                        </div>
                        <div className="h-full w-full flex flex-col justify-start items-start">
                            <div className="h-fit w-full font-libre text-2xl text-white italic leading-[2.2rem] pt-1">
                                <h1>{getGreetingsByHour()},</h1>
                                <Textfit
                                    mode="single"
                                    forceSingleModeWidth={true}
                                    min={16}
                                    max={24}
                                    className=""
                                >
                                    {userStore?.username || "anon"}
                                </Textfit>
                            </div>
                            <p className="text-zinc-400 text-sm mt-8">
                                {user?.email?.address || "No ID connected"}
                            </p>
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
                        onClick={() => setNotificationsDialogOpen(true)}
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
                open={notificationsDialogOpen}
                onOpenChange={setNotificationsDialogOpen}
                requests={pendingRequests}
            />
            <UploadProfileImageDialog
                open={uploadProfileImageDialogOpen}
                onOpenChange={setUploadProfileImageDialogOpen}
            />
            <SetUsernameDialog open={usernameDialogOpen} onOpenChange={setUsernameDialogOpen} />
        </div>
    );
}
