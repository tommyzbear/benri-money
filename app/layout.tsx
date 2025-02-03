import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { DesktopHeader } from "@/components/desktop-header";
import { MobileHeader } from "@/components/mobile-header";
import { QuickActions } from "@/components/quick-actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PaymentApp",
  description: "A modern payment application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main className="min-h-screen bg-background">
            <div className="flex flex-col min-h-screen">
              {/* Mobile Header - visible only on mobile */}
              <div className="lg:hidden">
                <MobileHeader />
              </div>

              {/* Desktop Header - visible only on desktop */}
              <div className="hidden lg:block">
                <DesktopHeader />
              </div>
              <div className="pb-24 lg:pb-8">
                {children}
              </div>


              {/* Mobile Bottom Navigation */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
                <QuickActions />
              </div>
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
