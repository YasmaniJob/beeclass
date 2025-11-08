import { NextRequest, NextResponse } from 'next/server';
import { readAsistencias, writeAsistencia, writeAsistenciasBatch } from '@/lib/google-sheets';

/**
 * GET /api/google-sheets/asistencias
 * Lee todas las asistencias de Google Sheets
 */
export async function GET(request: NextRequest) {
  try {
    const scopeParam = request.nextUrl.searchParams.get('scope');
    const asistencias = await readAsistencias();
    const data = scopeParam
      ? asistencias.filter(row => (row[8] ?? '').toString().trim().toUpperCase() === scopeParam.toUpperCase())
      : asistencias;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error reading asistencias:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al leer asistencias' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/google-sheets/asistencias
 * Guarda una o múltiples asistencias en Google Sheets
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar si es un batch (array) o una sola asistencia
    if (Array.isArray(body)) {
      const normalized = body.map(item => {
        const scope = (item.scope ?? 'IE').toUpperCase();
        if (scope !== 'IE' && scope !== 'AULA') {
          throw new Error(`Scope inválido: ${scope}`);
        }

        const origenId = item.origenId ?? item.registradoPor ?? '';
        if (!origenId) {
          throw new Error('Falta origenId en batch de asistencias');
        }

        return {
          ...item,
          scope,
          origenId,
        };
      });

      const result = await writeAsistenciasBatch(normalized);
      return NextResponse.json({ 
        success: true, 
        data: result,
        count: normalized.length 
      });
    } else {
      // Una sola asistencia
      const {
        estudianteId,
        nombreEstudiante,
        grado,
        seccion,
        fecha,
        status,
        registradoPor,
        observaciones,
        scope: rawScope,
        origenId: rawOrigenId,
        uuid,
      } = body;

      if (!estudianteId || !nombreEstudiante || !grado || !seccion || !fecha || !status || !registradoPor) {
        return NextResponse.json(
          { success: false, error: 'Faltan campos requeridos' },
          { status: 400 }
        );
      }

      const scope = (rawScope ?? 'IE').toUpperCase();
      if (scope !== 'IE' && scope !== 'AULA') {
        return NextResponse.json(
          { success: false, error: `Scope inválido: ${scope}` },
          { status: 400 }
        );
      }

      const origenId = rawOrigenId ?? registradoPor;
      if (!origenId) {
        return NextResponse.json(
          { success: false, error: 'Falta origenId para la asistencia' },
          { status: 400 }
        );
      }

      const result = await writeAsistencia({
        estudianteId,
        nombreEstudiante,
        grado,
        seccion,
        fecha,
        status,
        registradoPor,
        observaciones,
        scope,
        origenId,
        uuid,
      });

      return NextResponse.json({ success: true, data: result });
    }
  } catch (error) {
    console.error('Error writing asistencia:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al guardar asistencia' 
      },
      { status: 500 }
    );
  }
}
