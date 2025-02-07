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

export default function LoginLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}