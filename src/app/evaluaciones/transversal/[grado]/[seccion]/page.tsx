
'use client';

import { useParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { useCompetencias } from '@/hooks/use-competencias';
import { Competencia, Estudiante } from '@/lib/definitions';
import { EvaluacionesTutorTable } from '@/components/evaluaciones/evaluaciones-tutor-table';
import { Skeleton } from '@/components/ui/skeleton';
import { DocentesCalificadoresSheet } from '@/components/evaluaciones/docentes-calificadores-sheet';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function ConsolidadoTransversalPage() {
  const params = useParams();
  const grado = decodeURIComponent(params.grado as string);
  const seccion = decodeURIComponent(params.seccion as string);

  const { docentes, allEstudiantes, areas, isLoaded: isMatriculaLoaded } = useMatriculaData();
  const { allCalificaciones: calificaciones } = useCompetencias();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const isLoading = !isMatriculaLoaded;

  const { estudiantes, competenciasTransversales } = useMemo(() => {
    if (isLoading) return { estudiantes: [], competenciasTransversales: [] };

    const estudiantesDeSeccion = allEstudiantes
        .filter(e => e.grado === grado && e.seccion === seccion)
        .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));

    const areaTransversal = areas.find(a => a.nombre === 'Competencias Transversales');
    const competencias = areaTransversal?.competencias || [];
    
    return { estudiantes: estudiantesDeSeccion, competenciasTransversales: competencias };
  }, [grado, seccion, allEstudiantes, areas, isLoading]);
  
  const { docentesCalificados, docentesPendientes } = useMemo(() => {
      if (isLoading) return { docentesCalificados: [], docentesPendientes: [] };

      const docentesAsignados = docentes.filter(d => 
          d.asignaciones?.some(a => a.grado === grado && a.seccion === seccion)
      );

      const calificaron = new Set<string>();
      calificaciones.forEach(c => {
          if (competenciasTransversales.some(ct => ct.id === c.competenciaId)) {
              calificaron.add(c.docenteId);
          }
      });
      
      return {
          docentesCalificados: docentesAsignados.filter(d => calificaron.has(d.numeroDocumento)),
          docentesPendientes: docentesAsignados.filter(d => !calificaron.has(d.numeroDocumento)),
      }
  }, [isLoading, docentes, grado, seccion, calificaciones, competenciasTransversales]);


  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Consolidado de Competencias Transversales
                </h1>
                 <p className="text-muted-foreground mt-1">
                    {`Promedio de calificaciones para ${grado} - ${seccion.replace('Sección ','')}`}
                </p>
            </div>
             <Button variant="outline" onClick={() => setIsSheetOpen(true)}>
                <Users className="mr-2 h-4 w-4" />
                Ver Estado de Docentes ({docentesCalificados.length}/{docentesCalificados.length + docentesPendientes.length})
            </Button>
        </div>
        
        {isLoading ? (
             <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
        ) : (
             <EvaluacionesTutorTable
                estudiantes={estudiantes}
                competencias={competenciasTransversales}
                calificaciones={calificaciones}
             />
        )}
        <DocentesCalificadoresSheet 
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            tituloCompetencia="Competencias Transversales"
            calificados={docentesCalificados}
            pendientes={docentesPendientes}
        />
    </div>
  );
}
