
import { Calificacion, CalificacionCompetencia } from './definitions';
import { initialDocentes } from './docentes-data';

const docente1 = initialDocentes[0].numeroDocumento; // ANA MARIA GARCIA
const docente2 = initialDocentes[1].numeroDocumento; // CARLOS JAVIER MARTINEZ
const docente3 = initialDocentes[2].numeroDocumento; // ELENA PETROV
const docente4 = initialDocentes[3].numeroDocumento; // LUISA FERNANDA SANCHEZ
const docente5 = initialDocentes[4].numeroDocumento; // JORGE LUIS DIAZ
const docente6 = initialDocentes[5].numeroDocumento; // ISABEL CRISTINA FLORES
const docente7 = initialDocentes[7].numeroDocumento; // SOFIA VERONICA MENDOZA
const docente8 = initialDocentes[8].numeroDocumento; // MANUEL ALEJANDRO CASTILLO
const docente9 = initialDocentes[9].numeroDocumento; // GABRIELA LUCIA RUIZ
const docente10 = initialDocentes[10].numeroDocumento; // FERNANDO JOSE ORTEGA


// Este mock es ahora obsoleto, pero lo mantenemos para compatibilidad con la calificación de competencias transversales.
export const initialCalificacionesCompetencias: CalificacionCompetencia[] = [
    // --- Estudiante: ACUÑA TELLO, MAYLI MONICA (78065440) ---
    { 
        estudianteId: '78065440',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección A',
        fecha: new Date('2024-05-10T10:00:00Z'),
        competencia1: 'A',
        competencia2: 'A',
    },
    
    // --- Estudiante: APARCO MORENO, DAI YU LIONSKING (63761886) ---
    { 
        estudianteId: '63761886',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección A',
        fecha: new Date('2024-05-10T10:01:00Z'),
        competencia1: 'B',
        competencia2: 'A',
    },

    // --- Estudiante: GOMEZ PEREZ, JUAN CARLOS (71234567) ---
    { 
        estudianteId: '71234567',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección B',
        fecha: new Date('2024-05-11T11:00:00Z'),
        competencia1: 'A', 
        competencia2: 'AD',
    },
    { 
        estudianteId: '71234567',
        docenteId: docente8,
        grado: '1er Grado',
        seccion: 'Sección B',
        fecha: new Date('2024-05-11T11:05:00Z'),
        competencia1: 'A', 
        competencia2: 'A',
    },
    { 
        estudianteId: '71234567',
        docenteId: docente9,
        grado: '1er Grado',
        seccion: 'Sección B',
        fecha: new Date('2024-05-12T09:30:00Z'),
        competencia1: 'B', 
        competencia2: 'A',
    },


    // --- Estudiante: SMITH, JOHN (X1234567Z) ---
    { 
        estudianteId: 'X1234567Z',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección B',
        fecha: new Date('2024-05-11T11:02:00Z'),
        competencia1: 'B', 
        competencia2: 'C',
    },
    { 
        estudianteId: 'X1234567Z',
        docenteId: docente8,
        grado: '1er Grado',
        seccion: 'Sección B',
        fecha: new Date('2024-05-12T14:00:00Z'),
        competencia1: 'B', 
        competencia2: 'B',
    },
];

// Nuevo mock para calificaciones por área/competencia
export const initialCalificaciones: Omit<Calificacion, 'id'>[] = [
    // --- 1er Grado A ---
    // Estudiante: ACUÑA TELLO, MAYLI MONICA (78065440)
    {
        estudianteId: '78065440',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección A',
        areaId: 'p-mat',
        competenciaId: 'p-mat-c1',
        fecha: new Date('2024-05-10'),
        nota: 'A',
        sesionId: 'sesion-mat-1',
    },
    {
        estudianteId: '78065440',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección A',
        areaId: 'p-mat',
        competenciaId: 'p-mat-c1',
        fecha: new Date('2024-05-20'),
        nota: 'AD',
        sesionId: 'sesion-mat-3',
    },
    {
        estudianteId: '78065440',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección A',
        areaId: 'p-mat',
        competenciaId: 'p-mat-c2',
        fecha: new Date('2024-05-15'),
        nota: 'A',
        sesionId: 'sesion-mat-2',
    },
    // Estudiante: APARCO MORENO, DAI YU LIONSKING (63761886)
    {
        estudianteId: '63761886',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección A',
        areaId: 'p-mat',
        competenciaId: 'p-mat-c1',
        fecha: new Date('2024-05-10'),
        nota: 'B',
        sesionId: 'sesion-mat-1',
    },
     {
        estudianteId: '63761886',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección A',
        areaId: 'p-mat',
        competenciaId: 'p-mat-c1',
        fecha: new Date('2024-05-20'),
        nota: 'A',
        sesionId: 'sesion-mat-3',
    },
    {
        estudianteId: '63761886',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección A',
        areaId: 'p-com',
        competenciaId: 'p-com-c2',
        fecha: new Date('2024-05-12'),
        nota: 'B',
        sesionId: 'sesion-com-1',
    },

    // --- 1er Grado B ---
    // Estudiante: GOMEZ PEREZ, JUAN CARLOS (71234567)
    {
        estudianteId: '71234567',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección B',
        areaId: 'p-mat',
        competenciaId: 'p-mat-c1',
        fecha: new Date('2024-05-10'),
        nota: 'AD',
        sesionId: 'sesion-mat-1',
    },
     {
        estudianteId: '71234567',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección B',
        areaId: 'p-mat',
        competenciaId: 'p-mat-c2',
        fecha: new Date('2024-05-15'),
        nota: 'A',
        sesionId: 'sesion-mat-2',
    },
    // Estudiante: SMITH, JOHN (X1234567Z)
    {
        estudianteId: 'X1234567Z',
        docenteId: docente1,
        grado: '1er Grado',
        seccion: 'Sección B',
        areaId: 'p-mat',
        competenciaId: 'p-mat-c1',
        fecha: new Date('2024-05-20'),
        nota: 'C',
        sesionId: 'sesion-mat-3',
    },


    // DATOS TRANSVERSALES PARA 1RO B
    // Estudiante: GOMEZ PEREZ, JUAN CARLOS (71234567)
    {
        estudianteId: '71234567', 
        docenteId: docente1, // Tutor: ANA MARIA GARCIA
        grado: '1er Grado',
        seccion: 'Sección B',
        areaId: 't-primaria',
        competenciaId: 't-c1', // Gestiona su aprendizaje
        periodo: 'Bimestre 1',
        fecha: new Date('2024-05-12'),
        nota: 'A',
    },
    {
        estudianteId: '71234567', 
        docenteId: docente1, // Tutor: ANA MARIA GARCIA
        grado: '1er Grado',
        seccion: 'Sección B',
        areaId: 't-primaria',
        competenciaId: 't-c2', // Se desenvuelve en EV
        periodo: 'Bimestre 1',
        fecha: new Date('2024-05-12'),
        nota: 'AD',
    },
    {
        estudianteId: '71234567', 
        docenteId: docente7, // Docente de área: SOFIA VERONICA
        grado: '1er Grado',
        seccion: 'Sección B',
        areaId: 't-primaria',
        competenciaId: 't-c1', // Gestiona su aprendizaje
        periodo: 'Bimestre 1',
        fecha: new Date('2024-05-13'),
        nota: 'A',
    },
     // Estudiante: SMITH, JOHN (X1234567Z)
     {
        estudianteId: 'X1234567Z', 
        docenteId: docente1, // Tutor
        grado: '1er Grado',
        seccion: 'Sección B',
        areaId: 't-primaria',
        competenciaId: 't-c1',
        periodo: 'Bimestre 1',
        fecha: new Date('2024-05-12'),
        nota: 'B',
    },
     {
        estudianteId: 'X1234567Z', 
        docenteId: docente1, // Tutor
        grado: '1er Grado',
        seccion: 'Sección B',
        areaId: 't-primaria',
        competenciaId: 't-c2',
        periodo: 'Bimestre 1',
        fecha: new Date('2024-05-12'),
        nota: 'C',
    },
];
