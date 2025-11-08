
'use client';

import { useCallback } from 'react';
import { useMatriculaData } from './use-matricula-data';
import { AreaCurricular, Competencia, Nivel } from '@/lib/definitions';
import { useToast } from './use-toast';

export function useCurricular() {
    const { 
        areas: allAreas, 
        niveles, 
        getAreas, 
        setAreas, 
    } = useMatriculaData();

    const addArea = useCallback((nombre: string, nivel: Nivel) => {
        const memoryAreas = getAreas();
        const newArea: AreaCurricular = {
            id: `area-${Date.now()}-${Math.random()}`,
            nombre,
            nivel,
            competencias: [],
        };
        setAreas([...memoryAreas, newArea]);
    }, [getAreas, setAreas]);

    const deleteArea = useCallback((areaId: string) => {
        const memoryAreas = getAreas();
        setAreas(memoryAreas.filter(a => a.id !== areaId));
    }, [getAreas, setAreas]);

    const addCompetencia = useCallback((areaId: string, nombreCompetencia: string) => {
        const memoryAreas = getAreas();
        const areaIndex = memoryAreas.findIndex(a => a.id === areaId);
        if (areaIndex > -1) {
            const newCompetencia: Competencia = {
                id: `comp-${Date.now()}-${Math.random()}`,
                nombre: nombreCompetencia,
            };
            memoryAreas[areaIndex].competencias.push(newCompetencia);
            setAreas(memoryAreas);
        }
    }, [getAreas, setAreas]);

    const updateCompetencia = useCallback((areaId: string, competenciaId: string, nuevoNombre: string) => {
        const memoryAreas = getAreas();
        const areaIndex = memoryAreas.findIndex(a => a.id === areaId);
        if (areaIndex > -1) {
            const compIndex = memoryAreas[areaIndex].competencias.findIndex(c => c.id === competenciaId);
            if (compIndex > -1) {
                memoryAreas[areaIndex].competencias[compIndex].nombre = nuevoNombre;
                setAreas(memoryAreas);
            }
        }
    }, [getAreas, setAreas]);

    const deleteCompetencia = useCallback((areaId: string, competenciaId: string) => {
        const memoryAreas = getAreas();
        const areaIndex = memoryAreas.findIndex(a => a.id === areaId);
        if (areaIndex > -1) {
            memoryAreas[areaIndex].competencias = memoryAreas[areaIndex].competencias.filter(c => c.id !== competenciaId);
            setAreas(memoryAreas);
        }
    }, [getAreas, setAreas]);

    return {
        niveles,
        areas: allAreas,
        addArea,
        deleteArea,
        addCompetencia,
        updateCompetencia,
        deleteCompetencia,
    };
}
