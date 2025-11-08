
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';

interface HoraPedagogica {
    id: string;
    nombre: string;
}

const HORAS_KEY = 'horas_pedagogicas_config';

const defaultHoras: HoraPedagogica[] = [
    { id: '1', nombre: '1ra Hora' },
    { id: '2', nombre: '2da Hora' },
    { id: '3', nombre: '3ra Hora' },
    { id: '4', nombre: '4ta Hora' },
    { id: '5', nombre: '5ta Hora' },
    { id: '6', nombre: '6ta Hora' },
    { id: '7', nombre: '7ma Hora' },
];

function getInitialHoras(): HoraPedagogica[] {
    // Only access localStorage on client side
    if (typeof window === 'undefined') {
        return defaultHoras;
    }

    try {
        const storedHoras = localStorage.getItem(HORAS_KEY);
        return storedHoras ? JSON.parse(storedHoras) : defaultHoras;
    } catch (error) {
        console.error("No se pudo acceder a localStorage. Usando valores por defecto.");
        return defaultHoras;
    }
}

let memoryHoras: HoraPedagogica[] = defaultHoras;

export function useHorasPedagogicas() {
    const [horas, setHoras] = useState<HoraPedagogica[]>([]);
    const { toast } = useToast();

    const updateLocalStorage = (newHoras: HoraPedagogica[]) => {
        // Only save to localStorage on client side
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(HORAS_KEY, JSON.stringify(newHoras));
        } catch (error) {
            console.error("No se pudo guardar la configuración en localStorage.");
        }
    };

    const loadHoras = useCallback(() => {
        // Load from localStorage on client side only
        if (typeof window !== 'undefined') {
            memoryHoras = getInitialHoras();
        }
        setHoras([...memoryHoras].sort((a,b) => parseInt(a.id) - parseInt(b.id)));
    }, []);

    useEffect(() => {
        loadHoras();
    }, [loadHoras]);


    const addHora = useCallback(() => {
        const lastId = memoryHoras.reduce((max, h) => Math.max(max, parseInt(h.id)), 0);
        const newId = lastId + 1;
        const newNombre = `${newId}${newId === 1 ? 'ra' : (newId === 2 ? 'da' : (newId === 3 ? 'ra' : 'va'))} Hora`;
        
        const newHora: HoraPedagogica = {
            id: String(newId),
            nombre: newNombre,
        };

        memoryHoras = [...memoryHoras, newHora];
        updateLocalStorage(memoryHoras);
        loadHoras();
        toast({ title: 'Bloque añadido', description: `Se ha añadido "${newNombre}".`});
    }, [loadHoras, toast]);

    const deleteHora = useCallback((id: string) => {
        const horaToDelete = memoryHoras.find(h => h.id === id);
        memoryHoras = memoryHoras.filter(h => h.id !== id);
        updateLocalStorage(memoryHoras);
        loadHoras();
        if(horaToDelete) {
             toast({ title: 'Bloque eliminado', description: `Se ha eliminado "${horaToDelete.nombre}".`});
        }
    }, [loadHoras, toast]);

    return {
        horas,
        addHora,
        deleteHora,
    };
}
