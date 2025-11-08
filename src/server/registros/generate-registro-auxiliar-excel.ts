import * as XLSX from "xlsx";

interface StudentLike {
  numero_documento?: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string | null;
}

interface RegistroAuxiliarCompetencia {
  nombre: string;
  capacidades?: string[];
}

interface RegistroAuxiliarTemplateOptions {
  institution?: string;
  nivel?: string | null;
  grado: string;
  seccion: string;
  area: string;
  anio?: string;
  minimoFilas?: number;
  competencias?: RegistroAuxiliarCompetencia[];
}

type ColumnGroup = {
  label: string;
  subcolumns: string[];
};

const DEFAULT_COLUMN_GROUPS: ColumnGroup[] = [
  {
    label: "Construye interpretaciones",
    subcolumns: [
      "Estrategias y rutas de atención",
      "Nivel de logro",
    ],
  },
  {
    label: "Gestiona responsablemente",
    subcolumns: [
      "Cuidado de sí mismo y del entorno",
      "Nivel de logro",
    ],
  },
  {
    label: "Gestiona su aprendizaje",
    subcolumns: [
      "Acompañamiento socioemocional",
      "Nivel de logro",
    ],
  },
  {
    label: "Se desenvuelve en entornos",
    subcolumns: [
      "Interacción y convivencia",
      "Nivel de logro",
    ],
  },
];

function buildFullName(student: StudentLike): string {
  const apellidoPaterno = student.apellido_paterno?.trim() ?? "";
  const apellidoMaterno = student.apellido_materno?.trim() ?? "";
  const nombres = student.nombres?.trim() ?? "";
  const apellidos = [apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ");
  return [apellidos.toUpperCase(), nombres.toUpperCase()].filter(Boolean).join(", ");
}

export function generateRegistroAuxiliarExcel(
  students: StudentLike[],
  {
    institution = "INSTITUCIÓN EDUCATIVA",
    nivel = null,
    grado,
    seccion,
    area,
    anio = new Date().getFullYear().toString(),
    minimoFilas = 35,
    competencias,
  }: RegistroAuxiliarTemplateOptions,
): Buffer {
  const baseColumns = 2; // Nº, Apellidos y Nombres

  const normalizedGroups: ColumnGroup[] = (competencias && competencias.length > 0)
    ? competencias.map((competencia, index) => {
        const normalizedName = competencia.nombre?.trim() || `Competencia ${index + 1}`;
        const capacities = (competencia.capacidades ?? []).filter(Boolean).map(cap => cap.trim()).filter(cap => cap.length > 0);
        const subcolumns = capacities.length > 0
          ? [...capacities, "Nivel de logro"]
          : ["Registro", "Nivel de logro"];
        return {
          label: normalizedName,
          subcolumns,
        } satisfies ColumnGroup;
      })
    : DEFAULT_COLUMN_GROUPS;

  const totalColumns =
    baseColumns +
    normalizedGroups.reduce((acc, group) => acc + group.subcolumns.length, 0);

  const ensureRow = (values: any[]): any[] => {
    const row = Array(totalColumns).fill("");
    values.forEach((value, index) => {
      if (index < totalColumns) {
        row[index] = value;
      }
    });
    return row;
  };

  const sheetData: any[][] = [];

  const institutionLabel = nivel
    ? `${institution.toUpperCase()} - ${nivel.toString().toUpperCase()}`
    : institution.toUpperCase();

  sheetData.push(ensureRow([institutionLabel]));
  sheetData.push(
    ensureRow([
      `REGISTRO AUXILIAR ${anio} · ${area.toUpperCase()}`,
    ]),
  );

  const metaParts = [
    `GRADO: ${grado.toUpperCase()}`,
    `SECCIÓN: ${seccion.toUpperCase()}`,
    `ÁREA: ${area.toUpperCase()}`,
  ];
  sheetData.push(ensureRow([metaParts.join(" · ")]));

  const headerRow = ensureRow(["N°", "APELLIDOS Y NOMBRES"]);
  const subHeaderRow = ensureRow(["", ""]);

  let currentColumnIndex = baseColumns;
  normalizedGroups.forEach((group, groupIndex) => {
    const span = group.subcolumns.length;
    const labelPrefix = normalizedGroups.length > 1 ? `C${groupIndex + 1}: ` : "";
    headerRow[currentColumnIndex] = `${labelPrefix}${group.label.toUpperCase()}`;
    for (let i = 0; i < span; i++) {
      subHeaderRow[currentColumnIndex + i] = group.subcolumns[i];
    }
    currentColumnIndex += span;
  });

  sheetData.push(headerRow);
  sheetData.push(subHeaderRow);

  const totalRows = Math.max(minimoFilas, students.length);
  for (let index = 0; index < totalRows; index++) {
    const student = students[index];
    const fullName = student ? buildFullName(student) : "";
    sheetData.push(
      ensureRow([
        index + 1,
        fullName,
      ]),
    );
  }

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  worksheet["!cols"] = [
    { wch: 4 },
    { wch: 40 },
    ...normalizedGroups.flatMap(group =>
      group.subcolumns.map((subcolumn, index) => ({
        wch: index === group.subcolumns.length - 1 ? 14 : Math.min(Math.max(subcolumn.length * 1.2, 18), 36),
      })),
    ),
  ];

  worksheet["!rows"] = [
    { hpt: 22 },
    { hpt: 24 },
    { hpt: 18 },
    { hpt: 18 },
    { hpt: 16 },
  ];

  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalColumns - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalColumns - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },
    { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } },
  ];

  let mergeIndex = baseColumns;
  normalizedGroups.forEach((group) => {
    const span = group.subcolumns.length;
    merges.push({
      s: { r: 3, c: mergeIndex },
      e: { r: 3, c: mergeIndex + span - 1 },
    });
    mergeIndex += span;
  });

  worksheet["!merges"] = merges;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registro Auxiliar");

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}
