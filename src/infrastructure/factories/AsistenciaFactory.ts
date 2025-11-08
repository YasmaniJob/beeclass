// src/infrastructure/factories/AsistenciaFactory.ts
import { GoogleSheetsService } from '../adapters/GoogleSheetsService';
import { GoogleSheetsAsistenciaRepository } from '../repositories/GoogleSheetsAsistenciaRepository';
import { RegistrarAsistenciaUseCase } from '../../application/use-cases/RegistrarAsistenciaUseCase';

export class AsistenciaFactory {
  static createFromConfig(config: {
    spreadsheetId: string;
    credentials: any;
  }, currentUser: { numeroDocumento: string }) {
    // 1. Crear servicio de Google Sheets
    const sheetsService = new GoogleSheetsService(config);

    // 2. Crear repositorio
    const repository = new GoogleSheetsAsistenciaRepository(sheetsService);

    // 3. Crear use case
    const useCase = new RegistrarAsistenciaUseCase(repository);

    // 4. Configurar store con dependencias
    const { useAsistenciaStore } = require('../stores/asistenciaStore');
    useAsistenciaStore.getState().setDependencies(repository, useCase, currentUser);

    return {
      repository,
      useCase,
      store: useAsistenciaStore
    };
  }
}
