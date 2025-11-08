
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { SeccionEvaluacionCard } from '@/components/evaluaciones/seccion-evaluacion-card';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { CheckCheck } from 'lucide-react';

export default function EvaluacionesPage() {
  const { user } = useCurrentUser();
  const { 
    docentes,
    allGrados, 
    seccionesPorGrado: allSecciones, 
    estudiantesPorSeccion, 
  } = useMatriculaData();
  
  const { grados, seccionesPorGrado } = useMemo(() => {
    if (!user) {
      return { grados: [], seccionesPorGrado: {} };
    }
    
    // Para Admin y Auxiliar, mostrar todas las secciones que tengan un tutor asignado.
    if (user.rol === 'Admin' || user.rol === 'Auxiliar') {
        const gradosConTutor: string[] = [];
        const seccionesConTutor: Record<string, string[]> = {};

        allGrados.forEach(grado => {
            const seccionesDelGrado = allSecciones[grado] || [];
            const seccionesFiltradas = seccionesDelGrado.filter(seccion => 
                docentes.some(d => d.asignaciones?.some(a => a.grado === grado && a.seccion === seccion && a.rol === 'Docente y Tutor'))
            );
            if (seccionesFiltradas.length > 0) {
                gradosConTutor.push(grado);
                seccionesConTutor[grado] = seccionesFiltradas;
            }
        });

      return { grados: gradosConTutor, seccionesPorGrado: seccionesConTutor };
    }

    // Para Docentes, mostrar solo las secciones donde son tutores
    const asignaciones = user.asignaciones?.filter(a => a.rol === 'Docente y Tutor') || [];
    const gradosAsignados = [...new Set(asignaciones.map(a => a.grado))].sort();
    
    const seccionesAsignadas: Record<string, string[]> = {};
    asignaciones.forEach(a => {
      if (!seccionesAsignadas[a.grado]) {
        seccionesAsignadas[a.grado] = [];
      }
      if (!seccionesAsignadas[a.grado].includes(a.seccion)) {
        seccionesAsignadas[a.grado].push(a.seccion);
      }
    });
    // Ordenar secciones
    for (const grado of Object.keys(seccionesAsignadas)) {
        seccionesAsignadas[grado].sort();
    }

    return { grados: gradosAsignados, seccionesPorGrado: seccionesAsignadas };
  }, [user, allGrados, allSecciones, docentes]);
  
  const { isMobile, isMounted } = useIsMobile();
  const [activeTab, setActiveTab] = useState(grados[0] || '');

  useEffect(() => {
    if (grados.length > 0 && !grados.includes(activeTab)) {
      setActiveTab(grados[0]);
    } else if (grados.length === 0) {
      setActiveTab('');
    }
  }, [grados, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const renderContent = (grado: string) => {
    const secciones = seccionesPorGrado[grado] || [];
    if (secciones.length === 0) {
        return <PlaceholderContent icon={CheckCheck} title="Sin secciones" description="No hay secciones con tutor asignado para este grado." className="my-8" />
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secciones.map(seccion => (
                <SeccionEvaluacionCard 
                    key={seccion}
                    grado={grado}
                    seccion={seccion}
                    totalEstudiantes={(estudiantesPorSeccion[grado]?.[seccion] || []).length}
                    isTutorView={true}
                />
            ))}
        </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Consolidado Transversal
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecciona una sección para ver el consolidado de competencias transversales.
          </p>
        </div>
      </div>

      {!isMounted ? (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
      ) : isMobile ? (
        <div className="space-y-4">
          <Select onValueChange={handleTabChange} value={activeTab} disabled={grados.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un grado" />
            </SelectTrigger>
            <SelectContent>
              {grados.map(grado => (
                <SelectItem key={grado} value={grado}>
                  {grado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeTab && renderContent(activeTab)}
          {grados.length === 0 && <PlaceholderContent icon={CheckCheck} title="No hay secciones de tutoría" description="No hay secciones con tutor asignado para mostrar." className="my-8"/>}
        </div>
      ) : (
        grados.length > 0 ? (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="flex items-center border-b">
                <TabsList>
                  {grados.map(grado => (
                      <TabsTrigger key={grado} value={grado}>{grado}</TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {grados.map(grado => (
                <TabsContent key={grado} value={grado} className="pt-6">
                  {renderContent(grado)}
                </TabsContent>
              ))}
            </Tabs>
        ) : (
            <PlaceholderContent icon={CheckCheck} title="No hay secciones de tutoría" description="No hay secciones con tutor asignado para mostrar." className="my-8" />
        )
      )}
    </div>
  );
}
