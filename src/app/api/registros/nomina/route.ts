import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/infrastructure/adapters/supabase/config";
import { generateNominaExcel } from "@/server/registros/generate-nomina-excel";

interface RequestUser {
  personalId?: string | null;
  numeroDocumento?: string | null;
  rol?: string | null;
}

interface NominaRequestBody {
  grado: string;
  seccion: string;
  areaId?: string | null;
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NominaRequestBody | null;

    if (!body?.grado || !body?.seccion) {
      return NextResponse.json(
        { message: "Se requieren grado y sección" },
        { status: 400 },
      );
    }

    const grado = body.grado.trim();
    const seccion = body.seccion.trim();
    const areaId = body.areaId?.trim() || null;
    const user = body.user;

    if (!user) {
      return NextResponse.json(
        { message: "No se proporcionó información del usuario" },
        { status: 401 },
      );
    }

    const privileged = hasPrivilegedAccess(user.rol);

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
          "area_id, grados_secciones (grado, seccion, nivel)"
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
        const areaMatch = areaId ? assignment.areaId === areaId : true;
        return gradeMatch && sectionMatch && areaMatch;
      });

      if (!hasAssignment) {
        return NextResponse.json(
          { message: "No tienes asignaciones para la sección solicitada" },
          { status: 403 },
        );
      }
    }

    const { data: students, error: studentsError } = await supabaseAdmin
      .from("estudiantes")
      .select("numero_documento, nombres, apellido_paterno, apellido_materno")
      .eq("grado", grado)
      .eq("seccion", seccion)
      .order("apellido_paterno", { ascending: true })
      .order("apellido_materno", { ascending: true })
      .order("nombres", { ascending: true });

    if (studentsError) {
      console.error("Error fetching students", studentsError);
      return NextResponse.json(
        { message: "No se pudieron obtener los estudiantes" },
        { status: 500 },
      );
    }

    let areaNombre: string | null = null;
    if (areaId) {
      const { data: area, error: areaError } = await supabaseAdmin
        .from("areas_curriculares")
        .select("nombre")
        .eq("id", areaId)
        .maybeSingle();

      if (areaError) {
        console.error("Error fetching area", areaError);
        return NextResponse.json(
          { message: "No se pudo validar el área curricular" },
          { status: 500 },
        );
      }

      areaNombre = area?.nombre ?? null;
    }

    if (body.format === "json") {
      return NextResponse.json({
        students: (students ?? []).map((student) => ({
          numero_documento: student.numero_documento,
          nombres: student.nombres,
          apellido_paterno: student.apellido_paterno,
          apellido_materno: student.apellido_materno,
        })),
        meta: {
          grado,
          seccion,
          area: areaNombre,
          institution: body.institution ?? null,
          nivel: body.nivel ?? null,
          anio: body.anio ?? new Date().getFullYear().toString(),
        },
      });
    }

    const buffer = generateNominaExcel(students ?? [], {
      institution: body.institution,
      nivel: body.nivel ?? null,
      grado,
      seccion,
      anio: body.anio,
      area: areaNombre,
      minimoFilas: body.minimoFilas,
    });

    const filename = `nomina-${grado}-${seccion}.xlsx`.replace(/\s+/g, "-");

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("POST /api/registros/nomina", error);
    return NextResponse.json(
      { message: "Error generando la plantilla de nómina" },
      { status: 500 },
    );
  }
}
