import type { Metadata } from "next";
import { HeaderTypeProvider } from "@/components/header/header-type-provider";
import { HeaderType } from "@/stores/use-header-store";

export const metadata: Metadata = {
    title: "home",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return <HeaderTypeProvider headerType={"balance" as HeaderType}>{children}</HeaderTypeProvider>;
}
