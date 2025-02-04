"use client";

import { ContactSearch } from "@/components/contacts/contact-search";
import { ContactList } from "@/components/contacts/contact-list";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function ContactListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-lg border flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ContactsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="flex-1 p-4">
            <div className="max-w-3xl mx-auto space-y-4">
                <ContactSearch onSearch={setSearchQuery} />
                <React.Suspense fallback={<ContactListSkeleton />}>
                    <ContactList searchQuery={searchQuery} />
                </React.Suspense>
            </div>
        </div>
    );
} 