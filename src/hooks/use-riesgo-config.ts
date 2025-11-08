
'use client';

import { useState, useCallback, useEffect } from 'react';

const FALTAS_THRESHOLD_KEY = 'riesgo_faltas_threshold';
const INCIDENTES_THRESHOLD_KEY = 'riesgo_incidentes_threshold';
const NOTAS_THRESHOLD_KEY = 'riesgo_notas_threshold';

const DEFAULT_FALTAS = 3;
const DEFAULT_INCIDENTES = 2;
const DEFAULT_NOTAS = 2;

export function useRiesgoConfig() {
    const [faltasThreshold, setFaltasThreshold] = useState(DEFAULT_FALTAS);
    const [incidentesThreshold, setIncidentesThreshold] = useState(DEFAULT_INCIDENTES);
    const [notasReprobadasThreshold, setNotasReprobadasThreshold] = useState(DEFAULT_NOTAS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') {
            setIsLoaded(true);
            return;
        }

        try {
            const storedFaltas = localStorage.getItem(FALTAS_THRESHOLD_KEY);
            const storedIncidentes = localStorage.getItem(INCIDENTES_THRESHOLD_KEY);
            const storedNotas = localStorage.getItem(NOTAS_THRESHOLD_KEY);

            if (storedFaltas) setFaltasThreshold(Number(storedFaltas));
            if (storedIncidentes) setIncidentesThreshold(Number(storedIncidentes));
            if (storedNotas) setNotasReprobadasThreshold(Number(storedNotas));

        } catch (error) {
            console.error("No se pudo acceder a localStorage. Usando valores por defecto.");
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveConfig = useCallback((faltas: number, incidentes: number, notas: number) => {
        // Only save to localStorage on client side
        if (typeof window === 'undefined') {
            setFaltasThreshold(faltas);
            setIncidentesThreshold(incidentes);
            setNotasReprobadasThreshold(notas);
            return;
        }

        try {
            localStorage.setItem(FALTAS_THRESHOLD_KEY, String(faltas));
            localStorage.setItem(INCIDENTES_THRESHOLD_KEY, String(incidentes));
            localStorage.setItem(NOTAS_THRESHOLD_KEY, String(notas));

            setFaltasThreshold(faltas);
            setIncidentesThreshold(incidentes);
            setNotasReprobadasThreshold(notas);
        } catch (error) {
            console.error("No se pudo guardar la configuración en localStorage.");
        }
    }, []);

    return {
        faltasThreshold,
        incidentesThreshold,
        notasReprobadasThreshold,
        setFaltasThreshold,
        setIncidentesThreshold,
        setNotasReprobadasThreshold,
        saveConfig,
        isLoaded,
    };
}
