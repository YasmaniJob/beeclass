import { useState, useCallback, useEffect, useMemo } from 'react';
import { useMatriculaData } from './use-matricula-data';

// Hook híbrido que usa Google Sheets para asistencias y BD para maestros
export function useAsistenciaHibrida(subjectType: 'estudiantes' | 'personal', grado?: string, seccion?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar datos maestros de la base de datos (Supabase/Firebase)
  const { allEstudiantes, docentes } = useMatriculaData();

  const subjects = useMemo(() => {
    if (subjectType === 'estudiantes') {
      return allEstudiantes
        .filter(a => a.grado === grado && a.seccion === seccion)
        .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
    }
    return docentes.sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
  }, [subjectType, grado, seccion, allEstudiantes, docentes]);

  // Guardar asistencia en Google Sheets
  const saveAsistencia = useCallback(async (
    estudianteId: string,
    nombreEstudiante: string,
    gradoParam: string,
    seccionParam: string,
    status: string,
    registradoPor: string,
    observaciones?: string
  ) => {
    if (!process.env.USE_GOOGLE_SHEETS_FOR_ASISTENCIAS) {
      // Fallback a localStorage o base de datos
      console.log('Guardando en fallback...');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-sheets/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estudianteId,
          nombreEstudiante,
          grado: gradoParam,
          seccion: seccionParam,
          fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          status,
          registradoPor,
          observaciones: observaciones || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar asistencia');
      }

      // Aquí podrías actualizar el estado local también
      // para una respuesta más rápida

    } catch (err) {
      setError('Error al guardar asistencia');
      console.error('Error saving asistencia:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Leer asistencias del día desde Google Sheets
  const loadAsistenciasDelDia = useCallback(async (fecha: string) => {
    if (!process.env.USE_GOOGLE_SHEETS_FOR_ASISTENCIAS) {
      return [];
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/google-sheets/asistencias');
      if (!response.ok) {
        throw new Error('Error al cargar asistencias');
      }
      
      const { data: asistencias } = await response.json();
      // Filtrar por fecha y mapear a formato interno
      return asistencias
        .filter((row: string[]) => row[1] === fecha) // filtrar por fecha
        .map((row: string[]) => ({
          estudianteId: row[0],
          fecha: row[1],
          hora: row[2],
          status: row[3],
          registradoPor: row[4],
          timestamp: row[5],
        }));
    } catch (err) {
      setError('Error al cargar asistencias');
      console.error('Error loading asistencias:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Backup: función para sincronizar datos críticos a la base de datos
  const syncToDatabase = useCallback(async () => {
    try {
      const response = await fetch('/api/google-sheets/asistencias');
      if (!response.ok) {
        throw new Error('Error al sincronizar');
      }
      
      const { data: asistencias } = await response.json();
      // Aquí iría la lógica para sincronizar con Supabase/Firebase
      // como backup o para reportes complejos

      console.log(`Sincronizadas ${asistencias.length} asistencias`);
    } catch (err) {
      console.error('Error syncing to database:', err);
    }
  }, []);

  // Auto-sync cada hora para backup
  useEffect(() => {
    if (process.env.USE_GOOGLE_SHEETS_FOR_ASISTENCIAS) {
      const interval = setInterval(syncToDatabase, 60 * 60 * 1000); // 1 hora
      return () => clearInterval(interval);
    }
  }, [syncToDatabase]);

  return {
    subjects,
    saveAsistencia,
    loadAsistenciasDelDia,
    isLoading,
    error,
    syncToDatabase,
  };
}
