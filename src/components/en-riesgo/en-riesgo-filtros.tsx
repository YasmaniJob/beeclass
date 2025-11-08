
'use client';

import { EnRiesgoFilters } from "@/app/en-riesgo/page";
import { FiltrosSheet, FilterOption } from "@/components/filtros/filtros-sheet";
import { SearchInput } from "@/components/filtros/search-input";
import { useMemo } from "react";

interface EnRiesgoFiltrosProps {
    filters: EnRiesgoFilters;
    onFiltersChange: (filters: EnRiesgoFilters) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    gradosOptions: string[];
}

const riesgoOptions: ('Faltas' | 'Incidentes' | 'Notas Bajas' | 'Ambos')[] = ['Faltas', 'Incidentes', 'Notas Bajas', 'Ambos'];

export function EnRiesgoFiltros({
    filters,
    onFiltersChange,
    searchTerm,
    onSearchTermChange,
    gradosOptions,
}: EnRiesgoFiltrosProps) {

    const filterOptions: FilterOption[] = useMemo(() => [
        {
            id: 'grado',
            label: 'Grado',
            options: gradosOptions,
        },
        {
            id: 'riesgo',
            label: 'Tipo de Riesgo',
            options: riesgoOptions,
        }
    ], [gradosOptions]);


    const handleCheckboxChange = (filterId: string, value: string, checked: boolean) => {
        onFiltersChange({
            ...filters,
            [filterId]: checked
                ? [...(filters[filterId as keyof EnRiesgoFilters] || []), value]
                : (filters[filterId as keyof EnRiesgoFilters] || []).filter(item => item !== value),
        } as EnRiesgoFilters);
    };

    const handleClearFilters = () => {
        onFiltersChange({ grado: [], riesgo: [] });
    };

    const activeFilterCount = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);

    return (
        <>
            <SearchInput
                searchTerm={searchTerm}
                onSearchTermChange={onSearchTermChange}
                placeholder="Buscar por nombre, apellidos o documento..."
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
