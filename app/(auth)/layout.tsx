import { DesktopHeader } from "@/components/desktop-header";
import { MobileHeader } from "@/components/mobile-header";
import { MobileNav } from "@/components/mobile-nav";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Home",
};

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen">
            <MobileHeader className="lg:hidden" />
            <DesktopHeader className="hidden lg:block" />
            <main className="pb-24 lg:pb-8 p-4 lg:p-8">{children}</main>

            <MobileNav />
        </div>
    );
}
