"use client";

import { useHeaderStore, HeaderType } from "@/stores/use-header-store";
import { useEffect } from "react";

interface HeaderTypeProviderProps {
    headerType: HeaderType;
    children: React.ReactNode;
}

export function HeaderTypeProvider({ headerType, children }: HeaderTypeProviderProps) {
    const { setHeaderType } = useHeaderStore();

    useEffect(() => {
        setHeaderType(headerType);
        return () => {
            setHeaderType("" as HeaderType);
        };
    }, [setHeaderType, headerType]);

    return <>{children}</>;
}
