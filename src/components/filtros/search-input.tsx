'use client';

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    placeholder: string;
}

export function SearchInput({ searchTerm, onSearchTermChange, placeholder }: SearchInputProps) {
    return (
        <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                className="w-full rounded-lg bg-background pl-8"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
            />
        </div>
    );
}