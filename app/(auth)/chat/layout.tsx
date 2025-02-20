import type { Metadata } from "next";
import { HeaderTypeProvider } from "@/components/header/header-type-provider";
import { HeaderType } from "@/stores/use-header-store";

export const metadata: Metadata = {
    title: "chat",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <HeaderTypeProvider headerType={"balance-sm" as HeaderType}>{children}</HeaderTypeProvider>
    );
}
