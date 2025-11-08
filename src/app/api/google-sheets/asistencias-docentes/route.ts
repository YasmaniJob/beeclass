import { NextRequest, NextResponse } from 'next/server';
import { readAsistenciasDocentes, writeAsistenciaDocente, writeAsistenciasDocentesBatch } from '@/lib/google-sheets';

/**
 * GET /api/google-sheets/asistencias-docentes
 * Lee las asistencias registradas por docentes en Google Sheets
 */
export async function GET() {
  try {
    const asistencias = await readAsistenciasDocentes();
    return NextResponse.json({ success: true, data: asistencias });
  } catch (error) {
    console.error('Error reading docentes asistencias:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al leer asistencias de docentes',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/google-sheets/asistencias-docentes
 * Guarda una o múltiples asistencias de docentes en Google Sheets
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      const result = await writeAsistenciasDocentesBatch(body);
      return NextResponse.json({ success: true, data: result, count: body.length });
    }

    const {
      estudianteId,
      nombreEstudiante,
      grado,
      seccion,
      fecha,
      status,
      registradoPor,
      observaciones,
      docenteId,
      docenteNombre,
    } = body;

    if (
      !estudianteId ||
      !nombreEstudiante ||
      !grado ||
      !seccion ||
      !fecha ||
      !status ||
      !registradoPor ||
      !docenteId ||
      !docenteNombre
    ) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos para registrar asistencia de docente' },
        { status: 400 },
      );
    }

    const result = await writeAsistenciaDocente({
      estudianteId,
      nombreEstudiante,
      grado,
      seccion,
      fecha,
      status,
      registradoPor,
      observaciones,
      docenteId,
      docenteNombre,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error writing docente asistencia:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al guardar asistencia de docente',
      },
      { status: 500 },
    );
  }
}
