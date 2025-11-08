import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/infrastructure/adapters/supabase/config";
import { generateRegistroAuxiliarExcel } from "@/server/registros/generate-registro-auxiliar-excel";

interface RequestUser {
  personalId?: string | null;
  numeroDocumento?: string | null;
  rol?: string | null;
}

interface RegistroAuxiliarRequestBody {
  grado: string;
  seccion: string;
  areaId: string;
  institution?: string;
  nivel?: string | null;
  anio?: string;
  minimoFilas?: number;
  user?: RequestUser;
  format?: "excel" | "json";
}

function hasPrivilegedAccess(role?: string | null) {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return (
    normalized.includes("admin") ||
    normalized.includes("director") ||
    normalized.includes("coordinador")
  );
}

function sanitizeName(value?: string | null): string {
  return (value ?? "").trim();
}

function toSentenceCase(text?: string | null): string | null {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return null;
  const lower = trimmed.toLocaleLowerCase("es");
  return `${lower.charAt(0).toLocaleUpperCase("es")}${lower.slice(1)}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegistroAuxiliarRequestBody | null;

    if (!body?.grado || !body?.seccion || !body?.areaId) {
      return NextResponse.json(
        { message: "Se requieren grado, sección y área" },
        { status: 400 },
      );
    }

    const grado = body.grado.trim();
    const seccion = body.seccion.trim();
    const areaId = body.areaId.trim();
    const user = body.user;

    if (!user) {
      return NextResponse.json(
        { message: "No se proporcionó información del usuario" },
        { status: 401 },
      );
    }

    const privileged = hasPrivilegedAccess(user.rol);
    let docenteNombreCompleto: string | null = null;

    if (!privileged) {
      if (!user.personalId) {
        return NextResponse.json(
          { message: "No se pudo validar las asignaciones del usuario" },
          { status: 403 },
        );
      }

      const { data: assignments, error: assignmentsError } = await supabaseAdmin
        .from("asignaciones_docentes")
        .select(
          "area_id, grados_secciones (grado, seccion)"
        )
        .eq("personal_id", user.personalId)
        .eq("activo", true);

      if (assignmentsError) {
        console.error("Error fetching assignments", assignmentsError);
        return NextResponse.json(
          { message: "No se pudieron validar las asignaciones del usuario" },
          { status: 500 },
        );
      }

      const normalizedAssignments = (assignments ?? []).map((assignment) => {
        const group = Array.isArray(assignment.grados_secciones)
          ? assignment.grados_secciones[0]
          : assignment.grados_secciones;

        return {
          areaId: assignment.area_id as string | null,
          grado: group?.grado as string | undefined,
          seccion: group?.seccion as string | undefined,
        };
      });

      const hasAssignment = normalizedAssignments.some((assignment) => {
        const gradeMatch = assignment.grado === grado;
        const sectionMatch = assignment.seccion === seccion;
        const areaMatch = assignment.areaId === areaId;
        return gradeMatch && sectionMatch && areaMatch;
      });

      if (!hasAssignment) {
        return NextResponse.json(
          { message: "No tienes asignaciones para la sección o área solicitada" },
          { status: 403 },
        );
      }
    }

    if (user.personalId) {
      const { data: personalRecord, error: personalError } = await supabaseAdmin
        .from("personal")
        .select("nombres, apellido_paterno, apellido_materno")
        .eq("id", user.personalId)
        .maybeSingle();

      if (personalError) {
        console.error("Error fetching personal", personalError);
      } else if (personalRecord) {
        const nombres = sanitizeName(personalRecord.nombres);
        const apellidoPaterno = sanitizeName(personalRecord.apellido_paterno);
        const apellidoMaterno = sanitizeName(personalRecord.apellido_materno);
        docenteNombreCompleto = [apellidoPaterno, apellidoMaterno, nombres]
          .filter((part) => part.length > 0)
          .join(" ")
          .trim();
      }
    }

    const [studentsResponse, areaResponse, competenciasResponse] = await Promise.all([
      supabaseAdmin
        .from("estudiantes")
        .select("numero_documento, nombres, apellido_paterno, apellido_materno")
        .eq("grado", grado)
        .eq("seccion", seccion)
        .order("apellido_paterno", { ascending: true })
        .order("apellido_materno", { ascending: true })
        .order("nombres", { ascending: true }),
      supabaseAdmin
        .from("areas_curriculares")
        .select("nombre")
        .eq("id", areaId)
        .maybeSingle(),
      supabaseAdmin
        .from("competencias")
        .select("id, nombre")
        .eq("area_id", areaId)
        .order("orden", { ascending: true }),
    ]);

    const { data: students, error: studentsError } = studentsResponse;
    if (studentsError) {
      console.error("Error fetching students", studentsError);
      return NextResponse.json(
        { message: "No se pudieron obtener los estudiantes" },
        { status: 500 },
      );
    }

    const { data: area, error: areaError } = areaResponse;
    if (areaError) {
      console.error("Error fetching area", areaError);
      return NextResponse.json(
        { message: "No se pudo validar el área curricular" },
        { status: 500 },
      );
    }

    const { data: competenciasData, error: competenciasError } = competenciasResponse;
    if (competenciasError) {
      console.error("Error fetching competencias", competenciasError);
      return NextResponse.json(
        { message: "No se pudieron obtener las competencias del área" },
        { status: 500 },
      );
    }

    const competenciaIds = (competenciasData ?? [])
      .map((competencia) => competencia.id)
      .filter(Boolean);

    let capacidadesData: { competencia_id: string | null; nombre: string | null }[] = [];
    if (competenciaIds.length > 0) {
      const { data: capacidadesRaw, error: capacidadesError } = await supabaseAdmin
        .from("capacidades")
        .select("competencia_id, nombre")
        .in("competencia_id", competenciaIds)
        .order("orden", { ascending: true });

      if (capacidadesError) {
        console.error("Error fetching capacidades", capacidadesError);
        return NextResponse.json(
          { message: "No se pudieron obtener las capacidades del área" },
          { status: 500 },
        );
      }

      capacidadesData = capacidadesRaw ?? [];
    }

    const competencias = (competenciasData ?? []).map((competencia, index) => {
      const capacidades = capacidadesData
        .filter((capacidad) => capacidad.competencia_id === competencia.id)
        .map((capacidad) => toSentenceCase(capacidad.nombre))
        .filter((nombre): nombre is string => Boolean(nombre && nombre.length > 0));

      return {
        nombre: sanitizeName(competencia.nombre) || competencia.id || `Competencia ${index + 1}`,
        capacidades,
      };
    });

    const areaNombre = sanitizeName(area?.nombre) || areaId;

    if (body.format === "json") {
      return NextResponse.json({
        students: (students ?? []).map((student) => ({
          numero_documento: student.numero_documento,
          nombres: sanitizeName(student.nombres),
          apellido_paterno: sanitizeName(student.apellido_paterno),
          apellido_materno: sanitizeName(student.apellido_materno),
        })),
        meta: {
          grado,
          seccion,
          area: areaNombre,
          institution: body.institution ?? null,
          nivel: body.nivel ?? null,
          anio: body.anio ?? new Date().getFullYear().toString(),
          docente: docenteNombreCompleto,
        },
        competencias,
      });
    }

    const buffer = generateRegistroAuxiliarExcel(students ?? [], {
      institution: body.institution,
      nivel: body.nivel ?? null,
      grado,
      seccion,
      area: areaNombre,
      anio: body.anio,
      minimoFilas: body.minimoFilas,
      competencias,
    });

    const filename = `registro-auxiliar-${grado}-${seccion}-${areaNombre}`
      .replace(/\s+/g, "-")
      .concat(".xlsx");

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("POST /api/registros/registro-auxiliar", error);
    return NextResponse.json(
      { message: "Error generando la plantilla de registro auxiliar" },
      { status: 500 },
    );
  }
}
