// src/infrastructure/adapters/GoogleSheetsService.ts
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export interface GoogleSheetsConfig {
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

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private readonly defaultRange = 'Asistencias!A:I';

  constructor(config: GoogleSheetsConfig) {
    this.spreadsheetId = config.spreadsheetId;

    // Configurar autenticación
    const auth = new JWT({
      email: config.credentials.client_email,
      key: config.credentials.private_key.replace(/\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async appendRow(range: string, data: (string | number | Date | null)[]): Promise<void> {
    try {
      const values = [data.map(cell => cell?.toString() || '')];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
      });
    } catch (error) {
      console.error('Error appending row to Google Sheets:', error);
      throw error;
    }
  }

  async getRange(range: string): Promise<string[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
        valueRenderOption: 'FORMATTED_VALUE',
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Error getting all rows from Google Sheets:', error);
      throw error;
    }
  }

  async updateRow(range: string, rowIndex: number, data: (string | number | Date | null)[]): Promise<void> {
    try {
      const values = [data.map(cell => cell?.toString() || '')];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: this.buildRange(range, rowIndex),
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });
    } catch (error) {
      console.error('Error updating row in Google Sheets:', error);
      throw error;
    }
  }

  async clearRow(range: string, rowIndex: number): Promise<void> {
    try {
      await this.updateRow(range, rowIndex, []);
    } catch (error) {
      console.error('Error deleting row in Google Sheets:', error);
      throw error;
    }
  }

  async getAllRows(range: string = this.defaultRange): Promise<string[][]> {
    return this.getRange(range);
  }

  async getRowsByDate(targetDate: Date, options?: { range?: string; dateColumnIndex?: number }): Promise<string[][]> {
    const range = options?.range ?? this.defaultRange;
    const dateColumnIndex = options?.dateColumnIndex ?? 4;
    const rows = await this.getRange(range);
    const dateString = targetDate.toISOString().split('T')[0];

    return rows.filter((row: string[]) => row[dateColumnIndex] === dateString);
  }

  async updateRowAt(rowIndex: number, data: (string | number | Date | null)[], range: string = this.defaultRange): Promise<void> {
    await this.updateRow(range, rowIndex, data);
  }

  async deleteRow(rowIndex: number, range: string = this.defaultRange): Promise<void> {
    await this.clearRow(range, rowIndex);
  }

  async getRowCount(range: string = this.defaultRange): Promise<number> {
    const rows = await this.getAllRows(range);
    return rows.length;
  }

  async clearOldData(daysToKeep: number, options?: { range?: string; dateColumnIndex?: number }): Promise<number> {
    const range = options?.range ?? this.defaultRange;
    const dateColumnIndex = options?.dateColumnIndex ?? 4;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const rows = await this.getAllRows(range);
    let deletedCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[dateColumnIndex]) {
        const rowDate = new Date(row[dateColumnIndex]);
        if (rowDate < cutoffDate) {
          await this.deleteRow(i, range);
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  private buildRange(baseRange: string, rowIndex: number): string {
    const [sheetName, columns] = baseRange.split('!');
    if (!columns) return baseRange;

    const [startColumn, endColumn] = columns.split(':');
    if (!startColumn || !endColumn) {
      return `${sheetName}!${startColumn}${rowIndex + 1}`;
    }

    return `${sheetName}!${startColumn}${rowIndex + 1}:${endColumn}${rowIndex + 1}`;
  }
}
