// src/domain/shared/legacy-adapter.ts
/**
 * ADAPTADOR DE TIPOS: Puente entre sistema legacy y nueva arquitectura
 *
 * Este archivo resuelve conflictos de tipos entre el sistema existente
 * y la nueva arquitectura hexagonal + DDD.
 */

import { EstadoAsistencia, EstadoAsistenciaEnum } from '../value-objects/EstadoAsistencia';
import { AsistenciaStatus } from '../../lib/definitions';

// Mapear EstadoAsistencia (nuevo) a AsistenciaStatus (legacy)
export function estadoToLegacy(estado: EstadoAsistencia): AsistenciaStatus {
  switch (estado.value) {
    case EstadoAsistenciaEnum.SIN_ASISTENCIA:
      return 'sin_asistencia';
    case EstadoAsistenciaEnum.PRESENTE:
      return 'presente';
    case EstadoAsistenciaEnum.TARDE:
      return 'tarde';
    case EstadoAsistenciaEnum.FALTA:
      return 'falta';
    case EstadoAsistenciaEnum.PERMISO:
      return 'permiso';
    default:
      return 'sin_asistencia';
  }
}

// Mapear AsistenciaStatus (legacy) a EstadoAsistencia (nuevo)
export function legacyToEstado(status: AsistenciaStatus): EstadoAsistencia {
  switch (status) {
    case 'sin_asistencia':
      return EstadoAsistencia.SIN_ASISTENCIA;
    case 'presente':
      return EstadoAsistencia.PRESENTE;
    case 'tarde':
      return EstadoAsistencia.TARDE;
    case 'falta':
      return EstadoAsistencia.FALTA;
    case 'permiso':
      return EstadoAsistencia.PERMISO;
    default:
      return EstadoAsistencia.SIN_ASISTENCIA;
  }
}

// Adaptador para compatibilidad con hooks existentes
export interface LegacyAsistenciaState {
  asistencia: Record<string, {
    status: AsistenciaStatus;
    entryTime: Date | null;
    horasAfectadas?: string[];
  }>;
  initialAsistencia: Record<string, any>;
  currentDate: Date | null;
  statusFilter: AsistenciaStatus | 'todos';
  searchTerm: string;
}

// Funciones de utilidad para conversión
export function convertAsistenciaArrayToLegacy(asistencias: any[]): LegacyAsistenciaState['asistencia'] {
  return asistencias.reduce((acc, asistencia) => {
    if (asistencia.estudianteId) {
      acc[asistencia.estudianteId] = {
        status: estadoToLegacy(asistencia.estado),
        entryTime: asistencia.horaIngreso,
        horasAfectadas: []
      };
    }
    return acc;
  }, {} as LegacyAsistenciaState['asistencia']);
}
