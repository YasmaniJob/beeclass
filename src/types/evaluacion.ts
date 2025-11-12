import { LucideIcon } from 'lucide-react';

/**
 * Tipos de evaluación disponibles en el sistema
 * - directa: Evaluación directa con calificaciones literales (AD, A, B, C)
 * - lista-cotejo: Evaluación mediante lista de criterios de logro
 * - rubrica: Evaluación mediante rúbrica con niveles de desempeño
 */
export type TipoEvaluacion = 'directa' | 'lista-cotejo' | 'rubrica';

/**
 * Configuración de un tipo de evaluación
 */
export interface EvaluationType {
  id: TipoEvaluacion;
  label: string;
  icon: LucideIcon;
  description: string;
  available: boolean;
}

/**
 * Modelo de datos para Lista de Cotejo
 * TODO: Implementar funcionalidad - Ver README-TIPOS-EVALUACION.md
 */
export interface ListaCotejoItem {
  id: string;
  criterio: string;
  cumple: boolean;
}

/**
 * Modelo de calificación con Lista de Cotejo
 * TODO: Implementar funcionalidad - Ver README-TIPOS-EVALUACION.md
 * 
 * Nota final calculada según % de criterios cumplidos:
 * AD: 90-100% | A: 75-89% | B: 60-74% | C: 0-59%
 */
export interface CalificacionListaCotejo {
  estudianteId: string;
  sesionId: string;
  items: {
    criterioId: string;
    cumple: boolean;
  }[];
  notaFinal: 'AD' | 'A' | 'B' | 'C';
}

/**
 * Modelo de criterio de Rúbrica
 * TODO: Implementar funcionalidad - Ver README-TIPOS-EVALUACION.md
 */
export interface RubricaCriterio {
  id: string;
  nombre: string;
  niveles: {
    nivel: number;
    descripcion: string;
    puntaje: number;
  }[];
}

/**
 * Modelo de calificación con Rúbrica
 * TODO: Implementar funcionalidad - Ver README-TIPOS-EVALUACION.md
 * 
 * Nota final calculada según % del puntaje total:
 * AD: 90-100% | A: 70-89% | B: 55-69% | C: 0-54%
 */
export interface CalificacionRubrica {
  estudianteId: string;
  sesionId: string;
  criterios: {
    criterioId: string;
    nivelAlcanzado: number;
    puntaje: number;
  }[];
  puntajeTotal: number;
  notaFinal: 'AD' | 'A' | 'B' | 'C';
}
