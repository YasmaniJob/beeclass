'use server';

import { Permiso, Estudiante } from '@/lib/definitions';

// Columnas esperadas en la hoja "Permisos":
// A:id | B:numeroDocumento | C:apellidoPaterno | D:apellidoMaterno | E:nombres
// F:grado | G:seccion | H:fechaInicio | I:fechaFin | J:motivo | K:documentoUrl
// L:registradoPor | M:createdAt | N:updatedAt
const PERMISOS_RANGE = 'Permisos!A:N';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

interface GoogleSheetsPermisoRow {
  id: string;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  grado?: string;
  seccion?: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  documentoUrl: string;
  registradoPor: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermisoPayload {
  estudiante: Estudiante;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  documentoUrl?: string | null;
  registradoPor: string;
}

type SheetsClient = Awaited<ReturnType<typeof initializeSheetsClient>>;

let sheetsClientPromise: Promise<SheetsClient> | null = null;

function getSpreadsheetId(): string {
  const spreadsheetId =
    process.env.GOOGLE_SHEETS_PERMISOS_SPREADSHEET_ID ||
    process.env.GOOGLE_SHEETS_INCIDENTES_SPREADSHEET_ID ||
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error(
      'GOOGLE_SHEETS_PERMISOS_SPREADSHEET_ID no está configurado (y tampoco las variables de respaldo)'
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

function permisoFromRow(row: GoogleSheetsPermisoRow): Permiso {
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
    fechaInicio: new Date(row.fechaInicio),
    fechaFin: new Date(row.fechaFin),
    motivo: row.motivo,
    documento: row.documentoUrl || undefined,
    registradoPor: row.registradoPor,
  };
}

function rowFromPermiso(
  permiso: Permiso,
  options?: { createdAt?: string }
): GoogleSheetsPermisoRow {
  const estudiante = permiso.estudiante;
  return {
    id: permiso.id,
    numeroDocumento: estudiante.numeroDocumento,
    apellidoPaterno: estudiante.apellidoPaterno,
    apellidoMaterno: estudiante.apellidoMaterno ?? '',
    nombres: estudiante.nombres,
    grado: estudiante.grado ?? '',
    seccion: estudiante.seccion ?? '',
    fechaInicio: permiso.fechaInicio.toISOString(),
    fechaFin: permiso.fechaFin.toISOString(),
    motivo: permiso.motivo,
    documentoUrl: permiso.documento ?? '',
    registradoPor: permiso.registradoPor,
    createdAt: options?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function valuesToRow(values: string[]): GoogleSheetsPermisoRow | null {
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
    fechaInicio: values[7] ?? new Date().toISOString(),
    fechaFin: values[8] ?? values[7] ?? new Date().toISOString(),
    motivo: values[9] ?? '',
    documentoUrl: values[10] ?? '',
    registradoPor: values[11] ?? '',
    createdAt: values[12] ?? new Date().toISOString(),
    updatedAt: values[13] ?? new Date().toISOString(),
  };
}

function rowToValues(row: GoogleSheetsPermisoRow): (string | null)[] {
  return [
    row.id,
    row.numeroDocumento,
    row.apellidoPaterno,
    row.apellidoMaterno ?? '',
    row.nombres,
    row.grado ?? '',
    row.seccion ?? '',
    row.fechaInicio,
    row.fechaFin,
    row.motivo,
    row.documentoUrl,
    row.registradoPor,
    row.createdAt,
    row.updatedAt,
  ];
}

export async function listPermisos(): Promise<Permiso[]> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: PERMISOS_RANGE,
      valueRenderOption: 'FORMATTED_VALUE',
    });

    const rows = response.data.values ?? [];
    const [, ...dataRows] = rows;

    return dataRows
      .map(valuesToRow)
      .filter((row): row is GoogleSheetsPermisoRow => row !== null)
      .map(permisoFromRow)
      .sort((a, b) => b.fechaInicio.getTime() - a.fechaInicio.getTime());
  } catch (error) {
    console.error('listPermisos error:', error);
    if (
      error instanceof Error &&
      (
        error.message.includes('Unable to parse range') ||
        error.message.includes('Requested entity was not found') ||
        error.message.includes('PERMISOS')
      )
    ) {
      return [];
    }
    throw error;
  }
}

export async function createPermiso(payload: PermisoPayload): Promise<Permiso> {
  const { sheets, spreadsheetId } = await getSheetsClient();

  const fechaInicio = new Date(payload.fechaInicio);
  const fechaFin = payload.fechaFin ? new Date(payload.fechaFin) : fechaInicio;
  const permiso: Permiso = {
    id: `${payload.estudiante.numeroDocumento}-${Date.now()}`,
    estudiante: payload.estudiante,
    fechaInicio,
    fechaFin,
    motivo: payload.motivo,
    documento: payload.documentoUrl?.trim() || undefined,
    registradoPor: payload.registradoPor,
  };

  const row = rowFromPermiso(permiso);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: PERMISOS_RANGE,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [rowToValues(row)],
    },
  });

  return permiso;
}

export async function updatePermiso(id: string, payload: PermisoPayload): Promise<Permiso | null> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: PERMISOS_RANGE,
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

  const fechaInicio = new Date(payload.fechaInicio);
  const fechaFin = payload.fechaFin ? new Date(payload.fechaFin) : fechaInicio;

  const updatedPermiso: Permiso = {
    id,
    estudiante: payload.estudiante,
    fechaInicio,
    fechaFin,
    motivo: payload.motivo,
    documento: payload.documentoUrl?.trim() || undefined,
    registradoPor: payload.registradoPor,
  };

  const updatedRow = rowFromPermiso(updatedPermiso, { createdAt: existingRow.createdAt });

  const rowNumber = rowIndex + headerOffset;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Permisos!A${rowNumber}:N${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowToValues(updatedRow)],
    },
  });

  return updatedPermiso;
}

export async function deletePermiso(id: string): Promise<boolean> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: PERMISOS_RANGE,
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
    range: `Permisos!A${rowNumber}:N${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['DELETED', '', '', '', '', '', '', '', '', '', '', '', '', '']],
    },
  });

  return true;
}
