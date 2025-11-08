// src/domain/value-objects/EstadoAsistencia.ts
import { DomainError, Result, success, failure } from '../shared/types';

export enum EstadoAsistenciaEnum {
  SIN_ASISTENCIA = 'sin_asistencia',
  PRESENTE = 'presente',
  TARDE = 'tarde',
  FALTA = 'falta',
  PERMISO = 'permiso'
}

export class EstadoAsistencia {
  private constructor(private readonly estado: EstadoAsistenciaEnum) {}

  static readonly SIN_ASISTENCIA = new EstadoAsistencia(EstadoAsistenciaEnum.SIN_ASISTENCIA);
  static readonly PRESENTE = new EstadoAsistencia(EstadoAsistenciaEnum.PRESENTE);
  static readonly TARDE = new EstadoAsistencia(EstadoAsistenciaEnum.TARDE);
  static readonly FALTA = new EstadoAsistencia(EstadoAsistenciaEnum.FALTA);
  static readonly PERMISO = new EstadoAsistencia(EstadoAsistenciaEnum.PERMISO);

  static fromString(value: string): Result<EstadoAsistencia, DomainError> {
    const estado = Object.values(EstadoAsistenciaEnum).find(e => e === value);
    if (!estado) {
      return failure(new DomainError(`Estado de asistencia inválido: ${value}`));
    }
    return success(new EstadoAsistencia(estado));
  }

  static crear(value: EstadoAsistenciaEnum): Result<EstadoAsistencia, DomainError> {
    return success(new EstadoAsistencia(value));
  }

  get value(): EstadoAsistenciaEnum {
    return this.estado;
  }

  toString(): string {
    return this.estado;
  }

  esJustificable(): boolean {
    return this.estado === EstadoAsistenciaEnum.FALTA || this.estado === EstadoAsistenciaEnum.TARDE;
  }

  requiereHoraIngreso(): boolean {
    return this.estado === EstadoAsistenciaEnum.PRESENTE || this.estado === EstadoAsistenciaEnum.TARDE;
  }

  equals(other: EstadoAsistencia): boolean {
    return this.estado === other.estado;
  }

  get label(): string {
    switch (this.estado) {
      case EstadoAsistenciaEnum.SIN_ASISTENCIA:
        return 'Sin asistencia';
      case EstadoAsistenciaEnum.PRESENTE:
        return 'Presente';
      case EstadoAsistenciaEnum.TARDE:
        return 'Tarde';
      case EstadoAsistenciaEnum.FALTA:
        return 'Falta';
      case EstadoAsistenciaEnum.PERMISO:
        return 'Permiso';
      default:
        return this.estado;
    }
  }
}
