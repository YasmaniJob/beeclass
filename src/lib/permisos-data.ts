
import { Permiso } from './definitions';
import { fullEstudiantesList } from './alumnos-data';
import { initialDocentes } from './docentes-data';

// Esto es solo para tener datos iniciales.
// En una aplicación real, estos datos vendrían de una base de datos.
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);


export const initialPermisos: Omit<Permiso, 'id'>[] = [
    {
        estudiante: fullEstudiantesList[0], // ACUÑA TELLO, MAYLI MONICA
        fechaInicio: today,
        fechaFin: today,
        motivo: 'Cita médica odontológica. Se adjunta constancia.',
        documento: 'constancia_medica_mayli.pdf',
        registradoPor: `${initialDocentes[3].nombres} ${initialDocentes[3].apellidoPaterno} (${initialDocentes[3].rol})`,
    },
    {
        estudiante: fullEstudiantesList[2], // GOMEZ PEREZ, JUAN CARLOS
        fechaInicio: yesterday,
        fechaFin: tomorrow,
        motivo: 'Viaje familiar de emergencia por motivos de salud de un pariente.',
        documento: 'pasajes_juan.pdf',
        registradoPor: `${initialDocentes[4].nombres} ${initialDocentes[4].apellidoPaterno} (${initialDocentes[4].rol})`,
    },
];
