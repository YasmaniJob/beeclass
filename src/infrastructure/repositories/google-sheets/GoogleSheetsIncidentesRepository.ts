import { GoogleSheetsService } from '@/infrastructure/adapters/GoogleSheetsService';
import { Incidente } from '@/lib/definitions';

type EstudianteSujeto = Extract<Incidente['sujeto'], { grado?: string | undefined }>;

function esSujetoEstudiante(sujeto: Incidente['sujeto']): sujeto is EstudianteSujeto {
  return 'grado' in sujeto || 'seccion' in sujeto;
}

export interface GoogleSheetsIncidenteRow {
  id: string;
  tipoSujeto: 'estudiante' | 'personal';
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  grado?: string | null;
  seccion?: string | null;
  fecha: string; // ISO string
  descripcion: string;
  reportadoPor: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

function incidenteToRow(incidente: Incidente): GoogleSheetsIncidenteRow {
  const sujeto = incidente.sujeto;
  const esEstudiante = esSujetoEstudiante(sujeto);

  let grado = '';
  let seccion = '';
  if (esEstudiante) {
    grado = sujeto.grado ?? '';
    seccion = sujeto.seccion ?? '';
  }
  return {
    id: incidente.id,
    tipoSujeto: esEstudiante ? 'estudiante' : 'personal',
    numeroDocumento: sujeto.numeroDocumento,
    apellidoPaterno: sujeto.apellidoPaterno,
    apellidoMaterno: sujeto.apellidoMaterno ?? '',
    nombres: sujeto.nombres,
    grado,
    seccion,
    fecha: incidente.fecha.toISOString(),
    descripcion: incidente.descripcion,
    reportadoPor: incidente.reportadoPor,
    createdAt: incidente.fecha.toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function rowToIncidente(row: GoogleSheetsIncidenteRow): Incidente {
  const base = {
    tipoDocumento: 'DNI' as const,
    numeroDocumento: row.numeroDocumento,
    apellidoPaterno: row.apellidoPaterno,
    apellidoMaterno: row.apellidoMaterno,
    nombres: row.nombres,
  };

  const sujeto =
    row.tipoSujeto === 'estudiante'
      ? {
          ...base,
          grado: row.grado ?? undefined,
          seccion: row.seccion ?? undefined,
        }
      : base;

  return {
    id: row.id,
    sujeto,
    fecha: new Date(row.fecha),
    descripcion: row.descripcion,
    reportadoPor: row.reportadoPor,
  };
}

export class GoogleSheetsIncidentesRepository {
  private readonly range = 'Incidentes!A:M';

  constructor(private readonly sheetsService: GoogleSheetsService) {}

  async listAll(): Promise<Incidente[]> {
    const rows = await this.sheetsService.getRange(this.range);
    if (rows.length <= 1) {
      return [];
    }

    const [, ...dataRows] = rows;
    return dataRows
      .map(row => this.mapRow(row))
      .filter((incidente): incidente is Incidente => incidente !== null)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  async append(incidente: Incidente): Promise<void> {
    const row = incidenteToRow(incidente);
    await this.sheetsService.appendRow(this.range, this.toSheetRow(row));
  }

  async update(incidente: Incidente): Promise<void> {
    const rows = await this.sheetsService.getRange(this.range);
    const index = rows.findIndex(row => row[0] === incidente.id);
    if (index === -1) {
      throw new Error(`Incidente con ID ${incidente.id} no encontrado en Google Sheets`);
    }

    const row = incidenteToRow(incidente);
    await this.sheetsService.updateRow(this.range, index, this.toSheetRow(row));
  }

  async remove(id: string): Promise<void> {
    const rows = await this.sheetsService.getRange(this.range);
    const index = rows.findIndex(row => row[0] === id);
    if (index === -1) {
      return;
    }

    await this.sheetsService.clearRow(this.range, index);
  }

  private mapRow(row: string[]): Incidente | null {
    if (!row[0]) {
      return null;
    }

    const data: GoogleSheetsIncidenteRow = {
      id: row[0],
      tipoSujeto: (row[1] as 'estudiante' | 'personal') ?? 'estudiante',
      numeroDocumento: row[2] ?? '',
      apellidoPaterno: row[3] ?? '',
      apellidoMaterno: row[4] ?? '',
      nombres: row[5] ?? '',
      grado: row[6] ?? '',
      seccion: row[7] ?? '',
      fecha: row[8] ?? new Date().toISOString(),
      descripcion: row[9] ?? '',
      reportadoPor: row[10] ?? '',
      createdAt: row[11] ?? new Date().toISOString(),
      updatedAt: row[12] ?? new Date().toISOString(),
    };

    try {
      return rowToIncidente(data);
    } catch (error) {
      console.warn('Error al mapear fila de incidente', { error, row });
      return null;
    }
  }

  private toSheetRow(row: GoogleSheetsIncidenteRow): (string | null)[] {
    return [
      row.id,
      row.tipoSujeto,
      row.numeroDocumento,
      row.apellidoPaterno,
      row.apellidoMaterno,
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
}
