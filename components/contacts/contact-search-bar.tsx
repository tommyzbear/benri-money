"use client";

import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { AddFriendDialog } from "@/components/dialogs/add-friend-dialog";

interface ContactSearchBarProps {
    friendSearchQuery: string;
    onSearch: (query: string) => void;
}

export function ContactSearchBar({ friendSearchQuery, onSearch }: ContactSearchBarProps) {
    const [addFriendOpen, setAddFriendOpen] = useState(false);
    const debouncedSearch = useDebounce((value: string) => {
        onSearch(value);
    }, 300);

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            debouncedSearch(e.target.value);
        },
        [debouncedSearch]
    );

    return (
        <div className="relative bg-secondary z-10">
            <div className="flex flex-row items-center gap-2 h-12 px-3 py-2.5">
                <div className="h-full w-full bg-white rounded-full overflow-hidden">
                    <Search className="absolute left-5 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder=""
                        className="pl-8 h-full w-full"
                        onChange={handleSearch}
                        defaultValue={friendSearchQuery}
                    />
                </div>
                {/* <Button className="h-full rounded-full bg-white text-muted-foreground w-fit p-2">
                    <Filter className="h-4 w-4" />
                </Button> */}
                <Button className="h-full rounded-xl bg-muted-foreground p-3 px-5">
                    <Plus className="h-4 w-4" onClick={() => setAddFriendOpen(true)} />
                </Button>
            </div>
            <AddFriendDialog open={addFriendOpen} onOpenChange={setAddFriendOpen} />
        </div>
    );
}
