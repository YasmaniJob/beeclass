

// Este archivo contendrá las definiciones de tipos y esquemas de Zod
// que se utilizarán en toda la aplicación, sirviendo como una única fuente de verdad
// para las estructuras de datos.

import { z } from 'zod';

export const TipoDocumentoEnum = z.enum(['DNI', 'CE', 'Otro']);

export const EstudianteSchema = z.object({
  id: z.string().optional(),
  tipoDocumento: TipoDocumentoEnum,
  numeroDocumento: z.string().min(1, 'El número de documento es requerido.'),
  apellidoPaterno: z.string().min(1, 'El apellido paterno es requerido.'),
  apellidoMaterno: z.string().optional(),
  nombres: z.string().min(1, 'El nombre es requerido.'),
  grado: z.string().optional(),
  seccion: z.string().optional(),
  nee: z.string().optional(),
  neeDocumentos: z.array(z.string()).optional(),
  descripcionNee: z.string().optional(),
  fechaNacimiento: z.union([z.date(), z.string()]).optional(),
  sexo: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().optional(),
  nombreApoderado: z.string().optional(),
  telefonoApoderado: z.string().optional(),
});

export type Estudiante = z.infer<typeof EstudianteSchema>;

export const UserRoleEnum = z.enum([
    'Admin',
    'Director',
    'Sub-director',
    'Coordinador',
    'Docente',
    'Auxiliar',
]);

export type UserRole = z.infer<typeof UserRoleEnum>;

export const AsignacionRolEnum = z.enum(['Docente', 'Docente y Tutor', 'Auxiliar']);
export type AsignacionRol = z.infer<typeof AsignacionRolEnum>;

export const AsignacionSchema = z.object({
  id: z.string(),
  grado: z.string(),
  seccion: z.string(),
  rol: z.string().min(1),
  areaId: z.string().optional(), // Nuevo campo para vincular con el área
  gradoSeccionId: z.string().optional(),
  horasSemanales: z.number().optional(),
});
export type Asignacion = z.infer<typeof AsignacionSchema>;


export const DocenteSchema = z.object({
  id: z.string().optional(),
  tipoDocumento: TipoDocumentoEnum,
  numeroDocumento: z.string().min(1, 'El número de documento es requerido.'),
  apellidoPaterno: z.string().min(1, 'El apellido paterno es requerido.'),
  apellidoMaterno: z.string().optional(),
  nombres: z.string().min(1, 'El nombre es requerido.'),
  email: z.string().email('Email inválido').optional(),
  telefono: z.string().optional(),
  rol: z.string().min(1).default('Docente'),
  asignaciones: z.array(AsignacionSchema).optional(),
  horario: z.record(z.string()).optional(), // Clave: "dia-horaId", Valor: "asignacionAreaId"
  personalId: z.string().optional(),
});

export type Docente = z.infer<typeof DocenteSchema>;

export const PermisoSchema = z.object({
    id: z.string(),
    estudiante: EstudianteSchema,
    fechaInicio: z.date(),
    fechaFin: z.date(),
    motivo: z.string().min(1, 'El motivo es requerido.'),
    documento: z.string().optional(),
    registradoPor: z.string().min(1, 'Se requiere saber quién registra el permiso.'),
});

export type Permiso = z.infer<typeof PermisoSchema>;

export const NeeEntrySchema = z.object({
    id: z.string(),
    estudiante: EstudianteSchema,
    descripcion: z.string().min(1, 'La descripción es requerida.'),
    documentoUrl: z.string().url('Debe ser un enlace válido.').optional(),
    registradoPor: z.string().min(1, 'Se requiere registrar quién actualiza la NEE.'),
    updatedAt: z.date(),
});

export type NeeEntry = z.infer<typeof NeeEntrySchema>;

export const SujetoIncidenteSchema = EstudianteSchema.or(DocenteSchema.omit({asignaciones: true}));
export type SujetoIncidente = z.infer<typeof SujetoIncidenteSchema>;

export const IncidenteSchema = z.object({
    id: z.string(),
    sujeto: SujetoIncidenteSchema,
    fecha: z.date(),
    descripcion: z.string().min(1, 'La descripción es requerida.'),
    reportadoPor: z.string().min(1, 'Se requiere saber quién reporta el incidente.'),
});

export type Incidente = z.infer<typeof IncidenteSchema>;

export const SeguimientoSchema = z.object({
    id: z.string(),
    estudianteId: z.string(),
    fecha: z.date(),
    accion: z.string().min(1, 'La acción es requerida.'),
    detalles: z.string().min(1, 'Los detalles son requeridos.'),
    realizadoPor: z.string().min(1, 'Se requiere saber quién realizó la acción.'),
});

export type Seguimiento = z.infer<typeof SeguimientoSchema>;

export const NotaCualitativaEnum = z.enum(['AD', 'A', 'B', 'C']);
export type NotaCualitativa = z.infer<typeof NotaCualitativaEnum>;

// --- Definiciones Curriculares ---
export type Nivel = 'Inicial' | 'Primaria' | 'Secundaria';

export const CompetenciaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  capacidades: z.array(z.string()).optional(),
});
export type Competencia = z.infer<typeof CompetenciaSchema>;

export const AreaCurricularSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  nivel: z.string(),
  competencias: z.array(CompetenciaSchema),
});
export type AreaCurricular = z.infer<typeof AreaCurricularSchema>;


export const TipoEvaluacionEnum = z.enum(['directa', 'lista-cotejo', 'rubrica']);
export type TipoEvaluacion = z.infer<typeof TipoEvaluacionEnum>;

export const SesionAprendizajeSchema = z.object({
  id: z.string(),
  areaId: z.string(),
  grado: z.string(),
  seccion: z.string(),
  titulo: z.string(),
  competenciaId: z.string(),
  capacidades: z.array(z.string()).optional(),
  fecha: z.date(),
  tipoEvaluacion: TipoEvaluacionEnum.default('directa'),
});
export type SesionAprendizaje = z.infer<typeof SesionAprendizajeSchema>;


// --- Definiciones de Calificaciones ---
export const CalificacionSchema = z.object({
  id: z.string(),
  estudianteId: z.string(),
  docenteId: z.string(),
  grado: z.string(),
  seccion: z.string(),
  areaId: z.string(),
  competenciaId: z.string(),
  periodo: z.string().optional(), // Ej: "Bimestre 1", "Trimestre 2"
  fecha: z.date(),
  nota: NotaCualitativaEnum,
  sesionId: z.string().optional(),
  tipoEvaluacion: TipoEvaluacionEnum.default('directa'),
});
export type Calificacion = z.infer<typeof CalificacionSchema>;

// Este schema se usaba para las competencias transversales y puede ser obsoleto o refactorizado
export const CalificacionCompetenciaSchema = z.object({
  estudianteId: z.string(),
  docenteId: z.string(),
  grado: z.string(),
  seccion: z.string(),
  fecha: z.date(),
  // GESTIONA SU APRENDIZAJE DE MANERA AUTÓNOMA
  competencia1: NotaCualitativaEnum.optional().nullable(),
  // SE DESENVUELVE EN ENTORNOS VIRTUALES GENERADOS POR LAS TICS
  competencia2: NotaCualitativaEnum.optional().nullable(),
});
export type CalificacionCompetencia = z.infer<typeof CalificacionCompetenciaSchema>;


export const AsistenciaStatusEnum = z.enum(['sin_asistencia', 'presente', 'tarde', 'falta', 'permiso']);
export type AsistenciaStatus = z.infer<typeof AsistenciaStatusEnum>;

export const AsistenciaDeAulaSchema = z.object({
    id: z.string(),
    estudianteId: z.string(),
    fecha: z.date(),
    horaPedagogicaId: z.string(),
    docenteId: z.string(),
    status: AsistenciaStatusEnum,
});
export type AsistenciaDeAula = z.infer<typeof AsistenciaDeAulaSchema>;

// --- Definiciones de Configuración de Evaluación ---
export const PeriodoEvaluacionEnum = z.enum(['Bimestre', 'Trimestre', 'Semestre']);
export type PeriodoEvaluacion = z.infer<typeof PeriodoEvaluacionEnum>;

export const ConfiguracionEvaluacionSchema = z.object({
    tipo: PeriodoEvaluacionEnum,
    cantidad: z.number().min(1).max(12),
});
export type ConfiguracionEvaluacion = z.infer<typeof ConfiguracionEvaluacionSchema>;
