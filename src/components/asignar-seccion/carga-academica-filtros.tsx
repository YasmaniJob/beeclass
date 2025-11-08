
'use client';

import { SearchInput } from "@/components/filtros/search-input";
import { Label } from "@/components/ui/label";

interface CargaAcademicaFiltrosProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

export function CargaAcademicaFiltros({
    searchTerm,
    onSearchTermChange,
}: CargaAcademicaFiltrosProps) {

    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="search-input">Buscar Personal</Label>
                 <SearchInput
                    searchTerm={searchTerm}
                    onSearchTermChange={onSearchTermChange}
                    placeholder="Buscar por nombre, apellidos, doc..."
                />
            </div>
        </div>
    );
}
