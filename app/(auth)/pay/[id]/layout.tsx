import { DesktopHeader } from "@/components/desktop-header";
import { MobileHeader } from "@/components/header/mobile-header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "PaymentApp",
    description: "A modern payment application",
    appleWebApp: {
        capable: true,
        title: "Wanderer",
        statusBarStyle: "black-translucent",
    },
};

export default function PayLayout({
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
            <div className="pb-24 lg:pb-8 p-4 lg:p-8">{children}</div>
        </div>
    );
}
