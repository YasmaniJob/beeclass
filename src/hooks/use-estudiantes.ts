
'use client';

import { useCallback } from 'react';
import { useMatriculaData } from './use-matricula-data';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Nivel } from '@/lib/definitions';
import { useToast } from './use-toast';
import { useAppConfig } from './use-app-config';

const parseGrado = (grado: string): number => {
    const match = grado.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
};

const formatGrado = (num: number, nivel: Nivel): string => {
    if (nivel === 'Inicial') {
        if (num === 3) return '3 Años';
        if (num === 4) return '4 Años';
        if (num === 5) return '5 Años';
    }
    if (nivel === 'Primaria') {
        if (num === 1) return '1er Grado';
        if (num === 2) return '2do Grado';
        if (num === 3) return '3er Grado';
        return `${num}to Grado`;
    }
     if (nivel === 'Secundaria') {
        if (num === 1) return '1ero Secundaria';
        if (num === 2) return '2do Secundaria';
        if (num === 3) return '3ero Secundaria';
        if (num === 4) return '4to Secundaria';
        if (num === 5) return '5to Secundaria';
    }
    return `${num} Grado`;
}

const getGradosForNivel = (nivel: Nivel): string[] => {
    if (nivel === 'Inicial') return ['3 Años', '4 Años', '5 Años'];
    if (nivel === 'Primaria') return ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'];
    if (nivel === 'Secundaria') return ['1ero Secundaria', '2do Secundaria', '3ero Secundaria', '4to Secundaria', '5to Secundaria'];
    return [];
}


export function useEstudiantes() {
    const { 
        getEstudiantes, 
        setEstudiantes,
        getGrados,
        setGrados,
        getSecciones,
        setSecciones,
    } = useMatriculaData();
    const { toast } = useToast();
    const { nivelInstitucion } = useAppConfig();

    const addEstudiante = useCallback((estudiante: Estudiante) => {
        const memoryEstudiantes = getEstudiantes();
        setEstudiantes([...memoryEstudiantes, estudiante]);
    }, [getEstudiantes, setEstudiantes]);

    const updateEstudiante = useCallback((numeroDocumento: string, updatedData: Partial<Estudiante>) => {
        const memoryEstudiantes = getEstudiantes();
        const updatedList = memoryEstudiantes.map(estudiante => {
            if (estudiante.numeroDocumento !== numeroDocumento) {
                return estudiante;
            }

            const result = estudiante.actualizar(updatedData);
            if (!result.isSuccess) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error.message,
                });
                return estudiante;
            }

            return result.value;
        });

        setEstudiantes(updatedList);
    }, [getEstudiantes, setEstudiantes, toast]);

    const deleteEstudiante = useCallback((numeroDocumento: string) => {
        const memoryEstudiantes = getEstudiantes();
        const updatedList = memoryEstudiantes.filter(e => e.numeroDocumento !== numeroDocumento);
        setEstudiantes(updatedList);
    }, [getEstudiantes, setEstudiantes]);

    const transferEstudiante = useCallback((numeroDocumento: string, newGrado: string, newSeccion: string) => {
        const memoryEstudiantes = getEstudiantes();
        const updatedList = memoryEstudiantes.map(estudiante => {
            if (estudiante.numeroDocumento !== numeroDocumento) {
                return estudiante;
            }

            const result = estudiante.actualizar({ grado: newGrado, seccion: newSeccion });
            if (!result.isSuccess) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error.message,
                });
                return estudiante;
            }

            return result.value;
        });

        setEstudiantes(updatedList);
    }, [getEstudiantes, setEstudiantes, toast]);

    const addGrado = useCallback((): string | null => {
        const memoryGrados = getGrados();
        const gradosDelNivel = getGradosForNivel(nivelInstitucion);
        const gradosExistentesEnNivel = memoryGrados.filter(g => gradosDelNivel.includes(g)).sort((a,b) => parseGrado(a) - parseGrado(b));
        const ultimoGrado = gradosExistentesEnNivel[gradosExistentesEnNivel.length - 1];

        let nuevoNombre;
        if (nivelInstitucion === 'Inicial') {
            const orden = ['3 Años', '4 Años', '5 Años'];
            const ultimoIndex = ultimoGrado ? orden.indexOf(ultimoGrado) : -1;
            if (ultimoIndex === -1 && gradosExistentesEnNivel.length === 0) nuevoNombre = orden[0];
            else if (ultimoIndex < orden.length - 1) nuevoNombre = orden[ultimoIndex + 1];
        } else {
            const ultimoNumero = ultimoGrado ? parseGrado(ultimoGrado) : 0;
            nuevoNombre = formatGrado(ultimoNumero + 1, nivelInstitucion);
        }
        
        if (!nuevoNombre || !gradosDelNivel.includes(nuevoNombre)) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pueden añadir más grados a este nivel.' });
            return null;
        }
        if (memoryGrados.includes(nuevoNombre)) { toast({ variant: 'destructive', title: 'Error', description: 'El grado ya existe.' }); return null; }
        
        setGrados([...memoryGrados, nuevoNombre].sort());
        const memorySecciones = getSecciones();
        memorySecciones[nuevoNombre] = [];
        setSecciones(memorySecciones);
        
        toast({ title: 'Éxito', description: `Grado "${nuevoNombre}" añadido.` });
        return nuevoNombre;
    }, [getGrados, setGrados, getSecciones, setSecciones, toast, nivelInstitucion]);

    const deleteGrado = useCallback((nombre: string) => {
        const memorySecciones = getSecciones();
        if ((memorySecciones[nombre] || []).length > 0) { toast({ variant: 'destructive', title: 'Error', description: `No se puede eliminar. El grado tiene secciones.` }); return; }
        
        const memoryGrados = getGrados();
        setGrados(memoryGrados.filter(g => g !== nombre));
        delete memorySecciones[nombre];
        setSecciones(memorySecciones);
        toast({ title: 'Éxito', description: `Grado "${nombre}" eliminado.` });
    }, [getGrados, setGrados, getSecciones, setSecciones, toast]);

    const addSeccion = useCallback((grado: string) => {
        const memorySecciones = getSecciones();
        const seccionesActuales = memorySecciones[grado] || [];
        const ultimaSeccion = seccionesActuales[seccionesActuales.length - 1];
        let nuevoNombre;
        if (!ultimaSeccion) nuevoNombre = 'Sección A';
        else if (ultimaSeccion === 'Sección Única') { toast({ variant: 'destructive', title: 'Error', description: 'No se pueden añadir más secciones a un grado con sección única.' }); return; }
        else {
            const match = ultimaSeccion.match(/Sección ([A-Z])$/);
            if (match) {
                const ultimoChar = match[1];
                if (ultimoChar === 'Z') { toast({ variant: 'destructive', title: 'Error', description: 'Se ha alcanzado el límite de secciones.' }); return; }
                nuevoNombre = `Sección ${String.fromCharCode(ultimoChar.charCodeAt(0) + 1)}`;
            } else nuevoNombre = 'Sección B';
        }
        if (seccionesActuales.includes(nuevoNombre)) { toast({ variant: 'destructive', title: 'Error', description: 'La sección ya existe en este grado.' }); return; }
        
        if (!memorySecciones[grado]) memorySecciones[grado] = [];
        memorySecciones[grado].push(nuevoNombre);
        setSecciones(memorySecciones);
        toast({ title: 'Éxito', description: `Sección "${nuevoNombre}" añadida a ${grado}.` });
    }, [getSecciones, setSecciones, toast]);

    const deleteSeccion = useCallback((grado: string, seccion: string) => {
        const memoryEstudiantes = getEstudiantes();
        if ((memoryEstudiantes.filter(e => e.grado === grado && e.seccion === seccion) || []).length > 0) {
            toast({ variant: 'destructive', title: 'Error', description: `No se puede eliminar. La sección tiene estudiantes.` });
            return;
        }

        const memorySecciones = getSecciones();
        memorySecciones[grado] = memorySecciones[grado].filter(s => s !== seccion);
        setSecciones(memorySecciones);
        toast({ title: 'Éxito', description: `Sección "${seccion}" eliminada.` });
    }, [getEstudiantes, getSecciones, setSecciones, toast]);

    return {
        addEstudiante,
        updateEstudiante,
        deleteEstudiante,
        transferEstudiante,
        addGrado,
        deleteGrado,
        addSeccion,
        deleteSeccion,
    };
}
