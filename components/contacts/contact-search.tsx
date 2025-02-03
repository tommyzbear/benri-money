import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCallback, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface ContactSearchProps {
    onSearch: (query: string) => void;
}

export function ContactSearch({ onSearch }: ContactSearchProps) {
    const [value, setValue] = useState("");

    const debouncedSearch = useDebounce((value: string) => {
        onSearch(value);
    }, 300);

    const handleSearch = useCallback((value: string) => {
        setValue(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search"
                className="pl-9 bg-white w-full"
                value={value}
                onChange={(e) => handleSearch(e.target.value)}
            />
        </div>
    );
} 