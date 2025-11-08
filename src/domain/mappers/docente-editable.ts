import { Docente, DocenteInput, DocenteAsignacion } from '@/domain/entities/Docente';

type Horario = Record<string, string>;

export type DocenteEditable = DocenteInput & {
  asignaciones?: DocenteAsignacion[];
  horario?: Horario;
  personalId?: string;
};

const cloneAsignaciones = (asignaciones?: DocenteAsignacion[]): DocenteAsignacion[] | undefined => {
  if (!asignaciones) return undefined;
  return asignaciones.map(asignacion => ({ ...asignacion }));
};

const cloneHorario = (horario?: Horario): Horario | undefined => {
  if (!horario) return undefined;
  return { ...horario };
};

export function docenteToEditable(docente: Docente): DocenteEditable {
  return {
    tipoDocumento: docente.tipoDocumento,
    numeroDocumento: docente.numeroDocumento,
    apellidoPaterno: docente.apellidoPaterno,
    apellidoMaterno: docente.apellidoMaterno,
    nombres: docente.nombres,
    email: docente.email,
    telefono: docente.telefono,
    rol: docente.rol,
    asignaciones: cloneAsignaciones(docente.asignaciones),
    horario: cloneHorario(docente.horario),
    personalId: docente.personalId,
  };
}

export function editableToDocente(editable: DocenteEditable): Docente {
  const result = Docente.crear({
    ...editable,
    asignaciones: cloneAsignaciones(editable.asignaciones),
    horario: cloneHorario(editable.horario),
  });

  if (!result.isSuccess) {
    throw result.error;
  }

  return result.value;
}

export function cloneDocenteEditable(editable: DocenteEditable): DocenteEditable {
  return {
    ...editable,
    asignaciones: cloneAsignaciones(editable.asignaciones),
    horario: cloneHorario(editable.horario),
  };
}
