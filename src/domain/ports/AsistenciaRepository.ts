// src/domain/ports/AsistenciaRepository.ts
import { Result, DomainError } from '../shared/types';
import { RegistroAsistencia } from '../entities/RegistroAsistencia';
import { EstadoAsistencia } from '../value-objects/EstadoAsistencia';

export interface AsistenciaRepository {
  // CRUD operations
  guardar(asistencia: RegistroAsistencia): Promise<Result<void, DomainError>>;
  obtenerPorId(id: string): Promise<Result<RegistroAsistencia | null, DomainError>>;
  actualizar(asistencia: RegistroAsistencia): Promise<Result<void, DomainError>>;
  eliminar(id: string): Promise<Result<void, DomainError>>;

  // Query operations
  obtenerPorFecha(fecha: Date): Promise<Result<RegistroAsistencia[], DomainError>>;
  obtenerPorEstudiante(estudianteId: string): Promise<Result<RegistroAsistencia[], DomainError>>;
  obtenerPorEstudianteYFecha(estudianteId: string, fecha: Date): Promise<Result<RegistroAsistencia | null, DomainError>>;
  obtenerPorGradoYFecha(grado: string, fecha: Date): Promise<Result<RegistroAsistencia[], DomainError>>;
  obtenerPorSeccionYFecha(grado: string, seccion: string, fecha: Date): Promise<Result<RegistroAsistencia[], DomainError>>;

  // Estadísticas y reportes
  obtenerEstadisticasPorFecha(fecha: Date): Promise<Result<{
    total: number;
    presentes: number;
    tardes: number;
    faltas: number;
    permisos: number;
    porGrado: Record<string, {
      total: number;
      presentes: number;
      tardes: number;
      faltas: number;
      permisos: number;
    }>;
  }, DomainError>>;

  obtenerEstadisticasPorEstudiante(estudianteId: string, fechaInicio: Date, fechaFin: Date): Promise<Result<{
    total: number;
    presentes: number;
    tardes: number;
    faltas: number;
    permisos: number;
    promedioAsistencia: number;
  }, DomainError>>;

  // Operaciones de mantenimiento
  limpiarRegistrosAntiguos(diasAConservar: number): Promise<Result<number, DomainError>>; // Retorna cantidad eliminada
  obtenerFechasConRegistros(): Promise<Result<Date[], DomainError>>;
}
