
'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AreaCurricular, Calificacion } from '@/lib/definitions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { AreaCalificacionCard } from '@/components/evaluaciones/area-calificacion-card';
import { useCompetencias } from '@/hooks/use-competencias';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { BookDashed, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EvaluacionSeccionPage() {
  const params = useParams();
  const grado = decodeURIComponent(params.grado as string);
  const seccion = decodeURIComponent(params.seccion as string);
  const router = useRouter();

  const { user } = useCurrentUser();
  const { allCalificaciones: calificaciones } = useCompetencias();
  const { allEstudiantes, areas } = useMatriculaData();
  
  const esTutor = useMemo(() => {
    if (!user) return false;
    return user.asignaciones?.some(a => a.grado === grado && a.seccion === seccion && a.rol === 'Docente y Tutor');
  }, [user, grado, seccion]);
  
  const esAdminOrAux = user?.rol === 'Admin' || user?.rol === 'Auxiliar';


  const { estudiantes, areasDelDocente } = useMemo(() => {
    const estudiantesDeSeccion = allEstudiantes
        .filter(e => e.grado === grado && e.seccion === seccion)
        .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));

    let areasParaDocente: AreaCurricular[] = [];
    if (user?.asignaciones) {
        const areasAsignadasIds = new Set(user.asignaciones
            .filter(a => a.grado === grado && a.seccion === seccion && a.areaId)
            .map(a => a.areaId)
        );
        areasParaDocente = areas.filter(a => areasAsignadasIds.has(a.id) && a.nombre !== 'Competencias Transversales');
    }
    
    return { 
        estudiantes: estudiantesDeSeccion, 
        areasDelDocente: areasParaDocente,
    };
  }, [grado, seccion, allEstudiantes, areas, user]);
  
  const calificacionesPorArea = useMemo(() => {
    const porArea: Record<string, { calif: Calificacion[] }> = {};

    for(const estudiante of estudiantes) {
        const califsEstudiante = calificaciones.filter(c => c.estudianteId === estudiante.numeroDocumento);
        for(const area of areasDelDocente) {
            if (!porArea[area.id]) porArea[area.id] = { calif: [] };

            const califsArea = califsEstudiante.filter(c => c.areaId === area.id);
            if(califsArea.length > 0) {
                 porArea[area.id].calif.push(...califsArea);
            }
        }
    }
    return porArea;
  }, [calificaciones, estudiantes, areasDelDocente]);


  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {`Áreas Asignadas: ${grado} - ${seccion.replace('Sección ', '')}`}
                </h1>
                 <p className="text-muted-foreground mt-1">
                    Selecciona una de tus áreas para registrar calificaciones.
                </p>
            </div>
            {(esTutor || esAdminOrAux) && (
                <Button asChild>
                    <Link href={`/evaluaciones/transversal/${encodeURIComponent(grado)}/${encodeURIComponent(seccion)}`}>
                        Ver Consolidado Transversal
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            )}
        </div>
       
        {areasDelDocente.length > 0 ? (
            <div>
                 <h2 className="text-xl font-semibold mb-4">Mis Áreas Curriculares</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {areasDelDocente.map(area => {
                        const totalCalificados = new Set((calificacionesPorArea[area.id]?.calif || []).map(c => c.estudianteId)).size;
                        return (
                            <AreaCalificacionCard 
                                key={area.id}
                                area={area}
                                grado={grado}
                                seccion={seccion}
                                totalEstudiantes={estudiantes.length}
                                totalCalificados={totalCalificados}
                            />
                        )
                    })}
                </div>
            </div>
        ) : (
             <Card>
                <CardContent className="p-10">
                    <PlaceholderContent
                        icon={BookDashed}
                        title="Sin áreas asignadas"
                        description="No tienes áreas curriculares asignadas para esta sección en específico."
                    />
                </CardContent>
            </Card>
        )}
    </div>
  );
}
