
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Incidente, IncidenteInput, SujetoIncidente } from '@/domain/entities/Incidente';
import { useMatriculaData } from './use-matricula-data';
import { incidenteToPayload, toIncidenteEntity } from '@/domain/mappers/entity-builders';

type RawIncidente = {
    id: string;
    sujeto: any;
    fecha: string | Date;
    descripcion: string;
    reportadoPor: string;
};

function ensureEntity(data: RawIncidente | Incidente): Incidente {
    if (data instanceof Incidente) {
        return data;
    }

    if (!data?.descripcion || !data?.reportadoPor || !data?.fecha) {
        throw new Error('Incidente inválido: faltan campos requeridos');
    }

    const fecha = data.fecha instanceof Date ? data.fecha : new Date(data.fecha);

    const parsed = toIncidenteEntity({
        id: data?.id,
        sujeto: data?.sujeto,
        fecha,
        descripcion: data.descripcion,
        reportadoPor: data.reportadoPor,
    });

    if (!parsed.isSuccess) {
        throw parsed.error;
    }

    return parsed.value;
}

export function useIncidentes() {
    const { incidentes: allIncidentes, getIncidentes, setIncidentes } = useMatriculaData();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rowKeyCounts, setRowKeyCounts] = useState<Record<string, number>>({});

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/incidentes', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('No se pudieron obtener los incidentes');
            }
            const data: RawIncidente[] = await response.json();
            const parsed = Array.isArray(data) ? data.map(ensureEntity) : [];
            setIncidentes(parsed);
            const counts: Record<string, number> = {};
            parsed.forEach(item => {
                const key = `${item.id}-${item.fecha.getTime()}`;
                counts[key] = (counts[key] ?? 0) + 1;
            });
            setRowKeyCounts(counts);
            setError(null);
        } catch (error) {
            console.error('Error al cargar incidentes', error);
            setIncidentes([]);
            setError(error instanceof Error ? error.message : 'Error al cargar incidentes');
        } finally {
            setIsLoading(false);
        }
    }, [setIncidentes]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addIncidente = useCallback(
        async (newIncidenteData: IncidenteInput) => {
            try {
                const payload = incidenteToPayload(newIncidenteData);
                const response = await fetch('/api/incidentes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Error al registrar incidente');
                }

                const created = ensureEntity(await response.json());
                setIncidentes([...getIncidentes(), created]);
                setRowKeyCounts(prev => {
                    const key = `${created.id}-${created.fecha.getTime()}`;
                    const next = { ...prev };
                    next[key] = (next[key] ?? 0) + 1;
                    return next;
                });
                setError(null);
            } catch (error) {
                console.error('Error creando incidente', error);
                setError(error instanceof Error ? error.message : 'Error creando incidente');
                throw error;
            }
        },
        [getIncidentes, setIncidentes]
    );

    const updateIncidente = useCallback(
        async (id: string, updatedData: Partial<IncidenteInput>) => {
            const current = getIncidentes().find(i => i.id === id);
            if (!current) {
                console.warn(`Incidente con id ${id} no encontrado`);
                return;
            }

            const updatedResult = current.actualizar(updatedData);
            if (!updatedResult.isSuccess) {
                throw updatedResult.error;
            }

            const updatedEntity = updatedResult.value;
            const payload = incidenteToPayload({
                id,
                sujeto: updatedEntity.sujeto,
                fecha: updatedEntity.fecha,
                descripcion: updatedEntity.descripcion,
                reportadoPor: updatedEntity.reportadoPor,
            });

            try {
                const response = await fetch(`/api/incidentes/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Error al actualizar incidente');
                }

                const updated = ensureEntity(await response.json());
                const next = getIncidentes().map(i => (i.id === id ? updated : i));
                setIncidentes(next);
                setRowKeyCounts(prev => {
                    const nextCounts = { ...prev };
                    Object.keys(nextCounts).forEach(key => {
                        if (key.startsWith(`${id}-`)) {
                            delete nextCounts[key];
                        }
                    });
                    next.forEach(item => {
                        if (item.id === id) {
                            const key = `${item.id}-${item.fecha.getTime()}`;
                            nextCounts[key] = (nextCounts[key] ?? 0) + 1;
                        }
                    });
                    return nextCounts;
                });
                setError(null);
            } catch (error) {
                console.error('Error actualizando incidente', error);
                setError(error instanceof Error ? error.message : 'Error actualizando incidente');
                throw error;
            }
        },
        [getIncidentes, setIncidentes]
    );

    const deleteIncidente = useCallback(
        async (id: string) => {
            try {
                const response = await fetch(`/api/incidentes/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar incidente');
                }

                const next = getIncidentes().filter((i: Incidente) => i.id !== id);
                setIncidentes(next);
                setRowKeyCounts(prev => {
                    const nextCounts = { ...prev };
                    Object.keys(nextCounts).forEach(key => {
                        if (key.startsWith(`${id}-`)) {
                            delete nextCounts[key];
                        }
                    });
                    return nextCounts;
                });
                setError(null);
            } catch (error) {
                console.error('Error eliminando incidente', error);
                setError(error instanceof Error ? error.message : 'Error eliminando incidente');
                throw error;
            }
        },
        [getIncidentes, setIncidentes]
    );

    const getIncidenteById = useCallback((id: string): Incidente | undefined => {
        return getIncidentes().find(i => i.id === id);
    }, [getIncidentes]);

    const getIncidentesForSujeto = useCallback((numeroDocumento: string): Incidente[] => {
        return getIncidentes()
            .filter(i => i.sujeto.numeroDocumento === numeroDocumento)
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [getIncidentes]);

    const getIncidentesByDocente = useCallback((docenteId: string): Incidente[] => {
        return getIncidentes()
            .filter(i => i.reportadoPor.includes(docenteId))
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [getIncidentes]);

    const incidentesMemo = useMemo(() => getIncidentes(), [getIncidentes, allIncidentes]);

    const duplicatedKeys = useMemo(() =>
        Object.entries(rowKeyCounts)
            .filter(([, count]) => count > 1)
            .map(([key]) => key),
        [rowKeyCounts]
    );

    return {
        incidentes: incidentesMemo,
        isLoading,
        error,
        duplicatedKeys,
        refresh,
        addIncidente,
        deleteIncidente,
        updateIncidente,
        getIncidenteById,
        getIncidentesForSujeto,
        getIncidentesByDocente,
    };
}
