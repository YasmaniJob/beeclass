
'use client';

import { useCallback } from 'react';
import { useMatriculaData } from './use-matricula-data';
import { Docente } from '@/domain/entities/Docente';

export function useDocentes() {
    const { docentes, getDocentes, setDocentes: setGlobalDocentes } = useMatriculaData();

    const addDocente = useCallback(async (docente: Docente) => {
        const currentDocentes = getDocentes();
        return setGlobalDocentes([...currentDocentes, docente]);
    }, [getDocentes, setGlobalDocentes]);

    const updateDocente = useCallback(async (numeroDocumento: string, updatedData: Docente) => {
        const currentDocentes = getDocentes();
        const updatedList = currentDocentes.map(d => 
            d.numeroDocumento === numeroDocumento ? updatedData : d
        );
        return setGlobalDocentes(updatedList);
    }, [getDocentes, setGlobalDocentes]);

    const deleteDocente = useCallback(async (numeroDocumento: string) => {
        const currentDocentes = getDocentes();
        const updatedList = currentDocentes.filter(d => d.numeroDocumento !== numeroDocumento);
        return setGlobalDocentes(updatedList);
    }, [getDocentes, setGlobalDocentes]);
    
    const setDocentes = useCallback((newDocentes: Docente[]) => {
        return setGlobalDocentes(newDocentes);
    }, [setGlobalDocentes]);

    return {
        docentes,
        addDocente,
        updateDocente,
        deleteDocente,
        setDocentes,
    };
}
