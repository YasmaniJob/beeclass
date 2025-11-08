// src/infrastructure/adapters/AsistenciaAdapter.ts
import React from 'react';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAsistenciaHibrida } from '../hooks/useAsistenciaHibrida';
import { EstadoAsistencia } from '@/domain/value-objects/EstadoAsistencia';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Docente } from '@/domain/entities/Docente';
import { AsistenciaStatus } from '@/lib/definitions';
import { estadoToLegacy, LegacyAsistenciaState } from '@/domain/shared/legacy-adapter';

const isEstudiante = (subject: Estudiante | Docente): subject is Estudiante => {
  return 'seccion' in subject;
};

const isDocente = (subject: Estudiante | Docente): subject is Docente => {
  return 'rol' in subject;
};

/**
 * Adaptador que permite usar la nueva arquitectura hexagonal
 * con el código existente, manteniendo compatibilidad hacia atrás.
 */
export function useAsistenciaAdapter(
  subjectType: 'estudiantes' | 'personal',
  grado?: string,
  seccion?: string
) {
  const { allEstudiantes, docentes } = useMatriculaData();
  const { user } = useCurrentUser();

  // Usar estudiantes o personal según el tipo
  const subjects = React.useMemo<Array<Estudiante | Docente>>(() => {
    if (subjectType === 'estudiantes') {
      return allEstudiantes
        .filter((a) => a.grado === grado && a.seccion === seccion)
        .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
    }
    return [...docentes].sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
  }, [subjectType, grado, seccion, allEstudiantes, docentes]);

  const resolveSubjectDetails = React.useCallback(
    (numeroDocumento: string): {
      nombre: string;
      grado: string;
      seccion: string;
    } | null => {
      const subject = subjects.find((item) => item.numeroDocumento === numeroDocumento);
      if (!subject) {
        return null;
      }

      const nombre = `${subject.nombres} ${subject.apellidoPaterno}${subject.apellidoMaterno ? ` ${subject.apellidoMaterno}` : ''}`.trim();

      if (isEstudiante(subject)) {
        return {
          nombre,
          grado: subject.grado ?? 'Sin grado',
          seccion: subject.seccion ?? 'Sin sección',
        };
      }

      if (!isDocente(subject)) {
        return {
          nombre,
          grado: 'Sin grado',
          seccion: 'Sin sección',
        };
      }

      const asignacion = subject.asignaciones?.find((a) => a.grado && a.seccion);
      return {
        nombre,
        grado: asignacion?.grado ?? 'Personal',
        seccion: asignacion?.seccion ?? subject.rol ?? 'General',
      };
    },
    [subjects]
  );

  // Configuración para Google Sheets (por ahora usando mock)
  const googleSheetsConfig = React.useMemo(() => {
    // TODO: Obtener de environment variables
    return process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID ? {
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID,
      credentials: JSON.parse(process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS || '{}')
    } : undefined;
  }, []);

  // Hook de la nueva arquitectura
  const hexagonal = useAsistenciaHibrida({
    googleSheetsConfig,
    currentUser: user ? { numeroDocumento: user.numeroDocumento } : { numeroDocumento: 'system' },
    autoLoad: Boolean(googleSheetsConfig)
  });

  // Convertir EstadoAsistencia de la nueva arquitectura a AsistenciaStatus del sistema actual
  const convertEstadoToLegacy = (estado: EstadoAsistencia) => {
    switch (estado.value) {
      case 'presente': return 'presente' as const;
      case 'tarde': return 'tarde' as const;
      case 'falta': return 'falta' as const;
      case 'permiso': return 'permiso' as const;
      default: return 'presente' as const;
    }
  };

  // Adaptar para compatibilidad con el hook existente
  return {
    // State de la nueva arquitectura
    ...hexagonal,

    // Compatibilidad con hook existente
    subjects,
    state: {
      asistencia: hexagonal.asistenciasDelDia.reduce((acc: Record<string, any>, asistencia) => {
        acc[asistencia.estudianteId] = {
          status: estadoToLegacy(asistencia.estado),
          entryTime: asistencia.horaIngreso,
          horasAfectadas: []
        };
        return acc;
      }, {}),
      initialAsistencia: {},
      currentDate: hexagonal.fechaSeleccionada,
      statusFilter: 'todos',
      searchTerm: ''
    },

    // Actions adaptados
    dispatch: (action: any) => {
      // Adaptar acciones del reducer existente a la nueva arquitectura
      switch (action.type) {
        case 'SET_ASISTENCIA_STATUS': {
          const estado = EstadoAsistencia.fromString(action.payload.status);
          if (!estado.isSuccess) {
            break;
          }

          const detalles = resolveSubjectDetails(action.payload.numeroDocumento);
          if (!detalles) {
            console.warn('No se encontró el sujeto para registrar asistencia', action.payload.numeroDocumento);
            break;
          }

          void hexagonal.registrarAsistencia(
            action.payload.numeroDocumento,
            detalles.nombre,
            detalles.grado,
            detalles.seccion,
            estado.value
          );
          break;
        }
        case 'MARK_ALL_PRESENT':
          hexagonal.marcarTodosPresentes();
          break;
        case 'SET_DATE':
          hexagonal.setFecha(action.payload);
          break;
        default:
          console.warn('Acción no soportada en adaptador:', action.type);
      }
    },

    // Métodos del hook original
    markAllAsPresent: hexagonal.marcarTodosPresentes,
    handleHorasChange: (numeroDocumento: string, asignacionId: string, horas: string[], notas?: string) => {
      // TODO: Implementar cuando esté disponible la funcionalidad de horas
      console.log('handleHorasChange not implemented yet', { numeroDocumento, asignacionId, horas, notas });
    },

    // Estado adicional
    isHexagonalReady: hexagonal.isConfigured,
    hasGoogleSheets: Boolean(googleSheetsConfig)
  };
}
