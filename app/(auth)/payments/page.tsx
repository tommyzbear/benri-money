"use client";

import Link from "next/link";
import { ContactSearchBar } from "@/components/contacts/contact-search-bar";
import { ContactList } from "@/components/contacts/contact-list";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function PaymentsPage() {
    const [friendSearchQuery, setFriendSearchQuery] = useState("");

    const handleSearch = (query: string) => {
        setFriendSearchQuery(query);
    };

    return (
        <div className="flex flex-col gap-6">
            <div
                className={cn(
                    "flex flex-col gap-0 bg-white",
                    "rounded-3xl p-0 overflow-hidden min-h-[calc(100vh-15.5rem)]",
                    "shadow-md outline-0 border-0 ring-0"
                )}
            >
                <div className="pl-5 pt-2 pb-1 m-0 bg-chart-4 w-full">
                    <h3 className="header-text text-primary-foreground">contacts</h3>
                </div>
                <ContactSearchBar onSearch={handleSearch} friendSearchQuery={friendSearchQuery} />
                <ContactList friendSearchQuery={friendSearchQuery} />
            </div>
        </div>
    );
}
