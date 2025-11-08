
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEnRiesgoData } from '@/hooks/use-en-riesgo-data';
import { EnRiesgoTable } from '@/components/en-riesgo/en-riesgo-table';
import { useRiesgoConfig } from '@/hooks/use-riesgo-config';
import { EnRiesgoFiltros } from '@/components/en-riesgo/en-riesgo-filtros';
import { EstudianteEnRiesgo } from '@/hooks/use-en-riesgo-data';
import { SeguimientoSheet } from '@/components/en-riesgo/seguimiento-sheet';
import { useSeguimiento } from '@/hooks/use-seguimiento';
import { RiesgoCharts } from '@/components/en-riesgo/riesgo-charts';
import { useCurrentUser } from '@/hooks/use-current-user';
import { AuthGuard } from '@/components/auth-guard';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { AlertTriangle } from 'lucide-react';
import { useMatriculaData } from '@/hooks/use-matricula-data';

export type EnRiesgoFilters = {
    grado: string[];
    riesgo: ('Faltas' | 'Incidentes' | 'Notas Bajas' | 'Ambos')[];
}

export default function EnRiesgoPage() {
  const { user, isLoaded: isUserLoaded } = useCurrentUser();
  const { allEstudiantes, isLoaded: isMatriculaLoaded } = useMatriculaData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EnRiesgoFilters>({ grado: [], riesgo: [] });
  const { faltasThreshold, incidentesThreshold, notasReprobadasThreshold } = useRiesgoConfig();
  const { estudiantesEnRiesgo, isLoading } = useEnRiesgoData(faltasThreshold, incidentesThreshold, notasReprobadasThreshold);
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteEnRiesgo | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { seguimientos, addSeguimiento, getSeguimientosForEstudiante } = useSeguimiento();

  const userRole = user?.rol;
  const canManageSeguimiento = userRole === 'Admin' || userRole === 'Auxiliar';
  const isAuthorized = Boolean(userRole);

  if (!isUserLoaded) {
    return (
      <Card>
        <CardContent className="p-10">
          <PlaceholderContent
            icon={AlertTriangle}
            title="Cargando usuario"
            description="Preparando el centro de intervención..."
          />
        </CardContent>
      </Card>
    );
  }

  const seguimientosPorEstudiante = useMemo(() => {
    const map = new Map<string, number>();
    seguimientos.forEach(s => {
        map.set(s.estudianteId, (map.get(s.estudianteId) || 0) + 1);
    });
    return map;
  }, [seguimientos]);

  const visibleEstudiantes = useMemo(() => {
    if (!user || !userRole) {
      return estudiantesEnRiesgo;
    }

    if (userRole === 'Docente' || userRole === 'Auxiliar') {
      const asignaciones = user.asignaciones ?? [];
      if (asignaciones.length === 0) return [];
      const seccionesAsignadas = new Set(
        asignaciones
          .filter(asignacion => asignacion.grado && asignacion.seccion)
          .map(asignacion => `${asignacion.grado}|${asignacion.seccion}`)
      );

      return estudiantesEnRiesgo.filter(est => {
        const key = `${est.grado}|${est.seccion}`;
        return seccionesAsignadas.has(key);
      });
    }

    // Otros roles tienen acceso a la vista completa.
    return estudiantesEnRiesgo;
  }, [estudiantesEnRiesgo, user, userRole]);

  const uniqueGrados = useMemo(() => {
    const grados = visibleEstudiantes.map(e => e.grado).filter(Boolean) as string[];
    return Array.from(new Set(grados)).sort((a, b) => a.localeCompare(b, 'es'));
  }, [visibleEstudiantes]);

  const resumenRiesgo = useMemo(() => {
    const total = visibleEstudiantes.length;
    let porFaltas = 0;
    let porIncidentes = 0;
    let porNotas = 0;
    let multiples = 0;

    visibleEstudiantes.forEach(est => {
      const factores: string[] = [];
      if (faltasThreshold > 0 && est.faltasCount >= faltasThreshold) factores.push('Faltas');
      if (incidentesThreshold > 0 && est.incidentesCount >= incidentesThreshold) factores.push('Incidentes');
      if (notasReprobadasThreshold > 0 && est.notasBajasCount >= notasReprobadasThreshold) factores.push('Notas Bajas');

      if (factores.includes('Faltas')) porFaltas += 1;
      if (factores.includes('Incidentes')) porIncidentes += 1;
      if (factores.includes('Notas Bajas')) porNotas += 1;
      if (factores.length > 1) multiples += 1;
    });

    const topEstudiantes = visibleEstudiantes.slice(0, 5).map(est => {
      const factores: string[] = [];
      if (faltasThreshold > 0 && est.faltasCount >= faltasThreshold) factores.push(`Faltas: ${est.faltasCount}`);
      if (incidentesThreshold > 0 && est.incidentesCount >= incidentesThreshold) factores.push(`Incidentes: ${est.incidentesCount}`);
      if (notasReprobadasThreshold > 0 && est.notasBajasCount >= notasReprobadasThreshold) factores.push(`Notas C: ${est.notasBajasCount}`);

      return {
        nombre: `${est.apellidoPaterno} ${est.apellidoMaterno ?? ''}, ${est.nombres}`.trim(),
        grado: est.grado,
        factores,
      };
    });

    return {
      total,
      porFaltas,
      porIncidentes,
      porNotas,
      multiples,
      topEstudiantes,
    };
  }, [
    visibleEstudiantes,
    faltasThreshold,
    incidentesThreshold,
    notasReprobadasThreshold,
  ]);

  const filteredEstudiantes = useMemo(() => {
    return visibleEstudiantes.filter(estudiante => {
        const term = searchTerm.toLowerCase();
        const searchMatch = (
            `${estudiante.nombres} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}`.toLowerCase().includes(term) || 
            estudiante.numeroDocumento.includes(term)
        );

        const gradoMatch = filters.grado.length === 0 || (estudiante.grado && filters.grado.includes(estudiante.grado));
        
        const riskFactors: ('Faltas' | 'Incidentes' | 'Notas Bajas')[] = [];
        if (estudiante.faltasCount >= faltasThreshold) riskFactors.push('Faltas');
        if (estudiante.incidentesCount >= incidentesThreshold) riskFactors.push('Incidentes');
        if (estudiante.notasBajasCount >= notasReprobadasThreshold) riskFactors.push('Notas Bajas');

        const riesgoMatch = filters.riesgo.length === 0 || filters.riesgo.some(r => {
            if (r === 'Ambos') return riskFactors.length > 1;
            return riskFactors.includes(r as any);
        });

        return searchMatch && gradoMatch && riesgoMatch;
    });
  }, [searchTerm, filters, visibleEstudiantes, faltasThreshold, incidentesThreshold, notasReprobadasThreshold]);

  const handleOpenSeguimiento = (estudiante: EstudianteEnRiesgo) => {
    setSelectedEstudiante(estudiante);
    setIsSheetOpen(true);
  }
  
  if (!isAuthorized) {
    return (
        <AuthGuard>
            <Card>
                <CardContent className="p-10">
                    <PlaceholderContent
                        icon={AlertTriangle}
                        title="Acceso Denegado"
                        description="No tienes permiso para acceder a esta sección."
                    />
                </CardContent>
            </Card>
        </AuthGuard>
    );
  }

  if (!isMatriculaLoaded) {
    return (
      <Card>
        <CardContent className="p-10">
          <PlaceholderContent
            icon={AlertTriangle}
            title="Cargando datos"
            description="Estamos preparando la información académica para mostrar indicadores de riesgo."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Centro de Intervención Temprana
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualiza y gestiona estudiantes que requieren atención por indicadores de riesgo.
          </p>
        </div>
      </div>

      <RiesgoCharts
        isLoading={isLoading}
        total={resumenRiesgo.total}
        faltas={resumenRiesgo.porFaltas}
        incidentes={resumenRiesgo.porIncidentes}
        notas={resumenRiesgo.porNotas}
        multiples={resumenRiesgo.multiples}
        topEstudiantes={resumenRiesgo.topEstudiantes}
      />

      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b">
           <EnRiesgoFiltros
                filters={filters}
                onFiltersChange={setFilters}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                gradosOptions={uniqueGrados}
            />
        </div>
        <CardContent className="p-0">
          <EnRiesgoTable 
            estudiantes={filteredEstudiantes}
            isLoading={isLoading}
            onOpenSeguimiento={handleOpenSeguimiento}
            seguimientosCount={seguimientosPorEstudiante}
            canManageSeguimiento={canManageSeguimiento}
          />
        </CardContent>
      </Card>

      {selectedEstudiante && (
        <SeguimientoSheet
            estudiante={selectedEstudiante}
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            onAddSeguimiento={addSeguimiento}
            getSeguimientosForEstudiante={getSeguimientosForEstudiante}
            canManage={canManageSeguimiento}
        />
      )}
    </div>
  );
}
