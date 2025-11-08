'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Estudiante, NeeEntry } from '@/lib/definitions';
import { useMatriculaData } from './use-matricula-data';

export interface NeeInput {
    estudiante: Estudiante;
    descripcion: string;
    documentoUrl?: string;
    registradoPor: string;
}

function parseNeeEntry(data: any): NeeEntry {
    return {
        ...data,
        updatedAt: new Date(data.updatedAt),
    };
}

function serializeNeePayload(data: NeeInput): any {
    return {
        ...data,
        documentoUrl: data.documentoUrl ?? null,
    };
}

export function useNee() {
    const { neeEntries: allEntries, setNeeEntries, getNeeEntries } = useMatriculaData();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/nee', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('No se pudieron obtener los registros NEE');
            }
            const data = await response.json();
            const parsed = Array.isArray(data) ? data.map(parseNeeEntry) : [];
            setNeeEntries(parsed);
            setError(null);
        } catch (error) {
            console.error('Error al cargar NEE', error);
            setNeeEntries([]);
            setError(error instanceof Error ? error.message : 'Error al cargar NEE');
        } finally {
            setIsLoading(false);
        }
    }, [setNeeEntries]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const upsertNee = useCallback(async (payload: NeeInput) => {
        try {
            const response = await fetch('/api/nee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serializeNeePayload(payload)),
            });

            if (!response.ok) {
                throw new Error('Error al guardar registro NEE');
            }

            const saved = parseNeeEntry(await response.json());
            const existing = getNeeEntries().filter(entry => entry.id !== saved.id && entry.estudiante.numeroDocumento !== saved.estudiante.numeroDocumento);
            setNeeEntries([...existing, saved]);
            setError(null);
            return saved;
        } catch (error) {
            console.error('Error guardando NEE', error);
            setError(error instanceof Error ? error.message : 'Error guardando NEE');
            throw error;
        }
    }, [getNeeEntries, setNeeEntries]);

    const deleteNee = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/nee/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Error al eliminar registro NEE');
            }

            setNeeEntries(getNeeEntries().filter(entry => entry.id !== id));
            setError(null);
        } catch (error) {
            console.error('Error eliminando NEE', error);
            setError(error instanceof Error ? error.message : 'Error eliminando NEE');
            throw error;
        }
    }, [getNeeEntries, setNeeEntries]);

    const getNeeByDocumento = useCallback((numeroDocumento: string): NeeEntry | undefined => {
        return getNeeEntries().find(entry => entry.estudiante.numeroDocumento === numeroDocumento);
    }, [getNeeEntries]);

    const entriesMemo = useMemo(() => getNeeEntries(), [getNeeEntries, allEntries]);

    return {
        entries: entriesMemo,
        isLoading,
        error,
        refresh,
        upsertNee,
        deleteNee,
        getNeeByDocumento,
    };
}
