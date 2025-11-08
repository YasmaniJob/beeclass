// src/infrastructure/stores/asistenciaStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Result, DomainError, success, failure } from '../../domain/shared/types';
import { RegistroAsistencia } from '../../domain/entities/RegistroAsistencia';
import { EstadoAsistencia } from '../../domain/value-objects/EstadoAsistencia';
import { AsistenciaRepository } from '../../domain/ports/AsistenciaRepository';
import { RegistrarAsistenciaUseCase } from '../../application/use-cases/RegistrarAsistenciaUseCase';

interface AsistenciaState {
  // State
  asistenciasDelDia: RegistroAsistencia[];
  isLoading: boolean;
  error: string | null;
  fechaSeleccionada: Date;

  // Dependencies (injected)
  asistenciaRepository: AsistenciaRepository | null;
  registrarAsistenciaUseCase: RegistrarAsistenciaUseCase | null;
  currentUser: { numeroDocumento: string } | null;

  // Actions
  setFecha: (fecha: Date) => void;
  setDependencies: (
    repository: AsistenciaRepository,
    useCase: RegistrarAsistenciaUseCase,
    user: { numeroDocumento: string }
  ) => void;
  cargarAsistenciasDelDia: () => Promise<void>;
  registrarAsistencia: (estudianteId: string, nombreEstudiante: string, grado: string, seccion: string, estado: EstadoAsistencia) => Promise<Result<void, DomainError>>;
  marcarTodosPresentes: () => Promise<Result<void, DomainError>>;
  limpiarError: () => void;
}

export const useAsistenciaStore = create<AsistenciaState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      asistenciasDelDia: [],
      isLoading: false,
      error: null,
      fechaSeleccionada: new Date(),
      asistenciaRepository: null,
      registrarAsistenciaUseCase: null,
      currentUser: null,

      // Actions
      setFecha: (fecha: Date) => {
        set((state) => {
          state.fechaSeleccionada = fecha;
        });
        get().cargarAsistenciasDelDia();
      },

      setDependencies: (repository, useCase, user) => {
        set((state) => {
          state.asistenciaRepository = repository;
          state.registrarAsistenciaUseCase = useCase;
          state.currentUser = user;
        });
      },

      cargarAsistenciasDelDia: async () => {
        const { asistenciaRepository, fechaSeleccionada } = get();

        if (!asistenciaRepository) {
          set((state) => {
            state.error = 'Repositorio no configurado';
          });
          return;
        }

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const result = await asistenciaRepository.obtenerPorFecha(fechaSeleccionada);

          if (result.isSuccess) {
            set((state) => {
              state.asistenciasDelDia = result.value;
              state.isLoading = false;
            });
          } else {
            set((state) => {
              state.error = result.error.message;
              state.isLoading = false;
            });
          }
        } catch (error) {
          set((state) => {
            state.error = 'Error inesperado al cargar asistencias';
            state.isLoading = false;
          });
        }
      },

      registrarAsistencia: async (estudianteId: string, nombreEstudiante: string, grado: string, seccion: string, estado: EstadoAsistencia) => {
        const { registrarAsistenciaUseCase, currentUser, fechaSeleccionada } = get();

        if (!registrarAsistenciaUseCase || !currentUser) {
          return failure(new DomainError('Dependencias no configuradas'));
        }

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const result = await registrarAsistenciaUseCase.execute({
            estudianteId,
            nombreEstudiante,
            grado,
            seccion,
            estado,
            registradoPor: currentUser.numeroDocumento,
            fecha: fechaSeleccionada
          });

          if (result.isSuccess) {
            // Recargar asistencias del día
            await get().cargarAsistenciasDelDia();
            set((state) => {
              state.isLoading = false;
            });
            return success(undefined);
          } else {
            set((state) => {
              state.error = result.error.message;
              state.isLoading = false;
            });
            return failure(result.error);
          }
        } catch (error) {
          set((state) => {
            state.error = 'Error inesperado al registrar asistencia';
            state.isLoading = false;
          });
          return failure(new DomainError('Error inesperado al registrar asistencia'));
        }
      },

      marcarTodosPresentes: async () => {
        const { asistenciasDelDia } = get();

        // Marcar todos los que no tienen permiso como presentes
        const presentesPromises = asistenciasDelDia
          .filter(a => !a.estado.equals(EstadoAsistencia.PERMISO))
          .map(a => get().registrarAsistencia(a.estudianteId, a.nombreEstudiante, a.grado, a.seccion, EstadoAsistencia.PRESENTE));

        const results = await Promise.all(presentesPromises);

        // Verificar si alguna falló
        const hasFailure = results.some(result => !result.isSuccess);

        if (hasFailure) {
          return failure(new DomainError('Algunos registros no se pudieron actualizar'));
        }

        return success(undefined);
      },

      limpiarError: () => {
        set((state) => {
          state.error = null;
        });
      }
    })),
    {
      name: 'asistencia-store',
    }
  )
);
