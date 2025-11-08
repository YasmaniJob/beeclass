import { NextResponse } from 'next/server';
import { createPermiso, listPermisos, PermisoPayload } from '@/server/googleSheets/permisos';

export async function GET() {
  try {
    const permisos = await listPermisos();
    return NextResponse.json(permisos, { status: 200 });
  } catch (error) {
    console.error('GET /api/permisos', error);
    if (
      error instanceof Error &&
      (error.message.includes('no está configurado') || error.message.includes('Credenciales'))
    ) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json({ message: 'Error al obtener permisos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PermisoPayload;

    if (!body?.estudiante || !body?.fechaInicio || !body?.motivo || !body?.registradoPor) {
      return NextResponse.json(
        { message: 'Datos incompletos para registrar el permiso' },
        { status: 400 }
      );
    }

    const permiso = await createPermiso(body);
    return NextResponse.json(permiso, { status: 201 });
  } catch (error) {
    console.error('POST /api/permisos', error);
    const message = error instanceof Error ? error.message : 'Error al crear el permiso';
    return NextResponse.json({ message }, { status: 500 });
  }
}
