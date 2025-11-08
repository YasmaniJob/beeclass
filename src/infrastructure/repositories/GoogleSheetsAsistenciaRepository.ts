// src/infrastructure/repositories/GoogleSheetsAsistenciaRepository.ts
import { Result, DomainError, success, failure } from '../../domain/shared/types';
import { RegistroAsistencia } from '../../domain/entities/RegistroAsistencia';
import { EstadoAsistencia } from '../../domain/value-objects/EstadoAsistencia';
import { AsistenciaRepository } from '../../domain/ports/AsistenciaRepository';
import { GoogleSheetsService } from '../adapters/GoogleSheetsService';

export class GoogleSheetsAsistenciaRepository implements AsistenciaRepository {
  private readonly range = 'Asistencias!A:I';
  private readonly dateColumnIndex = 4;

  constructor(private readonly sheetsService: GoogleSheetsService) {}

  async guardar(asistencia: RegistroAsistencia): Promise<Result<void, DomainError>> {
    try {
      // Estructura: A=ID, B=Nombre, C=Grado, D=Sección, E=Fecha, F=Estado, G=Registrado Por, H=Observaciones, I=Timestamp
      const data = [
        asistencia.estudianteId,                        // A: Estudiante ID
        asistencia.nombreEstudiante,                    // B: Nombre Estudiante
        asistencia.grado,                               // C: Grado
        asistencia.seccion,                             // D: Sección
        this.normalizeDate(asistencia.fecha),           // E: Fecha (YYYY-MM-DD)
        asistencia.estado.toString(),                   // F: Estado
        asistencia.registradoPor,                       // G: Registrado Por
        asistencia.observaciones || '',                 // H: Observaciones
        new Date().toISOString()                        // I: Timestamp
      ];

      await this.sheetsService.appendRow(this.range, data);
      return success(undefined);
    } catch (error) {
      return failure(new DomainError('Error al guardar asistencia en Google Sheets'));
    }
  }

  async obtenerPorId(id: string): Promise<Result<RegistroAsistencia | null, DomainError>> {
    try {
      const rows = await this.sheetsService.getAllRows(this.range);

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (i.toString() === id && row[0] !== 'DELETED') {
          const asistencia = this.mapRowToEntity(row, i);
          return success(asistencia);
        }
      }

      return success(null);
    } catch (error) {
      return failure(new DomainError('Error al obtener asistencia por ID'));
    }
  }

  async actualizar(asistencia: RegistroAsistencia): Promise<Result<void, DomainError>> {
    try {
      const rowIndex = Number(asistencia.id);

      if (!Number.isFinite(rowIndex) || rowIndex <= 0) {
        return failure(new DomainError('Identificador de registro inválido para actualización'));
      }

      const rows = await this.sheetsService.getAllRows(this.range);

      if (rowIndex >= rows.length) {
        return failure(new DomainError('Registro de asistencia no encontrado'));
      }

      const existingRow = rows[rowIndex];

      if (!existingRow || existingRow[0] === 'DELETED') {
        return failure(new DomainError('Registro de asistencia no encontrado'));
      }

      const data = [
        asistencia.estudianteId,                        // A
        asistencia.nombreEstudiante,                    // B
        asistencia.grado,                               // C
        asistencia.seccion,                             // D
        this.normalizeDate(asistencia.fecha),           // E
        asistencia.estado.toString(),                   // F
        asistencia.registradoPor,                       // G
        asistencia.observaciones || '',                 // H
        existingRow[8] || new Date().toISOString()      // I: Mantener timestamp original
      ];

      await this.sheetsService.updateRow(this.range, rowIndex, data);
      return success(undefined);
    } catch (error) {
      return failure(new DomainError('Error al actualizar asistencia'));
    }
  }

  async eliminar(id: string): Promise<Result<void, DomainError>> {
    try {
      const rows = await this.sheetsService.getAllRows();

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[6] === id && row[0] !== 'DELETED') {
          await this.sheetsService.deleteRow(i, this.range);
          return success(undefined);
        }
      }

      return failure(new DomainError('Registro de asistencia no encontrado'));
    } catch (error) {
      return failure(new DomainError('Error al eliminar asistencia'));
    }
  }

  async obtenerPorFecha(fecha: Date): Promise<Result<RegistroAsistencia[], DomainError>> {
    try {
      const rows = await this.sheetsService.getAllRows(this.range);
      const targetDateString = this.normalizeDate(fecha);

      const asistencias = rows
        .map((row, index) => ({ row, index }))
        .filter(({ row, index }) => {
          if (index === 0 || row[0] === 'DELETED') {
            return false;
          }

          const rowDate = this.parseDateCell(row[4]);
          if (!rowDate) {
            return false;
          }

          return this.normalizeDate(rowDate) === targetDateString;
        })
        .map(({ row, index }) => this.mapRowToEntity(row, index));

      return success(asistencias);
    } catch (error) {
      return failure(new DomainError('Error al obtener asistencias por fecha'));
    }
  }

  async obtenerPorEstudiante(estudianteId: string): Promise<Result<RegistroAsistencia[], DomainError>> {
    try {
      const rows = await this.sheetsService.getAllRows(this.range);
      const asistencias = rows
        .map((row, index) => ({ row, index }))
        .filter(({ row, index }) => index > 0 && row[0] === estudianteId && row[0] !== 'DELETED')
        .map(({ row, index }) => this.mapRowToEntity(row, index));

      return success(asistencias);
    } catch (error) {
      return failure(new DomainError('Error al obtener asistencias por estudiante'));
    }
  }

  async obtenerPorEstudianteYFecha(estudianteId: string, fecha: Date): Promise<Result<RegistroAsistencia | null, DomainError>> {
    try {
      const rows = await this.sheetsService.getAllRows(this.range);
      const targetDateString = this.normalizeDate(fecha);

      for (let index = 1; index < rows.length; index++) {
        const row = rows[index];
        if (row[0] !== estudianteId || row[0] === 'DELETED') {
          continue;
        }

        const rowDate = this.parseDateCell(row[4]);
        if (!rowDate) {
          continue;
        }

        if (this.normalizeDate(rowDate) === targetDateString) {
          return success(this.mapRowToEntity(row, index));
        }
      }

      return success(null);
    } catch (error) {
      return failure(new DomainError('Error al obtener asistencia por estudiante y fecha'));
    }
  }

  async obtenerPorGradoYFecha(grado: string, fecha: Date): Promise<Result<RegistroAsistencia[], DomainError>> {
    // TODO: Implementar cuando esté disponible la info de estudiantes por grado
    return success([]);
  }

  async obtenerPorSeccionYFecha(grado: string, seccion: string, fecha: Date): Promise<Result<RegistroAsistencia[], DomainError>> {
    // TODO: Implementar cuando esté disponible la info de estudiantes por sección
    return success([]);
  }

  async obtenerEstadisticasPorFecha(fecha: Date): Promise<Result<any, DomainError>> {
    try {
      const asistencias = await this.obtenerPorFecha(fecha);

      if (!asistencias.isSuccess) {
        return asistencias;
      }

      const registros = asistencias.value;
      const estadisticas = {
        total: registros.length,
        presentes: registros.filter(r => r.estado.equals(EstadoAsistencia.PRESENTE)).length,
        tardes: registros.filter(r => r.estado.equals(EstadoAsistencia.TARDE)).length,
        faltas: registros.filter(r => r.estado.equals(EstadoAsistencia.FALTA)).length,
        permisos: registros.filter(r => r.estado.equals(EstadoAsistencia.PERMISO)).length,
        porGrado: {} // TODO: Implementar cuando esté disponible
      };

      return success(estadisticas);
    } catch (error) {
      return failure(new DomainError('Error al obtener estadísticas'));
    }
  }

  async obtenerEstadisticasPorEstudiante(estudianteId: string, fechaInicio: Date, fechaFin: Date): Promise<Result<any, DomainError>> {
    try {
      const asistencias = await this.obtenerPorEstudiante(estudianteId);

      if (!asistencias.isSuccess) {
        return asistencias;
      }

      const registros = asistencias.value.filter(r =>
        r.fecha >= fechaInicio && r.fecha <= fechaFin
      );

      const estadisticas = {
        total: registros.length,
        presentes: registros.filter(r => r.estado.equals(EstadoAsistencia.PRESENTE)).length,
        tardes: registros.filter(r => r.estado.equals(EstadoAsistencia.TARDE)).length,
        faltas: registros.filter(r => r.estado.equals(EstadoAsistencia.FALTA)).length,
        permisos: registros.filter(r => r.estado.equals(EstadoAsistencia.PERMISO)).length,
        promedioAsistencia: 0 // TODO: Calcular correctamente
      };

      return success(estadisticas);
    } catch (error) {
      return failure(new DomainError('Error al obtener estadísticas por estudiante'));
    }
  }

  async limpiarRegistrosAntiguos(diasAConservar: number): Promise<Result<number, DomainError>> {
    try {
      const deletedCount = await this.sheetsService.clearOldData(diasAConservar, { range: this.range, dateColumnIndex: this.dateColumnIndex });
      return success(deletedCount);
    } catch (error) {
      return failure(new DomainError('Error al limpiar registros antiguos'));
    }
  }

  async obtenerFechasConRegistros(): Promise<Result<Date[], DomainError>> {
    try {
      const rows = await this.sheetsService.getAllRows(this.range);
      const fechas = new Set<Date>();

      rows.slice(1).forEach((row: string[]) => { // Saltar headers
        if (row[1] && row[0] !== 'DELETED') { // Si hay fecha y no está eliminado
          fechas.add(new Date(row[1]));
        }
      });

      return success(Array.from(fechas));
    } catch (error) {
      return failure(new DomainError('Error al obtener fechas con registros'));
    }
  }

  private mapRowToEntity(row: string[], rowIndex: number): RegistroAsistencia {
    // Estructura: A=ID, B=Nombre, C=Grado, D=Sección, E=Fecha, F=Estado, G=Registrado Por, H=Observaciones, I=Timestamp
    const estadoResult = EstadoAsistencia.fromString(row[5]);
    const estado = estadoResult.isSuccess ? estadoResult.value : EstadoAsistencia.SIN_ASISTENCIA;

    const fecha = this.parseDateCell(row[4]) ?? new Date();

    return new RegistroAsistencia(
      row[0] || '',                     // A: estudianteId
      row[1] || 'DESCONOCIDO',          // B: nombreEstudiante
      row[2] || '',                     // C: grado
      row[3] || '',                     // D: seccion
      fecha,                            // E: fecha
      estado,                           // F: estado
      null,                             // horaIngreso (no se guarda en esta estructura)
      row[6] || '',                     // G: registradoPor
      row[7] || '',                     // H: observaciones
      rowIndex.toString()               // id basado en índice de fila
    );
  }

  private normalizeDate(date: Date): string {
    const iso = new Date(date.getTime());
    iso.setUTCHours(0, 0, 0, 0);
    return iso.toISOString().split('T')[0];
  }

  private parseDateCell(value: string | number | undefined): Date | null {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value === 'number') {
      // Google Sheets serial number (days since 1899-12-30)
      const base = new Date(Date.UTC(1899, 11, 30));
      base.setUTCDate(base.getUTCDate() + Math.floor(value));
      return base;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return new Date(`${trimmed}T00:00:00Z`);
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      const [part1, part2, year] = trimmed.split('/').map(Number);
      if (Number.isNaN(part1) || Number.isNaN(part2) || Number.isNaN(year)) {
        return null;
      }

      let day = part1;
      let month = part2;

      if (part1 > 12 && part2 <= 12) {
        day = part1;
        month = part2;
      } else if (part2 > 12 && part1 <= 12) {
        day = part2;
        month = part1;
      } else {
        // Ambiguous, asumir formato day/month (config común en ES)
        day = part1;
        month = part2;
      }

      return new Date(Date.UTC(year, month - 1, day));
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
