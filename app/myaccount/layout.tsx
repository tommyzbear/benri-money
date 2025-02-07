import { DesktopHeader } from "@/components/desktop-header";
import { MobileHeader } from "@/components/mobile-header";
import { QuickActions } from "@/components/quick-actions";
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

export default function MyAccountLayout({
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
            <div className="pb-24 lg:pb-8 p-4 lg:p-8">
                {children}
            </div>


            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
                <QuickActions />
            </div>
        </div>
    );
}