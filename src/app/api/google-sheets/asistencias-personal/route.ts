import { NextRequest, NextResponse } from 'next/server';
import { readAsistenciasPersonal, writeAsistenciaPersonal, writeAsistenciasPersonalBatch } from '@/lib/google-sheets';

/**
 * GET /api/google-sheets/asistencias-personal
 * Lee todas las asistencias de personal de Google Sheets
 */
export async function GET(request: NextRequest) {
  try {
    const asistencias = await readAsistenciasPersonal();
    return NextResponse.json({ success: true, data: asistencias });
  } catch (error) {
    console.error('Error reading asistencias personal:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al leer asistencias de personal' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/google-sheets/asistencias-personal
 * Guarda una o múltiples asistencias de personal en Google Sheets
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar si es un batch (array) o una sola asistencia
    if (Array.isArray(body)) {
      // Batch de asistencias
      const result = await writeAsistenciasPersonalBatch(body);
      return NextResponse.json({ 
        success: true, 
        data: result,
        count: body.length 
      });
    } else {
      // Una sola asistencia
      const { personalId, nombrePersonal, cargo, fecha, status, registradoPor, horasAfectadas } = body;

      if (!personalId || !nombrePersonal || !cargo || !fecha || !status || !registradoPor) {
        return NextResponse.json(
          { success: false, error: 'Faltan campos requeridos' },
          { status: 400 }
        );
      }

      const result = await writeAsistenciaPersonal({
        personalId,
        nombrePersonal,
        cargo,
        fecha,
        status,
        registradoPor,
        horasAfectadas,
      });

      return NextResponse.json({ success: true, data: result });
    }
  } catch (error) {
    console.error('Error writing asistencia personal:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al guardar asistencia de personal' 
      },
      { status: 500 }
    );
  }
}
