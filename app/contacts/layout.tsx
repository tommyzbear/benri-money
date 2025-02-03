import { MobileHeader } from "@/components/mobile-header";
import { DesktopHeader } from "@/components/desktop-header";
import { QuickActions } from "@/components/quick-actions";

export default function ContactsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            {/* Mobile Header - visible only on mobile */}
            <div className="lg:hidden">
                <MobileHeader />
            </div>

            {/* Desktop Header - visible only on desktop */}
            <div className="hidden lg:block">
                <DesktopHeader />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 lg:flex-row lg:mx-auto lg:max-w-7xl">
                {children}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
                <QuickActions />
            </div>
        </div>
    );
} 