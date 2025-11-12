
'use client';

import { useState, useCallback, useEffect } from 'react';
import { SesionAprendizaje } from '@/lib/definitions';
import { useMatriculaData } from './use-matricula-data';
import { TipoEvaluacion } from '@/types/evaluacion';

export function useSesiones() {
    const { sesiones: allSesiones, getSesiones, setSesiones } = useMatriculaData();

    const loadSesiones = useCallback((grado?: string, seccion?: string, areaId?: string) => {
        let sesionesFiltradas = getSesiones();
        
        if (grado && seccion && areaId) {
            sesionesFiltradas = sesionesFiltradas.filter(
                s => s.grado === grado && s.seccion === seccion && s.areaId === areaId
            );
        } else if (grado && seccion) { // Cargar todas las de un grado y seccion
             sesionesFiltradas = sesionesFiltradas.filter(
                s => s.grado === grado && s.seccion === seccion
            );
        }
        // Si no se proveen filtros, no se hace nada, el estado `sesiones` en el hook ya tiene todas.
    }, [getSesiones]);
    
    const getSesionById = useCallback((sesionId: string): SesionAprendizaje | undefined => {
        const sesion = getSesiones().find(s => s.id === sesionId);
        return sesion ? { ...sesion } : undefined;
    }, [getSesiones]);

    const addSesion = useCallback((
        grado: string, 
        seccion: string, 
        areaId: string, 
        titulo: string, 
        competenciaId: string, 
        capacidades?: string[],
        tipoEvaluacion: TipoEvaluacion = 'directa'
    ): SesionAprendizaje => {
        const memorySesiones = getSesiones();
        const newSesion: SesionAprendizaje = {
            id: `sesion-${Date.now()}`,
            grado,
            seccion,
            areaId,
            titulo,
            competenciaId,
            capacidades,
            fecha: new Date(),
            tipoEvaluacion,
        };
        setSesiones([...memorySesiones, newSesion]);
        return newSesion;
    }, [getSesiones, setSesiones]);

    return {
        sesiones: allSesiones,
        addSesion,
        getSesionById,
        loadSesiones,
    };
}
