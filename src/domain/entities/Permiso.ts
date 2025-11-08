import { DomainError, Result, failure, success } from '@/domain/shared/types';
import { Estudiante } from '@/domain/entities/Estudiante';

export interface PermisoProps {
  id: string;
  estudiante: Estudiante;
  fechaInicio: Date;
  fechaFin: Date;
  motivo: string;
  documento?: string;
  registradoPor: string;
}

export interface PermisoInput extends Omit<PermisoProps, 'id'> {
  id?: string;
}

export class Permiso {
  private constructor(private readonly props: PermisoProps) {}

  get id(): string {
    return this.props.id;
  }

  get estudiante(): Estudiante {
    return this.props.estudiante;
  }

  get fechaInicio(): Date {
    return this.props.fechaInicio;
  }

  get fechaFin(): Date {
    return this.props.fechaFin;
  }

  get motivo(): string {
    return this.props.motivo;
  }

  get documento(): string | undefined {
    return this.props.documento;
  }

  get registradoPor(): string {
    return this.props.registradoPor;
  }

  static crear(input: PermisoInput): Result<Permiso, DomainError> {
    if (!input.estudiante) {
      return failure(new DomainError('El permiso requiere un estudiante válido'));
    }

    if (!input.fechaInicio || !input.fechaFin) {
      return failure(new DomainError('El permiso requiere fechas de inicio y fin válidas'));
    }

    if (input.fechaFin.getTime() < input.fechaInicio.getTime()) {
      return failure(new DomainError('La fecha de fin del permiso no puede ser anterior a la fecha de inicio'));
    }

    if (!input.motivo || input.motivo.trim().length === 0) {
      return failure(new DomainError('El permiso requiere un motivo'));
    }

    if (!input.registradoPor || input.registradoPor.trim().length === 0) {
      return failure(new DomainError('El permiso requiere la persona que lo registró'));
    }

    const props: PermisoProps = {
      id: input.id ?? crypto.randomUUID(),
      estudiante: input.estudiante,
      fechaInicio: new Date(input.fechaInicio),
      fechaFin: new Date(input.fechaFin),
      motivo: input.motivo.trim(),
      documento: input.documento?.trim() || undefined,
      registradoPor: input.registradoPor.trim(),
    };

    return success(new Permiso(props));
  }

  actualizar(input: Partial<PermisoInput>): Result<Permiso, DomainError> {
    return Permiso.crear({
      id: this.id,
      estudiante: input.estudiante ?? this.estudiante,
      fechaInicio: input.fechaInicio ?? this.fechaInicio,
      fechaFin: input.fechaFin ?? this.fechaFin,
      motivo: input.motivo ?? this.motivo,
      documento: input.documento ?? this.documento,
      registradoPor: input.registradoPor ?? this.registradoPor,
    });
  }

  toJSON(): PermisoProps {
    return {
      id: this.id,
      estudiante: this.estudiante,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      motivo: this.motivo,
      documento: this.documento,
      registradoPor: this.registradoPor,
    };
  }
}
