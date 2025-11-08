// src/domain/entities/RegistroAsistencia.ts
import { DomainError, Result, success, failure } from '../shared/types';
import { EstadoAsistencia, EstadoAsistenciaEnum } from '../value-objects/EstadoAsistencia';

export class RegistroAsistencia {
  constructor(
    public readonly estudianteId: string,
    public readonly nombreEstudiante: string,
    public readonly grado: string,
    public readonly seccion: string,
    public readonly fecha: Date,
    public readonly estado: EstadoAsistencia,
    public readonly horaIngreso: Date | null = null,
    public readonly registradoPor: string,
    public readonly observaciones: string = '',
    public readonly id: string = crypto.randomUUID()
  ) {}

  static crear(
    estudianteId: string,
    nombreEstudiante: string,
    grado: string,
    seccion: string,
    estado: EstadoAsistencia,
    registradoPor: string,
    observaciones: string = '',
    fecha?: Date
  ): Result<RegistroAsistencia, DomainError> {
    if (!estudianteId || estudianteId.trim().length === 0) {
      return failure(new DomainError('ID de estudiante es requerido'));
    }

    if (!nombreEstudiante || nombreEstudiante.trim().length === 0) {
      return failure(new DomainError('Nombre de estudiante es requerido'));
    }

    if (!grado || grado.trim().length === 0) {
      return failure(new DomainError('Grado es requerido'));
    }

    if (!seccion || seccion.trim().length === 0) {
      return failure(new DomainError('Sección es requerida'));
    }

    if (!registradoPor || registradoPor.trim().length === 0) {
      return failure(new DomainError('Registrador es requerido'));
    }

    const horaIngreso = estado.requiereHoraIngreso() ? new Date() : null;
    const fechaRegistro = fecha ? new Date(fecha) : new Date();

    return success(new RegistroAsistencia(
      estudianteId.trim(),
      nombreEstudiante.trim(),
      grado.trim(),
      seccion.trim(),
      fechaRegistro,
      estado,
      horaIngreso,
      registradoPor.trim(),
      observaciones.trim()
    ));
  }

  esJustificable(): boolean {
    return this.estado.esJustificable();
  }

  requiereJustificacion(): boolean {
    return this.estado.esJustificable();
  }

  // Método para actualizar el registro (retorna nuevo registro)
  actualizarEstado(
    nuevoEstado: EstadoAsistencia,
    registradoPor: string,
    observaciones: string = this.observaciones
  ): Result<RegistroAsistencia, DomainError> {
    if (!registradoPor || registradoPor.trim().length === 0) {
      return failure(new DomainError('Registrador es requerido'));
    }

    const horaIngreso = nuevoEstado.requiereHoraIngreso() ? new Date() : null;

    return success(
      new RegistroAsistencia(
        this.estudianteId,
        this.nombreEstudiante,
        this.grado,
        this.seccion,
        this.fecha,
        nuevoEstado,
        horaIngreso,
        registradoPor.trim(),
        observaciones,
        this.id
      )
    );
  }

  equals(other: RegistroAsistencia): boolean {
    return this.id === other.id;
  }

  // Validación de reglas de negocio
  esValidoParaFecha(fecha: Date): boolean {
    // No permitir registros en fechas futuras (excepto hoy)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaRegistro = new Date(this.fecha);
    fechaRegistro.setHours(0, 0, 0, 0);

    return fechaRegistro <= hoy;
  }
}
