// src/infrastructure/hooks/useMatriculaSupabaseHibrida.tsx
'use client';

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAppConfig } from '@/hooks/use-app-config';
import { Nivel, AreaCurricular, SesionAprendizaje, Calificacion } from '@/lib/definitions';
import { Estudiante } from '@/domain/entities/Estudiante';
import { EstudianteInput } from '@/domain/entities/EstudianteInput';
import { SupabaseEstudianteRepository } from '@/infrastructure/repositories/supabase/SupabaseEstudianteRepository';
import { SupabasePersonalRepository } from '@/infrastructure/repositories/supabase/SupabasePersonalRepository';
import { SupabaseAreaCurricularRepository } from '@/infrastructure/repositories/supabase/SupabaseAreaCurricularRepository';
import { gradosSeccionesRepository, GradoSeccionRecord } from '@/infrastructure/repositories/supabase/SupabaseGradosSeccionesRepository';
import { Docente } from '@/domain/entities/Docente';
import { Incidente } from '@/domain/entities/Incidente';
import { Permiso } from '@/domain/entities/Permiso';
// import { AsistenciaGoogleSheetsService, AsistenciaGoogleSheetsConfig } from '@/infrastructure/adapters/google-sheets/AsistenciaGoogleSheetsService';
import { useToast } from '@/hooks/use-toast';
import { EstadoAsistencia, EstadoAsistenciaEnum } from '@/domain/value-objects/EstadoAsistencia';

// Temporary type definition for Google Sheets config
type AsistenciaGoogleSheetsConfig = any;

// Repositorios
const estudianteRepo = new SupabaseEstudianteRepository();
const personalRepo = new SupabasePersonalRepository();
const areaRepo = new SupabaseAreaCurricularRepository();

// Servicios de Google Sheets (temporarily disabled)
// let googleSheetsService: AsistenciaGoogleSheetsService | null = null;

// --- CONTEXT DEFINITION ---
interface MatriculaSupabaseHibridaContextType {
  // Estados de carga
  isLoaded: boolean;
  loading: {
    estudiantes: boolean;
    personal: boolean;
    areas: boolean;
    asistencias: boolean;
    incidentes: boolean;
    permisos: boolean;
  };

  // Datos maestros (Supabase)
  estudiantes: Estudiante[];
  personal: Docente[];
  areasCurriculares: AreaCurricular[];
  nivelesEducativos: {id: string, nombre: Nivel}[];
  gradosSecciones: GradoSeccionRecord[];

  // Datos transaccionales (Google Sheets)
  asistencias: any[];
  incidentes: Incidente[];
  permisos: Permiso[];
  sesiones: SesionAprendizaje[];
  calificaciones: Calificacion[];

  // Configuración Google Sheets
  googleSheetsConfig: AsistenciaGoogleSheetsConfig | null;

  // Funciones de datos maestros (Supabase)
  refreshEstudiantes: () => Promise<void>;
  refreshPersonal: () => Promise<void>;
  refreshAreasCurriculares: (nivel?: string) => Promise<void>;
  refreshGradosSecciones: () => Promise<void>;

  // Funciones CRUD Estudiantes (Supabase)
  addEstudiante: (estudiante: Estudiante) => Promise<boolean>;
  updateEstudiante: (numeroDocumento: string, estudiante: Partial<Estudiante>) => Promise<boolean>;
  deleteEstudiante: (numeroDocumento: string) => Promise<boolean>;

  // Funciones CRUD Personal (Supabase)
  addPersonal: (personal: Docente) => Promise<boolean>;
  updatePersonal: (numeroDocumento: string, personal: Partial<Docente>) => Promise<boolean>;
  deletePersonal: (numeroDocumento: string) => Promise<boolean>;

  // Funciones de asistencias (Google Sheets)
  registrarAsistencia: (data: {
    estudianteId: string;
    nombreEstudiante: string;
    grado: string;
    seccion: string;
    estado: EstadoAsistencia;
    registradoPor: string;
    observaciones?: string;
  }) => Promise<boolean>;

  updateAsistencia: (id: string, data: {
    estado?: EstadoAsistencia;
    horaIngreso?: string | null;
  }) => Promise<boolean>;

  // Funciones de incidentes (Google Sheets)
  registrarIncidente: (data: {
    estudianteId: string;
    descripcion: string;
    reportadoPor: string;
  }) => Promise<boolean>;

  // Funciones de permisos (Google Sheets)
  registrarPermiso: (data: {
    estudianteId: string;
    fechaInicio: string;
    fechaFin: string;
    motivo: string;
    registradoPor: string;
  }) => Promise<boolean>;

  // Funciones de utilidad
  getEstudiantesPorGradoSeccion: (grado: string, seccion: string) => Estudiante[];
  getPersonalPorRol: (rol: string) => Docente[];
  getAreasPorGrado: (grado: string) => AreaCurricular[];
}

const MatriculaSupabaseHibridaContext = createContext<MatriculaSupabaseHibridaContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export function MatriculaSupabaseHibridaProvider({
  children,
  googleSheetsConfig
}: {
  children: ReactNode;
  googleSheetsConfig?: AsistenciaGoogleSheetsConfig;
}) {
  const { nivelInstitucion, isLoaded: isAppConfigLoaded } = useAppConfig();
  const { toast } = useToast();

  // Estados de carga
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState({
    estudiantes: false,
    personal: false,
    areas: false,
    asistencias: false,
    incidentes: false,
    permisos: false,
  });

  // Estados de datos
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [personal, setPersonal] = useState<Docente[]>([]);
  const [areasCurriculares, setAreasCurriculares] = useState<AreaCurricular[]>([]);
  const [nivelesEducativos, setNivelesEducativos] = useState<{id: string, nombre: Nivel}[]>([]);
  const [gradosSecciones, setGradosSecciones] = useState<GradoSeccionRecord[]>([]);

  // Estados de Google Sheets
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [sesiones, setSesiones] = useState<SesionAprendizaje[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);

  // Configuración de Google Sheets
  const [currentGoogleSheetsConfig, setCurrentGoogleSheetsConfig] = useState<AsistenciaGoogleSheetsConfig | null>(googleSheetsConfig || null);

  // Inicializar servicio de Google Sheets (temporarily disabled)
  useEffect(() => {
    // if (googleSheetsConfig && !googleSheetsService) {
    //   googleSheetsService = new AsistenciaGoogleSheetsService(googleSheetsConfig);
    //   setCurrentGoogleSheetsConfig(googleSheetsConfig);
    // }
  }, [googleSheetsConfig]);

  // Funciones de carga de datos maestros (Supabase)
  const refreshEstudiantes = useCallback(async () => {
    setLoading(prev => ({ ...prev, estudiantes: true }));
    try {
      const result = await estudianteRepo.obtenerTodos();
      if (result.isSuccess) {
        setEstudiantes(result.value);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los estudiantes'
        });
      }
    } catch (error) {
      console.error('Error loading estudiantes:', error);
    } finally {
      setLoading(prev => ({ ...prev, estudiantes: false }));
    }
  }, [toast]);

  const refreshGradosSecciones = useCallback(async () => {
    try {
      const records = await gradosSeccionesRepository.findAllActivos();
      setGradosSecciones(records);
    } catch (error) {
      console.error('Error loading grados_secciones:', error);
    }
  }, []);

  const refreshPersonal = useCallback(async (forceRefresh = false) => {
    setLoading(prev => ({ ...prev, personal: true }));
    try {
      // Intentar usar caché si no es refresh forzado
      if (!forceRefresh && typeof window !== 'undefined') {
        const { getCachedPersonal, cachePersonal } = await import('@/lib/cache/personal-cache');
        const cached = getCachedPersonal();
        if (cached) {
          setPersonal(cached);
          setLoading(prev => ({ ...prev, personal: false }));
          return;
        }
      }

      // Si no hay caché o es refresh forzado, consultar Supabase
      const result = await personalRepo.findAll();
      if (result.isSuccess) {
        setPersonal(result.value);
        
        // Guardar en caché
        if (typeof window !== 'undefined') {
          const { cachePersonal } = await import('@/lib/cache/personal-cache');
          cachePersonal(result.value);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo cargar el personal'
        });
      }
    } catch (error) {
      console.error('Error loading personal:', error);
    } finally {
      setLoading(prev => ({ ...prev, personal: false }));
    }
  }, [toast]);

  const refreshAreasCurriculares = useCallback(async (nivel?: string) => {
    setLoading(prev => ({ ...prev, areas: true }));
    try {
      // Primero obtener niveles
      const nivelesResult = await areaRepo.getNivelesEducativos();
      if (nivelesResult.isSuccess) {
        setNivelesEducativos(nivelesResult.value);
        
        // Si se especifica un nivel, cargar solo ese nivel con todas sus competencias
        if (nivel && nivelesResult.value.length > 0) {
          const nivelObj = nivelesResult.value.find(n => n.id === nivel);
          if (nivelObj) {
            const result = await areaRepo.findByNivel(nivelObj.nombre);
            if (result.isSuccess) {
              setAreasCurriculares(result.value);
            }
          }
        } else {
          // Si no se especifica nivel, cargar solo las áreas sin competencias
          const result = await areaRepo.findAll();
          if (result.isSuccess) {
            setAreasCurriculares(result.value);
          }
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar las áreas curriculares'
        });
      }
    } catch (error) {
      console.error('Error loading areas curriculares:', error);
    } finally {
      setLoading(prev => ({ ...prev, areas: false }));
    }
  }, [toast]);

  // Carga inicial de datos
  useEffect(() => {
    if (isAppConfigLoaded) {
      refreshEstudiantes();
      refreshPersonal();
      refreshAreasCurriculares();
      refreshGradosSecciones();
      setIsLoaded(true);
    }
  }, [isAppConfigLoaded, refreshEstudiantes, refreshPersonal, refreshAreasCurriculares, refreshGradosSecciones]);

  // Funciones CRUD Estudiantes (Supabase)
  const addEstudiante = useCallback(async (estudiante: Estudiante): Promise<boolean> => {
    try {
      const result = await estudianteRepo.guardar(estudiante);
      if (result.isSuccess) {
        await refreshEstudiantes();
        toast({
          title: 'Éxito',
          description: 'Estudiante agregado correctamente'
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo agregar el estudiante'
        });
        return false;
      }
    } catch (error) {
      console.error('Error adding estudiante:', error);
      return false;
    }
  }, [refreshEstudiantes, toast]);

  const updateEstudiante = useCallback(async (numeroDocumento: string, estudianteData: Partial<Estudiante>): Promise<boolean> => {
    try {
      // Primero obtener el estudiante actual
      const currentResult = await estudianteRepo.obtenerPorId(numeroDocumento, estudianteData.tipoDocumento!);
      if (!currentResult.isSuccess || !currentResult.value) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Estudiante no encontrado'
        });
        return false;
      }

      // Actualizar usando la entidad del dominio
      const updatedResult = currentResult.value.actualizar(estudianteData);
      if (!updatedResult.isSuccess) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo actualizar el estudiante'
        });
        return false;
      }

      const result = await estudianteRepo.actualizar(updatedResult.value);
      if (result.isSuccess) {
        await refreshEstudiantes();
        toast({
          title: 'Éxito',
          description: 'Estudiante actualizado correctamente'
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo actualizar el estudiante'
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating estudiante:', error);
      return false;
    }
  }, [refreshEstudiantes, toast]);

  const deleteEstudiante = useCallback(async (numeroDocumento: string): Promise<boolean> => {
    try {
      // Necesito obtener el estudiante primero para saber el tipo de documento
      const estudiantesResult = await estudianteRepo.obtenerTodos();
      if (!estudiantesResult.isSuccess) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo obtener la información del estudiante'
        });
        return false;
      }

      const estudiante = estudiantesResult.value.find(e => e.numeroDocumento === numeroDocumento);
      if (!estudiante) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Estudiante no encontrado'
        });
        return false;
      }

      const result = await estudianteRepo.eliminar(numeroDocumento, estudiante.tipoDocumento);
      if (result.isSuccess) {
        await refreshEstudiantes();
        toast({
          title: 'Éxito',
          description: 'Estudiante eliminado correctamente'
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo eliminar el estudiante'
        });
        return false;
      }
    } catch (error) {
      console.error('Error deleting estudiante:', error);
      return false;
    }
  }, [refreshEstudiantes, toast]);

  // Funciones CRUD Personal (Supabase)
  const addPersonal = useCallback(async (personalData: Docente): Promise<boolean> => {
    try {
      const result = await personalRepo.save(personalData);
      if (result.isSuccess) {
        // Invalidar caché
        if (typeof window !== 'undefined') {
          const { clearPersonalCache } = await import('@/lib/cache/personal-cache');
          clearPersonalCache();
        }
        await refreshPersonal(true);
        toast({
          title: 'Éxito',
          description: 'Personal agregado correctamente'
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo agregar el personal'
        });
        return false;
      }
    } catch (error) {
      console.error('Error adding personal:', error);
      return false;
    }
  }, [refreshPersonal, toast]);

  const updatePersonal = useCallback(async (numeroDocumento: string, personalData: Partial<Docente>): Promise<boolean> => {
    try {
      // Si personalData es un Docente completo (tiene numeroDocumento), usar save
      // Si es un Partial, usar update
      const isFullDocente = 'numeroDocumento' in personalData && personalData.numeroDocumento;
      
      const result = isFullDocente 
        ? await personalRepo.save(personalData as Docente)
        : await personalRepo.update(numeroDocumento, personalData);
        
      if (result.isSuccess) {
        // Invalidar caché
        if (typeof window !== 'undefined') {
          const { clearPersonalCache } = await import('@/lib/cache/personal-cache');
          clearPersonalCache();
        }
        await refreshPersonal(true);
        toast({
          title: 'Éxito',
          description: 'Personal actualizado correctamente'
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error?.message || 'No se pudo actualizar el personal'
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating personal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
      return false;
    }
  }, [refreshPersonal, toast]);

  const deletePersonal = useCallback(async (numeroDocumento: string, currentUserNumeroDocumento?: string): Promise<boolean> => {
    try {
      // Validar que no se elimine a sí mismo
      if (currentUserNumeroDocumento && numeroDocumento === currentUserNumeroDocumento) {
        toast({
          variant: 'destructive',
          title: 'Operación no permitida',
          description: 'No puedes eliminarte a ti mismo del sistema.'
        });
        return false;
      }

      const result = await personalRepo.delete(numeroDocumento);
      if (result.isSuccess) {
        // Invalidar caché antes de refrescar
        if (typeof window !== 'undefined') {
          const { clearPersonalCache } = await import('@/lib/cache/personal-cache');
          clearPersonalCache();
        }
        
        // Forzar refresh desde Supabase
        await refreshPersonal(true);
        
        toast({
          title: 'Éxito',
          description: 'Personal eliminado permanentemente del sistema'
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo eliminar el personal'
        });
        return false;
      }
    } catch (error) {
      console.error('Error deleting personal:', error);
      return false;
    }
  }, [refreshPersonal, toast]);

  // Funciones de asistencias (Google Sheets)
  const registrarAsistencia = useCallback(async (data: {
    estudianteId: string;
    nombreEstudiante: string;
    grado: string;
    seccion: string;
    estado: EstadoAsistencia | EstadoAsistenciaEnum | string;
    registradoPor: string;
    observaciones?: string;
  }): Promise<boolean> => {
    try {
      const estadoValor =
        typeof data.estado === 'string'
          ? data.estado
          : data.estado instanceof EstadoAsistencia
            ? data.estado.toString()
            : data.estado;

      const response = await fetch('/api/google-sheets/asistencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudianteId: data.estudianteId,
          nombreEstudiante: data.nombreEstudiante,
          grado: data.grado,
          seccion: data.seccion,
          fecha: new Date().toISOString().split('T')[0],
          status: estadoValor.toString().toLowerCase(),
          registradoPor: data.registradoPor,
          observaciones: data.observaciones || ''
        })
      });

      if (!response.ok) {
        throw new Error('Error al registrar asistencia');
      }

      toast({
        title: 'Asistencia registrada',
        description: 'La asistencia se ha guardado correctamente'
      });
      
      return true;
    } catch (error) {
      console.error('Error registrando asistencia:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo registrar la asistencia'
      });
      return false;
    }
  }, [toast]);

  const updateAsistencia = useCallback(async (id: string, data: {
    estado?: EstadoAsistencia;
    horaIngreso?: string | null;
  }): Promise<boolean> => {
    // Google Sheets functionality temporarily disabled
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Google Sheets no está disponible temporalmente'
    });
    return false;
  }, [toast]);

  // Funciones de utilidad
  const getEstudiantesPorGradoSeccion = useCallback((grado: string, seccion: string): Estudiante[] => {
    return estudiantes.filter(e => e.grado === grado && e.seccion === seccion);
  }, [estudiantes]);

  const getPersonalPorRol = useCallback((rol: string): Docente[] => {
    return personal.filter(p => p.rol === rol);
  }, [personal]);

  const getAreasPorGrado = useCallback((grado: string): AreaCurricular[] => {
    let nivel: Nivel;
    if (grado.includes('Inicial') || grado.includes('Años')) {
      nivel = 'Inicial';
    } else if (grado.includes('Secundaria')) {
      nivel = 'Secundaria';
    } else {
      nivel = 'Primaria';
    }

    return areasCurriculares.filter(area => area.nivel === nivel);
  }, [areasCurriculares]);

  // Funciones de incidentes (Google Sheets - temporarily disabled)
  const registrarIncidente = useCallback(async (data: {
    estudianteId: string;
    descripcion: string;
    reportadoPor: string;
  }): Promise<boolean> => {
    // Google Sheets functionality temporarily disabled
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Google Sheets no está disponible temporalmente'
    });
    return false;
    /* if (!googleSheetsService) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Google Sheets no configurado'
      });
      return false;
    }

    try {
      const success = await googleSheetsService.writeIncidente({
        estudianteId: data.estudianteId,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: data.descripcion,
        reportadoPor: data.reportadoPor,
      });

      if (success) {
        toast({
          title: 'Éxito',
          description: 'Incidente registrado correctamente'
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo registrar el incidente'
        });
        return false;
      }
    } catch (error) {
      console.error('Error registrando incidente:', error);
      return false;
    } */
  }, [toast]);

  // Funciones de permisos (Google Sheets - temporarily disabled)
  const registrarPermiso = useCallback(async (data: {
    estudianteId: string;
    fechaInicio: string;
    fechaFin: string;
    motivo: string;
    registradoPor: string;
  }): Promise<boolean> => {
    // Google Sheets functionality temporarily disabled
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Google Sheets no está disponible temporalmente'
    });
    return false;
  }, [toast]);

  const value: MatriculaSupabaseHibridaContextType = {
    // Estados
    isLoaded,
    loading,
    googleSheetsConfig: currentGoogleSheetsConfig,

    // Datos maestros (Supabase)
    estudiantes,
    personal,
    areasCurriculares,
    nivelesEducativos,
    gradosSecciones,

    // Datos transaccionales (Google Sheets)
    asistencias,
    incidentes,
    permisos,
    sesiones,
    calificaciones,

    // Funciones de datos maestros
    refreshEstudiantes,
    refreshPersonal,
    refreshAreasCurriculares,
    refreshGradosSecciones,

    // Funciones CRUD Estudiantes
    addEstudiante,
    updateEstudiante,
    deleteEstudiante,

    // Funciones CRUD Personal
    addPersonal,
    updatePersonal,
    deletePersonal,

    // Funciones de asistencias
    registrarAsistencia,
    updateAsistencia,

    // Funciones de incidentes
    registrarIncidente,

    // Funciones de permisos
    registrarPermiso,

    // Funciones de utilidad
    getEstudiantesPorGradoSeccion,
    getPersonalPorRol,
    getAreasPorGrado,
  };

  return (
    <MatriculaSupabaseHibridaContext.Provider value={value}>
      {children}
    </MatriculaSupabaseHibridaContext.Provider>
  );
}

// --- HOOK ---
export function useMatriculaSupabaseHibrida() {
  const context = useContext(MatriculaSupabaseHibridaContext);
  if (context === undefined) {
    throw new Error('useMatriculaSupabaseHibrida must be used within a MatriculaSupabaseHibridaProvider');
  }
  return context;
}
