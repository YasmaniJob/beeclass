
'use client';

import { EstudianteFilters } from "@/app/estudiantes/[grado]/[seccion]/page";
import { FiltrosSheet, FilterOption } from "@/components/filtros/filtros-sheet";
import { SearchInput } from "@/components/filtros/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EstudiantesFiltrosProps {
    filters: EstudianteFilters;
    onFiltersChange: (filters: EstudianteFilters) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    grados?: string[];
    secciones?: string[];
    gradoActual?: string;
    seccionActual?: string;
    onGradoChange?: (grado: string) => void;
    onSeccionChange?: (seccion: string) => void;
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
    grados = [],
    secciones = [],
    gradoActual,
    seccionActual,
    onGradoChange,
    onSeccionChange,
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
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
            {grados.length > 0 && onGradoChange && (
                <Select value={gradoActual} onValueChange={onGradoChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                        {grados.map((grado) => (
                            <SelectItem key={grado} value={grado}>
                                {grado}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            
            {secciones.length > 0 && onSeccionChange && (
                <Select value={seccionActual} onValueChange={onSeccionChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Seleccionar sección" />
                    </SelectTrigger>
                    <SelectContent>
                        {secciones.map((seccion) => (
                            <SelectItem key={seccion} value={seccion}>
                                {seccion.replace('Sección ', '')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            
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
        </div>
    );
}
