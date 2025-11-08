'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/infrastructure/adapters/supabase/config';

export interface HoraPedagogica {
    id: string;
    nombre: string;
    orden: number;
    hora_inicio: string;
    hora_fin: string;
    es_recreo: boolean;
    activo: boolean;
}

export function useHorasPedagogicasSupabase() {
    const [horas, setHoras] = useState<HoraPedagogica[]>([]);
    const [loading, setLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    const loadHoras = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('horas_pedagogicas')
                .select('*')
                .eq('activo', true)
                .order('orden', { ascending: true });

            if (error) {
                console.error('Error loading horas:', error);
                toast({
                    title: 'Error',
                    description: 'No se pudieron cargar las horas pedagógicas',
                    variant: 'destructive',
                });
                return;
            }

            setHoras(data || []);
        } catch (error) {
            console.error('Error loading horas pedagogicas:', error);
        } finally {
            setIsLoaded(true);
        }
    }, [toast]);

    useEffect(() => {
        loadHoras();
    }, [loadHoras]);

    const addHora = useCallback(async (hora: Omit<HoraPedagogica, 'id' | 'activo'>) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('horas_pedagogicas')
                .insert({
                    nombre: hora.nombre,
                    orden: hora.orden,
                    hora_inicio: hora.hora_inicio,
                    hora_fin: hora.hora_fin,
                    es_recreo: hora.es_recreo,
                    activo: true,
                });

            if (error) throw error;

            toast({
                title: 'Hora agregada',
                description: `Se ha agregado "${hora.nombre}"`,
            });

            await loadHoras();
            return true;
        } catch (error) {
            console.error('Error adding hora:', error);
            toast({
                title: 'Error',
                description: 'No se pudo agregar la hora pedagógica',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadHoras, toast]);

    const updateHora = useCallback(async (id: string, hora: Partial<Omit<HoraPedagogica, 'id' | 'activo'>>) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('horas_pedagogicas')
                .update(hora)
                .eq('id', id);

            if (error) throw error;

            toast({
                title: 'Hora actualizada',
                description: 'Los cambios se han guardado correctamente',
            });

            await loadHoras();
            return true;
        } catch (error) {
            console.error('Error updating hora:', error);
            toast({
                title: 'Error',
                description: 'No se pudo actualizar la hora pedagógica',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadHoras, toast]);

    const deleteHora = useCallback(async (id: string) => {
        setLoading(true);
        try {
            // Soft delete: marcar como inactivo
            const { error } = await supabase
                .from('horas_pedagogicas')
                .update({ activo: false })
                .eq('id', id);

            if (error) throw error;

            toast({
                title: 'Hora eliminada',
                description: 'La hora pedagógica ha sido eliminada',
            });

            await loadHoras();
            return true;
        } catch (error) {
            console.error('Error deleting hora:', error);
            toast({
                title: 'Error',
                description: 'No se pudo eliminar la hora pedagógica',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadHoras, toast]);

    return {
        horas,
        loading,
        isLoaded,
        addHora,
        updateHora,
        deleteHora,
        refresh: loadHoras,
    };
}
