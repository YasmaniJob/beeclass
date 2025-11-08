'use client';

import { Docente, Asignacion } from "./definitions";

/**
 * Procesa la lista de docentes para crear una estructura de datos anidada
 * que facilite la consulta de asignaciones por grado y sección.
 */
export function processarAsignaciones(docentes: Docente[]) {
    const asignaciones: Record<string, Record<string, {
        docentes: string[];
        tutor: string | null;
        areas: Record<string, string | null>;
    }>> = {};

    docentes.forEach(docente => {
        (docente.asignaciones || []).forEach(asig => {
            if (!asignaciones[asig.grado]) {
                asignaciones[asig.grado] = {};
            }
            if (!asignaciones[asig.grado][asig.seccion]) {
                asignaciones[asig.grado][asig.seccion] = {
                    docentes: [],
                    tutor: null,
                    areas: {}
                };
            }

            const seccionData = asignaciones[asig.grado][asig.seccion];

            if (!asig.areaId && !seccionData.docentes.includes(docente.numeroDocumento)) {
                seccionData.docentes.push(docente.numeroDocumento);
            }

            if (asig.rol === 'Docente y Tutor' && !asig.areaId) {
                seccionData.tutor = docente.numeroDocumento;
            }

            if (asig.areaId) {
                seccionData.areas[asig.areaId] = docente.numeroDocumento;
            }
        });
    });

    return asignaciones;
}

/**
 * Actualiza la asignación principal de un docente a una sección.
 */
export function actualizarAsignacionPrincipal(docentes: Docente[], grado: string, seccion: string, docenteId: string, checked: boolean): Docente[] {
    return docentes.map(docente => {
        if (docente.numeroDocumento === docenteId) {
            let asignaciones = docente.asignaciones || [];
            if (checked) {
                const mainAsignacionExists = asignaciones.some(a => a.grado === grado && a.seccion === seccion && !a.areaId);
                if (!mainAsignacionExists) {
                    const newAsignacion: Asignacion = { id: `${grado}-${seccion}-${docenteId}`, grado, seccion, rol: 'Docente' };
                    asignaciones.push(newAsignacion);
                }
            } else {
                asignaciones = asignaciones.filter(a => !(a.grado === grado && a.seccion === seccion));
            }
            return { ...docente, asignaciones };
        }
        return docente;
    });
}

/**
 * Actualiza el rol de tutor para un docente en una sección específica.
 * Se asegura de que solo haya un tutor por sección.
 */
export function actualizarRolTutor(docentes: Docente[], grado: string, seccion: string, docenteId: string, isTutor: boolean): Docente[] {
    let updatedDocentes = [...docentes];

    if (isTutor) {
        updatedDocentes = updatedDocentes.map(d => ({
            ...d,
            asignaciones: d.asignaciones?.map(a => 
                (a.grado === grado && a.seccion === seccion && a.rol === 'Docente y Tutor' && !a.areaId)
                ? { ...a, rol: 'Docente' }
                : a
            ) || []
        }));
    }

    const docenteIndex = updatedDocentes.findIndex(d => d.numeroDocumento === docenteId);
    if(docenteIndex !== -1) {
        const newAsignaciones = updatedDocentes[docenteIndex].asignaciones?.map(a => 
            (a.grado === grado && a.seccion === seccion && !a.areaId)
            ? { ...a, rol: isTutor ? 'Docente y Tutor' : 'Docente' }
            : a
        ) || [];
        updatedDocentes[docenteIndex] = { ...updatedDocentes[docenteIndex], asignaciones: newAsignaciones };
    }
    
    return updatedDocentes;
}

/**
 * Actualiza la asignación de un área curricular a un docente en una sección.
 * Se asegura de que cada área solo esté asignada a un docente por sección.
 */
export function actualizarAsignacionArea(docentes: Docente[], grado: string, seccion: string, areaId: string, docenteId: string, isChecked: boolean): Docente[] {
    let updatedDocentes = [...docentes];

    updatedDocentes = updatedDocentes.map(d => ({
        ...d,
        asignaciones: d.asignaciones?.filter(a => !(a.grado === grado && a.seccion === seccion && a.areaId === areaId))
    }));
    
    if (isChecked) {
        const docenteIndex = updatedDocentes.findIndex(d => d.numeroDocumento === docenteId);
        if (docenteIndex !== -1) {
            const docenteAsignaciones = updatedDocentes[docenteIndex].asignaciones || [];
            const areaAsignacionExists = docenteAsignaciones.some(a => a.grado === grado && a.seccion === seccion && a.areaId === areaId);
            if (!areaAsignacionExists) {
                docenteAsignaciones.push({
                    id: `${grado}-${seccion}-${areaId}-${docenteId}`,
                    grado, seccion, areaId, rol: 'Docente'
                });
            }
            updatedDocentes[docenteIndex] = { ...updatedDocentes[docenteIndex], asignaciones: docenteAsignaciones };
        }
    }
    
    return updatedDocentes;
}
    