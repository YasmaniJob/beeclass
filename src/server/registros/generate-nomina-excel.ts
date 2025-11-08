import * as XLSX from "xlsx";

export interface StudentLike {
  numero_documento?: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string | null;
}

export interface NominaTemplateOptions {
  institution?: string;
  nivel?: string | null;
  grado: string;
  seccion: string;
  anio?: string;
  area?: string | null;
  minimoFilas?: number;
}

export function buildFullName(student: StudentLike): string {
  const apellidoPaterno = student.apellido_paterno?.trim() ?? "";
  const apellidoMaterno = student.apellido_materno?.trim() ?? "";
  const nombres = student.nombres?.trim() ?? "";
  const apellidos = [apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ");
  return [apellidos.toUpperCase(), nombres.toUpperCase()].filter(Boolean).join(", ");
}

export function generateNominaExcel(
  students: StudentLike[],
  {
    institution = "INSTITUCIÓN EDUCATIVA",
    nivel = null,
    grado,
    seccion,
    anio = new Date().getFullYear().toString(),
    area = null,
    minimoFilas = 35,
  }: NominaTemplateOptions,
): Buffer {
  const weekCount = 4;
  const days = ["L", "M", "Mi", "J", "V"];
  const totalColumns = 2 + weekCount * days.length + 1; // Nº, Nombre, semanas, Observaciones

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
      area ? `NÓMINA DE ASISTENCIA ${anio} · ${area.toUpperCase()}` : `NÓMINA DE ASISTENCIA ${anio}`,
    ]),
  );

  const sectionLabelParts = [`GRADO: ${grado.toUpperCase()}`, `SECCIÓN: ${seccion.toUpperCase()}`];
  if (area) {
    sectionLabelParts.push(`ÁREA: ${area.toUpperCase()}`);
  }
  sheetData.push(ensureRow([sectionLabelParts.join(" · ")]));

  // Header rows for table
  const headerWeeksRow = ensureRow(["N°", "APELLIDOS Y NOMBRES"]);
  for (let week = 0; week < weekCount; week++) {
    const startIndex = 2 + week * days.length;
    headerWeeksRow[startIndex] = `SEMANA ${week + 1}`;
  }
  headerWeeksRow[totalColumns - 1] = "OBSERVACIONES";
  sheetData.push(headerWeeksRow);

  const headerDaysRow = ensureRow(["", ""]);
  for (let week = 0; week < weekCount; week++) {
    const startIndex = 2 + week * days.length;
    days.forEach((day, idx) => {
      headerDaysRow[startIndex + idx] = day;
    });
  }
  sheetData.push(headerDaysRow);

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

  // Column widths
  worksheet["!cols"] = [
    { wch: 4 },
    { wch: 40 },
    ...Array(weekCount * days.length).fill({ wch: 5 }),
    { wch: 18 },
  ];

  // Row heights for headers
  worksheet["!rows"] = [
    { hpt: 22 },
    { hpt: 24 },
    { hpt: 18 },
    { hpt: 18 },
    { hpt: 16 },
  ];

  // Merges for titles and headers
  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalColumns - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalColumns - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },
    { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } },
    { s: { r: 3, c: totalColumns - 1 }, e: { r: 4, c: totalColumns - 1 } },
  ];

  for (let week = 0; week < weekCount; week++) {
    const startCol = 2 + week * days.length;
    const endCol = startCol + days.length - 1;
    merges.push({ s: { r: 3, c: startCol }, e: { r: 3, c: endCol } });
  }

  worksheet["!merges"] = merges;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Nómina");

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}
