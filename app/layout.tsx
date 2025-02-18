import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import { cookies } from "next/headers";
import { privyClient } from "@/lib/privy";

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

const libreBaskerville = localFont({
    src: [
        {
            path: "./fonts/LibreBaskerville-Regular.ttf",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/LibreBaskerville-Bold.ttf",
            weight: "700",
            style: "normal",
        },
        {
            path: "./fonts/LibreBaskerville-Italic.ttf",
            weight: "400",
            style: "italic",
        },
    ],
    variable: "--font-libre",
});

const roboto = localFont({
    src: [
        {
            path: "./fonts/Roboto-VariableFont_wdth,wght.ttf",
            weight: "100 900",
            style: "normal",
        },
        {
            path: "./fonts/Roboto-Italic-VariableFont_wdth,wght.ttf",
            weight: "100 900",
            style: "italic",
        },
    ],
    variable: "--font-variable",
});

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
            <body className={`${libreBaskerville.variable} ${roboto.className} font-sans`}>
                <Providers>
                    <main className="min-h-screen bg-background">{children}</main>
                </Providers>
                <Toaster />
            </body>
        </html>
    );
}
