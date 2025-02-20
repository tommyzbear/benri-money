import type { Metadata } from "next";
import { HeaderTypeProvider } from "@/components/header/header-type-provider";
import { HeaderType } from "@/stores/use-header-store";

export const metadata: Metadata = {
    title: "payments",
};

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
    return (
        <HeaderTypeProvider headerType={"balance-sm" as HeaderType}>{children}</HeaderTypeProvider>
    );
}
