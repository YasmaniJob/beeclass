
'use client';

import { EstudianteFilters } from "@/app/estudiantes/[grado]/[seccion]/page";
import { FiltrosSheet, FilterOption } from "@/components/filtros/filtros-sheet";
import { SearchInput } from "@/components/filtros/search-input";

interface EstudiantesFiltrosProps {
    filters: EstudianteFilters;
    onFiltersChange: (filters: EstudianteFilters) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

const filterOptions: FilterOption[] = [
    {
        id: 'estado',
        label: 'Estado',
        options: ['Activo', 'Inactivo', 'Retirado', 'Trasladado'],
    },
];

export function EstudiantesFiltros({
    filters,
    onFiltersChange,
    searchTerm,
    onSearchTermChange,
}: EstudiantesFiltrosProps) {

    const handleCheckboxChange = (filterId: string, value: string, checked: boolean) => {
        onFiltersChange({
            ...filters,
            [filterId]: checked
                ? [...(filters[filterId as keyof EstudianteFilters] || []), value]
                : (filters[filterId as keyof EstudianteFilters] || []).filter(item => item !== value),
        });
    };

    const handleClearFilters = () => {
        onFiltersChange({ estado: [] });
    };

    const activeFilterCount = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);

    return (
        <>
            <SearchInput
                searchTerm={searchTerm}
                onSearchTermChange={onSearchTermChange}
                placeholder="Buscar por nombre, apellidos o n° doc..."
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
