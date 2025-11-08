
import { HistorialAsistenciaRecord } from "@/hooks/use-historial-asistencia";
import { fullEstudiantesList } from "./alumnos-data";

function getRandomStatus(): HistorialAsistenciaRecord['status'] {
    const statuses: HistorialAsistenciaRecord['status'][] = ['presente', 'tarde', 'falta'];
    const hasPermiso = Math.random() < 0.05; // 5% de probabilidad de permiso
    if (hasPermiso) return 'permiso';
    return statuses[Math.floor(Math.random() * statuses.length)];
}

function generateHistoryForStudent(numeroDocumento: string): Omit<HistorialAsistenciaRecord, 'numeroDocumento'>[] {
    const history: Omit<HistorialAsistenciaRecord, 'numeroDocumento'>[] = [];
    const today = new Date();
    for (let i = 1; i <= 20; i++) { // generar 20 días de historial
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        // saltar fines de semana
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        history.push({
            fecha: date,
            status: getRandomStatus(),
        });
    }
    return history;
}

export const initialHistorialAsistencia: Omit<HistorialAsistenciaRecord, 'fecha'>[] = fullEstudiantesList.flatMap(estudiante => {
    const studentHistory = generateHistoryForStudent(estudiante.numeroDocumento);
    return studentHistory.map(h => ({
        ...h,
        numeroDocumento: estudiante.numeroDocumento,
        fecha: h.fecha.toISOString(), // Convertir a string para el mock
    }));
});
