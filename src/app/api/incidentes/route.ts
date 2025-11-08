import { NextResponse } from 'next/server';
import { createIncidente, listIncidentes, IncidentePayload } from '@/server/googleSheets/incidentes';

export async function GET() {
  try {
    const incidentes = await listIncidentes();
    return NextResponse.json(incidentes, { status: 200 });
  } catch (error) {
    console.error('GET /api/incidentes', error);
    if (error instanceof Error && (
      error.message.includes('no está configurado') ||
      error.message.includes('Credenciales')
    )) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json({ message: 'Error al obtener incidentes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IncidentePayload;

    if (!body?.sujeto || !body?.fecha || !body?.descripcion || !body?.reportadoPor) {
      return NextResponse.json({ message: 'Datos incompletos para crear el incidente' }, { status: 400 });
    }

    const incidente = await createIncidente(body);
    return NextResponse.json(incidente, { status: 201 });
  } catch (error) {
    console.error('POST /api/incidentes', error);
    const message = error instanceof Error ? error.message : 'Error al crear el incidente';
    return NextResponse.json({ message }, { status: 500 });
  }
}
