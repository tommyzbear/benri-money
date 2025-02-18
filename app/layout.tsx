import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: {
        template: "%s · benri",
        default: "benri",
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
