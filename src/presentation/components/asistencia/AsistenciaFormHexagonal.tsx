// src/presentation/components/asistencia/AsistenciaFormHexagonal.tsx
'use client';

import React, { useMemo } from 'react';
import { useAsistenciaHibrida } from '@/infrastructure/hooks/useAsistenciaHibrida';
import { EstadoAsistencia, EstadoAsistenciaEnum } from '@/domain/value-objects/EstadoAsistencia';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Users, CheckCircle, AlertTriangle } from 'lucide-react';

interface AsistenciaFormHexagonalProps {
  grado: string;
  seccion: string;
  googleSheetsConfig?: {
    spreadsheetId: string;
    credentials: any;
  };
  currentUser: { numeroDocumento: string };
  estudiantes: Array<{
    numeroDocumento: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    grado?: string;
    seccion?: string;
  }>;
}

export function AsistenciaFormHexagonal({
  grado,
  seccion,
  googleSheetsConfig,
  currentUser,
  estudiantes
}: AsistenciaFormHexagonalProps) {
  const {
    asistenciasDelDia,
    isLoading,
    error,
    fechaSeleccionada,
    registrarAsistencia,
    marcarTodosPresentes,
    limpiarError,
    setFecha,
    isConfigured
  } = useAsistenciaHibrida({
    googleSheetsConfig,
    currentUser,
    autoLoad: true
  });

  // Filtrar estudiantes de la sección actual
  const estudiantesSeccion = useMemo(() => {
    return estudiantes.filter(e => e.grado === grado && e.seccion === seccion);
  }, [estudiantes, grado, seccion]);

  // Crear mapa de asistencias por estudiante
  const asistenciasPorEstudiante = useMemo(() => {
    const map = new Map<string, any>();
    asistenciasDelDia.forEach(asistencia => {
      map.set(asistencia.estudianteId, asistencia);
    });
    return map;
  }, [asistenciasDelDia]);

  const handleEstadoChange = async (estudianteId: string, estado: EstadoAsistencia) => {
    // Buscar el estudiante para obtener su nombre
    const estudiante = estudiantes.find(e => e.numeroDocumento === estudianteId);
    if (!estudiante) {
      console.error('Estudiante no encontrado:', estudianteId);
      return;
    }
    
    // Formatear nombre completo
    const nombreCompleto = `${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno || ''}, ${estudiante.nombres}`.trim();
    
    const result = await registrarAsistencia(estudianteId, nombreCompleto, grado, seccion, estado);
    if (result.isSuccess) {
      // Éxito - el store ya se actualizó automáticamente
    } else {
      // Error - mostrar mensaje
      console.error('Error registrando asistencia:', result.error.message);
    }
  };

  const handleMarcarTodosPresentes = async () => {
    const result = await marcarTodosPresentes();
    if (result.isSuccess) {
      console.log('Todos marcados como presentes');
    } else {
      console.error('Error marcando todos como presentes:', result.error.message);
    }
  };

  // Estadísticas rápidas
  const estadisticas = useMemo(() => {
    const presentes = asistenciasDelDia.filter(a => a.estado.equals(EstadoAsistencia.PRESENTE)).length;
    const tardes = asistenciasDelDia.filter(a => a.estado.equals(EstadoAsistencia.TARDE)).length;
    const faltas = asistenciasDelDia.filter(a => a.estado.equals(EstadoAsistencia.FALTA)).length;
    const permisos = asistenciasDelDia.filter(a => a.estado.equals(EstadoAsistencia.PERMISO)).length;

    return { presentes, tardes, faltas, permisos, total: asistenciasDelDia.length };
  }, [asistenciasDelDia]);

  if (!isConfigured) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Configuración de Google Sheets requerida. Por favor, proporcione las credenciales.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Control de Asistencia - {grado} {seccion}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFecha(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarcarTodosPresentes}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Marcar Todos Presentes
              </Button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{estadisticas.presentes}</div>
              <div className="text-sm text-green-600">Presentes</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.tardes}</div>
              <div className="text-sm text-yellow-600">Tardes</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{estadisticas.faltas}</div>
              <div className="text-sm text-red-600">Faltas</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.permisos}</div>
              <div className="text-sm text-blue-600">Permisos</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{estudiantesSeccion.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            {error}
            <Button variant="outline" size="sm" onClick={limpiarError}>
              Descartar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Cargando asistencias...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estudiantes list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estudiantes ({estudiantesSeccion.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {estudiantesSeccion.map(estudiante => {
              const asistencia = asistenciasPorEstudiante.get(estudiante.numeroDocumento);
              const estadoActual = asistencia?.estado || EstadoAsistencia.SIN_ASISTENCIA;

              return (
                <div
                  key={estudiante.numeroDocumento}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {estudiante.apellidoPaterno} {estudiante.apellidoMaterno}, {estudiante.nombres}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {estudiante.numeroDocumento}
                    </div>
                    {asistencia && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Registrado: {asistencia.registradoPor} • {asistencia.horaIngreso?.toLocaleTimeString() || 'Sin hora'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botones de estado */}
                    <div className="flex gap-1">
                      {Object.values(EstadoAsistenciaEnum).map(estadoEnum => {
                        const estadoResult = EstadoAsistencia.crear(estadoEnum);
                        if (!estadoResult.isSuccess) {
                          console.error('Estado de asistencia inválido', estadoEnum);
                          return null;
                        }

                        const estado = estadoResult.value;

                        return (
                          <Button
                            key={estadoEnum}
                            variant={estadoActual.equals(estado) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleEstadoChange(estudiante.numeroDocumento, estado)}
                            disabled={isLoading}
                            className="text-xs px-2 py-1"
                          >
                            {estado.label}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Badge del estado actual */}
                    <Badge variant={getBadgeVariant(estadoActual)} className="ml-2">
                      {estadoActual.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getBadgeVariant(estado: EstadoAsistencia) {
  const valor = estado.toString().toLowerCase();

  if (valor.includes('presente')) return 'default';
  if (valor.includes('tarde')) return 'secondary';
  if (valor.includes('permiso')) return 'outline';
  if (valor.includes('falta')) return 'destructive';

  return 'secondary';
}
