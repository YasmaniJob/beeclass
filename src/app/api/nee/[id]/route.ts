import { NextResponse } from 'next/server';
import { deleteNeeEntry, listNeeEntries, NeePayload, upsertNeeEntry } from '@/server/googleSheets/nee';

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
  }

  try {
    const body = (await request.json()) as NeePayload | null;

    if (!body?.estudiante || !body.descripcion?.trim() || !body.registradoPor?.trim()) {
      return NextResponse.json(
        { message: 'Datos incompletos para actualizar la NEE' },
        { status: 400 }
      );
    }

    const entry = await upsertNeeEntry({
      ...body,
      descripcion: body.descripcion.trim(),
      documentoUrl: body.documentoUrl?.trim() || undefined,
    });

    return NextResponse.json(entry, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/nee/${id}`, error);
    const message = error instanceof Error ? error.message : 'Error al actualizar la NEE';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
  }

  try {
    const deleted = await deleteNeeEntry(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Registro NEE no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/nee/${id}`, error);
    const message = error instanceof Error ? error.message : 'Error al eliminar la NEE';
    return NextResponse.json({ message }, { status: 500 });
  }
}
