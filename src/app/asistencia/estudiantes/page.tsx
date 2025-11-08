
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AsistenciaSeccionesTable } from '@/components/asistencia/asistencia-secciones-table';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { FolderOpen, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useSupabaseData } from '@/hooks/use-supabase-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


export default function AsistenciaDashboardPage() {
  const { user } = useCurrentUser();

  // La vista de "aula" se determina por si el usuario es un docente
  const isTeacherView = user?.rol === 'Docente';
  const baseUrl = isTeacherView ? '/asistencia/aula' : '/asistencia';
  const pageTitle = isTeacherView ? 'Registro de Asistencia en Aula' : 'Asistencia de Estudiantes';
  const pageDescription = isTeacherView
    ? 'Selecciona una de tus secciones asignadas para registrar la asistencia por hora.'
    : 'Selecciona un grado y sección para empezar a registrar la asistencia diaria.';

  const { 
    estudiantes,
    loading,
    refreshEstudiantes 
  } = useSupabaseData();

  // Derivar grados, secciones y estudiantes por sección
  const { allGrados, allSecciones, estudiantesPorSeccion } = useMemo(() => {
    const gradosSet = new Set<string>();
    const seccionesMap = new Map<string, Set<string>>();
    const estudiantesMap = new Map<string, typeof estudiantes>();

    estudiantes.forEach(estudiante => {
      if (estudiante.grado && estudiante.seccion) {
        gradosSet.add(estudiante.grado);
        
        if (!seccionesMap.has(estudiante.grado)) {
          seccionesMap.set(estudiante.grado, new Set());
        }
        seccionesMap.get(estudiante.grado)!.add(estudiante.seccion);

        const key = `${estudiante.grado}-${estudiante.seccion}`;
        if (!estudiantesMap.has(key)) {
          estudiantesMap.set(key, []);
        }
        estudiantesMap.get(key)!.push(estudiante);
      }
    });

    return {
      allGrados: Array.from(gradosSet).sort(),
      allSecciones: Object.fromEntries(
        Array.from(seccionesMap.entries()).map(([grado, secciones]) => [
          grado,
          Array.from(secciones).sort()
        ])
      ),
      estudiantesPorSeccion: Object.fromEntries(estudiantesMap)
    };
  }, [estudiantes]);

  const { grados, seccionesPorGrado } = useMemo(() => {
    if (!user) return { grados: [], seccionesPorGrado: {} };

    // Si NO es docente, muestra todo (Admin, Auxiliar, Director, etc.)
    if (!isTeacherView) {
      return { grados: allGrados, seccionesPorGrado: allSecciones };
    }
    
    // Si es docente, filtra para mostrar solo sus asignaciones
    const asignaciones = user.asignaciones?.filter(a => !a.areaId) || [];
    const gradosAsignados = [...new Set(asignaciones.map(a => a.grado))].sort();
    
    const seccionesAsignadas: Record<string, string[]> = {};
    asignaciones.forEach(a => {
      if (!seccionesAsignadas[a.grado]) seccionesAsignadas[a.grado] = [];
      if (!seccionesAsignadas[a.grado].includes(a.seccion)) {
        seccionesAsignadas[a.grado].push(a.seccion);
      }
    });
    Object.values(seccionesAsignadas).forEach(s => s.sort());

    return { grados: gradosAsignados, seccionesPorGrado: seccionesAsignadas };
  }, [user, allGrados, allSecciones, isTeacherView]);
  

  const { isMobile, isMounted } = useIsMobile();
  const [activeTab, setActiveTab] = useState('');

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
      const seccionesConInfo = (seccionesPorGrado[grado] || []).map(seccion => ({
            grado,
            seccion,
            totalEstudiantes: (estudiantesPorSeccion[`${grado}-${seccion}`] || []).length,
        }));

      return (
        <CardContent className="p-0">
            <AsistenciaSeccionesTable secciones={seccionesConInfo} baseUrl={baseUrl} />
        </CardContent>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground mt-1">
            {pageDescription}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={loading.estudiantes ? "secondary" : "default"}>
            {estudiantes.length} estudiantes
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshEstudiantes}
            disabled={loading.estudiantes}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading.estudiantes ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {grados.length > 0 ? (
          !isMounted ? (
             <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
          ) : isMobile ? (
            <div className="space-y-4">
              <Select onValueChange={handleTabChange} value={activeTab}>
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
              {activeTab && <Card>{renderContent(activeTab)}</Card>}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="flex items-center border-b">
                <TabsList>
                  {grados.map(grado => (
                    <TabsTrigger key={grado} value={grado}>{grado}</TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {grados.map(grado => (
                <TabsContent key={grado} value={grado} className="pt-4">
                  <Card>{renderContent(grado)}</Card>
                </TabsContent>
              ))}
            </Tabs>
          )
        ) : (
          <Card>
            <CardContent className="p-10">
              <PlaceholderContent
                  icon={FolderOpen}
                  title="No se encontraron resultados"
                  description="No tienes secciones asignadas o no hay grados configurados en el sistema."
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
