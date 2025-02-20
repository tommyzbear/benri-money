"use client";

import { useHeaderStore, HeaderType } from "@/stores/use-header-store";
import { useEffect } from "react";

interface HeaderTypeProviderProps {
    headerType: HeaderType;
    children: React.ReactNode;
}

export function HeaderTypeProvider({ headerType, children }: HeaderTypeProviderProps) {
    const { setHeaderType, type: currentType } = useHeaderStore();

    useEffect(() => {
        if (headerType !== currentType) {
            setHeaderType(headerType);
        }
    }, [setHeaderType, headerType, currentType]);

    return <>{children}</>;
}
