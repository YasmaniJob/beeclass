// src/domain/entities/EstudianteInput.ts
import { TipoDocumento } from './Estudiante';

export interface EstudianteInput {
  numeroDocumento: string;
  tipoDocumento: TipoDocumento;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  grado?: string;
  seccion?: string;
  nee?: string;
  neeDocumentos?: string[];
}
