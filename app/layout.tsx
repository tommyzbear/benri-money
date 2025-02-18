import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { cookies } from "next/headers";
import { privyClient } from "@/lib/privy";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        template: "%s · Benri",
        default: "Benri",
    },
    description: "Money made convenient",
    appleWebApp: {
        capable: true,
        title: "Benri",
        statusBarStyle: "black-translucent",
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

export { checkAuth };

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <main className="min-h-screen bg-background">{children}</main>
                </Providers>
                <Toaster />
            </body>
        </html>
    );
}
