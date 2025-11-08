
'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useMatriculaData } from './use-matricula-data';
import { useHistorialAsistencia } from './use-historial-asistencia';
import { Estudiante } from '@/domain/entities/Estudiante';
import { endOfDay, startOfDay, subDays } from 'date-fns';

export interface ReporteFilters {
  dateRange?: DateRange;
  grado: string;
  seccion: string;
}

export interface AsistenciaStats {
  totalEstudiantes: number;
  totalRegistros: number;
  presente: number;
  tarde: number;
  falta: number;
  permiso: number;
}

export interface EstudianteConteo {
  estudiante: Estudiante;
  presente: number;
  tarde: number;
  falta: number;
  permiso: number;
}

interface ChartItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

const defaultDateRange: DateRange = {
  from: subDays(new Date(), 29),
  to: new Date(),
};

const emptyStats: AsistenciaStats = {
  totalEstudiantes: 0,
  totalRegistros: 0,
  presente: 0,
  tarde: 0,
  falta: 0,
  permiso: 0,
};

export function useReporteAsistencia() {
  const { allEstudiantes, allGrados, seccionesPorGrado } = useMatriculaData();
  const { historial: allHistorial } = useHistorialAsistencia();

  const [filters, setFilters] = useState<ReporteFilters>({
    dateRange: defaultDateRange,
    grado: '',
    seccion: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AsistenciaStats>(emptyStats);
  const [estudiantesConteo, setEstudiantesConteo] = useState<EstudianteConteo[]>([]);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (allGrados.length === 0) {
      return;
    }

    if (!filters.grado) {
      const primerGrado = allGrados[0];
      const primeraSeccion = seccionesPorGrado[primerGrado]?.[0] ?? '';
      setFilters(prev => ({ ...prev, grado: primerGrado, seccion: primeraSeccion }));
      return;
    }

    const seccionesDisponibles = seccionesPorGrado[filters.grado] ?? [];
    if (seccionesDisponibles.length > 0 && !seccionesDisponibles.includes(filters.seccion)) {
      setFilters(prev => ({ ...prev, seccion: seccionesDisponibles[0] }));
    }
  }, [allGrados, filters.grado, filters.seccion, seccionesPorGrado]);

  useEffect(() => {
    setIsLoading(true);

    const timeout = window.setTimeout(() => {
      if (!filters.grado || !filters.seccion || !filters.dateRange?.from) {
        setStats(emptyStats);
        setEstudiantesConteo([]);
        setChartData([]);
        setIsLoading(false);
        return;
      }

      const estudiantesFiltrados = allEstudiantes.filter(
        estudiante => estudiante.grado === filters.grado && estudiante.seccion === filters.seccion
      );

      const from = startOfDay(filters.dateRange.from);
      const to = filters.dateRange.to ? endOfDay(filters.dateRange.to) : endOfDay(filters.dateRange.from);

      const historialFiltrado = allHistorial.filter(registro => {
        const fechaRegistro = startOfDay(new Date(registro.fecha));
        return fechaRegistro >= from && fechaRegistro <= to;
      });

      if (estudiantesFiltrados.length === 0) {
        setStats(emptyStats);
        setEstudiantesConteo([]);
        setChartData([]);
        setIsLoading(false);
        return;
      }

      type ConteoEstado = Record<'presente' | 'tarde' | 'falta' | 'permiso' | 'sin_asistencia', number>;

      const conteos = new Map<string, ConteoEstado>();
      estudiantesFiltrados.forEach(estudiante => {
        conteos.set(estudiante.numeroDocumento, {
          presente: 0,
          tarde: 0,
          falta: 0,
          permiso: 0,
          sin_asistencia: 0,
        });
      });

      const acumulado: AsistenciaStats = {
        totalEstudiantes: estudiantesFiltrados.length,
        totalRegistros: 0,
        presente: 0,
        tarde: 0,
        falta: 0,
        permiso: 0,
      };

      historialFiltrado.forEach(registro => {
        const conteoEstudiante = conteos.get(registro.numeroDocumento);
        if (!conteoEstudiante) return;

        if (registro.status in conteoEstudiante) {
          conteoEstudiante[registro.status as keyof ConteoEstado] += 1;
        }

        if (registro.status === 'presente' || registro.status === 'tarde' || registro.status === 'falta' || registro.status === 'permiso') {
          acumulado[registro.status] += 1;
        }
        acumulado.totalRegistros += 1;
      });

      const detalleEstudiantes: EstudianteConteo[] = estudiantesFiltrados.map(estudiante => ({
        estudiante,
        ...((() => {
          const conteo = conteos.get(estudiante.numeroDocumento)!;
          const { presente, tarde, falta, permiso } = conteo;
          return { presente, tarde, falta, permiso };
        })()),
      }));

      const totalSinPermisos = acumulado.presente + acumulado.tarde + acumulado.falta;
      const chartConfig: Array<{ label: string; key: keyof AsistenciaStats; color: string }> = [
        { label: 'Presentes', key: 'presente', color: 'hsl(var(--chart-2))' },
        { label: 'Tardanzas', key: 'tarde', color: 'hsl(var(--chart-3))' },
        { label: 'Faltas', key: 'falta', color: 'hsl(var(--chart-5))' },
      ];

      const nuevoChartData: ChartItem[] = chartConfig.map(item => {
        const valor = acumulado[item.key];
        const porcentaje = totalSinPermisos > 0 ? Number(((valor / totalSinPermisos) * 100).toFixed(1)) : 0;
        return {
          label: item.label,
          value: valor,
          percentage: porcentaje,
          color: item.color,
        };
      });

      const totalPagesCalc = Math.max(1, Math.ceil(detalleEstudiantes.length / pageSize));
      const current = Math.min(currentPage, totalPagesCalc);
      const startIndex = (current - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      setStats(acumulado);
      setEstudiantesConteo(detalleEstudiantes.slice(startIndex, endIndex));
      setChartData(nuevoChartData);
      setTotalPages(totalPagesCalc);
      setCurrentPage(current);
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [
    allEstudiantes,
    allHistorial,
    filters.dateRange,
    filters.grado,
    filters.seccion,
    currentPage,
  ]);

  const handleFiltersChange = (nuevosFiltros: Partial<ReporteFilters>) => {
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, ...nuevosFiltros }));
  };

  const periodoSeleccionado = useMemo(() => {
    if (!filters.dateRange?.from) return '';
    const from = filters.dateRange.from.toLocaleDateString('es-PE');
    const to = filters.dateRange.to ? filters.dateRange.to.toLocaleDateString('es-PE') : from;
    return from === to ? from : `${from} - ${to}`;
  }, [filters.dateRange]);

  return {
    filters,
    setFilters: handleFiltersChange,
    stats,
    estudiantesConteo,
    chartData,
    isLoading,
    periodoSeleccionado,
    pagination: {
      currentPage,
      totalPages,
      pageSize,
      setPage: setCurrentPage,
    },
  };
}
