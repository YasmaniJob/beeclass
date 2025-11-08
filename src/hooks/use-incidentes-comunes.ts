
'use client';

import { useCallback } from 'react';
import { useMatriculaData } from './use-matricula-data';

type TipoIncidente = 'estudiantes' | 'personal';

export function useIncidentesComunes() {
    const { incidentesComunes, getIncidentesComunes, setIncidentesComunes } = useMatriculaData();

    const addIncidenteComun = useCallback((incidente: string, tipo: TipoIncidente) => {
        const memoryIncidentesComunes = getIncidentesComunes();
        if (!memoryIncidentesComunes[tipo].includes(incidente)) {
            memoryIncidentesComunes[tipo] = [...memoryIncidentesComunes[tipo], incidente];
            setIncidentesComunes(memoryIncidentesComunes);
        }
    }, [getIncidentesComunes, setIncidentesComunes]);

    const deleteIncidenteComun = useCallback((incidente: string, tipo: TipoIncidente) => {
        const memoryIncidentesComunes = getIncidentesComunes();
        memoryIncidentesComunes[tipo] = memoryIncidentesComunes[tipo].filter(i => i !== incidente);
        setIncidentesComunes(memoryIncidentesComunes);
    }, [getIncidentesComunes, setIncidentesComunes]);

    return {
        incidentesComunes,
        addIncidenteComun,
        deleteIncidenteComun,
    };
}
