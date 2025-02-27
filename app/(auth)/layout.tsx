import { DesktopHeader } from "@/components/desktop-header";
import { MobileHeader } from "@/components/header/mobile-header";
import { MobileNav } from "@/components/mobile-nav";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { privy } from "@/lib/privy";
import { redirect } from "next/navigation";
import { AnimatePresence } from "framer-motion";
export const metadata: Metadata = {
    title: {
        template: "%s · benri",
        default: "benri",
    },
};

async function checkAuth() {
    const cookieStore = cookies();
    const cookieAuthToken = cookieStore.get("privy-token");

    if (!cookieAuthToken) return null;

    try {
        const claims = await privy.verifyToken(cookieAuthToken.value);
        return claims;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export default async function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const auth = await checkAuth();

    if (!auth) {
        redirect("/login");
    }

    return (
        <div className="flex flex-col bg-background px-4 sm:px-0 max-h-screen">
            <AnimatePresence initial={false} mode="popLayout">
                <DesktopHeader className="hidden lg:block" />
                <div className="h-full overflow-hidden">
                    <MobileHeader className="lg:hidden" />
                    <main className="py-6 w-full lg:pb-8 lg:p-8">{children}</main>
                    <MobileNav />
                </div>
            </AnimatePresence>
        </div>
    );
}
