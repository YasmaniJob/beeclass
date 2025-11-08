
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMatriculaData } from './use-matricula-data';
import { AsistenciaRecord } from './use-asistencia';

export type HistorialAsistenciaRecord = {
    numeroDocumento: string;
    fecha: Date;
    status: AsistenciaRecord['status'];
};

export function useHistorialAsistencia() {
    const { historialAsistencia: allHistorial } = useMatriculaData();
    const [historial, setHistorial] = useState<HistorialAsistenciaRecord[]>([]);

    const loadHistorialForEstudiante = useCallback((numeroDocumento: string) => {
        const historialEstudiante = allHistorial.filter(h => h.numeroDocumento === numeroDocumento);
        const sorted = historialEstudiante.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        setHistorial(sorted);
    }, [allHistorial]);
    
    const historialGlobal = useMemo(() => {
        return [...allHistorial].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [allHistorial]);

    return {
        historial,
        loadHistorialForEstudiante,
        historialGlobal,
    };
}
