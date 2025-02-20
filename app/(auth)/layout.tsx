import { DesktopHeader } from "@/components/desktop-header";
import { MobileHeader } from "@/components/header/mobile-header";
import { MobileNav } from "@/components/mobile-nav";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { privyClient } from "@/lib/privy";
import { redirect } from "next/navigation";

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
        const claims = await privyClient.verifyAuthToken(cookieAuthToken.value);
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
        <div className="flex flex-col min-h-screen px-4 border bg-background">
            <MobileHeader className="lg:hidden" />
            <DesktopHeader className="hidden lg:block" />
            <main className="py-6 w-full lg:pb-8 lg:p-8">{children}</main>
            <MobileNav />
        </div>
    );
}
