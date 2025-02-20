import type { Metadata } from "next";
import { HeaderTypeProvider } from "@/components/header/header-type-provider";
import { HeaderType } from "@/stores/use-header-store";

export const metadata: Metadata = {
    title: "profile",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <HeaderTypeProvider headerType={"profile" as HeaderType}>{children}</HeaderTypeProvider>;
}
