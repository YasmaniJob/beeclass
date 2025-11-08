'use server';

import { Incidente, SujetoIncidente } from '@/lib/definitions';

const INCIDENTES_RANGE = 'Incidentes!A:M';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

interface GoogleSheetsIncidenteRow {
  id: string;
  tipoSujeto: 'estudiante' | 'personal';
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  grado?: string;
  seccion?: string;
  fecha: string;
  descripcion: string;
  reportadoPor: string;
  createdAt: string;
  updatedAt: string;
}

interface IncidentePayload {
  sujeto: SujetoIncidente;
  fecha: string;
  descripcion: string;
  reportadoPor: string;
}

type SheetsClient = Awaited<ReturnType<typeof initializeSheetsClient>>;

let sheetsClientPromise: Promise<SheetsClient> | null = null;

function getSpreadsheetId(): string {
  const spreadsheetId =
    process.env.GOOGLE_SHEETS_INCIDENTES_SPREADSHEET_ID ||
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error(
      'GOOGLE_SHEETS_INCIDENTES_SPREADSHEET_ID no está configurado (y GOOGLE_SHEETS_SPREADSHEET_ID tampoco)'
    );
  }

  return spreadsheetId;
}

async function initializeSheetsClient() {
  const { google } = await import('googleapis');

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('Credenciales de Google Service Account no configuradas');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });

  await auth.authorize();

  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, spreadsheetId: getSpreadsheetId() };
}

async function getSheetsClient() {
  if (!sheetsClientPromise) {
    sheetsClientPromise = initializeSheetsClient();
  }
  return sheetsClientPromise;
}

function sujetoFromRow(row: GoogleSheetsIncidenteRow): SujetoIncidente {
  const base = {
    tipoDocumento: 'DNI' as const,
    numeroDocumento: row.numeroDocumento,
    apellidoPaterno: row.apellidoPaterno,
    apellidoMaterno: row.apellidoMaterno || undefined,
    nombres: row.nombres,
  };

  if (row.tipoSujeto === 'personal') {
    return base;
  }

  return {
    ...base,
    grado: row.grado || undefined,
    seccion: row.seccion || undefined,
  };
}

function rowFromIncidente(
  incidente: Incidente,
  options?: { createdAt?: string }
): GoogleSheetsIncidenteRow {
  const sujeto = incidente.sujeto;
  const esEstudiante = Boolean((sujeto as any)?.grado);

  return {
    id: incidente.id,
    tipoSujeto: esEstudiante ? 'estudiante' : 'personal',
    numeroDocumento: sujeto.numeroDocumento,
    apellidoPaterno: sujeto.apellidoPaterno,
    apellidoMaterno: sujeto.apellidoMaterno ?? '',
    nombres: sujeto.nombres,
    grado: esEstudiante ? ((sujeto as any).grado ?? '') : '',
    seccion: esEstudiante ? ((sujeto as any).seccion ?? '') : '',
    fecha: incidente.fecha.toISOString(),
    descripcion: incidente.descripcion,
    reportadoPor: incidente.reportadoPor,
    createdAt: options?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function incidenciaFromRow(row: GoogleSheetsIncidenteRow): Incidente {
  return {
    id: row.id,
    sujeto: sujetoFromRow(row),
    fecha: new Date(row.fecha),
    descripcion: row.descripcion,
    reportadoPor: row.reportadoPor,
  };
}

function valuesToRow(values: string[]): GoogleSheetsIncidenteRow | null {
  if (!values || values.length === 0) {
    return null;
  }

  if (values[0] === 'DELETED') {
    return null;
  }

  return {
    id: values[0] ?? '',
    tipoSujeto: (values[1] as 'estudiante' | 'personal') ?? 'estudiante',
    numeroDocumento: values[2] ?? '',
    apellidoPaterno: values[3] ?? '',
    apellidoMaterno: values[4] ?? '',
    nombres: values[5] ?? '',
    grado: values[6] ?? '',
    seccion: values[7] ?? '',
    fecha: values[8] ?? new Date().toISOString(),
    descripcion: values[9] ?? '',
    reportadoPor: values[10] ?? '',
    createdAt: values[11] ?? new Date().toISOString(),
    updatedAt: values[12] ?? new Date().toISOString(),
  };
}

function rowToValues(row: GoogleSheetsIncidenteRow): (string | null)[] {
  return [
    row.id,
    row.tipoSujeto,
    row.numeroDocumento,
    row.apellidoPaterno,
    row.apellidoMaterno ?? '',
    row.nombres,
    row.grado ?? '',
    row.seccion ?? '',
    row.fecha,
    row.descripcion,
    row.reportadoPor,
    row.createdAt,
    row.updatedAt,
  ];
}

export async function listIncidentes(): Promise<Incidente[]> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: INCIDENTES_RANGE,
    valueRenderOption: 'FORMATTED_VALUE',
  });

  const rows = response.data.values ?? [];
  const [, ...dataRows] = rows;

  return dataRows
    .map(valuesToRow)
    .filter((row): row is GoogleSheetsIncidenteRow => row !== null)
    .map(incidenciaFromRow)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

export async function createIncidente(payload: IncidentePayload): Promise<Incidente> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const incidente: Incidente = {
      id: payload.sujeto.numeroDocumento,
      sujeto: payload.sujeto,
      fecha: new Date(payload.fecha),
      descripcion: payload.descripcion,
      reportadoPor: payload.reportadoPor,
    };

    const row = rowFromIncidente(incidente);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: INCIDENTES_RANGE,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowToValues(row)],
      },
    });

    return incidente;
  } catch (error) {
    console.error('createIncidente error:', error);
    throw error;
  }
}

export async function updateIncidente(id: string, payload: IncidentePayload): Promise<Incidente | null> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: INCIDENTES_RANGE,
    valueRenderOption: 'FORMATTED_VALUE',
  });

  const rows = response.data.values ?? [];
  const headerOffset = 1;
  const rowIndex = rows.findIndex(row => row[0] === id);

  if (rowIndex === -1) {
    return null;
  }

  const existingRow = valuesToRow(rows[rowIndex]);
  if (!existingRow) {
    return null;
  }

  const updated = rowFromIncidente(
    {
      id,
      sujeto: payload.sujeto,
      fecha: new Date(payload.fecha),
      descripcion: payload.descripcion,
      reportadoPor: payload.reportadoPor,
    },
    { createdAt: existingRow.createdAt }
  );

  const rowNumber = rowIndex + headerOffset;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Incidentes!A${rowNumber}:M${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowToValues(updated)],
    },
  });

  return incidenciaFromRow(updated);
}

export async function deleteIncidente(id: string): Promise<boolean> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: INCIDENTES_RANGE,
    valueRenderOption: 'FORMATTED_VALUE',
  });

  const rows = response.data.values ?? [];
  const headerOffset = 1;
  const rowIndex = rows.findIndex(row => row[0] === id);

  if (rowIndex === -1) {
    return false;
  }

  const rowNumber = rowIndex + headerOffset;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Incidentes!A${rowNumber}:M${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['DELETED', '', '', '', '', '', '', '', '', '', '', '', '']],
    },
  });

  return true;
}

export type { IncidentePayload };
