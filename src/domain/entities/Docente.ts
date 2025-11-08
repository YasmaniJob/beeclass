import { DomainError, Result, failure, success } from '@/domain/shared/types';
import { TipoDocumento } from '@/domain/entities/Estudiante';

export type DocenteRol = 'Docente' | 'Docente y Tutor' | 'Auxiliar' | string;

export interface DocenteAsignacion {
  id?: string;
  grado: string;
  seccion: string;
  rol?: DocenteRol;
  areaId?: string;
  gradoSeccionId?: string;
  horasSemanales?: number;
}

export interface DocenteInput {
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  nombres: string;
  email?: string;
  telefono?: string;
  rol?: DocenteRol;
  asignaciones?: DocenteAsignacion[];
  horario?: Record<string, string>;
  personalId?: string;
}

export class Docente {
  private constructor(
    public readonly tipoDocumento: TipoDocumento,
    public readonly numeroDocumento: string,
    public readonly apellidoPaterno: string,
    public readonly apellidoMaterno: string | undefined,
    public readonly nombres: string,
    public readonly email: string | undefined,
    public readonly telefono: string | undefined,
    public readonly rol: DocenteRol,
    public readonly asignaciones: DocenteAsignacion[],
    public readonly horario: Record<string, string>,
    public readonly personalId: string | undefined,
  ) {}

  get nombreCompleto(): string {
    const apellidoMaterno = this.apellidoMaterno ? ` ${this.apellidoMaterno}` : '';
    return `${this.apellidoPaterno}${apellidoMaterno}, ${this.nombres}`;
  }

  get identificacionCompleta(): string {
    return `${this.tipoDocumento} ${this.numeroDocumento}`;
  }

  static crear(input: DocenteInput): Result<Docente, DomainError> {
    if (!input.numeroDocumento || input.numeroDocumento.trim().length < 7) {
      return failure(new DomainError('Número de documento inválido para el docente'));
    }

    if (!input.apellidoPaterno || input.apellidoPaterno.trim().length === 0) {
      return failure(new DomainError('El apellido paterno es requerido para el docente'));
    }

    if (!input.nombres || input.nombres.trim().length === 0) {
      return failure(new DomainError('El nombre del docente es requerido'));
    }

    const rol = input.rol ?? 'Docente';
    const asignaciones = (input.asignaciones ?? []).map(asignacion => ({
      ...asignacion,
      grado: asignacion.grado.trim(),
      seccion: asignacion.seccion.trim(),
      rol: asignacion.rol ?? rol,
    }));

    return success(
      new Docente(
        input.tipoDocumento,
        input.numeroDocumento.trim(),
        input.apellidoPaterno.trim(),
        input.apellidoMaterno?.trim(),
        input.nombres.trim(),
        input.email?.trim(),
        input.telefono?.trim(),
        rol,
        asignaciones,
        input.horario ?? {},
        input.personalId,
      ),
    );
  }

  actualizar(data: Partial<DocenteInput>): Result<Docente, DomainError> {
    return Docente.crear({
      tipoDocumento: data.tipoDocumento ?? this.tipoDocumento,
      numeroDocumento: this.numeroDocumento,
      apellidoPaterno: data.apellidoPaterno ?? this.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno ?? this.apellidoMaterno,
      nombres: data.nombres ?? this.nombres,
      email: data.email ?? this.email,
      telefono: data.telefono ?? this.telefono,
      rol: data.rol ?? this.rol,
      asignaciones: data.asignaciones ?? this.asignaciones,
      horario: data.horario ?? this.horario,
      personalId: data.personalId ?? this.personalId,
    });
  }
}
