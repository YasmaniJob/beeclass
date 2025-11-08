
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Estudiante, NotaCualitativa, Calificacion, AreaCurricular } from '@/lib/definitions';
import { useMatriculaData } from './use-matricula-data';
import { useCompetencias } from './use-competencias';
import { useCurrentUser } from './use-current-user';
import { useToast } from './use-toast';
import { useSesiones } from './use-sesiones';

const notaValues: Record<NotaCualitativa, number> = { 'AD': 4, 'A': 3, 'B': 2, 'C': 1 };
const valueToNota: Record<number, NotaCualitativa> = { 4: 'AD', 3: 'A', 2: 'B', 1: 'C' };

const getNotaPromedio = (notas: (NotaCualitativa | undefined | null)[]): NotaCualitativa | '-' => {
    const validNotas = notas.filter((n): n is NotaCualitativa => !!n);
    if (validNotas.length === 0) return '-';
    const sum = validNotas.reduce((acc, nota) => acc + notaValues[nota], 0);
    const avgValue = Math.round(sum / validNotas.length);
    return valueToNota[avgValue] || '-';
};

export interface PromedioCompetencia {
    nota: NotaCualitativa | '-';
    faltanNotas: number;
}

export interface EstudianteConPromedios extends Estudiante {
  promediosPorCompetencia: Record<string, PromedioCompetencia>;
  tieneNotasFaltantes: boolean;
  notasFaltantesCount: number;
}

export function useCalificaciones(grado: string, seccion: string, areaId: string) {
    const { allEstudiantes, areas } = useMatriculaData();
    const { user } = useCurrentUser();
    const { allCalificaciones } = useCompetencias();
    const { sesiones, loadSesiones } = useSesiones();

    const [isLoading, setIsLoading] = useState(true);

    const area = useMemo(() => areas.find(a => a.id === areaId), [areas, areaId]);

    const memoizedLoadSesiones = useCallback(loadSesiones, []);

    useEffect(() => {
        // Cargar todas las sesiones del grado/sección para tener la data completa para los desgloses
        memoizedLoadSesiones(grado, seccion);
    }, [grado, seccion, memoizedLoadSesiones]);

    const sesionesDelArea = useMemo(() => {
        return sesiones.filter(s => s.areaId === areaId);
    }, [sesiones, areaId]);

    const calificacionesPorEstudianteYCompetencia = useMemo(() => {
        const map = new Map<string, Map<string, Calificacion[]>>();
        if (!allCalificaciones) return map;
        
        allCalificaciones.forEach(c => {
            // Asegurarse que la calificación pertenece a la sección y grado correctos.
            if (c.grado === grado && c.seccion === seccion && c.sesionId) {
                 if (!map.has(c.estudianteId)) {
                    map.set(c.estudianteId, new Map());
                }
                const compMap = map.get(c.estudianteId)!;
                if (!compMap.has(c.competenciaId)) {
                    compMap.set(c.competenciaId, []);
                }
                compMap.get(c.competenciaId)!.push(c);
            }
        });
        return map;
    }, [allCalificaciones, grado, seccion]);

    const estudiantes = useMemo(() => {
        return allEstudiantes
            .filter(e => e.grado === grado && e.seccion === seccion)
            .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
    }, [grado, seccion, allEstudiantes]);


    useEffect(() => {
        setIsLoading(allEstudiantes.length === 0);
    }, [allEstudiantes]);


    const estudiantesConPromedios: EstudianteConPromedios[] = useMemo(() => {
        if (!area || !allCalificaciones) return [];
    
        const calificacionesPorEstudiante = new Map<string, Calificacion[]>();
        allCalificaciones.forEach(c => {
            if (c.grado === grado && c.seccion === seccion) {
                if (!calificacionesPorEstudiante.has(c.estudianteId)) {
                    calificacionesPorEstudiante.set(c.estudianteId, []);
                }
                calificacionesPorEstudiante.get(c.estudianteId)!.push(c);
            }
        });

        return estudiantes.map(estudiante => {
            const promediosPorCompetencia: Record<string, PromedioCompetencia> = {};
            let totalNotasFaltantes = 0;

            const calificacionesDelEstudiante = calificacionesPorEstudiante.get(estudiante.numeroDocumento) || [];

            area.competencias.forEach(comp => {
                const sesionesDeLaCompetencia = sesionesDelArea.filter(s => s.competenciaId === comp.id);
                
                const notasDeLaCompetencia = calificacionesDelEstudiante
                    .filter(c => c.competenciaId === comp.id)
                    .map(c => c.nota);
                
                const notaPromedio = getNotaPromedio(notasDeLaCompetencia);
                
                let notasFaltantesCompetencia = 0;
                if (sesionesDeLaCompetencia.length > 0) {
                    const sesionesCalificadasIds = new Set(calificacionesDelEstudiante.filter(c => c.competenciaId === comp.id).map(c => c.sesionId));
                    for (const sesion of sesionesDeLaCompetencia) {
                        if (!sesionesCalificadasIds.has(sesion.id)) {
                            notasFaltantesCompetencia++;
                        }
                    }
                }

                promediosPorCompetencia[comp.id] = {
                    nota: notaPromedio,
                    faltanNotas: notasFaltantesCompetencia,
                };
                totalNotasFaltantes += notasFaltantesCompetencia;
            });

            return { 
                ...estudiante, 
                promediosPorCompetencia, 
                tieneNotasFaltantes: totalNotasFaltantes > 0,
                notasFaltantesCount: totalNotasFaltantes 
            };
        });
    }, [estudiantes, area, sesionesDelArea, allCalificaciones, grado, seccion]);


    return {
        estudiantes: estudiantes,
        estudiantesConPromedios,
        calificacionesPorEstudianteYCompetencia,
        sesiones: sesiones, // Devolver todas las sesiones cargadas
        sesionesDelArea, // Sesiones filtradas para la vista principal de la libreta
        isLoading,
    };
}
