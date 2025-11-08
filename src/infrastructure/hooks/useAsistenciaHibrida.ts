// src/infrastructure/hooks/useAsistenciaHibrida.ts
'use client';

import { useEffect } from 'react';
import { useAsistenciaStore } from '../stores/asistenciaStore';
import { AsistenciaFactory } from '../factories/AsistenciaFactory';

interface UseAsistenciaHibridaProps {
  googleSheetsConfig?: {
    spreadsheetId: string;
    credentials: any;
  };
  currentUser: { numeroDocumento: string };
  autoLoad?: boolean;
}

export function useAsistenciaHibrida({
  googleSheetsConfig,
  currentUser,
  autoLoad = true
}: UseAsistenciaHibridaProps) {
  const store = useAsistenciaStore();
  const fechaSeleccionada = store.fechaSeleccionada;
  const cargarAsistenciasDelDia = store.cargarAsistenciasDelDia;

  // Inicializar dependencias si se proporciona configuración de Google Sheets
  useEffect(() => {
    if (googleSheetsConfig) {
      try {
        AsistenciaFactory.createFromConfig(googleSheetsConfig, currentUser);
      } catch (error) {
        console.error('Error inicializando dependencias de asistencia:', error);
        useAsistenciaStore.setState((state) => {
          state.error = 'Error de configuración';
        });
      }
    }
  }, [googleSheetsConfig, currentUser]);

  // Cargar datos automáticamente si está habilitado
  useEffect(() => {
    if (autoLoad && googleSheetsConfig) {
      cargarAsistenciasDelDia();
    }
  }, [autoLoad, googleSheetsConfig, fechaSeleccionada, cargarAsistenciasDelDia]);

  return {
    // State
    asistenciasDelDia: store.asistenciasDelDia,
    isLoading: store.isLoading,
    error: store.error,
    fechaSeleccionada: store.fechaSeleccionada,

    // Actions
    setFecha: store.setFecha,
    registrarAsistencia: store.registrarAsistencia,
    marcarTodosPresentes: store.marcarTodosPresentes,
    limpiarError: store.limpiarError,
    cargarAsistenciasDelDia: store.cargarAsistenciasDelDia,

    // Estado del store
    isConfigured: Boolean(store.asistenciaRepository && store.registrarAsistenciaUseCase)
  };
}
