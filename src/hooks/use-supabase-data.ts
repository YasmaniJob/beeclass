// src/hooks/use-supabase-data.ts
'use client';

import { useMatriculaSupabaseHibrida } from '@/infrastructure/hooks/useMatriculaSupabaseHibrida';

/**
 * Hook simplificado para acceder a los datos de Supabase
 * 
 * Este hook es un wrapper sobre useMatriculaSupabaseHibrida
 * para facilitar su uso en los componentes.
 * 
 * @example
 * ```tsx
 * function MiComponente() {
 *   const { estudiantes, loading, refreshEstudiantes } = useSupabaseData();
 *   
 *   if (loading.estudiantes) return <div>Cargando...</div>;
 *   
 *   return (
 *     <div>
 *       {estudiantes.map(e => (
 *         <div key={e.numeroDocumento}>{e.nombreCompleto}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSupabaseData() {
  return useMatriculaSupabaseHibrida();
}

/**
 * Hook para obtener solo estudiantes
 */
export function useEstudiantes() {
  const { estudiantes, loading, refreshEstudiantes, addEstudiante, updateEstudiante, deleteEstudiante } = useMatriculaSupabaseHibrida();
  
  return {
    estudiantes,
    loading: loading.estudiantes,
    refresh: refreshEstudiantes,
    add: addEstudiante,
    update: updateEstudiante,
    delete: deleteEstudiante,
  };
}

/**
 * Hook para obtener solo personal
 */
export function usePersonal() {
  const { personal, loading, refreshPersonal, addPersonal, updatePersonal, deletePersonal } = useMatriculaSupabaseHibrida();
  
  return {
    personal,
    loading: loading.personal,
    refresh: refreshPersonal,
    add: addPersonal,
    update: updatePersonal,
    delete: deletePersonal,
  };
}

/**
 * Hook para obtener solo áreas curriculares
 */
export function useAreasCurriculares() {
  const { areasCurriculares, nivelesEducativos, loading, refreshAreasCurriculares } = useMatriculaSupabaseHibrida();
  
  return {
    areas: areasCurriculares,
    niveles: nivelesEducativos,
    loading: loading.areas,
    refresh: refreshAreasCurriculares,
  };
}

/**
 * Hook para obtener estudiantes filtrados por grado y sección
 */
export function useEstudiantesPorSeccion(grado: string, seccion: string) {
  const { getEstudiantesPorGradoSeccion, loading } = useMatriculaSupabaseHibrida();
  
  return {
    estudiantes: getEstudiantesPorGradoSeccion(grado, seccion),
    loading: loading.estudiantes,
  };
}

/**
 * Hook para obtener personal filtrado por rol
 */
export function usePersonalPorRol(rol: string) {
  const { getPersonalPorRol, loading } = useMatriculaSupabaseHibrida();
  
  return {
    personal: getPersonalPorRol(rol),
    loading: loading.personal,
  };
}
