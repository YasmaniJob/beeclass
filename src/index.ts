// src/index.ts
/**
 * BARRIL PRINCIPAL: Nueva Arquitectura Hexagonal + DDD + Zustand
 *
 * Este archivo exporta toda la nueva arquitectura para facilitar su uso
 * en toda la aplicación.
 */

// Re-exportar arquitectura completa
export * from './infrastructure';

// Hooks de compatibilidad
export { useAsistenciaAdapter } from './infrastructure/adapters/AsistenciaAdapter';

// Componentes de presentación
export { AsistenciaFormHexagonal } from './presentation/components/asistencia/AsistenciaFormHexagonal';

// Ejemplos de uso
export { default as AsistenciaPageExample } from './presentation/examples/AsistenciaPageExample';
