import { google } from 'googleapis';
import { randomUUID } from 'crypto';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

const ASISTENCIAS_ESTUDIANTES_DATA_RANGE = 'AsistenciasEstudiantes!A2:L';
const ASISTENCIAS_ESTUDIANTES_APPEND_RANGE = 'AsistenciasEstudiantes!A:L';

/**
 * Obtiene el cliente autenticado de Google Sheets
 */
export async function getGoogleSheetsAuth() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Sheets credentials not configured. Check your .env.local file.');
  }

  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    credentials: {
      type: 'service_account',
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    },
  });

  return auth;
}

function buildPeruTimestamp() {
  return new Date().toISOString();
}

/**
 * Lee todas las asistencias de estudiantes desde la hoja unificada
 */
export async function readAsistencias(range: string = ASISTENCIAS_ESTUDIANTES_DATA_RANGE) {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
    }

    const auth = await getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueRenderOption: 'FORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    throw error;
  }
}

/**
 * Lee asistencias registradas por docentes (scope Aula) desde la hoja unificada
 */
export async function readAsistenciasDocentes() {
  const rows = await readAsistencias();
  return rows.filter(row => (row[8] ?? '').toString().trim().toUpperCase() === 'AULA');
}

/**
 * Escribe una asistencia registrada por un docente
 */
export async function writeAsistenciaDocente(asistencia: {
  estudianteId: string;
  nombreEstudiante: string;
  grado: string;
  seccion: string;
  fecha: string;
  status: 'presente' | 'tarde' | 'falta' | 'permiso';
  registradoPor: string;
  observaciones?: string;
  docenteId: string;
  docenteNombre: string;
}) {
  return writeAsistencia({
    estudianteId: asistencia.estudianteId,
    nombreEstudiante: asistencia.nombreEstudiante,
    grado: asistencia.grado,
    seccion: asistencia.seccion,
    fecha: asistencia.fecha,
    status: asistencia.status,
    registradoPor: asistencia.registradoPor,
    observaciones: asistencia.observaciones,
    scope: 'AULA',
    origenId: asistencia.docenteId,
  });
}

/**
 * Escribe múltiples asistencias registradas por docentes en batch
 */
export async function writeAsistenciasDocentesBatch(asistencias: Array<{
  estudianteId: string;
  nombreEstudiante: string;
  grado: string;
  seccion: string;
  fecha: string;
  status: 'presente' | 'tarde' | 'falta' | 'permiso';
  registradoPor: string;
  observaciones?: string;
  docenteId: string;
  docenteNombre: string;
}>) {
  return writeAsistenciasBatch(
    asistencias.map(a => ({
      estudianteId: a.estudianteId,
      nombreEstudiante: a.nombreEstudiante,
      grado: a.grado,
      seccion: a.seccion,
      fecha: a.fecha,
      status: a.status,
      registradoPor: a.registradoPor,
      observaciones: a.observaciones,
      scope: 'AULA',
      origenId: a.docenteId,
    })),
  );
}

/**
 * Lee asistencias de personal desde la hoja de cálculo
 */
export async function readAsistenciasPersonal(range: string = 'AsistenciaPersonal!A2:I') {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
    }

    const auth = await getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueRenderOption: 'FORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error reading personal asistencias from Google Sheets:', error);
    throw error;
  }
}

/**
 * Escribe una asistencia de personal
 */
export async function writeAsistenciaPersonal(asistencia: {
  personalId: string;
  nombrePersonal: string;
  cargo: string;
  fecha: string;
  status: 'presente' | 'tarde' | 'falta' | 'permiso';
  registradoPor: string;
  horasAfectadas?: string;
}) {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
    }

    const auth = await getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const now = new Date();
    const peruTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
    const timestamp = peruTime.toISOString();

    const values = [[
      asistencia.personalId,
      asistencia.nombrePersonal,
      asistencia.cargo ?? '',
      '',
      asistencia.fecha,
      asistencia.status,
      asistencia.registradoPor,
      asistencia.horasAfectadas || '',
      timestamp,
    ]];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'AsistenciaPersonal!A:I',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });

    return response.data;
  } catch (error) {
    console.error('Error writing personal asistencia to Google Sheets:', error);
    throw error;
  }
}

/**
 * Escribe múltiples asistencias de personal en batch
 */
export async function writeAsistenciasPersonalBatch(asistencias: Array<{
  personalId: string;
  nombrePersonal: string;
  cargo: string;
  fecha: string;
  status: 'presente' | 'tarde' | 'falta' | 'permiso';
  registradoPor: string;
  horasAfectadas?: string;
}>) {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
    }

    const auth = await getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const now = new Date();
    const peruTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
    const timestamp = peruTime.toISOString();

    const values = asistencias.map(a => [
      a.personalId,
      a.nombrePersonal,
      a.cargo ?? '',
      '',
      a.fecha,
      a.status,
      a.registradoPor,
      a.horasAfectadas || '',
      timestamp,
    ]);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'AsistenciaPersonal!A:I',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });

    return response.data;
  } catch (error) {
    console.error('Error writing personal asistencias batch to Google Sheets:', error);
    throw error;
  }
}

/**
 * Escribe una asistencia en la hoja de cálculo
 */
export async function writeAsistencia(asistencia: {
  estudianteId: string;
  nombreEstudiante: string;
  grado: string;
  seccion: string;
  fecha: string;
  status: 'presente' | 'tarde' | 'falta' | 'permiso';
  registradoPor: string;
  observaciones?: string;
  scope: 'IE' | 'AULA';
  origenId: string;
  uuid?: string;
}) {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
    }

    const auth = await getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const timestamp = buildPeruTimestamp();
    const uuid = asistencia.uuid ?? randomUUID();

    const values = [[
      asistencia.estudianteId,
      asistencia.nombreEstudiante,
      asistencia.grado,
      asistencia.seccion,
      asistencia.fecha,
      asistencia.status,
      asistencia.registradoPor,
      asistencia.observaciones || '',
      asistencia.scope,
      asistencia.origenId,
      timestamp,
      uuid,
    ]];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: ASISTENCIAS_ESTUDIANTES_APPEND_RANGE,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });

    return response.data;
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    throw error;
  }
}

/**
 * Escribe múltiples asistencias en batch
 */
export async function writeAsistenciasBatch(asistencias: Array<{
  estudianteId: string;
  nombreEstudiante: string;
  grado: string;
  seccion: string;
  fecha: string;
  status: 'presente' | 'tarde' | 'falta' | 'permiso';
  registradoPor: string;
  observaciones?: string;
  scope: 'IE' | 'AULA';
  origenId: string;
  uuid?: string;
}>) {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
    }

    const auth = await getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const timestamp = buildPeruTimestamp();

    const values = asistencias.map(a => [
      a.estudianteId,
      a.nombreEstudiante,
      a.grado,
      a.seccion,
      a.fecha,
      a.status,
      a.registradoPor,
      a.observaciones || '',
      a.scope,
      a.origenId,
      timestamp,
      a.uuid ?? randomUUID(),
    ]);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: ASISTENCIAS_ESTUDIANTES_APPEND_RANGE,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });

    return response.data;
  } catch (error) {
    console.error('Error writing batch to Google Sheets:', error);
    throw error;
  }
}
