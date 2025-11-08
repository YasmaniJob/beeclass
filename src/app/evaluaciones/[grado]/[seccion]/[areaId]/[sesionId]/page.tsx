'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useCalificacionesSesion } from '@/hooks/use-calificaciones-sesion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { BookCopy, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalificacionesSesionTable } from '@/components/evaluaciones/calificaciones-sesion-table';

export default function CalificarSesionPage() {
    const params = useParams<{ grado: string, seccion: string, areaId: string, sesionId: string }>();
    const { 
        sesion, 
        competencia, 
        estudiantes, 
        calificaciones, 
        isLoading, 
        handleNotaChange,
        handleSaveChanges,
        changedStudentIds
    } = useCalificacionesSesion(params.grado, params.seccion, params.sesionId);

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
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">{sesion.titulo}</h1>
                <div className="text-muted-foreground mt-2 space-y-2">
                    <p>
                        Registra las calificaciones de la sesión para la competencia: <span className="font-semibold text-foreground">{competencia.nombre}</span>.
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
            
             <Card>
                <CardHeader>
                    <CardTitle>Calificaciones de la Sesión</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <CalificacionesSesionTable
                        estudiantes={estudiantes}
                        calificaciones={calificaciones}
                        onNotaChange={handleNotaChange}
                        changedStudentIds={changedStudentIds}
                    />
                </CardContent>
            </Card>

            {changedStudentIds.size > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <Button size="lg" onClick={handleSaveChanges} className="shadow-lg">
                        <Save className="mr-2 h-5 w-5" />
                        Guardar Cambios
                        <Badge variant="secondary" className="ml-2">{changedStudentIds.size}</Badge>
                    </Button>
                </div>
            )}
        </div>
    );
}