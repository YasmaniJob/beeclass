
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMatriculaData } from './use-matricula-data';
import { useSesiones } from './use-sesiones';
import { useCompetencias } from './use-competencias';
import { useCurrentUser } from './use-current-user';
import { NotaCualitativa, SesionAprendizaje } from '@/lib/definitions';
import { useToast } from './use-toast';
import { useCurricular } from './use-curricular';

/**
 * Hook para gestionar calificaciones de sesiones de aprendizaje
 * 
 * Actualmente soporta: Evaluación Directa (AD, A, B, C)
 * TODO: Extender para Lista de Cotejo y Rúbrica
 * 
 * Ver guía de extensión en: src/components/evaluaciones/README-TIPOS-EVALUACION.md
 */
export function useCalificacionesSesion(grado: string, seccion: string, sesionId: string) {
    const { allEstudiantes, isLoaded: isMatriculaLoaded } = useMatriculaData();
    const { getSesionById } = useSesiones();
    const { allCalificaciones, saveCalificacion } = useCompetencias();
    const { user } = useCurrentUser();
    const { toast } = useToast();
    const { areas } = useCurricular();

    const [isLoading, setIsLoading] = useState(true);
    const [sesion, setSesion] = useState<SesionAprendizaje | undefined>(undefined);
    const [competencia, setCompetencia] = useState<any>(null);
    const [estudiantes, setEstudiantes] = useState<any[]>([]);
    const [localCalificaciones, setLocalCalificaciones] = useState<Record<string, NotaCualitativa | null>>({});
    const [changedStudentIds, setChangedStudentIds] = useState<Set<string>>(new Set());
    
    // Load all data when ready
    useEffect(() => {
        if (!isMatriculaLoaded || !user) {
            return;
        }

        const foundSesion = getSesionById(sesionId);
        setSesion(foundSesion);
        
        if (!foundSesion) {
            setIsLoading(false);
            return;
        }

        // Find competencia
        const area = areas.find(a => a.id === foundSesion.areaId);
        const foundCompetencia = area?.competencias.find(c => c.id === foundSesion.competenciaId) || null;
        setCompetencia(foundCompetencia);

        // Filter estudiantes
        const filteredEstudiantes = allEstudiantes
            .filter(e => e.grado === grado && e.seccion === seccion)
            .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
        setEstudiantes(filteredEstudiantes);
        
        // Load calificaciones
        const initialCalificaciones: Record<string, NotaCualitativa | null> = {};
        filteredEstudiantes.forEach(est => {
            const calificacionExistente = allCalificaciones.find(c => 
                c.sesionId === sesionId && c.estudianteId === est.numeroDocumento
            );
            initialCalificaciones[est.numeroDocumento] = calificacionExistente?.nota || null;
        });
        
        setLocalCalificaciones(initialCalificaciones);
        setIsLoading(false);
    }, [isMatriculaLoaded, user, sesionId, grado, seccion]);


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
