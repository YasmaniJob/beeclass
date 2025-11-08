'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Asistencia {
  estudianteId: string;
  nombreEstudiante?: string;
  grado: string;
  seccion: string;
  fecha: string;
  status: 'presente' | 'tarde' | 'falta' | 'permiso';
  registradoPor: string;
  observaciones?: string;
  scope?: 'IE' | 'AULA';
  origenId?: string;
  uuid?: string;
}

export interface AsistenciaRecord extends Asistencia {
  timestamp: string;
}

export interface AsistenciaPersonal {
  personalId: string;
  nombrePersonal: string;
  cargo: string;
  fecha: string;
  status: 'presente' | 'tarde' | 'falta' | 'permiso';
  registradoPor: string;
  horasAfectadas?: string;
}

export interface AsistenciaPersonalRecord extends AsistenciaPersonal {
  timestamp: string;
}

export interface AsistenciaDocente extends Asistencia {
  nombreEstudiante: string;
  docenteId: string;
  docenteNombre: string;
}

/**
 * Hook para gestionar asistencias con Google Sheets
 */
export function useAsistencias() {
  const [loading, setLoading] = useState(false);
  const [asistencias, setAsistencias] = useState<AsistenciaRecord[]>([]);
  const { toast } = useToast();

  /**
   * Obtiene todas las asistencias
   */
  const fetchAsistencias = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/google-sheets/asistencias');
      const data = await response.json();

      if (data.success) {
        const records: AsistenciaRecord[] = (data.data as string[][]).
          filter((row: string[]) => Array.isArray(row) && row.length >= 11).
          map((row: string[]) => ({
            estudianteId: row[0],
            nombreEstudiante: row[1],
            grado: row[2],
            seccion: row[3],
            fecha: row[4],
            status: row[5] as 'presente' | 'tarde' | 'falta' | 'permiso',
            registradoPor: row[6],
            observaciones: row[7] || '',
            scope: (row[8] ?? 'IE') as 'IE' | 'AULA',
            origenId: row[9] ?? '',
            timestamp: row[10] ?? '',
            uuid: row[11],
          }));

        setAsistencias(records);
        return records;
      } else {
        throw new Error(data.error || 'Error al obtener asistencias');
      }
    } catch (error) {
      console.error('Error fetching asistencias:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al obtener asistencias',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Guarda una asistencia
   */
  const saveAsistencia = useCallback(async (asistencia: Asistencia) => {
    setLoading(true);
    try {
      const payload = {
        ...asistencia,
        scope: (asistencia.scope ?? 'IE') as 'IE' | 'AULA',
        origenId: asistencia.origenId ?? asistencia.registradoPor,
      };

      const response = await fetch('/api/google-sheets/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Éxito',
          description: 'Asistencia guardada correctamente',
        });
        
        // Actualizar lista local
        await fetchAsistencias();
        return true;
      } else {
        throw new Error(data.error || 'Error al guardar asistencia');
      }
    } catch (error) {
      console.error('Error saving asistencia:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar asistencia',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchAsistencias]);

  const saveAsistenciasDocentesBatch = useCallback(async (asistencias: AsistenciaDocente[]) => {
    setLoading(true);
    try {
      const response = await fetch('/api/google-sheets/asistencias-docentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asistencias),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Éxito',
          description: `${data.count} asistencias de aula guardadas correctamente`,
        });
        return true;
      }

      throw new Error(data.error || 'Error al guardar asistencias de aula');
    } catch (error) {
      console.error('Error saving asistencias docentes batch:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar asistencias de aula',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Guarda múltiples asistencias en batch
   */
  const saveAsistenciasBatch = useCallback(async (asistencias: Asistencia[]) => {
    setLoading(true);
    try {
      const normalized = asistencias.map((a) => ({
        ...a,
        scope: (a.scope ?? 'IE') as 'IE' | 'AULA',
        origenId: a.origenId ?? a.registradoPor,
      }));

      const response = await fetch('/api/google-sheets/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalized),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Éxito',
          description: `${data.count} asistencias guardadas correctamente`,
        });
        
        // Actualizar lista local
        await fetchAsistencias();
        return true;
      } else {
        throw new Error(data.error || 'Error al guardar asistencias');
      }
    } catch (error) {
      console.error('Error saving asistencias batch:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar asistencias',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchAsistencias]);

  /**
   * Obtiene asistencias por fecha
   */
  const getAsistenciasByFecha = useCallback((fecha: string) => {
    return asistencias.filter(a => a.fecha === fecha);
  }, [asistencias]);

  /**
   * Obtiene asistencias por estudiante
   */
  const getAsistenciasByEstudiante = useCallback((estudianteId: string) => {
    return asistencias.filter(a => a.estudianteId === estudianteId);
  }, [asistencias]);

  /**
   * Obtiene asistencias por grado y sección
   */
  const getAsistenciasByGradoSeccion = useCallback((grado: string, seccion: string) => {
    return asistencias.filter(a => a.grado === grado && a.seccion === seccion);
  }, [asistencias]);

  /**
   * Guarda múltiples asistencias de personal en batch
   */
  const saveAsistenciasPersonalBatch = useCallback(async (asistencias: AsistenciaPersonal[]) => {
    setLoading(true);
    try {
      const response = await fetch('/api/google-sheets/asistencias-personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asistencias),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Éxito',
          description: `${data.count} asistencias de personal guardadas correctamente`,
        });
        return true;
      } else {
        throw new Error(data.error || 'Error al guardar asistencias de personal');
      }
    } catch (error) {
      console.error('Error saving asistencias personal batch:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar asistencias de personal',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    asistencias,
    loading,
    fetchAsistencias,
    saveAsistencia,
    saveAsistenciasBatch,
    saveAsistenciasDocentesBatch,
    saveAsistenciasPersonalBatch,
    getAsistenciasByFecha,
    getAsistenciasByEstudiante,
    getAsistenciasByGradoSeccion,
  };
}
