
'use client';

import { useReducer, useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { Permiso, Incidente, AsistenciaStatus } from '@/lib/definitions';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Docente } from '@/domain/entities/Docente';
import { isWithinInterval, startOfDay, format } from 'date-fns';
import { useToast } from './use-toast';
import { usePermisos } from './use-permisos';
import { useIncidentes } from './use-incidentes';
import { useMatriculaData } from './use-matricula-data';
import { useCurrentUser } from './use-current-user';
import { useAsistencias } from './use-asistencias';
import { toEstudianteEntity } from '@/domain/mappers/entity-builders';

// --- Types and Initial State ---
export type Subject = Estudiante | Docente;
export type FilterStatus = AsistenciaStatus | 'permiso' | 'todos';

export type HorasAfectadasPorAsignacion = {
    asignacionId: string;
    horas: string[];
    registradoPor?: string;
    notas?: string;
};

export type AsistenciaRecord = {
    status: AsistenciaStatus | 'permiso';
    entryTime: Date | null;
    horasAfectadas?: HorasAfectadasPorAsignacion[];
};

export interface AsistenciaState {
    asistencia: Record<string, AsistenciaRecord>;
    initialAsistencia: Record<string, AsistenciaRecord>;
    currentDate: Date | null;
    statusFilter: FilterStatus;
    searchTerm: string;
}

export type Action =
    | { type: 'SET_INITIAL_DATA'; payload: { permisos: Permiso[]; subjects: Subject[]; date: Date } }
    | { type: 'SET_ASISTENCIA_STATUS'; payload: { numeroDocumento: string; status: AsistenciaStatus } }
    | { type: 'SET_HORAS_AFECTADAS'; payload: { numeroDocumento: string; asignacionId: string; horas: string[]; notas?: string; registradoPor: string; } }
    | { type: 'SET_FILTER'; payload: FilterStatus }
    | { type: 'SET_SEARCH_TERM'; payload: string }
    | { type: 'MARK_ALL_PRESENT' }
    | { type: 'SAVE_CHANGES' }
    | { type: 'SET_REMOTE_DATA'; payload: Record<string, AsistenciaRecord> }
    | { type: 'SET_DATE'; payload: Date };

function getInitialState(): AsistenciaState {
    return {
        asistencia: {},
        initialAsistencia: {},
        currentDate: null,
        statusFilter: 'todos',
        searchTerm: '',
    };
}


function normalizeSheetDateString(value: string | undefined): string | null {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
        const [part1, part2, yearString] = trimmed.split('/');
        const first = Number(part1);
        const second = Number(part2);
        const year = Number(yearString);

        if (Number.isNaN(first) || Number.isNaN(second) || Number.isNaN(year)) {
            return null;
        }

        let day = first;
        let month = second;

        if (first > 12 && second <= 12) {
            day = first;
            month = second;
        } else if (second > 12 && first <= 12) {
            day = second;
            month = first;
        }

        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return format(parsed, 'yyyy-MM-dd');
}

const REMOTE_STATUS_SET = new Set(['presente', 'tarde', 'falta', 'permiso', 'sin_asistencia']);

function normalizePersonalIdentifier(value: string | null | undefined): string {
    if (value == null) {
        return '';
    }

    const rawString = `${value}`.trim();
    if (!rawString) {
        return '';
    }

    const cleaned = rawString
        .replace(/\s+/g, '')
        .replace(/[^0-9A-Za-z]/g, '')
        .replace(/\.0+$/, '');

    const withoutLeadingZeros = cleaned.replace(/^0+/, '');
    return (withoutLeadingZeros || cleaned).toUpperCase();
}


// --- Reducer ---

function reducer(state: AsistenciaState, action: Action): AsistenciaState {
    switch (action.type) {
        case 'SET_DATE': {
            // Only change the date, the useEffect will trigger the data reload.
            return { ...state, currentDate: action.payload };
        }

        case 'SET_INITIAL_DATA': {
            const { permisos, subjects, date } = action.payload;
            const newState = getInitialState();
            newState.currentDate = date;
            
            const today = startOfDay(newState.currentDate);
            
            const newAsistencia: Record<string, AsistenciaRecord> = {};
            subjects.forEach(subject => {
                let hasPermiso = false;
                if (subject instanceof Estudiante) {
                    hasPermiso = permisos.some(p =>
                        p.estudiante.numeroDocumento === subject.numeroDocumento &&
                        isWithinInterval(today, { start: startOfDay(new Date(p.fechaInicio)), end: startOfDay(new Date(p.fechaFin)) })
                    );
                }

                if (hasPermiso) {
                    newAsistencia[subject.numeroDocumento] = { status: 'permiso', entryTime: null };
                } else {
                     newAsistencia[subject.numeroDocumento] = { status: 'sin_asistencia', entryTime: null };
                }
            });

            return { ...newState, asistencia: newAsistencia, initialAsistencia: { ...newAsistencia } };
        }
        case 'SET_ASISTENCIA_STATUS': {
            const { numeroDocumento, status } = action.payload;
            const currentRecord = state.asistencia[numeroDocumento];
            const entryTime = (status === 'presente' || status === 'tarde') ? new Date() : null;
            const horasAfectadas = status === 'presente' || status === 'permiso' 
                ? [] 
                : currentRecord?.horasAfectadas;

            return {
                ...state,
                asistencia: { ...state.asistencia, [numeroDocumento]: { status, entryTime, horasAfectadas } },
            };
        }
        case 'SET_HORAS_AFECTADAS': {
             const { numeroDocumento, asignacionId, horas, notas, registradoPor } = action.payload;
             const currentRecord = state.asistencia[numeroDocumento];
             const otrasAsignaciones = (currentRecord?.horasAfectadas || []).filter(a => a.asignacionId !== asignacionId);
             
             const newHorasAfectadas: HorasAfectadasPorAsignacion[] = [...otrasAsignaciones];
             if (horas.length > 0 || (notas && notas.trim() !== '')) {
                newHorasAfectadas.push({ asignacionId, horas, notas, registradoPor });
             }

             return {
                ...state,
                asistencia: {
                    ...state.asistencia,
                    [numeroDocumento]: { ...currentRecord, status: currentRecord.status, entryTime: currentRecord.entryTime, horasAfectadas: newHorasAfectadas },
                },
             }
        }
        case 'SET_FILTER':
            return {
                ...state,
                statusFilter: state.statusFilter === action.payload ? 'todos' : action.payload,
            };
        case 'SET_SEARCH_TERM':
            return { ...state, searchTerm: action.payload };
        case 'MARK_ALL_PRESENT': {
            const allPresent: Record<string, AsistenciaRecord> = {};
            const now = new Date();
            Object.keys(state.asistencia).forEach(doc => {
                if (state.asistencia[doc].status !== 'permiso') {
                    allPresent[doc] = { status: 'presente', entryTime: now };
                } else {
                    allPresent[doc] = state.asistencia[doc]; // Mantener el permiso
                }
            });
            return { ...state, asistencia: allPresent };
        }
        case 'SAVE_CHANGES':
            return { ...state, initialAsistencia: { ...state.asistencia } };
        case 'SET_REMOTE_DATA': {
            const merged = { ...state.asistencia };
            Object.entries(action.payload).forEach(([numeroDocumento, record]) => {
                merged[numeroDocumento] = record;
            });

            return {
                ...state,
                asistencia: merged,
                initialAsistencia: { ...merged }
            };
        }
        default:
            return state;
    }
}


// --- Hook ---

export function useAsistencia(subjectType: 'estudiantes' | 'personal', grado?: string, seccion?: string) {
    const [state, dispatch] = useReducer(reducer, getInitialState());
    const asistenciaRef = useRef<Record<string, AsistenciaRecord>>(state.asistencia);
    const { toast } = useToast();
    const { allEstudiantes, docentes } = useMatriculaData();
    const { permisos } = usePermisos();
    const { incidentes } = useIncidentes();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useCurrentUser();
    const { saveAsistenciasBatch, saveAsistenciasPersonalBatch, saveAsistenciasDocentesBatch } = useAsistencias();

    useEffect(() => {
        asistenciaRef.current = state.asistencia;
    }, [state.asistencia]);

    const subjects = useMemo(() => {
        if (subjectType === 'estudiantes') {
            const estudiantes = (allEstudiantes ?? [])
                .map(estudiante => {
                    if (estudiante instanceof Estudiante) {
                        return estudiante;
                    }
                    const result = toEstudianteEntity(estudiante as any);
                    if (!result.isSuccess) {
                        console.warn('useAsistencia: no se pudo convertir estudiante', estudiante);
                        return null;
                    }
                    return result.value;
                })
                .filter((est): est is Estudiante => est !== null);

            return estudiantes
                .filter(est => (
                    (!grado || est.grado === grado) &&
                    (!seccion || est.seccion === seccion)
                ))
                .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
        }
        // Para 'personal'
        return docentes
            .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
    }, [subjectType, grado, seccion, allEstudiantes, docentes]);

    const personalSubjectIdMap = useMemo(() => {
        if (subjectType !== 'personal') {
            return null;
        }

        const map = new Map<string, string>();

        const addKey = (rawKey: string | undefined | null, canonical: string) => {
            if (!rawKey) {
                return;
            }

            const trimmed = `${rawKey}`.trim();
            if (!trimmed) {
                return;
            }

            map.set(trimmed, canonical);

            const withoutLeadingZeros = trimmed.replace(/^0+/, '');
            if (withoutLeadingZeros && withoutLeadingZeros !== trimmed) {
                map.set(withoutLeadingZeros, canonical);
            }

            const normalized = normalizePersonalIdentifier(trimmed);
            if (normalized && normalized !== trimmed && normalized !== withoutLeadingZeros) {
                map.set(normalized, canonical);
            }
        };

        subjects.forEach((subject) => {
            const numeroDocumento = (subject.numeroDocumento ?? '').trim();
            const personalId = 'personalId' in subject && subject.personalId ? subject.personalId.trim() : '';
            const canonical = numeroDocumento || personalId;

            if (!canonical) {
                return;
            }

            addKey(numeroDocumento, canonical);
            addKey(personalId, canonical);
            addKey(normalizePersonalIdentifier(numeroDocumento), canonical);
            addKey(normalizePersonalIdentifier(personalId), canonical);
        });

        return map;
    }, [subjectType, subjects]);

    const loadStudentAsistencias = useCallback(async (targetDate: Date) => {
        if (subjectType !== 'estudiantes') {
            return null;
        }

        const isDocenteAula = typeof window !== 'undefined' && window.location.pathname.includes('/asistencia/aula');
        const scope: 'IE' | 'AULA' = isDocenteAula ? 'AULA' : 'IE';

        if (!grado || !seccion) {
            return null;
        }

        try {
            const response = await fetch(`/api/google-sheets/asistencias?scope=${scope}`);

            if (!response.ok) {
                console.error('Error al obtener asistencias de estudiantes:', response.statusText);
                return null;
            }

            const payload = await response.json();

            if (!payload?.success || !Array.isArray(payload.data)) {
                console.error('Respuesta inesperada al cargar asistencias de estudiantes:', payload);
                return null;
            }

            const targetDateKey = format(targetDate, 'yyyy-MM-dd');
            const usuarioId = user?.numeroDocumento ?? user?.email ?? undefined;
            const registros: Record<string, AsistenciaRecord> = {};

            for (const row of payload.data as string[][]) {
                if (!Array.isArray(row) || row.length < 11) {
                    continue;
                }

                const estudianteId = row[0];
                const rowGrado = row[2] ?? '';
                const rowSeccion = row[3] ?? '';
                const rawFecha = row[4] ?? '';
                const rawStatus = row[5] ?? '';
                const rowScope = (row[8] ?? '').toString().trim().toUpperCase();
                const rowOrigenId = (row[9] ?? '').toString().trim();
                const timestamp = row[10] ?? '';

                if (!estudianteId) {
                    continue;
                }

                if (rowScope !== scope) {
                    continue;
                }

                if (rowGrado && grado && rowGrado !== grado) {
                    continue;
                }

                if (rowSeccion && seccion && rowSeccion !== seccion) {
                    continue;
                }

                if (scope === 'AULA' && usuarioId && rowOrigenId && rowOrigenId !== usuarioId) {
                    continue;
                }

                const normalizedRowDate = normalizeSheetDateString(rawFecha);
                if (!normalizedRowDate || normalizedRowDate !== targetDateKey) {
                    continue;
                }

                const statusLower = rawStatus.toLowerCase();
                const finalStatus = REMOTE_STATUS_SET.has(statusLower)
                    ? (statusLower as AsistenciaStatus | 'permiso')
                    : 'sin_asistencia';

                registros[estudianteId] = {
                    status: finalStatus,
                    entryTime: timestamp ? new Date(timestamp) : null,
                    horasAfectadas: asistenciaRef.current[estudianteId]?.horasAfectadas,
                };
            }

            return registros;
        } catch (error) {
            console.error('Error al cargar asistencias de estudiantes:', error);
            return null;
        }
    }, [subjectType, grado, seccion, user]);

    const loadPersonalAsistencias = useCallback(async (targetDate: Date) => {
        if (subjectType !== 'personal') {
            return null;
        }

        const idMap = personalSubjectIdMap ?? new Map<string, string>();

        try {
            const response = await fetch('/api/google-sheets/asistencias-personal');

            if (!response.ok) {
                console.error('Error al obtener asistencias de personal:', response.statusText);
                return null;
            }

            const payload = await response.json();

            if (!payload?.success || !Array.isArray(payload.data)) {
                console.error('Respuesta inesperada al cargar asistencias de personal:', payload);
                return null;
            }

            const targetDateKey = format(targetDate, 'yyyy-MM-dd');
            const registros: Record<string, AsistenciaRecord> = {};

            for (const row of payload.data as string[][]) {
                if (!Array.isArray(row) || row.length < 5) {
                    continue;
                }

                const personalId = row[0];
                const rawFecha = row[3] ?? '';
                const rawStatus = row[4] ?? '';
                const timestamp = row[7] ?? '';

                if (!personalId) {
                    continue;
                }

                const trimmedId = personalId.trim();
                const noLeadingZeros = trimmedId.replace(/^0+/, '');
                const normalizedId = normalizePersonalIdentifier(trimmedId);

                const canonicalSubjectId = idMap.get(trimmedId)
                    ?? (noLeadingZeros ? idMap.get(noLeadingZeros) : undefined)
                    ?? (normalizedId ? idMap.get(normalizedId) : undefined);

                if (!canonicalSubjectId) {
                    continue;
                }

                const normalizedRowDate = normalizeSheetDateString(rawFecha);
                if (!normalizedRowDate || normalizedRowDate !== targetDateKey) {
                    continue;
                }

                const statusLower = rawStatus.toLowerCase();
                const finalStatus = REMOTE_STATUS_SET.has(statusLower)
                    ? (statusLower as AsistenciaStatus | 'permiso')
                    : 'sin_asistencia';

                registros[canonicalSubjectId] = {
                    status: finalStatus,
                    entryTime: timestamp ? new Date(timestamp) : null,
                };
            }

            return registros;
        } catch (error) {
            console.error('Error al cargar asistencias de personal:', error);
            return null;
        }
    }, [subjectType, subjects]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setIsLoading(true);

            const date = state.currentDate || new Date();
            if (!state.currentDate) {
                dispatch({ type: 'SET_DATE', payload: date });
            }

            if (subjects.length > 0) {
                const permisosList = permisos ?? [];
                dispatch({ type: 'SET_INITIAL_DATA', payload: { permisos: permisosList, subjects, date } });

                const registrosEstudiantes = await loadStudentAsistencias(date);
                const registrosPersonal = await loadPersonalAsistencias(date);
                const registros = subjectType === 'estudiantes' ? registrosEstudiantes : registrosPersonal;

                if (isMounted && registros && Object.keys(registros).length > 0) {
                    dispatch({ type: 'SET_REMOTE_DATA', payload: registros });
                }
            }

            if (isMounted) {
                setIsLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [subjects, permisos, state.currentDate, loadStudentAsistencias, loadPersonalAsistencias, subjectType]);

    const markAllAsPresent = useCallback(() => {
        dispatch({ type: 'MARK_ALL_PRESENT' });
        toast({
            title: "Asistencia actualizada",
            description: "Todos los registros sin permiso han sido marcados como 'Presente'.",
        });
    }, [toast]);
    
    const handleHorasChange = useCallback((numeroDocumento: string, asignacionId: string, horas: string[], notas?: string) => {
        if (!user) return;
        const registradoPor = `${user.nombres} ${user.apellidoPaterno}`;
        dispatch({
            type: 'SET_HORAS_AFECTADAS',
            payload: { numeroDocumento, asignacionId, horas, notas, registradoPor }
        })
    }, [user]);

    /**
     * Guarda las asistencias en Google Sheets
     */
    const saveToGoogleSheets = useCallback(async () => {
        if (!user || !state.currentDate) {
            toast({
                title: 'Error',
                description: 'Faltan datos necesarios para guardar',
                variant: 'destructive',
            });
            return false;
        }

        // Validar que para estudiantes se requiere grado y sección
        if (subjectType === 'estudiantes' && (!grado || !seccion)) {
            toast({
                title: 'Error',
                description: 'Faltan grado y sección para guardar asistencia de estudiantes',
                variant: 'destructive',
            });
            return false;
        }

        setIsSaving(true);
        try {
            const registradoPor = `${user.nombres} ${user.apellidoPaterno}`;
            const currentDate = state.currentDate instanceof Date
                ? state.currentDate
                : new Date(state.currentDate);
            const fecha = format(currentDate, 'yyyy-MM-dd');

            if (subjectType === 'estudiantes') {
                const isDocenteAula = typeof window !== 'undefined' && window.location.pathname.includes('/asistencia/aula');
                const scope: 'IE' | 'AULA' = isDocenteAula ? 'AULA' : 'IE';
                const origenId = user.numeroDocumento ?? user.email ?? registradoPor;

                const asistenciasToSave = Object.entries(state.asistencia).map(([numeroDocumento, record]) => {
                    const estudiante = subjects.find(s => s.numeroDocumento === numeroDocumento);
                    const nombreEstudiante = estudiante
                        ? `${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno || ''}, ${estudiante.nombres}`.trim()
                        : 'DESCONOCIDO';

                    return {
                        estudianteId: numeroDocumento,
                        nombreEstudiante,
                        grado: grado!,
                        seccion: seccion!,
                        fecha,
                        status: (record.status === 'permiso' ? 'permiso' : record.status) as 'presente' | 'tarde' | 'falta' | 'permiso',
                        registradoPor,
                        observaciones: record.horasAfectadas?.map(h =>
                            `${h.asignacionId}: ${h.horas.join(', ')}${h.notas ? ` - ${h.notas}` : ''}`
                        ).join('; ') || '',
                        scope,
                        origenId,
                    };
                });

                const registrosCambiados = isDocenteAula
                    ? asistenciasToSave.filter(item => {
                        const initial = state.initialAsistencia[item.estudianteId];
                        if (!initial) return true;
                        const horasInicial = JSON.stringify(initial.horasAfectadas ?? []);
                        const horasActual = JSON.stringify(state.asistencia[item.estudianteId]?.horasAfectadas ?? []);
                        return initial.status !== state.asistencia[item.estudianteId]?.status || horasInicial !== horasActual;
                    })
                    : asistenciasToSave;

                if (isDocenteAula && registrosCambiados.length === 0) {
                    toast({
                        title: 'Sin cambios pendientes',
                        description: 'No hay actualizaciones nuevas para guardar.',
                    });
                    return true;
                }

                let success = false;
                if (isDocenteAula) {
                    const docenteId = origenId || 'desconocido';
                    const docenteNombre = `${user.apellidoPaterno ?? ''} ${user.apellidoMaterno ?? ''}, ${user.nombres ?? ''}`.trim();
                    success = await saveAsistenciasDocentesBatch(
                        registrosCambiados.map(item => ({
                            estudianteId: item.estudianteId,
                            nombreEstudiante: item.nombreEstudiante ?? 'DESCONOCIDO',
                            grado: item.grado,
                            seccion: item.seccion,
                            fecha: item.fecha,
                            status: item.status,
                            registradoPor: item.registradoPor,
                            observaciones: item.observaciones,
                            docenteId,
                            docenteNombre,
                        }))
                    );
                } else {
                    success = await saveAsistenciasBatch(registrosCambiados);
                }

                if (success) {
                    dispatch({ type: 'SAVE_CHANGES' });
                    return true;
                }
                return false;
            } else {
                // Convertir el estado de asistencia a formato de Google Sheets para personal
                const asistenciasToSave = Object.entries(state.asistencia).map(([numeroDocumento, record]) => {
                    // Buscar el personal para obtener su nombre completo y cargo
                    const personal = subjects.find(s => s.numeroDocumento === numeroDocumento);
                    const nombrePersonal = personal 
                        ? `${personal.apellidoPaterno} ${personal.apellidoMaterno || ''}, ${personal.nombres}`.trim()
                        : 'DESCONOCIDO';
                    const cargo = personal && 'rol' in personal ? personal.rol : 'Sin cargo';
                    const persistId = (personal && 'personalId' in personal && personal.personalId)
                        ? personal.personalId
                        : numeroDocumento;
                    
                    // Formatear horas afectadas
                    const horasAfectadas = record.horasAfectadas?.map(h => 
                        `${h.asignacionId}: ${h.horas.join(', ')}${h.notas ? ` - ${h.notas}` : ''}`
                    ).join('; ') || '';
                    
                    return {
                        personalId: persistId,
                        nombrePersonal,
                        cargo,
                        fecha,
                        status: (record.status === 'permiso' ? 'permiso' : record.status) as 'presente' | 'tarde' | 'falta' | 'permiso',
                        registradoPor,
                        horasAfectadas,
                    };
                });

                const success = await saveAsistenciasPersonalBatch(asistenciasToSave);
                
                if (success) {
                    dispatch({ type: 'SAVE_CHANGES' });
                    return true;
                }
                return false;
            }
        } catch (error) {
            console.error('Error saving to Google Sheets:', error);
            toast({
                title: 'Error',
                description: 'No se pudo guardar en Google Sheets',
                variant: 'destructive',
            });
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [user, subjectType, grado, seccion, state.currentDate, state.asistencia, subjects, saveAsistenciasBatch, saveAsistenciasPersonalBatch, toast]);

    return {
        state,
        dispatch,
        markAllAsPresent,
        subjects,
        permisos,
        incidentes,
        isLoading,
        isSaving,
        handleHorasChange,
        saveToGoogleSheets,
    };
}
    
