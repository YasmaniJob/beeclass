
'use client';

import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useMatriculaData } from "@/hooks/use-matricula-data";
import { ReporteFilters } from "@/hooks/use-reporte-asistencia";

interface ReporteFiltrosProps {
    filters: ReporteFilters;
    onFiltersChange: (newFilters: Partial<ReporteFilters>) => void;
}

export function ReporteFiltros({ filters, onFiltersChange }: ReporteFiltrosProps) {
    const { grados: allGrados, seccionesPorGrado } = useMatriculaData();

    const handleGradoChange = (grado: string) => {
        onFiltersChange({ grado, seccion: '' }); // Reset seccion when grado changes
    }

    const handleSeccionChange = (seccion: string) => {
        onFiltersChange({ seccion });
    }
    
    const handleDateChange = (range: DateRange | undefined) => {
        onFiltersChange({ dateRange: range });
    }

    const seccionesDisponibles = filters.grado ? seccionesPorGrado[filters.grado] || [] : [];
    
    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full md:w-[300px] justify-start text-left font-normal",
                            !filters.dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange?.from ? (
                            filters.dateRange.to ? (
                            <>
                                {format(filters.dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                {format(filters.dateRange.to, "LLL dd, y", { locale: es })}
                            </>
                            ) : (
                            format(filters.dateRange.from, "LLL dd, y", { locale: es })
                            )
                        ) : (
                            <span>Selecciona un rango</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={filters.dateRange?.from}
                        selected={filters.dateRange}
                        onSelect={handleDateChange}
                        numberOfMonths={2}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>

            <Select value={filters.grado} onValueChange={handleGradoChange}>
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                    {allGrados.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select value={filters.seccion} onValueChange={handleSeccionChange} disabled={!filters.grado}>
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Seleccionar sección" />
                </SelectTrigger>
                <SelectContent>
                    {seccionesDisponibles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    );
}

