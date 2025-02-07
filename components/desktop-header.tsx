"use client";

import { Bell, Settings } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLogout, usePrivy } from "@privy-io/react-auth";
import { PendingRequestsDialog } from "./dialogs/pending-requests-dialog";
import { useRouter } from "next/navigation";
import { usePaymentRequestsStore } from "@/stores/use-payment-requests-store";

export function DesktopHeader() {
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { ready } = usePrivy();
    const { logout } = useLogout({
        onSuccess: () => {
            router.push("/login");
        }
    });
    const { pendingRequests, fetchPendingRequests } = usePaymentRequestsStore();

    useEffect(() => {
        if (!ready) return;

        fetchPendingRequests();
    }, [ready, fetchPendingRequests]);

    const handleLogout = async (): Promise<void> => {
        await logout();
    }

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-[#1546a3] text-white">
            <div className="flex items-center space-x-8">
                <Image src="/logo.png" alt="Logo" width={32} height={32} />
                <nav className="flex space-x-6">
                    <Button variant="ghost"><Link href="/">Home</Link></Button>
                    <Button variant="ghost"><Link href="/contacts">Contacts</Link></Button>
                    <Button variant="ghost"><Link href="/cards">Cards</Link></Button>
                    <Button variant="ghost"><Link href="/crypto">Crypto</Link></Button>
                    <Button variant="ghost"><Link href="/myaccount">Me</Link></Button>
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
                            {pendingRequests.length > 99 ? '99+' : pendingRequests.length}
                        </span>
                    )}
                </Button>
                <Button variant="ghost" size="icon">
                    <Settings className="h-6 w-6" />
                </Button>
                <Button variant="ghost" onClick={() => handleLogout()}>LOG OUT</Button>
            </div>

            <PendingRequestsDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                requests={pendingRequests}
            />
        </header>
    );
} 