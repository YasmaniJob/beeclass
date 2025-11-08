
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Seguimiento } from '@/lib/definitions';

// Simulación de una base de datos en memoria
let memorySeguimientos: Seguimiento[] = [];

export function useSeguimiento() {
    const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);

    const loadAllSeguimientos = useCallback(() => {
        const sorted = [...memorySeguimientos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        setSeguimientos(sorted);
    }, []);

    const getSeguimientosForEstudiante = useCallback((estudianteId: string): Seguimiento[] => {
        return memorySeguimientos
            .filter(s => s.estudianteId === estudianteId)
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, []);

    const addSeguimiento = useCallback((newSeguimientoData: Omit<Seguimiento, 'id'>) => {
        const newSeguimiento: Seguimiento = {
            ...newSeguimientoData,
            id: crypto.randomUUID(),
        };
        memorySeguimientos = [newSeguimiento, ...memorySeguimientos];
        loadAllSeguimientos();
    }, [loadAllSeguimientos]);

    useEffect(() => {
        loadAllSeguimientos();
    }, [loadAllSeguimientos]);

    return {
        seguimientos,
        addSeguimiento,
        getSeguimientosForEstudiante,
    };
}
