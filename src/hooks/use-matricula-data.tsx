'use client';

import { useState, useCallback, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { initialGrados, initialSeccionesPorGrado } from '@/lib/data';
import { Nivel, AreaCurricular, Competencia, SesionAprendizaje, Calificacion, NeeEntry } from '@/lib/definitions';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Docente } from '@/domain/entities/Docente';
import { Permiso } from '@/domain/entities/Permiso';
import { Incidente } from '@/domain/entities/Incidente';
import { useAppConfig } from './use-app-config';
import { initialAsistenciaDeAula } from '@/lib/asistencia-aula-data';
import { initialCalificaciones } from '@/lib/evaluaciones-data';
import { initialHistorialAsistencia } from '@/lib/historial-asistencia-data';
import { initialIncidentesComunes } from '@/lib/incidentes-comunes-data';
import { useMatriculaSupabaseHibrida } from '@/infrastructure/hooks/useMatriculaSupabaseHibrida';
import { isSupabaseConfigured } from '@/infrastructure/adapters/supabase/config';
import { syncDocentesAsignacionesOptimized } from '@/infrastructure/services/asignaciones-supabase-optimized';
import { gradosSeccionesRepository } from '@/infrastructure/repositories/supabase/SupabaseGradosSeccionesRepository';

// ⚠️ NOTA: Este hook ahora usa Supabase internamente
// Se mantiene la interfaz legacy para compatibilidad con páginas existentes

type LocalDbState = {
    grados: string[];
    secciones: Record<string, string[]>;
    incidentes: Incidente[];
    permisos: Permiso[];
    neeEntries: NeeEntry[];
    sesiones: SesionAprendizaje[];
    calificaciones: Calificacion[];
    historialAsistencia: any[];
    incidentesComunes: { estudiantes: string[]; personal: string[] };
};

// --- HELPER FUNCTIONS ---
const getGradosForNivel = (nivel: Nivel): string[] => {
    if (nivel === 'Inicial') return ['3 Años', '4 Años', '5 Años'];
    if (nivel === 'Primaria') return ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'];
    if (nivel === 'Secundaria') return ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado'];
    return [];
}

const inferNivelFromGrado = (grado: string, fallback?: Nivel): Nivel => {
    const normalized = grado.toLowerCase();
    if (normalized.includes('inicial') || normalized.includes('años')) return 'Inicial';
    if (normalized.includes('secundaria')) return 'Secundaria';
    if (fallback) return fallback;
    return 'Primaria';
};

// --- CONTEXT DEFINITION ---
interface MatriculaDataContextType {
    grados: string[];
    seccionesPorGrado: Record<string, string[]>;
    allGrados: string[];
    estudiantesPorSeccion: Record<string, Record<string, Estudiante[]>>;
    allEstudiantes: Estudiante[];
    docentes: Docente[];
    niveles: {id: string, nombre: Nivel}[];
    areas: AreaCurricular[];
    allAreas: AreaCurricular[];
    areasPorGrado: Record<string, AreaCurricular[]>;
    incidentes: Incidente[];
    permisos: Permiso[];
    neeEntries: NeeEntry[];
    sesiones: SesionAprendizaje[];
    allCalificaciones: Calificacion[];
    historialAsistencia: any[];
    incidentesComunes: { estudiantes: string[], personal: string[] };
    gradoSeccionCatalog: Record<string, { id: string; grado: string; seccion: string; nivel: Nivel | null }>;

    getDocentes: () => Docente[];
    setDocentes: (newDocentes: Docente[]) => Promise<boolean>;
    getEstudiantes: () => Estudiante[];
    setEstudiantes: (newEstudiantes: Estudiante[]) => void;
    getAreas: () => AreaCurricular[];
    setAreas: (newAreas: AreaCurricular[]) => void;
    getGrados: () => string[];
    setGrados: (newGrados: string[]) => Promise<boolean>;
    getSecciones: () => Record<string, string[]>;
    setSecciones: (newSecciones: Record<string, string[]>) => Promise<boolean>;
    setIncidentes: (newIncidentes: Incidente[]) => void;
    getIncidentes: () => Incidente[];
    getPermisos: () => Permiso[];
    setPermisos: (newPermisos: Permiso[]) => void;
    getNeeEntries: () => NeeEntry[];
    setNeeEntries: (newNeeEntries: NeeEntry[]) => void;
    getSesiones: () => SesionAprendizaje[];
    setSesiones: (newSesiones: SesionAprendizaje[]) => void;
    getCalificaciones: () => Calificacion[];
    setCalificaciones: (newCalificaciones: Calificacion[]) => void;
    getIncidentesComunes: () => { estudiantes: string[], personal: string[] };
    setIncidentesComunes: (newIncidentesComunes: { estudiantes: string[], personal: string[] }) => void;
    getGradoSeccionId: (grado: string, seccion: string) => string | undefined;

    loadData: () => void;
    isLoaded: boolean;
}

const MatriculaDataContext = createContext<MatriculaDataContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export function MatriculaDataProvider({ children }: { children: ReactNode }) {
  const { nivelInstitucion, isLoaded: isAppConfigLoaded } = useAppConfig();
  
  // Usar Supabase para datos principales
  const supabaseData = useMatriculaSupabaseHibrida();
  const {
    estudiantes: supEstudiantes,
    personal: supDocentes,
    areasCurriculares: supAreas,
    gradosSecciones: supGradosSecciones,
    refreshPersonal,
    refreshAreasCurriculares,
    refreshEstudiantes,
    refreshGradosSecciones,
    isLoaded: supabaseLoaded,
  } = supabaseData;
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Datos locales sólo cuando Supabase no está configurado
  const [dbState, setDbState] = useState<LocalDbState>(() => ({
      grados: isSupabaseConfigured ? [] : [...initialGrados],
      secciones: isSupabaseConfigured ? {} : JSON.parse(JSON.stringify(initialSeccionesPorGrado)),
      incidentes: [],
      permisos: [],
      neeEntries: [],
      sesiones: [] as SesionAprendizaje[], // Vacío por ahora, se migrará después
      calificaciones: initialCalificaciones.map(c => ({...c, id: crypto.randomUUID(), fecha: new Date(c.fecha)})),
      historialAsistencia: (initialHistorialAsistencia as any[]).map(h => ({...h, fecha: new Date(h.fecha)})),
      incidentesComunes: JSON.parse(JSON.stringify(initialIncidentesComunes)),
  }));
  
  const [derivedState, setDerivedState] = useState<Omit<MatriculaDataContextType, 'isLoaded' | 'loadData' | 'getDocentes' | 'setDocentes' | 'getEstudiantes' | 'setEstudiantes' | 'getAreas' | 'setAreas' | 'getGrados' | 'setGrados' | 'getSecciones' | 'setSecciones' | 'getIncidentes' | 'setIncidentes' | 'getPermisos' | 'setPermisos' | 'getNeeEntries' | 'setNeeEntries' | 'getSesiones' | 'setSesiones' | 'getCalificaciones' | 'setCalificaciones' | 'getIncidentesComunes' | 'setIncidentesComunes' | 'getGradoSeccionId'>>({
      grados: [],
      seccionesPorGrado: {},
      allGrados: [],
      estudiantesPorSeccion: {},
      allEstudiantes: [],
      docentes: [],
      niveles: [],
      areas: [],
      allAreas: [],
      areasPorGrado: {},
      incidentes: [],
      permisos: [],
      neeEntries: [],
      sesiones: [],
      allCalificaciones: [],
      historialAsistencia: [],
      incidentesComunes: { estudiantes: [], personal: [] },
      gradoSeccionCatalog: {},
  });

  const loadData = useCallback(() => {
    setIsLoaded(false);
    
    const gradosDelNivel = getGradosForNivel(nivelInstitucion);
    const gradosRecords = supGradosSecciones || [];
    const supabaseReady = isSupabaseConfigured && supabaseLoaded;

    const seccionesSupabase: Record<string, string[]> = {};
    const gradoNivelMap: Record<string, Nivel> = {};
    const gradoSeccionCatalog: Record<string, { id: string; grado: string; seccion: string; nivel: Nivel | null }> = {};
    gradosRecords.forEach(record => {
        if (!record.grado) {
            return;
        }
        const grado = record.grado;
        const seccion = record.seccion ?? '';
        if (!seccionesSupabase[grado]) {
            seccionesSupabase[grado] = [];
        }
        if (seccion && !seccionesSupabase[grado].includes(seccion)) {
            seccionesSupabase[grado].push(seccion);
        }
        const nivel = (record.nivel as Nivel | null) ?? inferNivelFromGrado(grado, nivelInstitucion);
        gradoNivelMap[grado] = nivel;
        const key = `${grado}|${seccion}`;
        gradoSeccionCatalog[key] = {
            id: record.id,
            grado,
            seccion,
            nivel,
        };
    });

    const seccionesLocales = dbState.secciones;
    const finalSeccionesPorGrado = supabaseReady ? seccionesSupabase : seccionesLocales;

    const allGradosSup = gradosRecords.map(r => r.grado).filter((grado): grado is string => Boolean(grado));
    const allGradosFinal = supabaseReady
      ? Array.from(new Set(allGradosSup))
      : dbState.grados;

    const estudiantes = supabaseReady ? (supEstudiantes || []) : [];
    const docentes = supabaseReady ? (supDocentes || []) : [];
    
    // Filtrar áreas solo por nivel de institución
    // IMPORTANTE: allAreas incluirá Competencias Transversales para que estén disponibles
    // globalmente en componentes como el panel de docentes
    const areas = supabaseReady
      ? (supAreas || []).filter(area => (area.nivel as Nivel | undefined) === nivelInstitucion)
      : [];

    const newEstudiantesPorSeccion: Record<string, Record<string, Estudiante[]>> = {};
    allGradosFinal.forEach(grado => {
        const secciones = finalSeccionesPorGrado[grado] || [];
        newEstudiantesPorSeccion[grado] = {};
        secciones.forEach((seccion: string) => {
            newEstudiantesPorSeccion[grado][seccion] = estudiantes.filter((e: Estudiante) => e.grado === grado && e.seccion === seccion);
        });
    });

    // Construir areasPorGrado excluyendo Competencias Transversales
    // RAZÓN: Las competencias transversales no se asignan a grados específicos,
    // se manejan globalmente y están disponibles para todos los docentes con áreas asignadas.
    // Los componentes que necesiten transversales deben buscarlas en allAreas.
    const newAreasPorGrado: Record<string, AreaCurricular[]> = {};
    allGradosFinal.forEach(grado => {
        const nivel = gradoNivelMap[grado] ?? inferNivelFromGrado(grado);
        newAreasPorGrado[grado] = areas.filter((a: AreaCurricular) => {
            const areaNivel = (a.nivel as Nivel | undefined) ?? inferNivelFromGrado(grado);
            // Excluir Competencias Transversales de areasPorGrado porque se manejan globalmente
            return areaNivel === nivel && a.nombre !== 'Competencias Transversales';
        });
    });

    const nivelesList = [
        { id: 'inicial', nombre: 'Inicial' as Nivel },
        { id: 'primaria', nombre: 'Primaria' as Nivel },
        { id: 'secundaria', nombre: 'Secundaria' as Nivel }
    ];

    const gradosFiltrados = allGradosFinal
      .filter((g: string) => {
        const nivelDetectado = gradoNivelMap[g] ?? inferNivelFromGrado(g, nivelInstitucion);
        if (gradosDelNivel.length > 0) {
          return gradosDelNivel.includes(g) || nivelDetectado === nivelInstitucion;
        }
        return nivelDetectado === nivelInstitucion;
      })
      .sort((a: string, b: string) => a.localeCompare(b, 'es'));

    setDerivedState(prev => ({
        ...prev,
        grados: gradosFiltrados,
        seccionesPorGrado: finalSeccionesPorGrado,
        allGrados: allGradosFinal,
        estudiantesPorSeccion: newEstudiantesPorSeccion,
        allEstudiantes: estudiantes,
        docentes,
        niveles: nivelesList,
        areas,
        // allAreas contiene TODAS las áreas del nivel, incluyendo Competencias Transversales
        // Esto permite que componentes como el panel de docentes accedan a las transversales
        allAreas: areas,
        // areasPorGrado NO incluye Competencias Transversales (ver filtro arriba)
        areasPorGrado: newAreasPorGrado,
        incidentes: dbState.incidentes,
        permisos: dbState.permisos,
        neeEntries: dbState.neeEntries,
        sesiones: dbState.sesiones,
        allCalificaciones: dbState.calificaciones,
        historialAsistencia: dbState.historialAsistencia,
        incidentesComunes: dbState.incidentesComunes,
        gradoSeccionCatalog,
      }));
    
    setIsLoaded(true);
  }, [nivelInstitucion, dbState, supEstudiantes, supDocentes, supAreas, supGradosSecciones, supabaseLoaded]);
  
  const createSetter = <K extends keyof LocalDbState>(key: K) => (newValue: LocalDbState[K]) => {
      setDbState(prev => ({...prev, [key]: newValue}));
  };
  const createGetter = <K extends keyof LocalDbState>(key: K) => () => dbState[key];

  const setIncidentesState = useCallback((newIncidentes: Incidente[]) => {
    setDbState(prev => ({ ...prev, incidentes: newIncidentes }));
    setDerivedState(prev => ({ ...prev, incidentes: newIncidentes }));
  }, []);

  const setPermisosState = useCallback((newPermisos: Permiso[]) => {
    setDbState(prev => ({ ...prev, permisos: newPermisos }));
    setDerivedState(prev => ({ ...prev, permisos: newPermisos }));
  }, []);

  const setNeeEntriesState = useCallback((newNeeEntries: NeeEntry[]) => {
    setDbState(prev => ({ ...prev, neeEntries: newNeeEntries }));
    setDerivedState(prev => ({ ...prev, neeEntries: newNeeEntries }));
  }, []);
  
  const setDocentesAsync = useCallback(async (newDocentes: Docente[]): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      setDerivedState(prev => ({
        ...prev,
        docentes: newDocentes,
      }));
      setDbState(prev => ({
        ...prev,
        docentes: newDocentes,
      }));
      return true;
    }

    const success = await syncDocentesAsignacionesOptimized(newDocentes);
    if (success) {
        // Refrescar solo personal (las asignaciones ya están actualizadas)
        await refreshPersonal();
        // loadData() se ejecutará automáticamente por los useEffect cuando cambien los datos de Supabase
    }
    return success;
  }, [refreshPersonal]);

  const setGradosAsync = useCallback(async (newGrados: string[]): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      createSetter('grados')(newGrados);
      return true;
    }

    try {
      const uniqueGrados = Array.from(new Set(newGrados.map(g => g.trim())));
      const currentGrados = derivedState.grados ?? [];
      const gradosToDelete = currentGrados.filter(grado => !uniqueGrados.includes(grado));

      if (gradosToDelete.length > 0) {
        await Promise.all(gradosToDelete.map(grado => gradosSeccionesRepository.deleteByGrado(grado)));
        await refreshGradosSecciones();
      }

      setDerivedState(prev => ({
        ...prev,
        grados: uniqueGrados.sort((a, b) => a.localeCompare(b, 'es')),
        allGrados: uniqueGrados,
      }));
      loadData();
      return true;
    } catch (error) {
      console.error('Error setting grados:', error);
      return false;
    }
  }, [derivedState.grados, loadData, refreshGradosSecciones, nivelInstitucion]);

  const setSeccionesAsync = useCallback(async (newSecciones: Record<string, string[]>): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      createSetter('secciones')(newSecciones);
      return true;
    }

    try {
      const sanitizedNewSecciones = Object.fromEntries(
        Object.entries(newSecciones).map(([grado, secciones]) => [
          grado,
          (secciones || []).map(s => s.trim()).filter(Boolean)
        ])
      );
      const currentSecciones = derivedState.seccionesPorGrado ?? {};
      const operations: Promise<unknown>[] = [];

      // eliminar secciones/grados que ya no existen
      Object.entries(currentSecciones).forEach(([grado, secciones]) => {
        const nextSecciones = sanitizedNewSecciones[grado] ?? [];
        const nextSet = new Set(nextSecciones.map(s => s.trim()));

        (secciones || []).forEach(seccion => {
          const currentTrim = (seccion || '').trim();
          if (!nextSet.has(currentTrim)) {
            operations.push(gradosSeccionesRepository.deleteByGradoSeccion(grado, currentTrim || null));
          }
        });

        if (!(grado in newSecciones)) {
          operations.push(gradosSeccionesRepository.deleteByGrado(grado));
        }
      });

      // agregar nuevas secciones
      Object.entries(sanitizedNewSecciones).forEach(([grado, secciones]) => {
        const currentSet = new Set((currentSecciones[grado] || []).map(s => (s || '').trim()));
        secciones.forEach(seccion => {
          const normalizada = seccion.trim();
          if (!currentSet.has(normalizada)) {
            const nivel = inferNivelFromGrado(grado, nivelInstitucion);
            operations.push(gradosSeccionesRepository.upsert(grado, normalizada || null, nivel));
          }
        });
      });

      if (operations.length > 0) {
        await Promise.all(operations);
        await refreshGradosSecciones();
      }

      setDerivedState(prev => ({
        ...prev,
        seccionesPorGrado: sanitizedNewSecciones,
      }));
      loadData();
      return true;
    } catch (error) {
      console.error('Error setting secciones:', error);
      return false;
    }
  }, [derivedState.seccionesPorGrado, loadData, refreshGradosSecciones, nivelInstitucion]);

  const value = {
    ...derivedState,
    loadData,
    isLoaded,
    getDocentes: () => derivedState.docentes,
    setDocentes: setDocentesAsync,
    getEstudiantes: () => supEstudiantes || [],
    setEstudiantes: (newEstudiantes: Estudiante[]) => {
      // TODO: Implementar actualización en Supabase
      console.warn('setEstudiantes: Actualización en Supabase pendiente');
    },
    getAreas: () => supAreas || [],
    setAreas: (newAreas: AreaCurricular[]) => {
      // TODO: Implementar actualización en Supabase
      console.warn('setAreas: Actualización en Supabase pendiente');
    },
    getGrados: createGetter('grados'),
    setGrados: setGradosAsync,
    getSecciones: createGetter('secciones'),
    setSecciones: setSeccionesAsync,
    incidentes: derivedState.incidentes,
    setIncidentes: setIncidentesState,
    getIncidentes: createGetter('incidentes'),
    getPermisos: createGetter('permisos'),
    setPermisos: setPermisosState,
    neeEntries: derivedState.neeEntries,
    getNeeEntries: createGetter('neeEntries'),
    setNeeEntries: setNeeEntriesState,
    getSesiones: createGetter('sesiones'),
    setSesiones: createSetter('sesiones'),
    getCalificaciones: createGetter('calificaciones'),
    setCalificaciones: createSetter('calificaciones'),
    getIncidentesComunes: createGetter('incidentesComunes'),
    setIncidentesComunes: createSetter('incidentesComunes'),
    gradoSeccionCatalog: derivedState.gradoSeccionCatalog,
    getGradoSeccionId: (grado: string, seccion: string) => derivedState.gradoSeccionCatalog[`${grado}|${seccion}`]?.id,
  };

  useEffect(() => {
    if (isAppConfigLoaded) {
      loadData();
    }
  }, [isAppConfigLoaded, nivelInstitucion, loadData]);

  return <MatriculaDataContext.Provider value={value}>{children}</MatriculaDataContext.Provider>;
}

// --- HOOK ---
export function useMatriculaData() {
    const context = useContext(MatriculaDataContext);
    if (context === undefined) {
        throw new Error('useMatriculaData must be used within a MatriculaDataProvider');
    }
    return context;
}
