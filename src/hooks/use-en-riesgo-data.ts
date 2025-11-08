
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Estudiante } from '@/domain/entities/Estudiante';
import { useMatriculaData } from './use-matricula-data';
import { toEstudianteEntity } from '@/domain/mappers/entity-builders';

export type EstudianteEnRiesgo = Estudiante & {
  faltasCount: number;
  incidentesCount: number;
  notasBajasCount: number;
  areasConNotasBajas: { area: string; count: number }[];
  riskFactor: 'Faltas' | 'Incidentes' | 'Notas Bajas' | 'Ambos';
};

const buildEstudianteEnRiesgo = (
  estudiante: Estudiante,
  extras: Omit<EstudianteEnRiesgo, keyof Estudiante>
): EstudianteEnRiesgo => {
  return Object.assign(
    Object.create(Object.getPrototypeOf(estudiante)),
    estudiante,
    extras
  ) as EstudianteEnRiesgo;
};

export type RiskTrendData = {
  date: string;
  total: number;
  faltas: number;
  incidentes: number;
  notas: number;
};

export function useEnRiesgoData(
  faltasThreshold: number,
  incidentesThreshold: number,
  notasReprobadasThreshold: number
) {
  const {
    allEstudiantes,
    historialAsistencia,
    incidentes,
    allCalificaciones,
    allAreas,
    isLoaded: matriculaLoaded,
  } = useMatriculaData();

  const [estudiantesEnRiesgo, setEstudiantesEnRiesgo] = useState<EstudianteEnRiesgo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const areaNameById = useMemo(() => {
    const map = new Map<string, string>();
    allAreas?.forEach(area => {
      map.set(area.id, area.nombre);
    });
    return map;
  }, [allAreas]);

  useEffect(() => {
    if (!matriculaLoaded) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);

    const timeout = window.setTimeout(() => {
      const estudiantesSource = (allEstudiantes ?? [])
        .map(estudiante => {
          if (estudiante instanceof Estudiante) {
            return estudiante;
          }

          const result = toEstudianteEntity(estudiante as any);
          if (!result.isSuccess) {
            console.warn('useEnRiesgoData: no se pudo convertir estudiante', estudiante);
            return null;
          }

          return result.value;
        })
        .filter((est): est is Estudiante => est !== null);

      if (estudiantesSource.length === 0) {
        setEstudiantesEnRiesgo([]);
        setIsLoading(false);
        return;
      }

      const faltasPorEstudiante = new Map<string, number>();
      historialAsistencia.forEach(record => {
        if (record.status === 'falta') {
          faltasPorEstudiante.set(
            record.numeroDocumento,
            (faltasPorEstudiante.get(record.numeroDocumento) ?? 0) + 1
          );
        }
      });

      const incidentesPorEstudiante = new Map<string, number>();
      incidentes.forEach(incidente => {
        if (!(incidente.sujeto instanceof Estudiante)) {
          return;
        }

        incidentesPorEstudiante.set(
          incidente.sujeto.numeroDocumento,
          (incidentesPorEstudiante.get(incidente.sujeto.numeroDocumento) ?? 0) + 1
        );
      });

      const notasBajasPorEstudiante = new Map<
        string,
        { total: number; porArea: Map<string, number> }
      >();

      allCalificaciones.forEach(calificacion => {
        if (calificacion.nota !== 'C') {
          return;
        }

        const areaNombre = areaNameById.get(calificacion.areaId) ?? calificacion.areaId;

        const current = notasBajasPorEstudiante.get(calificacion.estudianteId) ?? {
          total: 0,
          porArea: new Map<string, number>(),
        };

        current.total += 1;
        current.porArea.set(areaNombre, (current.porArea.get(areaNombre) ?? 0) + 1);
        notasBajasPorEstudiante.set(calificacion.estudianteId, current);
      });

      const resultado: EstudianteEnRiesgo[] = estudiantesSource
        .map(estudiante => {
          const faltasCount = faltasPorEstudiante.get(estudiante.numeroDocumento) ?? 0;
          const incidentesCount = incidentesPorEstudiante.get(estudiante.numeroDocumento) ?? 0;
          const notasData = notasBajasPorEstudiante.get(estudiante.numeroDocumento);
          const notasBajasCount = notasData?.total ?? 0;
          const areasConNotasBajas = notasData
            ? Array.from(notasData.porArea.entries()).map(([area, count]) => ({ area, count }))
            : [];

          const factores: Array<'Faltas' | 'Incidentes' | 'Notas Bajas'> = [];
          if (faltasThreshold > 0 && faltasCount >= faltasThreshold) factores.push('Faltas');
          if (incidentesThreshold > 0 && incidentesCount >= incidentesThreshold) factores.push('Incidentes');
          if (notasReprobadasThreshold > 0 && notasBajasCount >= notasReprobadasThreshold) factores.push('Notas Bajas');

          if (factores.length === 0) {
            return null;
          }

          const riskFactor = factores.length > 1 ? 'Ambos' : factores[0];

          return buildEstudianteEnRiesgo(estudiante, {
            faltasCount,
            incidentesCount,
            notasBajasCount,
            areasConNotasBajas,
            riskFactor,
          });
        })
        .filter((item): item is EstudianteEnRiesgo => item !== null)
        .sort((a, b) => {
          const totalA = a.faltasCount + a.incidentesCount + a.notasBajasCount;
          const totalB = b.faltasCount + b.incidentesCount + b.notasBajasCount;
          return totalB - totalA;
        });

      setEstudiantesEnRiesgo(resultado);
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [
    allAreas,
    allCalificaciones,
    allEstudiantes,
    historialAsistencia,
    incidentes,
    matriculaLoaded,
    areaNameById,
    faltasThreshold,
    incidentesThreshold,
    notasReprobadasThreshold,
  ]);

  return { estudiantesEnRiesgo, isLoading };
}
