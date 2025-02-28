"use client";

import { useEffect, useState } from "react";
import { Mailbox, Wrench } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Textfit } from "react-textfit";
import { Skeleton } from "@/components/ui/skeleton";

import { cn, formatValue, getGreetingsByHour } from "@/lib/utils";
import { ProfileImgMask } from "../profile/profile-img-mask";

import { usePaymentRequestsStore } from "@/stores/use-payment-requests-store";
import { useHeaderStore } from "@/stores/use-header-store";
import { useWalletStore } from "@/stores/use-wallet-store";
import { useUserStore } from "@/stores/use-user-store";

import { UploadProfileImageDialog } from "@/components/dialogs/upload-profile-image-dialog";
import { SetUsernameDialog } from "@/components/dialogs/set-username-dialog";
import { NotificationsDialog } from "../dialogs/notifications-dialog";
import { useRouter } from "next/navigation";

interface MobileHeaderProps {
    className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
    const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
    const [uploadProfileImageDialogOpen, setUploadProfileImageDialogOpen] = useState(false);
    const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
    const { user, ready } = usePrivy();
    const { wallets, ready: walletsReady } = useWallets();
    const { pendingRequests, fetchPendingRequests } = usePaymentRequestsStore();
    const { type } = useHeaderStore();
    const { totalBalance, fetchBalances } = useWalletStore();
    const { user: userStore, fetchUser } = useUserStore();
    const [isTextScaled, setIsTextScaled] = useState(false);
    const router = useRouter()

    useEffect(() => {
        if (!ready || !walletsReady) return;

        if (userStore === null) {
            fetchUser();
        }
        fetchPendingRequests();
        if (totalBalance === undefined) {
            fetchBalances(
                wallets.find((wallet) => wallet.walletClientType === "privy")?.address ??
                wallets[0].address
            );
        }
    }, [
        ready,
        fetchPendingRequests,
        fetchUser,
        fetchBalances,
        wallets,
        walletsReady,
        userStore,
        totalBalance,
    ]);

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
            case "balance-sm":
                return (
                    <div className="flex relative w-full h-full animate-fade-in">
                        <div className="w-full h-full">
                            <div
                                className={cn(
                                    "absolute transition-all duration-300",
                                    type === "balance-sm" ? "left-0 top-0" : "left-0 top-0"
                                )}
                            >
                                <h3 className="header-text text-primary-foreground">balance</h3>
                            </div>
                            <div
                                className={cn(
                                    "absolute transition-all duration-300",
                                    type === "balance-sm"
                                        ? "left-24 -top-1 right-0"
                                        : "left-0 top-12 right-0"
                                )}
                            >
                                {!isTextScaled &&
                                    (type === "balance-sm" ? (
                                        <div className="absolute inset-0 flex items-center justify-end top-2">
                                            <Skeleton className="h-8 w-4/5 bg-accent" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center">
                                            <Skeleton className="h-12 w-4/5 bg-accent" />
                                        </div>
                                    ))}
                                <Textfit
                                    mode="single"
                                    forceSingleModeWidth={true}
                                    min={type === "balance-sm" ? 16 : 20}
                                    max={type === "balance-sm" ? 24 : 40}
                                    onReady={() => setIsTextScaled(true)}
                                    className={cn(
                                        "font-libre font-bold not-italic h-full w-full transition-all duration-300",
                                        type === "balance-sm" ? "text-right" : "text-left",
                                        !isTextScaled ? "opacity-0" : "animate-fade-in"
                                    )}
                                >
                                    {formatValue(totalBalance?.toString() ?? "0")}
                                </Textfit>
                            </div>
                        </div>
                    </div>
                );

            case "profile":
                return (
                    <div className="w-full h-full flex flex-row justify-start items-center relative gap-6 animate-fade-in">
                        <div className="relative w-fit h-full mb-auto">
                            <Button
                                className="w-20 h-20 bg-secondary-foreground rounded-lg p-2"
                                onClick={() => setUploadProfileImageDialogOpen(true)}
                            >
                                <ProfileImgMask fill="hsl(var(--primary-foreground))" />
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
                "mt-14 w-full z-5 transition-[height] duration-300",
                type === "balance-sm" ? "h-14" : "h-40",
                className
            )}
        >
            <header className="flex h-full flex-row gap-2">
                <div
                    className={cn(
                        "flex items-center gap-4 flex-1",
                        "bg-primary rounded-4xl text-primary-foreground",
                        "p-5 pt-4 shadow-primary h-full"
                    )}
                >
                    {headerCardContent()}
                </div>

                <div className="flex flex-col gap-3 w-14 h-full p-0">
                    <Button
                        className={cn(
                            "p-3 flex justify-center items-center h-14 w-full rounded-3xl",
                            "bg-chart-5 shadow-primary hover:bg-zinc-200/20 relative"
                        )}
                        onClick={() => setNotificationsDialogOpen(true)}
                    >
                        <Mailbox size={32} weight="fill" className="text-primary" />
                        {pendingRequests.length > 0 && (
                            <div className="absolute top-0 right-0 h-3 w-3 bg-chart-1-foreground rounded-full z-10" />
                        )}
                    </Button>
                    <Button
                        className={cn(
                            "px-3 flex-1 w-full rounded-4xl bg-chart-4/70 hover:bg-zinc-200/20",
                            "transition-all duration-300 overflow-hidden shadow-primary text-chart-4-foreground",
                            type === "balance-sm"
                                ? "h-0 py-0 pointer-events-none"
                                : "h-full py-4 pointer-events-auto"
                        )}
                        onClick={() => router.push("/profile")}
                    >
                        <Wrench size={32} weight="fill" className="" />
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
