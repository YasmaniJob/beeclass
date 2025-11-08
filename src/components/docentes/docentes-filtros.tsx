'use client';

import { DocenteFilters } from "@/app/docentes/page";
import { UserRoleEnum } from "@/lib/definitions";
import { FiltrosSheet, FilterOption } from "@/components/filtros/filtros-sheet";
import { SearchInput } from "@/components/filtros/search-input";
import { useCurrentUser } from "@/hooks/use-current-user";

interface DocentesFiltrosProps {
    filters: DocenteFilters;
    onFiltersChange: (filters: DocenteFilters) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

const filterOptions: FilterOption[] = [
    {
        id: 'rol',
        label: 'Rol',
        options: UserRoleEnum.options,
    },
];

export function DocentesFiltros({
    filters,
    onFiltersChange,
    searchTerm,
    onSearchTermChange,
}: DocentesFiltrosProps) {

    const handleCheckboxChange = (filterId: string, value: string, checked: boolean) => {
        onFiltersChange({
            ...filters,
            [filterId]: checked
                ? [...(filters[filterId as keyof DocenteFilters] || []), value]
                : (filters[filterId as keyof DocenteFilters] || []).filter(item => item !== value),
        });
    };

    const handleClearFilters = () => {
        onFiltersChange({ rol: [] });
    };

    const activeFilterCount = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);

    return (
        <>
            <SearchInput
                searchTerm={searchTerm}
                onSearchTermChange={onSearchTermChange}
                placeholder="Buscar por nombre, apellidos, doc..."
            />
            <FiltrosSheet
                options={filterOptions}
                activeFilters={filters}
                onCheckboxChange={handleCheckboxChange}
                onClearFilters={handleClearFilters}
                activeFilterCount={activeFilterCount}
            />
        </>
    );
}
    