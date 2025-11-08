// src/domain/ports/EstudianteRepository.ts
import { Result, DomainError } from '../shared/types';
import { Estudiante, TipoDocumento } from '../entities/Estudiante';

export interface EstudianteRepository {
  // CRUD operations
  guardar(estudiante: Estudiante): Promise<Result<void, DomainError>>;
  obtenerPorId(numeroDocumento: string, tipoDocumento: TipoDocumento): Promise<Result<Estudiante | null, DomainError>>;
  obtenerTodos(): Promise<Result<Estudiante[], DomainError>>;
  obtenerPorGrado(grado: string): Promise<Result<Estudiante[], DomainError>>;
  obtenerPorSeccion(grado: string, seccion: string): Promise<Result<Estudiante[], DomainError>>;

  // Update operations
  actualizar(estudiante: Estudiante): Promise<Result<void, DomainError>>;
  eliminar(numeroDocumento: string, tipoDocumento: TipoDocumento): Promise<Result<void, DomainError>>;

  // Query operations
  buscarPorNombre(query: string): Promise<Result<Estudiante[], DomainError>>;
  obtenerEstadisticas(): Promise<Result<{
    total: number;
    porGrado: Record<string, number>;
    porTipoDocumento: Record<TipoDocumento, number>;
    conNEE: number;
  }, DomainError>>;
}
