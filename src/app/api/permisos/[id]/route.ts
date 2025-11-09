import { NextResponse } from 'next/server';
import { updatePermiso, deletePermiso, PermisoPayload } from '@/server/googleSheets/permisos';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ message: 'Id de permiso no proporcionado' }, { status: 400 });
  }

  try {
    const body = (await request.json()) as PermisoPayload;

    if (!body?.estudiante || !body?.fechaInicio || !body?.motivo || !body?.registradoPor) {
      return NextResponse.json(
        { message: 'Datos incompletos para actualizar el permiso' },
        { status: 400 }
      );
    }

    const updated = await updatePermiso(id, body);
    if (!updated) {
      return NextResponse.json({ message: 'Permiso no encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT /api/permisos/:id', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar el permiso';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ message: 'Id de permiso no proporcionado' }, { status: 400 });
  }

  try {
    const deleted = await deletePermiso(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Permiso no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/permisos/:id', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar el permiso';
    return NextResponse.json({ message }, { status: 500 });
  }
}
