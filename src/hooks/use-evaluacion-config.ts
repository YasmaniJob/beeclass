
'use client';

import { useState, useCallback, useEffect } from 'react';
import { ConfiguracionEvaluacion, PeriodoEvaluacion } from '@/lib/definitions';
import { supabase } from '@/infrastructure/adapters/supabase/config';

const defaultConfig: ConfiguracionEvaluacion = {
    tipo: 'Bimestre',
    cantidad: 4,
};

export function useEvaluacionConfig() {
    const [config, setConfigState] = useState<ConfiguracionEvaluacion>(defaultConfig);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadConfig = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('configuracion_evaluacion')
                .select('*')
                .limit(1)
                .single();

            if (error) {
                console.error('Error loading config:', error);
                setConfigState(defaultConfig);
            } else if (data) {
                setConfigState({
                    tipo: data.tipo as PeriodoEvaluacion,
                    cantidad: data.cantidad
                });
            }
        } catch (error) {
            console.error('Error loading evaluation config:', error);
            setConfigState(defaultConfig);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const saveConfig = useCallback(async (newConfig: ConfiguracionEvaluacion) => {
        setLoading(true);
        try {
            // Primero verificar si existe un registro
            const { data: existing } = await supabase
                .from('configuracion_evaluacion')
                .select('id')
                .limit(1)
                .single();

            if (existing) {
                // Actualizar el registro existente
                const { error } = await supabase
                    .from('configuracion_evaluacion')
                    .update({
                        tipo: newConfig.tipo,
                        cantidad: newConfig.cantidad
                    })
                    .eq('id', existing.id);

                if (error) throw error;
            } else {
                // Crear nuevo registro
                const { error } = await supabase
                    .from('configuracion_evaluacion')
                    .insert({
                        tipo: newConfig.tipo,
                        cantidad: newConfig.cantidad
                    });

                if (error) throw error;
            }

            setConfigState(newConfig);
            return true;
        } catch (error) {
            console.error('Error saving evaluation config:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);
    
    const setConfig = (newConfig: ConfiguracionEvaluacion) => {
        setConfigState(newConfig);
    }

    return {
        config,
        setConfig,
        saveConfig,
        isLoaded,
        loading,
    };
}
