"use client";

import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useCallback } from "react";
import { useContactsStore } from "@/stores/use-contacts-store";
import { Button } from "@/components/ui/button";
export function ContactSearchBar() {
    const { searchQuery, setSearchQuery } = useContactsStore();

    const debouncedSearch = useDebounce((value: string) => {
        setSearchQuery(value);
    }, 300);

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            debouncedSearch(e.target.value);
        },
        [debouncedSearch]
    );

    return (
        <div className="relative bg-secondary">
            <div className="flex flex-row items-center gap-2 h-12 px-3 py-2.5">
                <div className="h-full w-full bg-white rounded-full overflow-hidden">
                    <Search className="absolute left-6 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder=""
                        className="pl-7 h-full w-full"
                        onChange={handleSearch}
                        defaultValue={searchQuery}
                    />
                </div>
                <Button className="h-full rounded-full bg-white text-muted-foreground w-fit p-2">
                    <Filter className="h-4 w-4" />
                </Button>
                <Button className="h-full rounded-xl bg-muted-foreground p-3">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
