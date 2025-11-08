'use server';

import { Estudiante, NeeEntry } from '@/lib/definitions';

// Columnas esperadas en la hoja "NEE":
// A:id | B:numeroDocumento | C:apellidoPaterno | D:apellidoMaterno | E:nombres
// F:grado | G:seccion | H:descripcion | I:documentoUrl | J:registradoPor | K:updatedAt
const NEE_RANGE = 'NEE!A:K';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

interface GoogleSheetsNeeRow {
  id: string;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  grado?: string;
  seccion?: string;
  descripcion: string;
  documentoUrl: string;
  registradoPor: string;
  updatedAt: string;
}

export interface NeePayload {
  estudiante: Estudiante;
  descripcion: string;
  documentoUrl?: string | null;
  registradoPor: string;
}

type SheetsClient = Awaited<ReturnType<typeof initializeSheetsClient>>;

let sheetsClientPromise: Promise<SheetsClient> | null = null;

function getSpreadsheetId(): string {
  const spreadsheetId =
    process.env.GOOGLE_SHEETS_NEE_SPREADSHEET_ID ||
    process.env.GOOGLE_SHEETS_PERMISOS_SPREADSHEET_ID ||
    process.env.GOOGLE_SHEETS_INCIDENTES_SPREADSHEET_ID ||
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error(
      'GOOGLE_SHEETS_NEE_SPREADSHEET_ID no está configurado (ni las variables de respaldo)'
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

function rowFromEntry(entry: NeeEntry): GoogleSheetsNeeRow {
  const estudiante = entry.estudiante;
  return {
    id: entry.id,
    numeroDocumento: estudiante.numeroDocumento,
    apellidoPaterno: estudiante.apellidoPaterno,
    apellidoMaterno: estudiante.apellidoMaterno ?? '',
    nombres: estudiante.nombres,
    grado: estudiante.grado ?? '',
    seccion: estudiante.seccion ?? '',
    descripcion: entry.descripcion,
    documentoUrl: entry.documentoUrl ?? '',
    registradoPor: entry.registradoPor,
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function valuesToRow(values: string[]): GoogleSheetsNeeRow | null {
  if (!values || values.length === 0) {
    return null;
  }

  if (values[0] === 'DELETED') {
    return null;
  }

  return {
    id: values[0] ?? '',
    numeroDocumento: values[1] ?? '',
    apellidoPaterno: values[2] ?? '',
    apellidoMaterno: values[3] ?? '',
    nombres: values[4] ?? '',
    grado: values[5] ?? '',
    seccion: values[6] ?? '',
    descripcion: values[7] ?? '',
    documentoUrl: values[8] ?? '',
    registradoPor: values[9] ?? '',
    updatedAt: values[10] ?? new Date().toISOString(),
  };
}

function rowToValues(row: GoogleSheetsNeeRow): (string | null)[] {
  return [
    row.id,
    row.numeroDocumento,
    row.apellidoPaterno,
    row.apellidoMaterno ?? '',
    row.nombres,
    row.grado ?? '',
    row.seccion ?? '',
    row.descripcion,
    row.documentoUrl,
    row.registradoPor,
    row.updatedAt,
  ];
}

function entryFromRow(row: GoogleSheetsNeeRow): NeeEntry {
  return {
    id: row.id,
    estudiante: {
      tipoDocumento: 'DNI',
      numeroDocumento: row.numeroDocumento,
      apellidoPaterno: row.apellidoPaterno,
      apellidoMaterno: row.apellidoMaterno || undefined,
      nombres: row.nombres,
      grado: row.grado || undefined,
      seccion: row.seccion || undefined,
    },
    descripcion: row.descripcion,
    documentoUrl: row.documentoUrl || undefined,
    registradoPor: row.registradoPor,
    updatedAt: new Date(row.updatedAt),
  };
}

export async function listNeeEntries(): Promise<NeeEntry[]> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: NEE_RANGE,
      valueRenderOption: 'FORMATTED_VALUE',
    });

    const rows = response.data.values ?? [];
    const [, ...dataRows] = rows;

    return dataRows
      .map(valuesToRow)
      .filter((row): row is GoogleSheetsNeeRow => row !== null)
      .map(entryFromRow)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('listNeeEntries error:', error);
    if (
      error instanceof Error &&
      (
        error.message.includes('Unable to parse range') ||
        error.message.includes('Requested entity was not found')
      )
    ) {
      return [];
    }
    throw error;
  }
}

export async function upsertNeeEntry(payload: NeePayload): Promise<NeeEntry> {
  const { sheets, spreadsheetId } = await getSheetsClient();

  const rowsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: NEE_RANGE,
    valueRenderOption: 'FORMATTED_VALUE',
  });

  const rows = rowsResponse.data.values ?? [];
  const headerOffset = 1;
  const rowIndex = rows.findIndex(row => row[1] === payload.estudiante.numeroDocumento);

  const numeroDocumento = payload.estudiante.numeroDocumento.trim();

  const entry: NeeEntry = {
    id: numeroDocumento,
    estudiante: { ...payload.estudiante, numeroDocumento },
    descripcion: payload.descripcion,
    documentoUrl: payload.documentoUrl?.trim() || undefined,
    registradoPor: payload.registradoPor,
    updatedAt: new Date(),
  };

  const row = rowFromEntry(entry);

  if (rowIndex === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: NEE_RANGE,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowToValues(row)],
      },
    });
  } else {
    const rowNumber = rowIndex + headerOffset;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `NEE!A${rowNumber}:K${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowToValues(row)],
      },
    });
  }

  return entry;
}

export async function deleteNeeEntry(id: string): Promise<boolean> {
  const { sheets, spreadsheetId } = await getSheetsClient();

  const rowsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: NEE_RANGE,
    valueRenderOption: 'FORMATTED_VALUE',
  });

  const rows = rowsResponse.data.values ?? [];
  const headerOffset = 1;
  const rowIndex = rows.findIndex(row => row[0] === id);

  if (rowIndex === -1) {
    return false;
  }

  const rowNumber = rowIndex + headerOffset;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `NEE!A${rowNumber}:K${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['DELETED', '', '', '', '', '', '', '', '', '', '']],
    },
  });

  return true;
}
