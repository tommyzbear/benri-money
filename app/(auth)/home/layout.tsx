import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "home",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return children;
}
