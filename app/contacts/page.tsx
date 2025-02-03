"use client";

import { ContactSearch } from "@/components/contacts/contact-search";
import { ContactList } from "@/components/contacts/contact-list";
import { useState } from "react";

export default function ContactsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="w-full p-4 lg:p-8 pb-24 lg:pb-8">
            <div className="space-y-6">
                <ContactSearch onSearch={setSearchQuery} />
                <ContactList searchQuery={searchQuery} />
            </div>
        </div>
    );
} 