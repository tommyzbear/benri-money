"use client";

import { AccountNav } from "@/components/account/account-nav";
import { AccountProfile } from "@/components/account/account-profile";
import { AccountDetails } from "@/components/account/account-details";
import { MobileHeader } from "@/components/mobile-header";
import { DesktopHeader } from "@/components/desktop-header";

export default function AccountPage() {
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
                    <AccountProfile />
                    <AccountDetails />
                </div>
            </div>
        </div>
    );
} 