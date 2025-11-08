// src/domain/entities/Estudiante.ts
import { DomainError, Result, success, failure } from '../shared/types';

export enum TipoDocumento {
  DNI = 'DNI',
  CE = 'CE',
  OTRO = 'Otro'
}

export class Estudiante {
  constructor(
    public readonly numeroDocumento: string,
    public readonly tipoDocumento: TipoDocumento,
    public readonly nombres: string,
    public readonly apellidoPaterno: string,
    public readonly apellidoMaterno?: string,
    public readonly grado?: string,
    public readonly seccion?: string,
    public readonly nee?: string,
    public readonly neeDocumentos?: string[]
  ) {}

  get nombreCompleto(): string {
    const apellidoMaterno = this.apellidoMaterno ? ` ${this.apellidoMaterno}` : '';
    return `${this.apellidoPaterno}${apellidoMaterno}, ${this.nombres}`;
  }

  get identificacionCompleta(): string {
    return `${this.tipoDocumento} ${this.numeroDocumento}`;
  }

  estaEnGrado(grado: string): boolean {
    return this.grado === grado;
  }

  estaEnSeccion(seccion: string): boolean {
    return this.seccion === seccion;
  }

  tieneNEE(): boolean {
    return Boolean(this.nee && this.nee.trim().length > 0);
  }

  // Factory method con validación de dominio
  static crear(data: {
    numeroDocumento: string;
    tipoDocumento: TipoDocumento;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    grado?: string;
    seccion?: string;
    nee?: string;
    neeDocumentos?: string[];
  }): Result<Estudiante, DomainError> {
    // Validaciones de negocio
    if (!data.numeroDocumento || data.numeroDocumento.length < 7) {
      return failure(new DomainError('Número de documento debe tener al menos 7 caracteres'));
    }

    if (!data.nombres || data.nombres.trim().length < 2) {
      return failure(new DomainError('Nombres debe tener al menos 2 caracteres'));
    }

    if (!data.apellidoPaterno || data.apellidoPaterno.trim().length < 2) {
      return failure(new DomainError('Apellido paterno es requerido'));
    }

    if (!Object.values(TipoDocumento).includes(data.tipoDocumento)) {
      return failure(new DomainError('Tipo de documento inválido'));
    }

    return success(new Estudiante(
      data.numeroDocumento.trim(),
      data.tipoDocumento,
      data.nombres.trim(),
      data.apellidoPaterno.trim(),
      data.apellidoMaterno?.trim(),
      data.grado?.trim(),
      data.seccion?.trim(),
      data.nee?.trim(),
      data.neeDocumentos
    ));
  }

  // Método para actualizar información (retorna nuevo estudiante)
  actualizar(data: Partial<{
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    grado: string;
    seccion: string;
    nee: string;
    neeDocumentos: string[];
  }>): Result<Estudiante, DomainError> {
    return Estudiante.crear({
      numeroDocumento: this.numeroDocumento,
      tipoDocumento: this.tipoDocumento,
      nombres: data.nombres ?? this.nombres,
      apellidoPaterno: data.apellidoPaterno ?? this.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno ?? this.apellidoMaterno,
      grado: data.grado ?? this.grado,
      seccion: data.seccion ?? this.seccion,
      nee: data.nee ?? this.nee,
      neeDocumentos: data.neeDocumentos ?? this.neeDocumentos
    });
  }

  equals(other: Estudiante): boolean {
    return this.numeroDocumento === other.numeroDocumento &&
           this.tipoDocumento === other.tipoDocumento;
  }
}
