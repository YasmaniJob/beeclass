
import { Incidente } from './definitions';
import { fullEstudiantesList } from './alumnos-data';
import { initialDocentes } from './docentes-data';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const initialIncidentes: Omit<Incidente, 'id'>[] = [
    {
        sujeto: fullEstudiantesList[0], // ACUÑA TELLO, MAYLI MONICA
        fecha: yesterday,
        descripcion: 'No presentó la tarea de matemáticas asignada para la fecha.',
        reportadoPor: `${initialDocentes[0].nombres} ${initialDocentes[0].apellidoPaterno} (${initialDocentes[0].rol})`,
    },
    {
        sujeto: fullEstudiantesList[2], // GOMEZ PEREZ, JUAN CARLOS
        fecha: twoDaysAgo,
        descripcion: 'Conversó disruptivamente durante la clase de historia, interrumpiendo al docente y a sus compañeros.',
        reportadoPor: `${initialDocentes[1].nombres} ${initialDocentes[1].apellidoPaterno} (${initialDocentes[1].rol})`,
    },
     {
        sujeto: fullEstudiantesList[0], // ACUÑA TELLO, MAYLI MONICA
        fecha: twoDaysAgo,
        descripcion: 'Llegó 15 minutos tarde a la primera hora de clase.',
        reportadoPor: `${initialDocentes[4].nombres} ${initialDocentes[4].apellidoPaterno} (${initialDocentes[4].rol})`,
    },
];
