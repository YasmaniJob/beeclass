// src/infrastructure/adapters/SupabaseGoogleSheetsAdapter.ts
import React from 'react';
import { useMatriculaSupabaseHibrida } from '../hooks/useMatriculaSupabaseHibrida';
import { EstadoAsistencia } from '@/domain/value-objects/EstadoAsistencia';
import { AsistenciaStatus } from '@/lib/definitions';
import { estadoToLegacy } from '@/domain/shared/legacy-adapter';
import { useCurrentUser } from '@/hooks/use-current-user';

/**
 * Adaptador que permite usar la nueva arquitectura Supabase + Google Sheets
 * con el código existente, manteniendo compatibilidad hacia atrás.
 */
export function useAsistenciaSupabaseAdapter(
  subjectType: 'estudiantes' | 'personal',
  grado?: string,
  seccion?: string
) {
  const {
    estudiantes,
    personal,
    loading,
    isLoaded,
    getEstudiantesPorGradoSeccion,
    getPersonalPorRol,
    registrarAsistencia,
    updateAsistencia,
  } = useMatriculaSupabaseHibrida();

  const { user } = useCurrentUser();

  // Obtener los subjects según el tipo
  const subjects = React.useMemo(() => {
    if (subjectType === 'estudiantes') {
      return grado && seccion
        ? getEstudiantesPorGradoSeccion(grado, seccion)
        : estudiantes;
    } else {
      return grado && seccion
        ? personal.filter(p =>
            p.asignaciones?.some(a => a.grado === grado && a.seccion === seccion)
          )
        : personal;
    }
  }, [subjectType, grado, seccion, estudiantes, personal, getEstudiantesPorGradoSeccion]);

  // Estado para el reducer (compatible con el hook original)
  const [state, setState] = React.useState({
    asistencia: {} as Record<string, {
      status: AsistenciaStatus;
      entryTime: Date | null;
      horasAfectadas?: string[];
    }>,
    initialAsistencia: {} as Record<string, any>,
    currentDate: new Date(),
    statusFilter: 'todos' as AsistenciaStatus | 'todos',
    searchTerm: '',
  });

  // Dispatch para compatibilidad
  const dispatch = React.useCallback((action: any) => {
    switch (action.type) {
      case 'SET_DATE':
        setState(prev => ({ ...prev, currentDate: action.payload }));
        break;
      case 'SET_FILTER':
        setState(prev => ({ ...prev, statusFilter: action.payload }));
        break;
      case 'SET_SEARCH':
        setState(prev => ({ ...prev, searchTerm: action.payload }));
        break;
      case 'MARK_PRESENT':
        if (action.payload.estudianteId) {
          const estudiante = estudiantes.find(e => e.numeroDocumento === action.payload.estudianteId);
          const nombreCompleto = estudiante?.nombreCompleto ?? 'DESCONOCIDO';

          registrarAsistencia({
            estudianteId: action.payload.estudianteId,
            nombreEstudiante: nombreCompleto,
            grado: estudiante?.grado || grado || '',
            seccion: estudiante?.seccion || seccion || '',
            estado: EstadoAsistencia.PRESENTE,
            registradoPor: user?.numeroDocumento || 'system',
          });
        }
        break;
      case 'MARK_ABSENT':
        if (action.payload.estudianteId) {
          const estudiante = estudiantes.find(e => e.numeroDocumento === action.payload.estudianteId);
          const nombreCompleto = estudiante?.nombreCompleto ?? 'DESCONOCIDO';

          registrarAsistencia({
            estudianteId: action.payload.estudianteId,
            nombreEstudiante: nombreCompleto,
            grado: estudiante?.grado || grado || '',
            seccion: estudiante?.seccion || seccion || '',
            estado: EstadoAsistencia.FALTA,
            registradoPor: user?.numeroDocumento || 'system',
          });
        }
        break;
      case 'MARK_LATE':
        if (action.payload.estudianteId) {
          const estudiante = estudiantes.find(e => e.numeroDocumento === action.payload.estudianteId);
          const nombreCompleto = estudiante?.nombreCompleto ?? 'DESCONOCIDO';

          registrarAsistencia({
            estudianteId: action.payload.estudianteId,
            nombreEstudiante: nombreCompleto,
            grado: estudiante?.grado || grado || '',
            seccion: estudiante?.seccion || seccion || '',
            estado: EstadoAsistencia.TARDE,
            registradoPor: user?.numeroDocumento || 'system',
          });
        }
        break;
      case 'MARK_PERMISSION':
        if (action.payload.estudianteId) {
          const estudiante = estudiantes.find(e => e.numeroDocumento === action.payload.estudianteId);
          const nombreCompleto = estudiante?.nombreCompleto ?? 'DESCONOCIDO';

          registrarAsistencia({
            estudianteId: action.payload.estudianteId,
            nombreEstudiante: nombreCompleto,
            grado: estudiante?.grado || grado || '',
            seccion: estudiante?.seccion || seccion || '',
            estado: EstadoAsistencia.PERMISO,
            registradoPor: user?.numeroDocumento || 'system',
          });
        }
        break;
      case 'UPDATE_ENTRY_TIME':
        // Esta funcionalidad vendría de Google Sheets
        console.log('UPDATE_ENTRY_TIME - implementar con Google Sheets');
        break;
    }
  }, [registrarAsistencia, user]);

  // Función para marcar a todos como presentes (compatible con hook original)
  const markAllAsPresent = React.useCallback(() => {
    subjects.forEach((subject: any) => {
      if (subjectType === 'estudiantes' && subject.numeroDocumento) {
        dispatch({
          type: 'MARK_PRESENT',
          payload: { estudianteId: subject.numeroDocumento }
        });
      }
    });
  }, [subjects, subjectType, dispatch]);

  // Estado de carga compatible
  const isLoading = loading.estudiantes || loading.personal || !isLoaded;

  return {
    subjects,
    state,
    dispatch,
    markAllAsPresent,
    isLoading,
    error: null, // Por ahora sin manejo de errores específico
  };
}
