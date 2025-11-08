

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMatriculaData } from './use-matricula-data';
import { useSesiones } from './use-sesiones';
import { useCompetencias } from './use-competencias';
import { useCurrentUser } from './use-current-user';
import { Estudiante, NotaCualitativa } from '@/lib/definitions';
import { useToast } from './use-toast';
import { useCurricular } from './use-curricular';

export function useCalificacionesSesion(grado: string, seccion: string, sesionId: string) {
    const { allEstudiantes, isLoaded: isMatriculaLoaded } = useMatriculaData();
    const { getSesionById } = useSesiones();
    const { allCalificaciones, saveCalificacion } = useCompetencias();
    const { user } = useCurrentUser();
    const { toast } = useToast();
    const { areas } = useCurricular();

    const [isLoading, setIsLoading] = useState(true);
    const [localCalificaciones, setLocalCalificaciones] = useState<Record<string, NotaCualitativa | null>>({});
    const [changedStudentIds, setChangedStudentIds] = useState<Set<string>>(new Set());

    const sesion = useMemo(() => getSesionById(sesionId), [sesionId, getSesionById]);
    
    const competencia = useMemo(() => {
        if (!sesion) return null;
        const area = areas.find(a => a.id === sesion.areaId);
        if (!area) return null;
        return area.competencias.find(c => c.id === sesion.competenciaId) || null;
    }, [sesion, areas]);

    const estudiantes = useMemo(() => {
        if (!isMatriculaLoaded) return [];
        return allEstudiantes
            .filter(e => e.grado === grado && e.seccion === seccion)
            .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
    }, [isMatriculaLoaded, allEstudiantes, grado, seccion]);

    useEffect(() => {
        if (estudiantes.length > 0 && user && sesion) {
            setIsLoading(true);
            const initialCalificaciones: Record<string, NotaCualitativa | null> = {};
            
            estudiantes.forEach(est => {
                const calificacionExistente = allCalificaciones.find(c => 
                    c.sesionId === sesionId && c.estudianteId === est.numeroDocumento
                );
                initialCalificaciones[est.numeroDocumento] = calificacionExistente?.nota || null;
            });
            
            setLocalCalificaciones(initialCalificaciones);
            setChangedStudentIds(new Set());
            setIsLoading(false);
        } else if (isMatriculaLoaded && user && sesion) {
            setIsLoading(false);
        }
    }, [estudiantes, user, sesion, allCalificaciones, sesionId, isMatriculaLoaded, allEstudiantes]);


    const handleNotaChange = useCallback((estudianteId: string, nota: NotaCualitativa) => {
        setLocalCalificaciones(prev => ({ ...prev, [estudianteId]: nota }));
        setChangedStudentIds(prev => new Set(prev).add(estudianteId));
    }, []);
    
    const handleSaveChanges = useCallback(() => {
        if (!user || !sesion || !competencia) return;

        changedStudentIds.forEach(estudianteId => {
            const nota = localCalificaciones[estudianteId];
            if (nota) {
                saveCalificacion({
                    estudianteId,
                    docenteId: user.numeroDocumento,
                    grado: sesion.grado,
                    seccion: sesion.seccion,
                    areaId: sesion.areaId,
                    competenciaId: sesion.competenciaId,
                    nota,
                    sesionId: sesion.id,
                });
            }
        });
        
        toast({ title: 'Calificaciones guardadas', description: `Se han guardado los cambios para ${changedStudentIds.size} estudiante(s).` });
        setChangedStudentIds(new Set());
    }, [user, sesion, competencia, changedStudentIds, localCalificaciones, saveCalificacion, toast]);


    return {
        sesion,
        competencia,
        estudiantes,
        calificaciones: localCalificaciones,
        isLoading,
        handleNotaChange,
        handleSaveChanges,
        changedStudentIds,
    };
}
