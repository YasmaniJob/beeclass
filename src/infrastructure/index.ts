// src/infrastructure/index.ts
// Exportar todas las dependencias de la nueva arquitectura

// Domain
export * from '../domain/shared/types';
export * from '../domain/entities/Estudiante';
export * from '../domain/entities/RegistroAsistencia';
export * from '../domain/value-objects/EstadoAsistencia';
export * from '../domain/ports/AsistenciaRepository';
export * from '../domain/ports/EstudianteRepository';

// Application
export * from '../application/use-cases/RegistrarAsistenciaUseCase';

// Infrastructure
export * from './stores/asistenciaStore';
export * from './adapters/GoogleSheetsService';
export * from './adapters/AsistenciaAdapter';
export * from './repositories/GoogleSheetsAsistenciaRepository';
export * from './factories/AsistenciaFactory';
