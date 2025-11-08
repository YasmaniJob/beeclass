import { Estudiante, TipoDocumento } from '@/domain/entities/Estudiante';
import { EstudianteInput } from '@/domain/entities/EstudianteInput';
import { Docente, DocenteInput } from '@/domain/entities/Docente';
import { Permiso, PermisoInput } from '@/domain/entities/Permiso';
import { Incidente, IncidenteInput, SujetoIncidente } from '@/domain/entities/Incidente';
import { DomainError, Result, failure, success } from '@/domain/shared/types';

export function normalizeTipoDocumento(value: string | TipoDocumento): TipoDocumento {
    if (typeof value !== 'string') {
        return value;
    }

    const normalized = value.trim().toUpperCase();
    switch (normalized) {
        case 'DNI':
            return TipoDocumento.DNI;
        case 'CE':
        case 'CARNET DE EXTRANJERÍA':
            return TipoDocumento.CE;
        default:
            return TipoDocumento.OTRO;
    }
}

export function toEstudianteEntity(input: EstudianteInput): Result<Estudiante, DomainError> {
    return Estudiante.crear({
        ...input,
        tipoDocumento: normalizeTipoDocumento(input.tipoDocumento),
    });
}

export function estudianteToInput(estudiante: Estudiante): EstudianteInput {
    return {
        numeroDocumento: estudiante.numeroDocumento,
        tipoDocumento: estudiante.tipoDocumento,
        nombres: estudiante.nombres,
        apellidoPaterno: estudiante.apellidoPaterno,
        apellidoMaterno: estudiante.apellidoMaterno,
        grado: estudiante.grado,
        seccion: estudiante.seccion,
        nee: estudiante.nee,
        neeDocumentos: estudiante.neeDocumentos,
    };
}

export function toDocenteEntity(input: DocenteInput): Result<Docente, DomainError> {
    return Docente.crear({
        ...input,
        tipoDocumento: normalizeTipoDocumento(input.tipoDocumento),
    });
}

type PermisoEstudianteInput = Estudiante | (EstudianteInput & { grado?: string; seccion?: string });

interface RawPermisoInput {
    id?: string;
    estudiante: PermisoEstudianteInput;
    fechaInicio: Date | string;
    fechaFin: Date | string;
    motivo: string;
    documento?: string | null;
    registradoPor: string;
}

export function toPermisoEntity(input: RawPermisoInput): Result<Permiso, DomainError> {
    let estudianteEntity: Estudiante;
    if (input.estudiante instanceof Estudiante) {
        estudianteEntity = input.estudiante;
    } else {
        const estudianteResult = toEstudianteEntity(input.estudiante);
        if (!estudianteResult.isSuccess) {
            return failure(estudianteResult.error);
        }
        estudianteEntity = estudianteResult.value;
    }

    const fechaInicio = input.fechaInicio instanceof Date ? input.fechaInicio : new Date(input.fechaInicio);
    const fechaFin = input.fechaFin instanceof Date ? input.fechaFin : new Date(input.fechaFin);

    return Permiso.crear({
        id: input.id,
        estudiante: estudianteEntity,
        fechaInicio,
        fechaFin,
        motivo: input.motivo,
        documento: input.documento ?? undefined,
        registradoPor: input.registradoPor,
    });
}

export function permisoToPayload(input: PermisoInput & { id?: string }) {
    const estudianteInput = estudianteToInput(input.estudiante);
    return {
        id: input.id,
        estudiante: {
            ...estudianteInput,
            grado: input.estudiante.grado,
            seccion: input.estudiante.seccion,
        },
        fechaInicio: input.fechaInicio instanceof Date ? input.fechaInicio.toISOString() : input.fechaInicio,
        fechaFin: input.fechaFin instanceof Date ? input.fechaFin.toISOString() : input.fechaFin,
        motivo: input.motivo,
        registradoPor: input.registradoPor,
        documentoUrl: input.documento ?? null,
    };
}

type RawDocenteLike = Omit<DocenteInput, 'tipoDocumento'> & { tipoDocumento: string } & { asignaciones?: DocenteInput['asignaciones'] };

export function toSujetoIncidenteEntity(input: any): Result<SujetoIncidente, DomainError> {
    if (input instanceof Estudiante || input instanceof Docente) {
        return success(input);
    }

    if (!input || typeof input !== 'object') {
        return failure(new DomainError('Sujeto de incidente inválido'));
    }

    if ('rol' in input || 'asignaciones' in input) {
        const docenteInput: DocenteInput = {
            tipoDocumento: normalizeTipoDocumento(input.tipoDocumento ?? input.tipo_documento ?? 'DNI'),
            numeroDocumento: input.numeroDocumento ?? input.numero_documento,
            apellidoPaterno: input.apellidoPaterno ?? input.apellido_paterno,
            apellidoMaterno: input.apellidoMaterno ?? input.apellido_materno,
            nombres: input.nombres,
            email: input.email,
            telefono: input.telefono,
            rol: input.rol,
            asignaciones: input.asignaciones,
            horario: input.horario,
            personalId: input.personalId ?? input.personal_id,
        };
        const docenteResult = toDocenteEntity(docenteInput);
        if (!docenteResult.isSuccess) {
            return failure(docenteResult.error);
        }
        return success(docenteResult.value);
    }

    const estudianteResult = toEstudianteEntity({
        numeroDocumento: input.numeroDocumento ?? input.numero_documento,
        tipoDocumento: normalizeTipoDocumento(input.tipoDocumento ?? input.tipo_documento ?? 'DNI'),
        nombres: input.nombres,
        apellidoPaterno: input.apellidoPaterno ?? input.apellido_paterno,
        apellidoMaterno: input.apellidoMaterno ?? input.apellido_materno,
        grado: input.grado,
        seccion: input.seccion,
        nee: input.nee,
        neeDocumentos: input.neeDocumentos ?? input.nee_documentos,
    });

    if (!estudianteResult.isSuccess) {
        return failure(estudianteResult.error);
    }

    return success(estudianteResult.value);
}

export function toIncidenteEntity(input: IncidenteInput | (Partial<IncidenteInput> & { sujeto: any; fecha: Date | string; id?: string })): Result<Incidente, DomainError> {
    const sujetoResult = toSujetoIncidenteEntity(input.sujeto);
    if (!sujetoResult.isSuccess) {
        return failure(sujetoResult.error);
    }

    const fecha = input.fecha instanceof Date ? input.fecha : new Date(input.fecha);

    return Incidente.crear({
        id: input.id,
        sujeto: sujetoResult.value,
        fecha,
        descripcion: input.descripcion!,
        reportadoPor: input.reportadoPor!,
    });
}

function sujetoToPayload(sujeto: SujetoIncidente) {
    if (sujeto instanceof Estudiante) {
        return {
            ...estudianteToInput(sujeto),
            grado: sujeto.grado,
            seccion: sujeto.seccion,
        };
    }

    return {
        tipoDocumento: sujeto.tipoDocumento,
        numeroDocumento: sujeto.numeroDocumento,
        apellidoPaterno: sujeto.apellidoPaterno,
        apellidoMaterno: sujeto.apellidoMaterno,
        nombres: sujeto.nombres,
        email: sujeto.email,
        telefono: sujeto.telefono,
        rol: sujeto.rol,
        asignaciones: sujeto.asignaciones,
        horario: sujeto.horario,
        personalId: sujeto.personalId,
    };
}

export function incidenteToPayload(input: IncidenteInput & { id?: string }) {
    return {
        id: input.id,
        sujeto: sujetoToPayload(input.sujeto),
        fecha: input.fecha instanceof Date ? input.fecha.toISOString() : input.fecha,
        descripcion: input.descripcion,
        reportadoPor: input.reportadoPor,
    };
}
