"use client";

import { MobileHeader } from "@/components/mobile-header";
import { DesktopHeader } from "@/components/desktop-header";
import { AccountNav } from "@/components/account/account-nav";
import { QuickActions } from "@/components/quick-actions";

export default function AccountLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Mobile Header - visible only on mobile */}
            <div className="lg:hidden">
                <MobileHeader />
            </div>

            {/* Desktop Header - visible only on desktop */}
            <div className="hidden lg:block">
                <DesktopHeader />
            </div>

            <div className="flex flex-1">
                {/* Desktop Navigation - visible only on desktop */}
                <div className="hidden lg:block lg:w-64 border-r">
                    <AccountNav />
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 lg:p-8 w-full lg:max-w-4xl lg:mx-auto">
                    {children}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
                <QuickActions />
            </div>
        </div>
    );
} 