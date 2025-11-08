// src/application/use-cases/RegistrarAsistenciaUseCase.ts
import { Result, DomainError, success, failure } from '../../domain/shared/types';
import { RegistroAsistencia } from '../../domain/entities/RegistroAsistencia';
import { EstadoAsistencia } from '../../domain/value-objects/EstadoAsistencia';
import { AsistenciaRepository } from '../../domain/ports/AsistenciaRepository';

export interface RegistrarAsistenciaRequest {
  estudianteId: string;
  nombreEstudiante: string; // Nombre completo del estudiante
  grado: string;
  seccion: string;
  estado: EstadoAsistencia;
  registradoPor: string;
  observaciones?: string;
  fecha?: Date; // Opcional, usa fecha actual si no se especifica
}

export class RegistrarAsistenciaUseCase {
  constructor(private readonly asistenciaRepository: AsistenciaRepository) {}

  async execute(request: RegistrarAsistenciaRequest): Promise<Result<RegistroAsistencia, DomainError>> {
    try {
      // 1. Validar datos de entrada
      const validationResult = this.validarRequest(request);
      if (!validationResult.isSuccess) {
        return validationResult;
      }

      // 2. Crear entidad de dominio
      const fecha = request.fecha || new Date();
      const asistenciaResult = RegistroAsistencia.crear(
        request.estudianteId,
        request.nombreEstudiante,
        request.grado,
        request.seccion,
        request.estado,
        request.registradoPor,
        request.observaciones || '',
        fecha
      );

      if (!asistenciaResult.isSuccess) {
        return failure(asistenciaResult.error);
      }

      const asistencia = asistenciaResult.value;

      // 3. Validaciones de negocio adicionales
      const businessRulesResult = await this.validarReglasDeNegocio(asistencia, fecha);
      if (!businessRulesResult.isSuccess) {
        return businessRulesResult;
      }

      // 4. Verificar si ya existe registro para esta fecha y estudiante
      const existingResult = await this.asistenciaRepository.obtenerPorEstudianteYFecha(
        request.estudianteId,
        fecha
      );

      if (!existingResult.isSuccess) {
        return failure(new DomainError('Error al verificar registro existente'));
      }

      if (existingResult.value) {
        const existing = existingResult.value;
        const updatedResult = existing.actualizarEstado(request.estado, request.registradoPor, request.observaciones || existing.observaciones);

        if (!updatedResult.isSuccess) {
          return failure(updatedResult.error);
        }

        const updatedRecord = updatedResult.value;
        const updateOutcome = await this.asistenciaRepository.actualizar(updatedRecord);

        if (!updateOutcome.isSuccess) {
          return failure(updateOutcome.error);
        }

        return success(updatedRecord);
      }

      // 5. Si es falta o tarde, verificar si hay permiso válido
      if (asistencia.requiereJustificacion()) {
        const permissionResult = await this.validarPermiso(asistencia);
        if (!permissionResult.isSuccess) {
          return permissionResult;
        }
      }

      // 6. Guardar en repositorio
      const saveResult = await this.asistenciaRepository.guardar(asistencia);
      if (!saveResult.isSuccess) {
        return failure(new DomainError('Error al guardar asistencia en base de datos'));
      }

      return success(asistencia);

    } catch (error) {
      return failure(new DomainError('Error inesperado al registrar asistencia'));
    }
  }

  private validarRequest(request: RegistrarAsistenciaRequest): Result<void, DomainError> {
    if (!request.estudianteId || request.estudianteId.trim().length === 0) {
      return failure(new DomainError('ID de estudiante es requerido'));
    }

    if (!request.nombreEstudiante || request.nombreEstudiante.trim().length === 0) {
      return failure(new DomainError('Nombre de estudiante es requerido'));
    }

    if (!request.grado || request.grado.trim().length === 0) {
      return failure(new DomainError('Grado es requerido'));
    }

    if (!request.seccion || request.seccion.trim().length === 0) {
      return failure(new DomainError('Sección es requerida'));
    }

    if (!request.registradoPor || request.registradoPor.trim().length === 0) {
      return failure(new DomainError('Registrador es requerido'));
    }

    if (!request.estado) {
      return failure(new DomainError('Estado de asistencia es requerido'));
    }

    // Validar que el estado sea válido
    const estadosValidos = Object.values(EstadoAsistencia);
    if (!estadosValidos.includes(request.estado)) {
      return failure(new DomainError('Estado de asistencia inválido'));
    }

    return success(undefined);
  }

  private async validarReglasDeNegocio(
    asistencia: RegistroAsistencia,
    fecha: Date
  ): Promise<Result<void, DomainError>> {
    // Validar que la fecha no sea futura (excepto hoy)
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999); // Fin del día de hoy

    if (fecha > hoy) {
      return failure(new DomainError('No se pueden registrar asistencias en fechas futuras'));
    }

    // Validar horario escolar (ejemplo: no antes de las 6 AM ni después de las 8 PM)
    const hora = fecha.getHours();
    if (hora < 6 || hora > 20) {
      return failure(new DomainError('Registro fuera del horario escolar permitido'));
    }

    return success(undefined);
  }

  private async validarPermiso(asistencia: RegistroAsistencia): Promise<Result<void, DomainError>> {
    // TODO: Implementar validación de permisos
    // Por ahora, permitir todas las justificaciones
    // En el futuro, verificar contra repositorio de permisos

    return success(undefined);
  }
}
