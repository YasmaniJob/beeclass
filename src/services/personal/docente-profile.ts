import type { User } from "@supabase/supabase-js";
import { SupabasePersonalRepository } from "@/infrastructure/repositories/supabase/SupabasePersonalRepository";
import { Docente, type DocenteAsignacion } from "@/domain/entities/Docente";
import { TipoDocumento } from "@/domain/entities/Estudiante";

const personalRepository = new SupabasePersonalRepository();

export type SerializedDocente = {
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  nombres: string;
  email?: string;
  telefono?: string;
  rol: string;
  asignaciones: DocenteAsignacion[];
  horario: Record<string, string>;
  personalId?: string;
};

function serializeDocente(docente: Docente): SerializedDocente {
  return {
    tipoDocumento: docente.tipoDocumento,
    numeroDocumento: docente.numeroDocumento,
    apellidoPaterno: docente.apellidoPaterno,
    apellidoMaterno: docente.apellidoMaterno,
    nombres: docente.nombres,
    email: docente.email,
    telefono: docente.telefono,
    rol: docente.rol,
    asignaciones: docente.asignaciones,
    horario: docente.horario,
    personalId: docente.personalId,
  };
}

export function deserializeDocente(data: SerializedDocente | null | undefined): Docente | null {
  if (!data) return null;
  const result = Docente.crear({
    tipoDocumento: data.tipoDocumento,
    numeroDocumento: data.numeroDocumento,
    apellidoPaterno: data.apellidoPaterno,
    apellidoMaterno: data.apellidoMaterno,
    nombres: data.nombres,
    email: data.email,
    telefono: data.telefono,
    rol: data.rol,
    asignaciones: data.asignaciones,
    horario: data.horario,
    personalId: data.personalId,
  });

  if (!result.isSuccess) {
    console.error("No se pudo reconstruir Docente desde datos serializados", result.error);
    return null;
  }

  return result.value;
}

async function loadDocenteProfileByEmail(email: string): Promise<SerializedDocente | null> {
  const docenteResult = await personalRepository.findByEmail(email);
  if (!docenteResult.isSuccess) {
    console.error("Error loading docente profile", docenteResult.error);
    return null;
  }
  return docenteResult.value ? serializeDocente(docenteResult.value) : null;
}

async function loadDocenteProfileByDocumento(documento: string): Promise<SerializedDocente | null> {
  const docenteResult = await personalRepository.findByDocumento(documento);
  if (!docenteResult.isSuccess) {
    console.error("Error loading docente profile", docenteResult.error);
    return null;
  }
  return docenteResult.value ? serializeDocente(docenteResult.value) : null;
}

export async function resolveDocenteFromAuthUser(authUser: User): Promise<SerializedDocente | null> {
  try {
    let docente: SerializedDocente | null = null;

    if (authUser.email) {
      docente = await loadDocenteProfileByEmail(authUser.email);
    }

    const documento = authUser.user_metadata?.numeroDocumento as string | undefined;
    if (!docente && documento) {
      docente = await loadDocenteProfileByDocumento(documento);
    }

    if (docente) {
      return docente;
    }

    const fallback = Docente.crear({
      tipoDocumento: TipoDocumento.DNI,
      numeroDocumento: documento ?? authUser.id,
      apellidoPaterno: (authUser.user_metadata?.apellidoPaterno as string | undefined) ?? "Sin-apellido",
      apellidoMaterno: authUser.user_metadata?.apellidoMaterno as string | undefined,
      nombres: (authUser.user_metadata?.nombres as string | undefined) ?? authUser.email ?? "Usuario",
      email: authUser.email ?? undefined,
      rol:
        (authUser.app_metadata?.role as string | undefined) ??
        (authUser.user_metadata?.role as string | undefined) ??
        (authUser.user_metadata?.rol as string | undefined) ??
        "Docente",
      asignaciones: [],
      horario: {},
    });

    if (fallback.isSuccess) {
      return serializeDocente(fallback.value);
    }

    console.error("No se pudo crear entidad Docente desde metadatos", fallback.error);
    return null;
  } catch (error) {
    console.error("Unexpected error resolving docente from auth user", error);
    return null;
  }
}
