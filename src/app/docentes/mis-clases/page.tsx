
'use client';

import { useMemo } from "react";
import { AreaCurricular } from "@/lib/definitions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMatriculaData } from "@/hooks/use-matricula-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookUser, Users } from "lucide-react";
import { PlaceholderContent } from "@/components/ui/placeholder-content";
import { AreaCalificacionCard } from "@/components/evaluaciones/area-calificacion-card";
import { useCompetencias } from "@/hooks/use-competencias";


export default function MisClasesPage() {
    const { user } = useCurrentUser();
    const { allAreas, estudiantesPorSeccion } = useMatriculaData();
    const { allCalificaciones: calificaciones } = useCompetencias();


    const asignacionesAgrupadas = useMemo(() => {
        if (!user?.asignaciones) return [];
        
        const asignacionesPrincipales = user.asignaciones
            .filter(a => !a.areaId)
            .sort((a, b) => `${a.grado}-${a.seccion}`.localeCompare(`${b.grado}-${b.seccion}`));

        return asignacionesPrincipales.map(asigPrincipal => {
            const areasAsignadasIds = new Set(user.asignaciones
                ?.filter(a => a.grado === asigPrincipal.grado && a.seccion === asigPrincipal.seccion && a.areaId)
                .map(a => a.areaId as string));

            const areas = allAreas.filter(area => areasAsignadasIds.has(area.id));
            
            return {
                ...asigPrincipal,
                areasAsignadas: areas,
                totalEstudiantes: (estudiantesPorSeccion[asigPrincipal.grado]?.[asigPrincipal.seccion] || []).length
            }
        });
    }, [user, allAreas, estudiantesPorSeccion]);
    
    const calificacionesPorArea = useMemo(() => {
        const porArea: Record<string, { calif: any[] }> = {};

        if (!user || !calificaciones) return porArea;

        const califsDocente = calificaciones.filter(c => c.docenteId === user.numeroDocumento);
        
        for(const calif of califsDocente) {
             if (!porArea[calif.areaId]) porArea[calif.areaId] = { calif: [] };
             porArea[calif.areaId].calif.push(calif);
        }

        return porArea;
    }, [calificaciones, user]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Panel del Docente
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Bienvenido/a, {user?.nombres}. Aquí tienes un resumen de tus clases y áreas asignadas.
                    </p>
                </div>
            </div>
            
            {asignacionesAgrupadas.length > 0 ? (
                <div className="space-y-8">
                    {asignacionesAgrupadas.map(asig => {
                        const esTutor = asig.rol === 'Docente y Tutor';
                        // Detectar nivel: Secundaria incluye explícitamente "Secundaria" o grados 1-5
                        const esSecundaria = asig.grado.includes('Secundaria') || 
                                           ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado'].includes(asig.grado);
                        const nivel = esSecundaria ? 'Secundaria' : 'Primaria';
                        
                        // Buscar área de competencias transversales con múltiples variantes
                        const areaTransversal = allAreas.find(a => {
                            const nombreMatch = a.nombre.toLowerCase().includes('competencias transversales') || 
                                              a.nombre.toLowerCase().includes('transversales');
                            const nivelMatch = a.nivel === nivel;
                            return nombreMatch && nivelMatch;
                        });

                        return (
                            <Card key={asig.id}>
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <CardTitle>{asig.grado} - {asig.seccion.replace('Sección ','')}</CardTitle>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>{asig.totalEstudiantes} estudiantes</span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground pt-1">
                                        <Badge variant={esTutor ? 'default' : 'secondary'}>
                                            {asig.rol}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {/* Mostrar competencias transversales agrupadas si tiene áreas asignadas O es tutor */}
                                        {(asig.areasAsignadas.length > 0 || esTutor) && areaTransversal && areaTransversal.competencias.length > 0 && (
                                            <AreaCalificacionCard
                                                key={`transversal-${areaTransversal.id}`}
                                                area={{
                                                    ...areaTransversal,
                                                    nombre: 'Áreas Transversales'
                                                }}
                                                grado={asig.grado}
                                                seccion={asig.seccion}
                                                totalEstudiantes={asig.totalEstudiantes}
                                                totalCalificados={new Set((calificacionesPorArea[areaTransversal.id]?.calif || []).map(c => c.estudianteId)).size}
                                                isTransversal
                                                isTutor={esTutor}
                                            />
                                        )}
                                        {asig.areasAsignadas.map(area => {
                                            const totalCalificados = new Set((calificacionesPorArea[area.id]?.calif || []).map(c => c.estudianteId)).size;
                                            return (
                                                <AreaCalificacionCard 
                                                    key={area.id}
                                                    area={area}
                                                    grado={asig.grado}
                                                    seccion={asig.seccion}
                                                    totalEstudiantes={asig.totalEstudiantes}
                                                    totalCalificados={totalCalificados}
                                                />
                                            )
                                        })}
                                    </div>
                                    {asig.areasAsignadas.length === 0 && !esTutor && (
                                         <p className="text-sm text-muted-foreground italic text-center py-4">Un administrador aún no te ha asignado áreas para calificar en esta sección.</p>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-10">
                        <PlaceholderContent
                            icon={BookUser}
                            title="Sin asignaciones"
                            description="Aún no te han asignado a ninguna sección. Contacta a un administrador para que te asigne a una o más secciones."
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
