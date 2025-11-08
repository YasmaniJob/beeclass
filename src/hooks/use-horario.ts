
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCurrentUser } from './use-current-user';
import { useMatriculaData } from './use-matricula-data';
import { useHorasPedagogicas } from './use-horas-pedagogicas';
import { DocenteAsignacion, Docente } from '@/domain/entities/Docente';
import isEqual from 'lodash/isEqual';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface ActividadPedagogica {
    id: string;
    nombre: string;
    type: 'activity';
}

// Define una estructura para una celda del horario
export interface HorarioCell {
    label: string;
    subLabel: string | null;
    color: string; 
    asignacionId: string;
}

// Mapa para el horario: la clave es "dia-horaId"
export type HorarioMap = Map<string, HorarioCell>;

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const colorPalette = [
    'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200', 
    'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200', 
    'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-200',
    'bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200',
    'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200',
    'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200',
    'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200',
    'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200'
];
const actividadColor = 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300';

const actividadesBase: ActividadPedagogica[] = [];

export function useHorario() {
    const { user, isLoaded: isUserLoaded, updateUser } = useCurrentUser();
    const { allAreas, isLoaded: isMatriculaLoaded } = useMatriculaData();
    const { horas } = useHorasPedagogicas();
    const [isLoading, setIsLoading] = useState(true);
    const [horario, setHorario] = useState<HorarioMap>(new Map());
    const [originalHorario, setOriginalHorario] = useState<HorarioMap>(new Map());
    const [actividadesPersonalizadas, setActividadesPersonalizadas] = useState<ActividadPedagogica[]>([]);
    const [currentTimeInfo, setCurrentTimeInfo] = useState<{dia: string, horaId: string | null}>({ dia: '', horaId: null });
    
    const asignacionesConArea = useMemo<DocenteAsignacion[]>(() => {
        return (user?.asignaciones ?? []).filter((a): a is DocenteAsignacion => Boolean(a.areaId));
    }, [user]);

    const actividadesPedagogicas = useMemo(() => [...actividadesBase, ...actividadesPersonalizadas], [actividadesPersonalizadas]);
    
    const areaColorMap = useMemo(() => {
        const map = new Map<string, string>();
        let colorIndex = 0;
        const areasAsignadas = new Set(asignacionesConArea.map(a => a.areaId).filter((id): id is string => Boolean(id)));
        areasAsignadas.forEach(areaId => {
            if (!map.has(areaId)) {
                map.set(areaId, colorPalette[colorIndex % colorPalette.length]);
                colorIndex++;
            }
        });
        return map;
    }, [asignacionesConArea]);

    const hasChanges = useMemo(() => {
        const currentMapObj = Object.fromEntries(horario);
        const originalMapObj = Object.fromEntries(originalHorario);
        return !isEqual(currentMapObj, originalMapObj);
    }, [horario, originalHorario]);

    const buildHorarioMap = useCallback((horarioData: Record<string, string>) => {
        const newHorario: HorarioMap = new Map();
        if (!user || horas.length === 0) {
            return newHorario;
        }

        const allOptions: (DocenteAsignacion | ActividadPedagogica)[] = [...asignacionesConArea, ...actividadesPedagogicas];

        for (const key in horarioData) {
            const id = horarioData[key];
            const item = allOptions.find(opt => opt.id === id);

            if (item) {
                if ('type' in item && item.type === 'activity') { // Es ActividadPedagogica
                    newHorario.set(key, {
                        label: item.nombre,
                        subLabel: null,
                        color: actividadColor,
                        asignacionId: item.id,
                    });
                } else { // Es Asignacion
                    const asignacion = item as DocenteAsignacion;
                    if (!asignacion.areaId) continue;
                    const area = allAreas.find(a => a.id === asignacion.areaId);
                    if (area) {
                        newHorario.set(key, {
                            label: area.nombre,
                            subLabel: `${asignacion.grado} - ${asignacion.seccion.replace('Sección ', '')}`,
                            color: areaColorMap.get(area.id) ?? actividadColor,
                            asignacionId: asignacion.id!,
                        });
                    }
                }
            }
        }
        return newHorario;
    }, [user, horas, asignacionesConArea, actividadesPedagogicas, allAreas, areaColorMap]);

    useEffect(() => {
        if (isUserLoaded && isMatriculaLoaded && user) {
            const initialHorarioData = user.horario || {};
            const builtHorario = buildHorarioMap(initialHorarioData);
            setHorario(builtHorario);
            setOriginalHorario(new Map(builtHorario));

            const now = new Date();
            const currentDia = format(now, 'EEEE', { locale: es });
            const currentHour = now.getHours();
            
            // Simple mapping for demo. A real app would map time ranges.
            const horaActualId = horas[currentHour - 8]?.id || null; 
            
            setCurrentTimeInfo({ 
                dia: currentDia.charAt(0).toUpperCase() + currentDia.slice(1), 
                horaId: horaActualId 
            });

            setIsLoading(false);
        }
    }, [isUserLoaded, isMatriculaLoaded, user, buildHorarioMap, horas]);

    const updateHorarioCell = useCallback((key: string, selection: DocenteAsignacion | ActividadPedagogica | null) => {
        setHorario(prevHorario => {
            const newHorario = new Map(prevHorario);
            if (selection === null) {
                newHorario.delete(key);
            } else if ('type' in selection && selection.type === 'activity') {
                 newHorario.set(key, {
                    label: selection.nombre,
                    subLabel: null,
                    color: actividadColor,
                    asignacionId: selection.id,
                });
            } else {
                const asignacion = selection as DocenteAsignacion;
                if (!asignacion.areaId) {
                    return newHorario;
                }
                const area = allAreas.find(a => a.id === asignacion.areaId);
                if (area) {
                    newHorario.set(key, {
                        label: area.nombre,
                        subLabel: `${asignacion.grado} - ${asignacion.seccion.replace('Sección ', '')}`,
                        color: areaColorMap.get(area.id) ?? actividadColor,
                        asignacionId: asignacion.id!,
                    });
                }
            }
            return newHorario;
        });
    }, [allAreas, areaColorMap]);


    const saveHorario = useCallback(() => {
        if (!user) return;
        const horarioToSave: Record<string, string> = {};
        horario.forEach((value, key) => {
            horarioToSave[key] = value.asignacionId;
        });

        const updatedResult = user.actualizar({ horario: horarioToSave });
        if (!updatedResult.isSuccess) {
            console.error('No se pudo actualizar el horario del usuario', updatedResult.error);
            return;
        }

        updateUser(updatedResult.value);
        setOriginalHorario(new Map(horario));
    }, [user, horario, updateUser]);
    
    const discardChanges = useCallback(() => {
        setHorario(new Map(originalHorario));
    }, [originalHorario]);

    const addActividadPersonalizada = useCallback((nombre: string) => {
        const newActivity: ActividadPedagogica = {
            id: `act-custom-${Date.now()}`,
            nombre,
            type: 'activity',
        };
        setActividadesPersonalizadas(prev => [...prev, newActivity]);
    }, []);

    return {
        horario,
        horas,
        dias: diasSemana,
        asignacionesConArea,
        actividadesPedagogicas,
        isLoading,
        updateHorarioCell,
        saveHorario,
        hasChanges,
        discardChanges,
        addActividadPersonalizada,
        currentTimeInfo,
    };
}
