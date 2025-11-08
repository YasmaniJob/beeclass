
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Permiso, PermisoInput } from '@/domain/entities/Permiso';
import { useMatriculaData } from './use-matricula-data';
import { permisoToPayload, toPermisoEntity } from '@/domain/mappers/entity-builders';

function parsePermisoResponse(item: any): Permiso {
    const parsed = toPermisoEntity({
        id: item?.id,
        estudiante: item?.estudiante,
        fechaInicio: item?.fechaInicio,
        fechaFin: item?.fechaFin,
        motivo: item?.motivo,
        documento: item?.documento ?? item?.documentoUrl ?? undefined,
        registradoPor: item?.registradoPor,
    });

    if (!parsed.isSuccess) {
        throw parsed.error;
    }

    return parsed.value;
}

export function usePermisos() {
    const { permisos: allPermisos, setPermisos, getPermisos } = useMatriculaData();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/permisos', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('No se pudieron obtener los permisos');
            }
            const data = await response.json();
            const parsed = Array.isArray(data) ? data.map(parsePermisoResponse) : [];
            setPermisos(parsed);
            setError(null);
        } catch (error) {
            console.error('Error al cargar permisos', error);
            setPermisos([]);
            setError(error instanceof Error ? error.message : 'Error al cargar permisos');
        } finally {
            setIsLoading(false);
        }
    }, [setPermisos]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addPermiso = useCallback(async (newPermisoData: PermisoInput) => {
        try {
            const payload = permisoToPayload(newPermisoData);
            const response = await fetch('/api/permisos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Error al registrar permiso');
            }

            const created = parsePermisoResponse(await response.json());
            setPermisos([...getPermisos(), created]);
            setError(null);
            return created;
        } catch (error) {
            console.error('Error creando permiso', error);
            setError(error instanceof Error ? error.message : 'Error creando permiso');
            throw error;
        }
    }, [getPermisos, setPermisos]);

    const updatePermiso = useCallback(async (id: string, updatedData: Partial<PermisoInput>) => {
        const current = getPermisos().find(p => p.id === id);
        if (!current) {
            console.warn(`Permiso con id ${id} no encontrado`);
            return;
        }

        const updatedResult = current.actualizar(updatedData);
        if (!updatedResult.isSuccess) {
            throw updatedResult.error;
        }

        const updatedEntity = updatedResult.value;
        const payload = permisoToPayload({
            id,
            estudiante: updatedEntity.estudiante,
            fechaInicio: updatedEntity.fechaInicio,
            fechaFin: updatedEntity.fechaFin,
            motivo: updatedEntity.motivo,
            documento: updatedEntity.documento,
            registradoPor: updatedEntity.registradoPor,
        });

        try {
            const response = await fetch(`/api/permisos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar permiso');
            }

            const updated = parsePermisoResponse(await response.json());
            setPermisos(getPermisos().map(p => (p.id === id ? updated : p)));
            setError(null);
            return updated;
        } catch (error) {
            console.error('Error actualizando permiso', error);
            setError(error instanceof Error ? error.message : 'Error actualizando permiso');
            throw error;
        }
    }, [getPermisos, setPermisos]);

    const deletePermiso = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/permisos/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Error al eliminar permiso');
            }

            setPermisos(getPermisos().filter(p => p.id !== id));
            setError(null);
        } catch (error) {
            console.error('Error eliminando permiso', error);
            setError(error instanceof Error ? error.message : 'Error eliminando permiso');
            throw error;
        }
    }, [getPermisos, setPermisos]);

    const getPermisoById = useCallback((id: string): Permiso | undefined => {
        return getPermisos().find(p => p.id === id);
    }, [getPermisos]);

    const getPermisosForEstudiante = useCallback((numeroDocumento: string): Permiso[] => {
        return getPermisos()
            .filter(p => p.estudiante.numeroDocumento === numeroDocumento)
            .sort((a, b) => b.fechaInicio.getTime() - a.fechaInicio.getTime());
    }, [getPermisos]);

    const permisosMemo = useMemo(() => getPermisos(), [getPermisos, allPermisos]);

    return {
        permisos: permisosMemo,
        isLoading,
        error,
        refresh,
        addPermiso,
        updatePermiso,
        deletePermiso,
        getPermisoById,
        getPermisosForEstudiante,
    };
}
