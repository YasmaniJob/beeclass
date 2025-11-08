import { NextResponse } from 'next/server';
import { listNeeEntries, NeePayload, upsertNeeEntry } from '@/server/googleSheets/nee';

export async function GET() {
  try {
    const entries = await listNeeEntries();
    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error('GET /api/nee', error);
    if (
      error instanceof Error &&
      (error.message.includes('no está configurado') || error.message.includes('Credenciales'))
    ) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json({ message: 'Error al obtener registros NEE' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NeePayload | null;

    if (!body?.estudiante || !body.descripcion?.trim() || !body.registradoPor?.trim()) {
      return NextResponse.json(
        { message: 'Datos incompletos para registrar la NEE' },
        { status: 400 }
      );
    }

    const entry = await upsertNeeEntry({
      ...body,
      descripcion: body.descripcion.trim(),
      documentoUrl: body.documentoUrl?.trim() || undefined,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('POST /api/nee', error);
    const message = error instanceof Error ? error.message : 'Error al guardar la NEE';
    return NextResponse.json({ message }, { status: 500 });
  }
}
