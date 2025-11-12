'use client';

/**
 * Página de Calificación de Sesiones de Aprendizaje
 * 
 * Sistema extensible de tipos de evaluación. Ver documentación completa en:
 * src/components/evaluaciones/README-TIPOS-EVALUACION.md
 */

import { useParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCalificacionesSesion } from '@/hooks/use-calificaciones-sesion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { BookCopy, Save, Calendar, ClipboardList, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalificacionesSesionTable } from '@/components/evaluaciones/calificaciones-sesion-table';
import { EvaluationTypeSelector } from '@/components/evaluaciones/evaluation-type-selector';
import { TipoEvaluacion } from '@/types/evaluacion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function CalificarSesionPage() {
    const params = useParams<{ grado: string, seccion: string, areaId: string, sesionId: string }>();
    
    // Decodificar parámetros ANTES de pasarlos al hook
    const grado = decodeURIComponent(params.grado);
    const seccion = decodeURIComponent(params.seccion);
    const areaId = decodeURIComponent(params.areaId);
    const sesionId = decodeURIComponent(params.sesionId);
    
    const { 
        sesion, 
        competencia, 
        estudiantes, 
        calificaciones, 
        isLoading, 
        handleNotaChange,
        handleSaveChanges,
        changedStudentIds
    } = useCalificacionesSesion(grado, seccion, sesionId);
    
    // Estado para el tipo de evaluación - inicializar desde la sesión
    const [tipoEvaluacion, setTipoEvaluacion] = useState<TipoEvaluacion>('directa');
    
    // Actualizar el tipo de evaluación cuando se carga la sesión
    useEffect(() => {
        if (sesion?.tipoEvaluacion) {
            setTipoEvaluacion(sesion.tipoEvaluacion);
        }
    }, [sesion]);

    // Calcular estadísticas por nota
    const estadisticas = useMemo(() => {
        const total = estudiantes.length;
        const notasCount = {
            AD: 0,
            A: 0,
            B: 0,
            C: 0,
            pendientes: 0
        };

        estudiantes.forEach(est => {
            const nota = calificaciones[est.numeroDocumento];
            if (nota) {
                notasCount[nota]++;
            } else {
                notasCount.pendientes++;
            }
        });

        return { total, ...notasCount };
    }, [estudiantes, calificaciones]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    if (!sesion || !competencia) {
        return <PlaceholderContent icon={BookCopy} title="Sesión no encontrada" description="No se pudo encontrar la sesión de aprendizaje." />
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb y fecha */}
            <div className="flex items-center justify-between">
                <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Link href="/docentes/mis-clases" className="hover:text-foreground transition-colors">
                        Mis Clases
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link 
                        href={`/evaluaciones/${encodeURIComponent(grado)}/${encodeURIComponent(seccion)}/${encodeURIComponent(areaId)}`}
                        className="hover:text-foreground transition-colors"
                    >
                        Libreta de Notas
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground font-medium">{sesion.titulo}</span>
                </nav>
                <div className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(sesion.fecha), "d 'de' MMMM, yyyy", { locale: es })}</span>
                </div>
            </div>

            {/* Header con selector de tipo de evaluación */}
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold tracking-tight font-headline">{sesion.titulo}</h1>
                    <div className="text-muted-foreground mt-2 space-y-2">
                        <p>
                            <span className="font-semibold text-foreground">{competencia.nombre}</span>
                        </p>
                        {sesion.capacidades && sesion.capacidades.length > 0 && (
                             <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-medium">Capacidades:</span>
                                {sesion.capacidades.map((cap, index) => (
                                    <Badge key={index} variant="outline">{cap}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selector de tipo de evaluación - compacto */}
                <div className="flex-shrink-0">
                    <EvaluationTypeSelector
                        selectedType={tipoEvaluacion}
                        onTypeChange={setTipoEvaluacion}
                    />
                </div>
            </div>
            
            {/* Cards de estadísticas por nota */}
            <div className="grid grid-cols-5 gap-3">
                <Card className="hover:shadow-sm transition-shadow cursor-pointer border-green-200 bg-green-50/30 dark:bg-green-950/10">
                    <CardContent className="py-2 px-3">
                        <div className="flex flex-col items-center text-center gap-0.5">
                            <div className="text-xl font-bold text-green-600">{estadisticas.AD}</div>
                            <div className="text-xs font-medium text-green-700 dark:text-green-400">AD</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-sm transition-shadow cursor-pointer border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
                    <CardContent className="py-2 px-3">
                        <div className="flex flex-col items-center text-center gap-0.5">
                            <div className="text-xl font-bold text-blue-600">{estadisticas.A}</div>
                            <div className="text-xs font-medium text-blue-700 dark:text-blue-400">A</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-sm transition-shadow cursor-pointer border-yellow-200 bg-yellow-50/30 dark:bg-yellow-950/10">
                    <CardContent className="py-2 px-3">
                        <div className="flex flex-col items-center text-center gap-0.5">
                            <div className="text-xl font-bold text-yellow-600">{estadisticas.B}</div>
                            <div className="text-xs font-medium text-yellow-700 dark:text-yellow-400">B</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-sm transition-shadow cursor-pointer border-red-200 bg-red-50/30 dark:bg-red-950/10">
                    <CardContent className="py-2 px-3">
                        <div className="flex flex-col items-center text-center gap-0.5">
                            <div className="text-xl font-bold text-red-600">{estadisticas.C}</div>
                            <div className="text-xs font-medium text-red-700 dark:text-red-400">C</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-sm transition-shadow cursor-pointer border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
                    <CardContent className="py-2 px-3">
                        <div className="flex flex-col items-center text-center gap-0.5">
                            <div className="text-xl font-bold text-amber-600">{estadisticas.pendientes}</div>
                            <div className="text-xs font-medium text-amber-700 dark:text-amber-400">Pendientes</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Renderizado condicional según tipo de evaluación */}
            {tipoEvaluacion === 'directa' && (
                <Card>
                    <CardContent className="p-0">
                        <CalificacionesSesionTable
                            estudiantes={estudiantes}
                            calificaciones={calificaciones}
                            onNotaChange={handleNotaChange}
                            changedStudentIds={changedStudentIds}
                        />
                    </CardContent>
                </Card>
            )}

            {/* TODO: Implementar ListaCotejoTable - Ver README-TIPOS-EVALUACION.md */}
            {tipoEvaluacion === 'lista-cotejo' && (
                <PlaceholderContent 
                    icon={ClipboardList}
                    title="Lista de Cotejo"
                    description="Esta funcionalidad estará disponible próximamente"
                />
            )}

            {/* TODO: Implementar RubricaTable - Ver README-TIPOS-EVALUACION.md */}
            {tipoEvaluacion === 'rubrica' && (
                <PlaceholderContent 
                    icon={Table2}
                    title="Rúbrica"
                    description="Esta funcionalidad estará disponible próximamente"
                />
            )}

            {changedStudentIds.size > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <Button size="lg" onClick={() => handleSaveChanges(tipoEvaluacion)} className="shadow-lg">
                        <Save className="mr-2 h-5 w-5" />
                        Guardar Cambios
                        <Badge variant="secondary" className="ml-2">{changedStudentIds.size}</Badge>
                    </Button>
                </div>
            )}
        </div>
    );
}