import { NextResponse } from 'next/server';
import { deleteIncidente, updateIncidente, IncidentePayload } from '@/server/googleSheets/incidentes';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = (await request.json()) as IncidentePayload;

    if (!body?.sujeto || !body?.fecha || !body?.descripcion || !body?.reportadoPor) {
      return NextResponse.json({ message: 'Datos incompletos para actualizar el incidente' }, { status: 400 });
    }

    const updated = await updateIncidente(params.id, body);

    if (!updated) {
      return NextResponse.json({ message: 'Incidente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/incidentes/${params.id}`, error);
    return NextResponse.json({ message: 'Error al actualizar incidente' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const removed = await deleteIncidente(params.id);

    if (!removed) {
      return NextResponse.json({ message: 'Incidente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/incidentes/${params.id}`, error);
    return NextResponse.json({ message: 'Error al eliminar incidente' }, { status: 500 });
  }
}
