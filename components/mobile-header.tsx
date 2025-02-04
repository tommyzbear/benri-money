"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { PendingRequestsDialog } from "./dialogs/pending-requests-dialog";
import { PaymentRequest } from "@/types/data";

export function MobileHeader() {
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [pendingRequests, setPendingRequests] = useState<PaymentRequest[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { ready } = usePrivy();

    useEffect(() => {
        const fetchPendingRequestsCount = async () => {
            if (!ready) return;

            try {
                const response = await fetch('/api/requests/pending');
                if (!response.ok) {
                    throw new Error('Failed to fetch pending requests count');
                }
                const { data } = await response.json();
                setPendingRequestsCount(data.length || 0);
                setPendingRequests(data);
            } catch (error) {
                console.error('Error fetching pending requests count:', error);
            }
        };

        fetchPendingRequestsCount();

        // Refresh count every minute
        const interval = setInterval(fetchPendingRequestsCount, 60000);

        return () => clearInterval(interval);
    }, [ready]);

    return (
        <header className="flex items-center justify-between p-4 bg-[#1546a3] text-white">
            <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
            </Button>
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => pendingRequestsCount > 0 && setDialogOpen(true)}
            >
                <Bell className="h-6 w-6" />
                {pendingRequestsCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                        {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
                    </span>
                )}
            </Button>

            <PendingRequestsDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                requests={pendingRequests}
            />
        </header>
    );
} 