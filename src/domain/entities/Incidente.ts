import { DomainError, Result, failure, success } from '@/domain/shared/types';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Docente } from '@/domain/entities/Docente';

export type SujetoIncidente = Estudiante | Docente;

export interface IncidenteProps {
  id: string;
  sujeto: SujetoIncidente;
  fecha: Date;
  descripcion: string;
  reportadoPor: string;
}

export interface IncidenteInput extends Omit<IncidenteProps, 'id'> {
  id?: string;
}

export class Incidente {
  private constructor(private readonly props: IncidenteProps) {}

  get id(): string {
    return this.props.id;
  }

  get sujeto(): SujetoIncidente {
    return this.props.sujeto;
  }

  get fecha(): Date {
    return this.props.fecha;
  }

  get descripcion(): string {
    return this.props.descripcion;
  }

  get reportadoPor(): string {
    return this.props.reportadoPor;
  }

  static crear(input: IncidenteInput): Result<Incidente, DomainError> {
    if (!input.sujeto) {
      return failure(new DomainError('El incidente requiere un sujeto válido'));
    }

    if (!input.fecha) {
      return failure(new DomainError('El incidente requiere una fecha'));
    }

    if (!input.descripcion || input.descripcion.trim().length === 0) {
      return failure(new DomainError('El incidente requiere una descripción'));
    }

    if (!input.reportadoPor || input.reportadoPor.trim().length === 0) {
      return failure(new DomainError('El incidente requiere la persona que lo reportó'));
    }

    const props: IncidenteProps = {
      id: input.id ?? crypto.randomUUID(),
      sujeto: input.sujeto,
      fecha: new Date(input.fecha),
      descripcion: input.descripcion.trim(),
      reportadoPor: input.reportadoPor.trim(),
    };

    return success(new Incidente(props));
  }

  actualizar(input: Partial<IncidenteInput>): Result<Incidente, DomainError> {
    return Incidente.crear({
      id: this.id,
      sujeto: input.sujeto ?? this.sujeto,
      fecha: input.fecha ?? this.fecha,
      descripcion: input.descripcion ?? this.descripcion,
      reportadoPor: input.reportadoPor ?? this.reportadoPor,
    });
  }

  toJSON(): IncidenteProps {
    return {
      id: this.id,
      sujeto: this.sujeto,
      fecha: this.fecha,
      descripcion: this.descripcion,
      reportadoPor: this.reportadoPor,
    };
  }
}
