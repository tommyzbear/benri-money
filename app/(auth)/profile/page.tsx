"use client";

import { AccountProfile } from "@/components/profile/account-profile";
import { AccountDetails } from "@/components/profile/account-details";
import { useHeaderStore, HeaderType } from "@/stores/use-header-store";
import { useEffect } from "react";

export default function ProfilePage() {
    const { setHeaderType } = useHeaderStore();

    useEffect(() => {
        setHeaderType("profile" as HeaderType);
        return () => {
            setHeaderType("" as HeaderType);
        };
    }, [setHeaderType]);

    return (
        <>
            <AccountProfile />
            <AccountDetails />
        </>
    );
}
