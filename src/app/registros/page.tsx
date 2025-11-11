'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, FileText, ShieldAlert, Loader2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMatriculaData } from "@/hooks/use-matricula-data";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAppConfig } from "@/hooks/use-app-config";
import { hexToRgb } from "@/lib/colors";
import type { RowInput } from "jspdf-autotable";

interface FetchOptions {
  grado: string;
  seccion: string;
  areaId?: string | null;
  areaNombre?: string | null;
}

function toSentenceCase(text: string, locale: string = "es"): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return trimmed;
  }

  const lower = trimmed.toLocaleLowerCase(locale);
  const firstChar = lower.charAt(0).toLocaleUpperCase(locale);
  return `${firstChar}${lower.slice(1)}`;
}

function truncateApa(text: string, maxChars = 52): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) {
    return clean;
  }

  const ellipsis = " ...";
  const targetLength = Math.max(maxChars - ellipsis.length, 0);
  if (targetLength === 0) {
    return ellipsis.trim();
  }

  let truncated = clean.slice(0, targetLength);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > targetLength * 0.6) {
    truncated = truncated.slice(0, lastSpace);
  }

  return `${truncated.trimEnd()}${ellipsis}`;
}

type RoleView = "auxiliar" | "docente" | "admin";

type SelectOption = {
  value: string;
  label: string;
};

type DownloadParams = {
  url: string;
  body: Record<string, unknown>;
  filename: string;
};

type StudentRecord = {
  numero_documento?: string | null;
  nombres?: string | null;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;
};

type NominaJsonResponse = {
  students: StudentRecord[];
  meta: {
    grado: string;
    seccion: string;
    area: string | null;
    institution: string | null;
    nivel: string | null;
    anio: string;
    docente?: string | null;
  };
};

type RegistroAuxiliarJsonResponse = {
  students: StudentRecord[];
  meta: {
    grado: string;
    seccion: string;
    area: string;
    institution: string | null;
    nivel: string | null;
    anio: string;
    docente?: string | null;
  };
  competencias: Array<{
    nombre: string;
    capacidades?: string[];
  }>;
};

type RegistroCompetenciaGroup = {
  label: string;
  subcolumns: string[];
};

const NOMINA_WEEK_COUNT = 4;
const NOMINA_DAYS = ["L", "M", "Mi", "J", "V"] as const;

const DEFAULT_REGISTRO_GROUPS: RegistroCompetenciaGroup[] = [
  {
    label: "Construye interpretaciones",
    subcolumns: ["Estrategias y rutas de atención"],
  },
  {
    label: "Gestiona responsablemente",
    subcolumns: ["Cuidado de sí mismo y del entorno"],
  },
  {
    label: "Gestiona su aprendizaje",
    subcolumns: ["Acompañamiento socioemocional"],
  },
  {
    label: "Se desenvuelve en entornos",
    subcolumns: ["Interacción y convivencia"],
  },
];

function formatStudentName(student?: StudentRecord): string {
  if (!student) return "";
  const apellidoPaterno = student.apellido_paterno?.trim() ?? "";
  const apellidoMaterno = student.apellido_materno?.trim() ?? "";
  const nombres = student.nombres?.trim() ?? "";
  const apellidos = [apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ");
  return [apellidos.toUpperCase(), nombres.toUpperCase()].filter(Boolean).join(", ");
}

function normalizeCompetenciaGroups(
  competencias?: Array<{ nombre?: string | null; capacidades?: string[] }>,
): RegistroCompetenciaGroup[] {
  const groups = (competencias ?? []).map((competencia, index) => {
    const label = (competencia.nombre ?? "").trim() || `Competencia ${index + 1}`;
    const capacities = (competencia.capacidades ?? [])
      .map((capacidad) => (capacidad ?? "").trim())
      .filter((capacidad) => capacidad.length > 0)
      .map((capacidad) => toSentenceCase(capacidad));
    
    // Agregar "Nivel de logro" después de cada capacidad
    const subcolumns = capacities.length > 0 
      ? [...capacities, "Nivel de logro"]
      : ["Registro", "Nivel de logro"];
    
    return {
      label,
      subcolumns,
    } satisfies RegistroCompetenciaGroup;
  });

  if (!groups.length) {
    return DEFAULT_REGISTRO_GROUPS.map((group) => ({
      label: group.label,
      subcolumns: [...group.subcolumns],
    }));
  }

  return groups;
}

type RegistroHeaderInfo = {
  labels: string[];
  subcolumns: string[];
  merges: Array<{ start: number; span: number }>;
  wrappedLabels: string[];
  wrappedSubcolumns: string[];
};

function buildCompetenciaHeaders(groups: RegistroCompetenciaGroup[]): RegistroHeaderInfo {
  const labels: string[] = [];
  const subcolumns: string[] = [];
  const merges: Array<{ start: number; span: number }> = [];

  let currentIndex = 0;
  groups.forEach((group, groupIndex) => {
    const span = group.subcolumns.length;
    merges.push({ start: currentIndex, span });
    labels.push(
      `${groups.length > 1 ? `C${groupIndex + 1}: ` : ""}${group.label.toUpperCase()}`,
    );
    group.subcolumns.forEach((subcolumn) => {
      subcolumns.push(truncateApa(subcolumn));
      currentIndex += 1;
    });
  });

  return {
    labels,
    subcolumns,
    merges,
    wrappedLabels: labels.map((label) => wrapLabel(label)),
    wrappedSubcolumns: subcolumns.map((subcolumn) => wrapLabel(subcolumn)),
  };
}

function calculateColumnWidths(columnCount: number): Record<number, { cellWidth?: number; halign?: "center" | "left" | "right" }> {
  const totalWidth = 280; // Aproximado en puntos para A4 landscape con márgenes
  const baseColumns = 2; // N°, Apellidos
  const remainingWidth = totalWidth - 8 - 52; // restar anchos fijos de primeras columnas
  const widthPerColumn = Math.max(Math.min(remainingWidth / Math.max(columnCount, 1), 26), 9);

  const columnStyles: Record<number, { cellWidth?: number; halign?: "center" | "left" | "right" }> = {
    0: { cellWidth: 8, halign: "center" },
    1: { cellWidth: 52, halign: "left" },
  };

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    columnStyles[columnIndex + baseColumns] = {
      cellWidth: widthPerColumn,
      halign: "center",
    };
  }

  return columnStyles;
}

function wrapLabel(text: string, maxLength = 28): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  const words = clean.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const tentative = currentLine ? `${currentLine} ${word}` : word;
    if (tentative.length > maxLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = tentative;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join("\n");
}

async function generateNominaPdf(
  data: NominaJsonResponse,
  minimoFilas: number,
  filename: string,
  isAdmin?: boolean,
  branding?: { appName?: string; institutionName?: string; themeColor?: string; docenteNombreFallback?: string },
) {
  const { jsPDF, autoTable } = await loadPdfDependencies();
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = branding?.themeColor ?? "#59AB45";
  const { r: primaryR, g: primaryG, b: primaryB } = hexToRgb(primaryColor);

  const institutionBase = (branding?.institutionName || data.meta.institution || "INSTITUCIÓN EDUCATIVA").trim();
  const institutionLabel = data.meta.nivel
    ? `${institutionBase.toUpperCase()} - ${data.meta.nivel.toUpperCase()}`
    : institutionBase.toUpperCase();

  // Si es admin, dejar el nombre del docente en blanco
  const docenteNombre = isAdmin ? "" : (data.meta.docente?.trim() || branding?.docenteNombreFallback || "");

  const headerTop = 12;
  doc.setFillColor(primaryR, primaryG, primaryB);
  doc.rect(10, headerTop, pageWidth - 20, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text((branding?.appName || "BEECLASS").toUpperCase(), 16, headerTop + 8);

  doc.setFontSize(16);
  doc.text("NÓMINA DE ASISTENCIA", pageWidth / 2, headerTop + 9, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(institutionLabel, pageWidth / 2, headerTop + 17, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subtitleParts = [
    `GRADO: ${data.meta.grado.toUpperCase()}`,
    `SECCIÓN: ${data.meta.seccion.toUpperCase()}`,
  ];
  doc.text(subtitleParts.join("  •  "), pageWidth / 2, headerTop + 24, { align: "center" });

  doc.setFontSize(8);
  doc.text(`AÑO: ${data.meta.anio}`, 16, headerTop + 17);
  doc.text(`DOCENTE: ${docenteNombre || ""}`, 16, headerTop + 23);

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(16, headerTop + 26, pageWidth - 16, headerTop + 26);

  doc.setTextColor(55, 55, 55);
  doc.setFont("helvetica", "normal");

  const students = data.students ?? [];
  const totalRows = Math.max(minimoFilas, students.length);
  const bodyRows = Array.from({ length: totalRows }, (_, index) => {
    const student = students[index];
    return [
      String(index + 1).padStart(2, "0"),
      formatStudentName(student),
      ...Array(NOMINA_WEEK_COUNT * NOMINA_DAYS.length).fill(""),
      "",
    ];
  });

  const headRow1 = [
    { content: "N°", rowSpan: 2, styles: { halign: "center" as const, valign: "middle" as const } },
    { content: "APELLIDOS Y NOMBRES", rowSpan: 2, styles: { halign: "center" as const, valign: "middle" as const } },
    ...Array.from({ length: NOMINA_WEEK_COUNT }, (_, index) => ({
      content: `SEMANA ${index + 1}`,
      colSpan: NOMINA_DAYS.length,
      styles: { halign: "center" as const },
    })),
    { content: "OBSERVACIONES", rowSpan: 2, styles: { halign: "center" as const, valign: "middle" as const } },
  ] satisfies RowInput;

  const headRow2 = Array.from({ length: NOMINA_WEEK_COUNT }, () => NOMINA_DAYS)
    .flat()
    .map((day) => ({
      content: day,
      styles: { halign: "center" as const },
    })) satisfies RowInput;

  const observationIndex = 2 + NOMINA_WEEK_COUNT * NOMINA_DAYS.length;

  autoTable(doc, {
    startY: headerTop + 32,
    head: [headRow1, headRow2],
    body: bodyRows,
    theme: "grid",
    margin: { left: 8, right: 8 },
    headStyles: {
      fillColor: [primaryR, primaryG, primaryB],
      textColor: 255,
      halign: "center" as const,
      valign: "middle" as const,
      fontSize: 9,
      cellPadding: 1.4,
      fontStyle: "bold" as const,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 1,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 58 },
      [observationIndex]: { cellWidth: 26 },
    },
    styles: {
      valign: "middle" as const,
      overflow: "linebreak",
    },
  });

  doc.save(filename);
}

type PdfDependencies = {
  jsPDF: typeof import("jspdf").jsPDF;
  autoTable: typeof import("jspdf-autotable").default;
};

let pdfDependenciesPromise: Promise<PdfDependencies> | null = null;

async function loadPdfDependencies(): Promise<PdfDependencies> {
  if (!pdfDependenciesPromise) {
    pdfDependenciesPromise = Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]).then(([{ jsPDF }, autoTableModule]) => ({
      jsPDF,
      autoTable: autoTableModule.default,
    }));
  }

  return pdfDependenciesPromise;
}

type RegistroAuxiliarBranding = {
  appName?: string;
  institutionName?: string;
  themeColor?: string;
  docenteNombreFallback?: string;
};

async function generateRegistroAuxiliarPdf(
  data: RegistroAuxiliarJsonResponse,
  minimoFilas: number,
  filename: string,
  branding?: RegistroAuxiliarBranding,
  isAdmin?: boolean,
) {
  const { jsPDF, autoTable } = await loadPdfDependencies();
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = branding?.themeColor ?? "#59AB45";
  const { r: primaryR, g: primaryG, b: primaryB } = hexToRgb(primaryColor);

  const institutionBase = (branding?.institutionName || data.meta.institution || "INSTITUCIÓN EDUCATIVA").trim();
  const institutionLabel = data.meta.nivel
    ? `${institutionBase.toUpperCase()} - ${data.meta.nivel.toUpperCase()}`
    : institutionBase.toUpperCase();

  // Si es admin, dejar el nombre del docente en blanco
  const docenteNombre = isAdmin ? "" : (data.meta.docente?.trim() || branding?.docenteNombreFallback || "");

  const headerTop = 12;
  doc.setFillColor(primaryR, primaryG, primaryB);
  doc.rect(10, headerTop, pageWidth - 20, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text((branding?.appName || "BEECLASS").toUpperCase(), 16, headerTop + 8);

  doc.setFontSize(16);
  doc.text("REGISTRO AUXILIAR", pageWidth / 2, headerTop + 9, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(institutionLabel, pageWidth / 2, headerTop + 17, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subtitleParts = [
    `GRADO: ${data.meta.grado.toUpperCase()}`,
    `SECCIÓN: ${data.meta.seccion.toUpperCase()}`,
    `ÁREA: ${data.meta.area.toUpperCase()}`,
  ];
  doc.text(subtitleParts.join("  •  "), pageWidth / 2, headerTop + 24, { align: "center" });

  doc.setFontSize(8);
  doc.text(`AÑO: ${data.meta.anio}`, 16, headerTop + 17);
  doc.text(`DOCENTE: ${docenteNombre || ""}`, 16, headerTop + 23);

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(16, headerTop + 26, pageWidth - 16, headerTop + 26);

  doc.setTextColor(55, 55, 55);
  doc.setFont("helvetica", "normal");

  const groups = normalizeCompetenciaGroups(data.competencias);
  const { wrappedLabels, wrappedSubcolumns, subcolumns } = buildCompetenciaHeaders(groups);
  const students = data.students ?? [];
  const totalRows = Math.max(minimoFilas, students.length);
  const totalCompetencyColumns = subcolumns.length;
  const bodyRows = Array.from({ length: totalRows }, (_, index) => {
    const competencyCells = Array(totalCompetencyColumns).fill("");
    return [
      String(index + 1).padStart(2, "0"),
      formatStudentName(students[index]),
      ...competencyCells,
    ];
  });

  const headRow1 = [
    { content: "N°", rowSpan: 2, styles: { halign: "center" as const, valign: "middle" as const } },
    { content: "APELLIDOS Y NOMBRES", rowSpan: 2, styles: { halign: "center" as const, valign: "middle" as const } },
    ...wrappedLabels.map((label, index) => ({
      content: label,
      colSpan: groups[index]?.subcolumns.length ?? 1,
      styles: { halign: "center" as const, valign: "middle" as const },
    })),
  ] satisfies RowInput;

  const headRow2 = wrappedSubcolumns.map((subcolumn) => ({
    content: subcolumn,
    styles: { halign: "center" as const, valign: "middle" as const },
  })) satisfies RowInput;

  const columnStyles = calculateColumnWidths(totalCompetencyColumns);

  autoTable(doc, {
    startY: headerTop + 32,
    head: [headRow1, headRow2],
    body: bodyRows,
    theme: "grid",
    margin: { left: 8, right: 8 },
    headStyles: {
      fillColor: [primaryR, primaryG, primaryB],
      textColor: 255,
      halign: "center" as const,
      valign: "middle" as const,
      fontSize: 8,
      cellPadding: 1.4,
      fontStyle: "bold" as const,
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 1,
    },
    columnStyles,
    styles: {
      valign: "middle" as const,
      overflow: "linebreak",
    },
    didParseCell: (data) => {
      if (data.section === "head" && data.row.index === 1) {
        data.cell.styles.fontSize = 6;
        data.cell.styles.fontStyle = "normal";
        data.cell.styles.textColor = [255, 255, 255];
      }
    },
  });

  doc.save(filename);
}

function buildOptionsFromMap(map: Record<string, string[]>): SelectOption[] {
  return Object.keys(map)
    .sort((a, b) => a.localeCompare(b, "es"))
    .map((grado) => ({ value: grado, label: grado }));
}

function buildSections(map: Record<string, string[]>, grado?: string): SelectOption[] {
  if (!grado) return [];
  return (map[grado] || [])
    .slice()
    .sort((a, b) => a.localeCompare(b, "es"))
    .map((seccion) => ({ value: seccion, label: seccion }));
}

function filterAreasByGrado(
  areasPorGrado: Record<string, Array<{ id?: string | null; nombre?: string | null }>>,
  grado?: string,
  allowedIds?: string[],
): SelectOption[] {
  if (!grado) return [];
  const allowedSet = allowedIds && allowedIds.length > 0 ? new Set(allowedIds) : undefined;

  const options: SelectOption[] = [];
  
  // Agregar áreas regulares del grado
  (areasPorGrado[grado] || []).forEach((area) => {
    const value = (area.id ?? area.nombre ?? "").trim();
    const label = (area.nombre ?? area.id ?? "").trim();
    const option = value
      ? {
          value,
          label: label || value,
        }
      : null;
    if (!option) return;
    if (allowedSet && !allowedSet.has(option.value)) {
      return;
    }
    options.push(option);
  });
  
  // Si hay competencias transversales en los IDs permitidos, agregarlas
  if (allowedSet) {
    const esSecundaria = grado?.toLowerCase().includes('secundaria') || 
                         parseInt(grado?.match(/\d+/)?.[0] || '0') > 6;
    const transversalId = esSecundaria ? 't-secundaria' : 't-primaria';
    
    if (allowedSet.has(transversalId)) {
      options.push({
        value: transversalId,
        label: 'Competencias Transversales'
      });
    }
  }
  
  return options.sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

async function downloadFile({ url, body, filename }: DownloadParams) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "No se pudo generar el archivo");
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

async function fetchPdfData<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...body, format: "json" }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "No se pudo obtener los datos para el PDF");
  }

  return response.json() as Promise<T>;
}

function useRoleView(): { role: RoleView; isLoading: boolean } {
  const { user, isLoaded } = useCurrentUser();

  const role = useMemo<RoleView>(() => {
    if (!user) {
      return "docente";
    }
    const roleLower = (user.rol ?? "docente").toLowerCase();
    if (roleLower.includes("auxiliar")) {
      return "auxiliar";
    }
    if (roleLower.includes("admin") || roleLower.includes("director") || roleLower.includes("coordinador")) {
      return "admin";
    }
    return "docente";
  }, [user]);

  return {
    role,
    isLoading: !isLoaded,
  };
}

type DownloadState = "idle" | "loading";

type DownloadKind = "nomina" | "registro";

type DownloadAction = "nominaExcel" | "nominaPdf" | "registroExcel" | "registroPdf";

export default function RegistrosPage() {
  const router = useRouter();
  const { role, isLoading } = useRoleView();
  const { isLoaded: dataLoaded, seccionesPorGrado, areasPorGrado, gradoSeccionCatalog, docentes } = useMatriculaData();
  const { user } = useCurrentUser();
  const { appName, institutionName, themeColor } = useAppConfig();

  const isAuxiliar = role === "auxiliar";
  const isDocente = role === "docente";
  const isPrivileged = role === "admin";

  const [selectedDocenteId, setSelectedDocenteId] = useState<string>("__ninguno__");
  
  const docenteOptions = useMemo(() => {
    return docentes
      .filter(d => d.asignaciones && d.asignaciones.length > 0)
      .map(d => ({
        value: d.numeroDocumento,
        label: `${d.apellidoPaterno} ${d.apellidoMaterno}, ${d.nombres}`,
        docente: d
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [docentes]);

  const selectedDocente = useMemo(() => {
    if (!selectedDocenteId || selectedDocenteId === "__ninguno__") return undefined;
    return docentes.find(d => d.numeroDocumento === selectedDocenteId);
  }, [docentes, selectedDocenteId]);

  // Filtrar grados según las asignaciones del usuario (o docente seleccionado si es admin)
  const gradoOptions = useMemo(() => {
    const targetUser = isPrivileged && selectedDocente ? selectedDocente : user;
    
    // Si es admin sin docente seleccionado, mostrar todos los grados
    if (isPrivileged && (!selectedDocenteId || selectedDocenteId === "__ninguno__")) {
      return buildOptionsFromMap(seccionesPorGrado);
    }
    
    // Si no hay asignaciones, no mostrar grados
    if (!targetUser?.asignaciones?.length) {
      return [];
    }
    
    // Obtener grados únicos de las asignaciones
    const gradosAsignados = new Set(
      targetUser.asignaciones
        .map(a => a.grado)
        .filter((g): g is string => Boolean(g))
    );
    
    // Filtrar solo los grados asignados
    return Array.from(gradosAsignados)
      .sort((a, b) => a.localeCompare(b, "es"))
      .map(grado => ({ value: grado, label: grado }));
  }, [seccionesPorGrado, user, selectedDocente, isPrivileged, selectedDocenteId]);
  
  const [grado, setGrado] = useState<string>("");
  
  // Filtrar secciones según las asignaciones del usuario (o docente seleccionado si es admin)
  const seccionOptions = useMemo(() => {
    if (!grado) return [];
    
    const targetUser = isPrivileged && selectedDocente ? selectedDocente : user;
    
    // Si es admin sin docente seleccionado, mostrar todas las secciones del grado
    if (isPrivileged && (!selectedDocenteId || selectedDocenteId === "__ninguno__")) {
      return buildSections(seccionesPorGrado, grado);
    }
    
    // Si no hay asignaciones, no mostrar secciones
    if (!targetUser?.asignaciones?.length) {
      return [];
    }
    
    // Obtener secciones únicas del grado seleccionado
    const seccionesAsignadas = new Set(
      targetUser.asignaciones
        .filter(a => a.grado === grado)
        .map(a => a.seccion)
        .filter((s): s is string => Boolean(s))
    );
    
    // Filtrar solo las secciones asignadas
    return Array.from(seccionesAsignadas)
      .sort((a, b) => a.localeCompare(b, "es"))
      .map(seccion => ({ value: seccion, label: seccion }));
  }, [seccionesPorGrado, grado, user, selectedDocente, isPrivileged, selectedDocenteId]);
  const [seccion, setSeccion] = useState<string>("");
  const assignedAreaIds = useMemo(() => {
    // Si es admin y ha seleccionado un docente, usar las asignaciones del docente
    const targetUser = isPrivileged && selectedDocente ? selectedDocente : user;
    
    if (!targetUser?.asignaciones?.length) {
      return [] as string[];
    }

    const areaIds = new Set<string>();
    
    // Verificar si el docente es tutor en el grado/sección seleccionado
    const esTutorEnSeccion = targetUser.asignaciones.some((assignment) => {
      const matchesGrado = !grado || assignment.grado === grado;
      const matchesSeccion = !seccion || assignment.seccion === seccion;
      return matchesGrado && matchesSeccion && assignment.rol === 'Docente y Tutor';
    });
    
    // Si es tutor, agregar competencias transversales automáticamente
    if (esTutorEnSeccion) {
      // Determinar el nivel basado en el grado
      const nivelTransversal = grado?.toLowerCase().includes('secundaria') || 
                               parseInt(grado?.match(/\d+/)?.[0] || '0') > 6
        ? 't-secundaria'
        : 't-primaria';
      areaIds.add(nivelTransversal);
    }
    
    // Agregar áreas asignadas explícitamente
    targetUser.asignaciones.forEach((assignment) => {
      if (!assignment.areaId) return;
      const matchesGrado = !grado || assignment.grado === grado;
      const matchesSeccion = !seccion || assignment.seccion === seccion;
      if (matchesGrado && matchesSeccion) {
        areaIds.add(assignment.areaId);
      }
    });

    return Array.from(areaIds);
  }, [user, selectedDocente, isPrivileged, grado, seccion]);

  // Obtener competencias transversales según el grado
  const competenciasTransversales = useMemo(() => {
    if (!grado) return null;
    
    // Determinar el nivel basado en el grado
    const esSecundaria = grado?.toLowerCase().includes('secundaria') || 
                         parseInt(grado?.match(/\d+/)?.[0] || '0') > 6;
    
    return {
      id: esSecundaria ? 't-secundaria' : 't-primaria',
      nombre: 'Competencias Transversales'
    };
  }, [grado]);

  // Obtener todas las áreas únicas del sistema (para administradores)
  const todasLasAreasDelSistema = useMemo(() => {
    const todasLasAreas = Object.values(areasPorGrado).flat();
    const areasUnicas = new Map<string, { id?: string | null; nombre?: string | null }>();
    
    todasLasAreas.forEach(area => {
      const id = area.id ?? area.nombre ?? '';
      if (id && !areasUnicas.has(id)) {
        areasUnicas.set(id, area);
      }
    });
    
    // Agregar competencias transversales si hay un grado seleccionado
    if (competenciasTransversales) {
      areasUnicas.set(competenciasTransversales.id, competenciasTransversales);
    }
    
    return Array.from(areasUnicas.values())
      .map(area => {
        const value = (area.id ?? area.nombre ?? "").trim();
        const label = (area.nombre ?? area.id ?? "").trim();
        return value ? { value, label: label || value } : null;
      })
      .filter((option): option is SelectOption => Boolean(option))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [areasPorGrado, competenciasTransversales]);

  const areaOptions = useMemo(() => {
    const hasNoDocenteSelected = !selectedDocenteId || selectedDocenteId === "__ninguno__";
    
    // ADMINISTRADORES: Siempre mostrar todas las áreas del sistema
    if (isPrivileged && hasNoDocenteSelected) {
      return todasLasAreasDelSistema;
    }
    
    // ADMINISTRADOR CON DOCENTE SELECCIONADO: Mostrar áreas del docente
    if (isPrivileged && !hasNoDocenteSelected) {
      return filterAreasByGrado(areasPorGrado, grado, assignedAreaIds);
    }
    
    // DOCENTES: Mostrar solo sus áreas asignadas
    return filterAreasByGrado(areasPorGrado, grado, assignedAreaIds);
  }, [areasPorGrado, grado, assignedAreaIds, isPrivileged, selectedDocenteId, todasLasAreasDelSistema]);
  const [areaId, setAreaId] = useState<string>("");
  const [anio, setAnio] = useState<string>(new Date().getFullYear().toString());
  const [downloadState, setDownloadState] = useState<Record<DownloadAction, DownloadState>>({
    nominaExcel: "idle",
    nominaPdf: "idle",
    registroExcel: "idle",
    registroPdf: "idle",
  });

  useEffect(() => {
    if (!gradoOptions.length) return;

    if (!grado || !gradoOptions.some((option) => option.value === grado)) {
      setGrado(gradoOptions[0]?.value ?? "");
    }
  }, [gradoOptions, grado]);

  useEffect(() => {
    if (!seccionOptions.length) {
      setSeccion("");
      return;
    }

    if (!seccion || !seccionOptions.some((option) => option.value === seccion)) {
      setSeccion(seccionOptions[0]?.value ?? "");
    }
  }, [seccionOptions, seccion]);

  useEffect(() => {
    if (isAuxiliar) {
      setAreaId("");
      return;
    }

    if (!areaOptions.length || !areaOptions.some((option) => option.value === areaId)) {
      setAreaId(areaOptions[0]?.value ?? "");
    }
  }, [isAuxiliar, areaOptions, areaId]);

  const currentAssignmentValid = useMemo(() => {
    if (!grado || !seccion) return false;
    const key = `${grado}|${seccion}`;
    return Boolean(gradoSeccionCatalog[key]);
  }, [grado, seccion, gradoSeccionCatalog]);

  useEffect(() => {
    if (!currentAssignmentValid && grado && seccionOptions.length) {
      setSeccion(seccionOptions[0]?.value ?? "");
    }
  }, [currentAssignmentValid, grado, seccionOptions]);

  useEffect(() => {
    if (!user?.personalId) {
      return;
    }

    if (role === "docente") {
      const assignments = user.asignaciones ?? [];
      if (!assignments.length) return;
      setGrado(assignments[0].grado ?? "");
      setSeccion(assignments[0].seccion ?? "");
      if (assignments[0].areaId) {
        setAreaId(assignments[0].areaId);
      }
    }
  }, [role, user]);

  const canDownloadNomina = useMemo(() => {
    if (!grado || !seccion) return false;
    // Administradores pueden descargar sin restricciones
    if (isPrivileged) return true;
    return Boolean(gradoSeccionCatalog[`${grado}|${seccion}`]);
  }, [grado, seccion, gradoSeccionCatalog, isPrivileged]);

  const canDownloadRegistro = useMemo(() => {
    if (isAuxiliar) return false;
    if (!grado || !seccion || !areaId) return false;
    // Administradores pueden descargar sin restricciones
    if (isPrivileged) return true;
    return Boolean(gradoSeccionCatalog[`${grado}|${seccion}`]);
  }, [isAuxiliar, grado, seccion, areaId, gradoSeccionCatalog, isPrivileged]);

  const handleDownloadExcel = async (kind: DownloadKind) => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const action: DownloadAction = kind === "nomina" ? "nominaExcel" : "registroExcel";
      setDownloadState((prev) => ({ ...prev, [action]: "loading" }));

      const payload: FetchOptions = {
        grado,
        seccion,
        areaId: areaId || null,
      };

      const userPayload = {
        personalId: user.personalId,
        numeroDocumento: user.numeroDocumento,
        rol: user.rol,
      };

      if (kind === "nomina") {
        await downloadFile({
          url: "/api/registros/nomina",
          body: {
            ...payload,
            areaId: isAuxiliar ? null : payload.areaId,
            anio,
            user: userPayload,
          },
          filename: `nomina-${grado}-${seccion}.xlsx`,
        });
      } else {
        await downloadFile({
          url: "/api/registros/registro-auxiliar",
          body: {
            ...payload,
            areaId,
            anio,
            user: userPayload,
          },
          filename: `registro-auxiliar-${grado}-${seccion}.xlsx`,
        });
      }

      toast({
        title: "Descarga iniciada",
        description: "El archivo se generó correctamente.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocurrió un error";
      toast({
        title: "No se pudo descargar",
        description: message,
        variant: "destructive",
      });
    } finally {
      const action: DownloadAction = kind === "nomina" ? "nominaExcel" : "registroExcel";
      setDownloadState((prev) => ({ ...prev, [action]: "idle" }));
    }
  };

  const handleDownloadPdf = async (kind: DownloadKind) => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const action: DownloadAction = kind === "nomina" ? "nominaPdf" : "registroPdf";
      setDownloadState((prev) => ({ ...prev, [action]: "loading" }));

      const payload: FetchOptions = {
        grado,
        seccion,
        areaId: areaId || null,
      };

      const userPayload = {
        personalId: user.personalId,
        numeroDocumento: user.numeroDocumento,
        rol: user.rol,
      };

      if (kind === "nomina") {
        const data = await fetchPdfData<NominaJsonResponse>("/api/registros/nomina", {
          ...payload,
          areaId: isAuxiliar ? null : payload.areaId,
          anio,
          user: userPayload,
        });

        await generateNominaPdf(
          data,
          35,
          `nomina-${grado}-${seccion}.pdf`,
          isPrivileged,
          {
            appName,
            institutionName,
            themeColor,
            docenteNombreFallback: `${user?.apellidoPaterno ?? ""} ${user?.apellidoMaterno ?? ""} ${user?.nombres ?? ""}`.replace(/\s+/g, " ").trim() || undefined,
          },
        );
      } else {
        if (!areaId) {
          throw new Error("Selecciona un área para generar el PDF");
        }

        const data = await fetchPdfData<RegistroAuxiliarJsonResponse>("/api/registros/registro-auxiliar", {
          ...payload,
          areaId,
          anio,
          user: userPayload,
        });

        await generateRegistroAuxiliarPdf(
          data,
          35,
          `registro-auxiliar-${grado}-${seccion}.pdf`,
          {
            appName,
            institutionName,
            themeColor,
            docenteNombreFallback: `${user?.apellidoPaterno ?? ""} ${user?.apellidoMaterno ?? ""} ${user?.nombres ?? ""}`.replace(/\s+/g, " ").trim() || undefined,
          },
          isPrivileged,
        );
      }

      toast({
        title: "PDF generado",
        description: "El archivo se generó correctamente.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocurrió un error";
      toast({
        title: "No se pudo generar el PDF",
        description: message,
        variant: "destructive",
      });
    } finally {
      const action: DownloadAction = kind === "nomina" ? "nominaPdf" : "registroPdf";
      setDownloadState((prev) => ({ ...prev, [action]: "idle" }));
    }
  };

  const contentLoading = isLoading || !dataLoaded || !gradoOptions.length;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Registros</h1>
          {isPrivileged && (
            <Badge variant="default" className="bg-blue-500">
              <ShieldAlert className="mr-1 h-3 w-3" />
              Acceso completo
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {isPrivileged 
            ? "Como administrador, puedes descargar registros de cualquier grado, sección y área sin restricciones."
            : "Descarga plantillas en blanco con la nómina de estudiantes y los registros auxiliares según tu perfil."
          }
        </p>
      </div>

      {contentLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <Tabs defaultValue={isAuxiliar ? "nomina" : "docente"} className="space-y-6">
          <TabsList>
            <TabsTrigger value="nomina">Nómina de asistencia</TabsTrigger>
            {!isAuxiliar && <TabsTrigger value="docente">Registros para docentes y administración</TabsTrigger>}
          </TabsList>

          <TabsContent value="nomina" className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle>Nómina de asistencia</CardTitle>
                <CardDescription>
                  Genera la nómina semanal con columnas por días. Disponible para auxiliares, docentes y administrativos.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="grado">Grado</Label>
                  <Select value={grado} onValueChange={setGrado}>
                    <SelectTrigger id="grado">
                      <SelectValue placeholder="Selecciona un grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradoOptions.map((option, index) => (
                        <SelectItem key={`${option.value}-${index}`} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seccion">Sección</Label>
                  <Select value={seccion} onValueChange={setSeccion} disabled={!grado}>
                    <SelectTrigger id="seccion">
                      <SelectValue placeholder="Selecciona una sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {seccionOptions.map((option, index) => (
                        <SelectItem key={`${option.value}-${index}`} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anio">Año</Label>
                  <Input id="anio" value={anio} onChange={(event) => setAnio(event.target.value)} placeholder="2025" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => handleDownloadExcel("nomina")}
                  disabled={!canDownloadNomina || downloadState.nominaExcel === "loading"}
                  className="inline-flex items-center gap-2"
                >
                  {downloadState.nominaExcel === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Descargar Excel
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDownloadPdf("nomina")}
                  disabled={!canDownloadNomina || downloadState.nominaPdf === "loading"}
                  className="inline-flex items-center gap-2"
                >
                  {downloadState.nominaPdf === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Descargar PDF
                </Button>
                {!canDownloadNomina && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldAlert className="h-4 w-4" />
                    Selecciona una combinación válida de grado y sección.
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {!isAuxiliar && (
            <TabsContent value="docente" className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle>Registro auxiliar</CardTitle>
                  <CardDescription>
                    Descarga la plantilla con columnas por competencias y niveles de logro. Disponible para docentes y personal administrativo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isPrivileged && (
                    <div className="space-y-2 pb-4 border-b">
                      <Label htmlFor="docente">Docente (opcional)</Label>
                      <Select value={selectedDocenteId} onValueChange={setSelectedDocenteId}>
                        <SelectTrigger id="docente">
                          <SelectValue placeholder="Selecciona un docente para ver sus áreas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__ninguno__">Ninguno (ver todas las áreas)</SelectItem>
                          {docenteOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Selecciona un docente para filtrar las áreas según sus asignaciones
                      </p>
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="grado-registro">Grado</Label>
                    <Select value={grado} onValueChange={setGrado}>
                      <SelectTrigger id="grado-registro">
                        <SelectValue placeholder="Selecciona un grado" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradoOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seccion-registro">Sección</Label>
                    <Select value={seccion} onValueChange={setSeccion} disabled={!grado}>
                      <SelectTrigger id="seccion-registro">
                        <SelectValue placeholder="Selecciona una sección" />
                      </SelectTrigger>
                      <SelectContent>
                        {seccionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Área</Label>
                    <Select value={areaId} onValueChange={setAreaId} disabled={!grado || areaOptions.length === 0}>
                      <SelectTrigger id="area">
                        <SelectValue placeholder={areaOptions.length ? "Selecciona un área" : "No hay áreas configuradas para este grado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {areaOptions.length > 0 ? (
                          areaOptions.map((option, index) => (
                            <SelectItem key={`${option.value}-${index}`} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No hay áreas curriculares configuradas para {grado}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {areaOptions.length === 0 && grado && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {isPrivileged 
                          ? "No hay áreas curriculares en el sistema. Configúralas en Gestión Curricular."
                          : "No tienes áreas asignadas para este grado. Contacta al administrador."
                        }
                      </p>
                    )}
                    {isPrivileged && areaOptions.length > 0 && (selectedDocenteId === "__ninguno__") && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Mostrando todas las áreas del sistema (sin filtro por grado)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anio-registro">Año</Label>
                    <Input id="anio-registro" value={anio} onChange={(event) => setAnio(event.target.value)} placeholder="2025" />
                  </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => handleDownloadExcel("registro")}
                    disabled={!canDownloadRegistro || downloadState.registroExcel === "loading"}
                    className="inline-flex items-center gap-2"
                  >
                    {downloadState.registroExcel === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                    Descargar Excel
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDownloadPdf("registro")}
                    disabled={!canDownloadRegistro || downloadState.registroPdf === "loading"}
                    className="inline-flex items-center gap-2"
                  >
                    {downloadState.registroPdf === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Descargar PDF
                  </Button>
                  {!canDownloadRegistro && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldAlert className="h-4 w-4" />
                      Selecciona grado, sección y área válidos.
                    </div>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
