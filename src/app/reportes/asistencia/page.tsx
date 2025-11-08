
'use client';

import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReporteFiltros } from "@/components/reportes/reporte-filtros";
import { useReporteAsistencia } from "@/hooks/use-reporte-asistencia";
import { ReporteAsistenciaStats } from "@/components/reportes/reporte-asistencia-stats";
import { ReporteAsistenciaTable } from "@/components/reportes/reporte-asistencia-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ReporteAsistenciaChart } from "@/components/reportes/reporte-asistencia-chart";

export default function ReporteAsistenciaPage() {
    const {
        filters,
        setFilters,
        stats,
        estudiantesConteo,
        chartData,
        isLoading,
        periodoSeleccionado,
        pagination,
    } = useReporteAsistencia();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Reporte de Asistencia
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Filtra y analiza los datos de asistencia de los estudiantes.
                    </p>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Filtros del Reporte</CardTitle>
                    <CardDescription>
                        Selecciona el rango de fechas, grado y sección para generar el reporte.
                        {periodoSeleccionado && (
                            <span className="block font-medium text-foreground mt-2">
                                Periodo seleccionado: {periodoSeleccionado}
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReporteFiltros filters={filters} onFiltersChange={setFilters} />
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : (
                <>
                    <ReporteAsistenciaChart data={chartData} />
                    <ReporteAsistenciaStats stats={stats} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalle por Estudiante</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ReporteAsistenciaTable
                                estudiantes={estudiantesConteo}
                                pagination={{
                                    currentPage: pagination.currentPage,
                                    totalPages: pagination.totalPages,
                                    onPageChange: pagination.setPage,
                                }}
                            />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
