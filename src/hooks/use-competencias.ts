
'use client';

import { useCallback } from 'react';
import { Calificacion } from '@/lib/definitions';
import { useMatriculaData } from './use-matricula-data';

export function useCompetencias() {
    const { allCalificaciones, getCalificaciones, setCalificaciones } = useMatriculaData();

    const saveCalificacion = useCallback((
        data: Omit<Calificacion, 'id' | 'fecha'>
    ) => {
        const memoryCalificaciones = getCalificaciones();
        const { estudianteId, docenteId, areaId, competenciaId, periodo, sesionId, nota, tipoEvaluacion } = data;
        
        let existingIndex = -1;

        if (sesionId) {
            existingIndex = memoryCalificaciones.findIndex(c => c.sesionId === sesionId && c.estudianteId === estudianteId);
        } else if (periodo) {
            // Lógica para calificaciones transversales (por periodo)
            existingIndex = memoryCalificaciones.findIndex(c => 
                c.estudianteId === estudianteId && 
                c.docenteId === docenteId &&
                c.competenciaId === competenciaId && 
                c.periodo === periodo
            );
        }
        
        if (existingIndex > -1) {
            // Se encontró una calificación existente, la actualizamos.
            const updatedCalificacion = {
                ...memoryCalificaciones[existingIndex],
                nota: nota,
                fecha: new Date(),
                docenteId: docenteId, 
                areaId: areaId,
                tipoEvaluacion: tipoEvaluacion || memoryCalificaciones[existingIndex].tipoEvaluacion || 'directa',
            };
            memoryCalificaciones[existingIndex] = updatedCalificacion;
        } else {
            // No se encontró, así que creamos una nueva.
            const newEntry: Calificacion = {
                id: crypto.randomUUID(),
                ...data,
                fecha: new Date(),
                tipoEvaluacion: tipoEvaluacion || 'directa',
            };
            memoryCalificaciones.push(newEntry);
        }
        
        setCalificaciones(memoryCalificaciones);
    }, [getCalificaciones, setCalificaciones]);


    return {
        allCalificaciones,
        saveCalificacion,
    };
}
