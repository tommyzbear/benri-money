"use client";

import { Bell, Settings } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLogout, usePrivy } from "@privy-io/react-auth";
import { NotificationsDialog } from "./dialogs/notifications-dialog";
import { useRouter } from "next/navigation";
import { usePaymentRequestsStore } from "@/stores/use-payment-requests-store";
import { cn } from "@/lib/utils";

interface DesktopHeaderProps {
    className?: string;
}

export function DesktopHeader({ className }: DesktopHeaderProps) {
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { ready } = usePrivy();
    const { logout } = useLogout({
        onSuccess: () => {
            router.push("/login");
        },
    });
    const { pendingRequests, fetchPendingRequests } = usePaymentRequestsStore();

    useEffect(() => {
        if (!ready) return;

        fetchPendingRequests();
    }, [ready, fetchPendingRequests]);

    const handleLogout = async (): Promise<void> => {
        await logout();
    };

    return (
        <header className={cn("flex justify-between px-6 py-3 bg-primary text-white", className)}>
            <div className="w-full flex justify-between items-center">
                <div className="flex flex-1 items-center space-x-8">
                    <Image
                        src="/benri-logo-icon.svg"
                        alt="Logo"
                        width={32}
                        height={32}
                        className="fill-white text-white invert filter-brightness-150"
                    />
                    <nav className="flex space-x-6">
                        <Button variant="ghost">
                            <Link href="/">Home</Link>
                        </Button>
                        <Button variant="ghost">
                            <Link href="/payments">Contacts</Link>
                        </Button>
                        <Button variant="ghost">
                            <Link href="/defi">DeFi</Link>
                        </Button>
                        <Button variant="ghost">
                            <Link href="/profile">Profile</Link>
                        </Button>
                    </nav>
                </div>

                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={() => pendingRequests.length > 0 && setDialogOpen(true)}
                    >
                        <Bell className="h-6 w-6" />
                        {pendingRequests.length > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                                {pendingRequests.length > 99 ? "99+" : pendingRequests.length}
                            </span>
                        )}
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" onClick={() => handleLogout()}>
                        LOG OUT
                    </Button>
                </div>
            </div>

            <NotificationsDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                requests={pendingRequests}
            />
        </header>
    );
}
