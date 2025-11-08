// src/infrastructure/adapters/google-sheets/AsistenciaGoogleSheetsService.ts
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export interface AsistenciaGoogleSheetsConfig {
  spreadsheetId: string;
  credentials: {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
  };
}

export class AsistenciaGoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor(config: AsistenciaGoogleSheetsConfig) {
    this.spreadsheetId = config.spreadsheetId;
    this.initializeAuth(config.credentials);
  }

  private async initializeAuth(credentials: AsistenciaGoogleSheetsConfig['credentials']) {
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async readAsistencias(range: string = 'Asistencias!A2:I'): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING',
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Error reading from Google Sheets:', error);
      return [];
    }
  }

  async writeAsistencia(data: {
    estudianteId: string;
    nombreEstudiante: string;
    grado: string;
    seccion: string;
    fecha: string;
    estado: string;
    registradoPor: string;
    observaciones?: string;
  }, range: string = 'Asistencias!A2:I'): Promise<boolean> {
    try {
      // Obtener timestamp en zona horaria de Perú (UTC-5)
      const now = new Date();
      const peruTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
      const timestamp = peruTime.toISOString();
      
      const values = [[
        data.estudianteId,        // A: Estudiante ID
        data.nombreEstudiante,    // B: Nombre Estudiante
        data.grado,               // C: Grado
        data.seccion,             // D: Sección
        data.fecha,               // E: Fecha
        data.estado,              // F: Estado
        data.registradoPor,       // G: Registrado Por
        data.observaciones || '', // H: Observaciones
        timestamp                 // I: Timestamp
      ]];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
      });

      return true;
    } catch (error) {
      console.error('Error writing to Google Sheets:', error);
      return false;
    }
  }

  async updateAsistencia(id: string, data: {
    estado?: string;
    observaciones?: string;
  }, range: string = 'Asistencias!A2:I'): Promise<boolean> {
    try {
      // Primero leer todas las asistencias para encontrar la fila
      const asistencias = await this.readAsistencias(range);

      // Buscar la fila por estudianteId y fecha (ya no hay ID único)
      let rowIndex = -1;
      for (let i = 0; i < asistencias.length; i++) {
        // Buscar por estudianteId (columna A) y fecha (columna E)
        if (asistencias[i][0] === id) {
          rowIndex = i + 2; // +2 porque empezamos desde A2 y arrays son 0-based
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error('Asistencia not found');
      }

      // Actualizar solo estado y observaciones
      const updateRange = `Asistencias!F${rowIndex}:H${rowIndex}`; // Estado, Registrado Por, Observaciones

      const currentValues = asistencias[rowIndex - 2];
      
      // Obtener timestamp en zona horaria de Perú (UTC-5)
      const now = new Date();
      const peruTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
      const timestamp = peruTime.toISOString();
      
      const values = [
        data.estado || currentValues[5], // F: Estado
        currentValues[6], // G: RegistradoPor (no cambiar)
        data.observaciones || currentValues[7] || '' // H: Observaciones
      ];

      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: updateRange,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [values] },
      });

      return true;
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
      return false;
    }
  }

  async deleteAsistencia(id: string, range: string = 'Asistencias!A2:I'): Promise<boolean> {
    try {
      // En Google Sheets no se pueden eliminar filas fácilmente
      // En su lugar, marcar como "ELIMINADO" en el estado
      return this.updateAsistencia(id, { estado: 'ELIMINADO' }, range);
    } catch (error) {
      console.error('Error deleting from Google Sheets:', error);
      return false;
    }
  }

  async readIncidentes(range: string = 'Incidentes!A2:G'): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING',
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Error reading incidentes from Google Sheets:', error);
      return [];
    }
  }

  async writeIncidente(data: {
    estudianteId: string;
    fecha: string;
    descripcion: string;
    reportadoPor: string;
    seguimiento?: string;
    id?: string;
  }, range: string = 'Incidentes!A2:G'): Promise<boolean> {
    try {
      const values = [[
        data.id || crypto.randomUUID(),
        data.estudianteId,
        data.fecha,
        data.descripcion,
        data.reportadoPor,
        data.seguimiento || '',
        new Date().toISOString()
      ]];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
      });

      return true;
    } catch (error) {
      console.error('Error writing incidente to Google Sheets:', error);
      return false;
    }
  }

  async readPermisos(range: string = 'Permisos!A2:G'): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING',
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Error reading permisos from Google Sheets:', error);
      return [];
    }
  }

  async writePermiso(data: {
    estudianteId: string;
    fechaInicio: string;
    fechaFin: string;
    motivo: string;
    registradoPor: string;
    id?: string;
  }, range: string = 'Permisos!A2:G'): Promise<boolean> {
    try {
      const values = [[
        data.id || crypto.randomUUID(),
        data.estudianteId,
        data.fechaInicio,
        data.fechaFin,
        data.motivo,
        data.registradoPor,
        new Date().toISOString()
      ]];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
      });

      return true;
    } catch (error) {
      console.error('Error writing permiso to Google Sheets:', error);
      return false;
    }
  }

  async readCalificaciones(range: string = 'Calificaciones!A2:I'): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING',
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Error reading calificaciones from Google Sheets:', error);
      return [];
    }
  }

  async writeCalificacion(data: {
    estudianteId: string;
    docenteId: string;
    areaId: string;
    competenciaId: string;
    grado: string;
    seccion: string;
    periodo?: string;
    fecha: string;
    nota: string;
    id?: string;
  }, range: string = 'Calificaciones!A2:I'): Promise<boolean> {
    try {
      const values = [[
        data.id || crypto.randomUUID(),
        data.estudianteId,
        data.docenteId,
        data.areaId,
        data.competenciaId,
        data.grado,
        data.seccion,
        data.periodo || '',
        data.fecha,
        data.nota
      ]];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
      });

      return true;
    } catch (error) {
      console.error('Error writing calificacion to Google Sheets:', error);
      return false;
    }
  }
}
