"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useCallback } from "react";
import { useContactsStore } from "@/stores/use-contacts-store";

export function ContactSearch() {
    const { searchQuery, setSearchQuery } = useContactsStore();

    const debouncedSearch = useDebounce((value: string) => {
        setSearchQuery(value);
    }, 300);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value);
    }, [debouncedSearch]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by email or wallet address"
                className="pl-9"
                onChange={handleSearch}
                defaultValue={searchQuery}
            />
        </div>
    );
} 