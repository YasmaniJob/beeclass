
'use client';

import { useEffect, useMemo } from 'react';
import { Incidente, Estudiante } from '@/lib/definitions';
import { useIncidentes } from './use-incidentes';
import { useEnRiesgoData } from './use-en-riesgo-data';
import { useRiesgoConfig } from './use-riesgo-config';
import { useMatriculaData } from './use-matricula-data';
import { useAsistencias } from './use-asistencias';
import { format, isToday } from 'date-fns';

export interface DashboardStats {
    presentesHoy: number;
    faltasHoy: number;
    tardanzasHoy: number;
    enRiesgoTotal: number;
}

function normalizeSheetDateString(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [part1, part2, yearString] = trimmed.split('/');
    const first = Number(part1);
    const second = Number(part2);
    const year = Number(yearString);

    if (Number.isNaN(first) || Number.isNaN(second) || Number.isNaN(year)) {
      return null;
    }

    let day = first;
    let month = second;

    if (first > 12 && second <= 12) {
      day = first;
      month = second;
    } else if (second > 12 && first <= 12) {
      day = second;
      month = first;
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return format(parsed, 'yyyy-MM-dd');
}

export function useDashboard() {
  const { incidentes } = useIncidentes();
  const { faltasThreshold, incidentesThreshold, notasReprobadasThreshold } = useRiesgoConfig();
  const { estudiantesEnRiesgo, isLoading: isRiesgoLoading } = useEnRiesgoData(
    faltasThreshold,
    incidentesThreshold,
    notasReprobadasThreshold
  );
  const { allEstudiantes, isLoaded: isMatriculaLoaded } = useMatriculaData();
  const { asistencias, loading: asistenciasLoading, fetchAsistencias } = useAsistencias();

  // Intentar usar caché primero
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadData = async () => {
      const { getCachedDashboardStats } = await import('@/lib/cache/dashboard-cache');
      const cached = getCachedDashboardStats();
      
      // Si no hay caché válido, cargar datos
      if (!cached) {
        fetchAsistencias();
      }
    };
    
    loadData();
  }, [fetchAsistencias]);

  const asistenciaHoy = useMemo(() => {
    if (!allEstudiantes.length) {
      return { presentes: 0, faltas: 0, tardanzas: 0 };
    }

    const todayKey = format(new Date(), 'yyyy-MM-dd');
    let presentes = 0;
    let faltas = 0;
    let tardanzas = 0;

    asistencias.forEach((registro) => {
      const normalizedDate = normalizeSheetDateString(registro.fecha);
      if (normalizedDate !== todayKey) {
        return;
      }

      switch (registro.status) {
        case 'presente':
          presentes += 1;
          break;
        case 'tarde':
          tardanzas += 1;
          break;
        case 'falta':
          faltas += 1;
          break;
        default:
          break;
      }
    });

    return { presentes, faltas, tardanzas };
  }, [allEstudiantes.length, asistencias]);

  const incidentesRecientes = useMemo(() => {
    return incidentes
      .filter((i) => isToday(new Date(i.fecha)))
      .slice(0, 5);
  }, [incidentes]);

  const isLoading = useMemo(
    () => !isMatriculaLoaded || isRiesgoLoading || asistenciasLoading,
    [isMatriculaLoaded, isRiesgoLoading, asistenciasLoading]
  );

  const enRiesgoCount = useMemo(() => estudiantesEnRiesgo.length, [estudiantesEnRiesgo]);

  const stats = useMemo<DashboardStats>(() => {
    const newStats = {
      presentesHoy: asistenciaHoy.presentes,
      faltasHoy: asistenciaHoy.faltas,
      tardanzasHoy: asistenciaHoy.tardanzas,
      enRiesgoTotal: enRiesgoCount,
    };
    
    // Guardar en caché
    if (typeof window !== 'undefined' && !isLoading) {
      import('@/lib/cache/dashboard-cache').then(({ cacheDashboardStats }) => {
        cacheDashboardStats(newStats);
      });
    }
    
    return newStats;
  }, [asistenciaHoy, enRiesgoCount, isLoading]);

  return {
    stats,
    incidentes: incidentesRecientes,
    isLoading,
  };
}
