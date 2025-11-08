// src/presentation/components/asistencia/AsistenciaForm.tsx
'use client';

import { useMemo, useCallback } from 'react';
import { useAsistenciaStore } from '@/infrastructure/stores/asistenciaStore';
import { EstadoAsistencia } from '@/domain/value-objects/EstadoAsistencia';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AsistenciaForm({ 
  grado, 
  seccion, 
  estudiantes 
}: { 
  grado: string; 
  seccion: string;
  estudiantes: Array<{
    numeroDocumento: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    grado: string;
    seccion: string;
  }>;
}) {
  const {
    asistenciasDelDia,
    isLoading,
    error,
    fechaSeleccionada,
    registrarAsistencia,
    setFecha,
    marcarTodosPresentes
  } = useAsistenciaStore();

  // Filtrar estudiantes de la sección
  const estudiantesSeccion = useMemo(() => {
    return estudiantes.filter(e => e.grado === grado && e.seccion === seccion);
  }, [grado, seccion, estudiantes]);

  const handleEstadoChange = useCallback(async (estudianteId: string, estado: EstadoAsistencia) => {
    // Buscar el estudiante para obtener su nombre
    const estudiante = estudiantesSeccion.find(e => e.numeroDocumento === estudianteId);
    if (!estudiante) {
      console.error('Estudiante no encontrado:', estudianteId);
      return;
    }
    
    // Formatear nombre completo
    const nombreCompleto = `${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno || ''}, ${estudiante.nombres}`.trim();
    
    await registrarAsistencia(estudianteId, nombreCompleto, grado, seccion, estado);
  }, [registrarAsistencia, estudiantesSeccion, grado, seccion]);

  const handleMarcarTodosPresentes = useCallback((estudiantesIds: string[]) => {
    estudiantesIds.forEach((id) => {
      handleEstadoChange(id, EstadoAsistencia.PRESENTE);
    });
  }, [handleEstadoChange]);

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-destructive">Error: {error}</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Control de Asistencia</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setFecha(new Date())}
            variant="outline"
          >
            Hoy
          </Button>
          <Button
            onClick={() => handleMarcarTodosPresentes(estudiantesSeccion.map(e => e.numeroDocumento))}
            disabled={isLoading}
          >
            Marcar Todos como presentes
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {estudiantesSeccion.map(estudiante => {
          const asistencia = asistenciasDelDia.find(a => a.estudianteId === estudiante.numeroDocumento);
          const estadoActual = asistencia?.estado || EstadoAsistencia.SIN_ASISTENCIA;

          return (
            <div key={estudiante.numeroDocumento} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">
                  {estudiante.apellidoPaterno} {estudiante.apellidoMaterno}, {estudiante.nombres}
                </div>
                <div className="text-sm text-muted-foreground">
                  {estudiante.grado} - {estudiante.seccion}
                </div>
              </div>

              <div className="flex gap-2">
                {[EstadoAsistencia.SIN_ASISTENCIA, EstadoAsistencia.PRESENTE, EstadoAsistencia.TARDE, EstadoAsistencia.FALTA, EstadoAsistencia.PERMISO].map((estado) => (
                  <Button
                    key={estado.toString()}
                    variant={estadoActual.equals(estado) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleEstadoChange(estudiante.numeroDocumento, estado)}
                    disabled={isLoading}
                  >
                    {estado.label}
                  </Button>
                ))}
              </div>

              <Badge variant={getBadgeVariant(estadoActual)}>
                {estadoActual.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function getBadgeVariant(estado: EstadoAsistencia) {
  if (estado.equals(EstadoAsistencia.SIN_ASISTENCIA)) return 'secondary';
  if (estado.equals(EstadoAsistencia.PRESENTE)) return 'default';
  if (estado.equals(EstadoAsistencia.TARDE)) return 'secondary';
  if (estado.equals(EstadoAsistencia.FALTA)) return 'destructive';
  if (estado.equals(EstadoAsistencia.PERMISO)) return 'outline';

  return 'secondary';
}
