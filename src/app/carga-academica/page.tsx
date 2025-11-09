
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { AreaCurricular, AsignacionRol } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Save, Search, Sparkles, Users, X, Layers, BookOpen, GraduationCap, UserCheck, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import isEqual from 'lodash/isEqual';
import { useDocentes } from '@/hooks/use-docentes';
import { Docente } from '@/domain/entities/Docente';
import { 
  docenteToEditable,
  editableToDocente,
  cloneDocenteEditable,
  DocenteEditable,
} from '@/domain/mappers/docente-editable';
import { DocenteAsignacion } from '@/domain/entities/Docente';

const DOC_COLUMN_WIDTH = 320;
const TUTOR_COLUMN_WIDTH = 56;
const MAX_VISIBLE_BADGES = 4;
const ITEMS_PER_PAGE = 10;

export default function CargaAcademicaPage() {
  const { toast } = useToast();
  const {
    docentes: initialDocentes,
    allGrados: grados,
    seccionesPorGrado,
    areasPorGrado,
    getGradoSeccionId,
  } = useMatriculaData();

  const { setDocentes: setGlobalDocentes } = useDocentes();

  const [localDocentes, setLocalDocentes] = useState<DocenteEditable[]>([]);
  const [originalDocentes, setOriginalDocentes] = useState<DocenteEditable[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedDocenteId, setSelectedDocenteId] = useState<string | null>(null);
  const [showOnlyChanged, setShowOnlyChanged] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showInsights, setShowInsights] = useState(false);
  const [showDocenteDetail, setShowDocenteDetail] = useState(false);
  const [docenteDetailId, setDocenteDetailId] = useState<string | null>(null);
  const [showGradeDetail, setShowGradeDetail] = useState(false);
  const [gradeDetailFilter, setGradeDetailFilter] = useState<string>('');
  const [sectionDetailFilter, setSectionDetailFilter] = useState<string>('');
  const [showAreaDetail, setShowAreaDetail] = useState(false);
  const [areaDetailFilter, setAreaDetailFilter] = useState<string>('');
  const [areaDetailGradeFilter, setAreaDetailGradeFilter] = useState<string>('');
  const [areaDetailSectionFilter, setAreaDetailSectionFilter] = useState<string>('');
  const [showTutorDetail, setShowTutorDetail] = useState(false);
  const [tutorGradeFilter, setTutorGradeFilter] = useState<string>('');
  const [tutorSectionFilter, setTutorSectionFilter] = useState<string>('');

  const sanitizeDocentes = useCallback((docentes: DocenteEditable[]) => {
    return docentes.map(docente => {
      if (docente.rol !== 'Auxiliar' || !docente.asignaciones) {
        return docente;
      }

      return {
        ...docente,
        asignaciones: docente.asignaciones.filter(asignacion => !asignacion.areaId),
      };
    });
  }, []);

  useEffect(() => {
    const editable = sanitizeDocentes((initialDocentes ?? []).map(docenteToEditable));
    setLocalDocentes(editable);
    setOriginalDocentes(editable.map(cloneDocenteEditable));
  }, [initialDocentes, sanitizeDocentes]);

  useEffect(() => {
    if (!grados || grados.length === 0) {
      setSelectedGrade('');
      return;
    }
    setSelectedGrade(prev => (prev && grados.includes(prev)) ? prev : grados[0]);
  }, [grados]);

  useEffect(() => {
    if (!selectedGrade) {
      setSelectedSection('');
      return;
    }
    const secciones = seccionesPorGrado?.[selectedGrade] || [];
    setSelectedSection(prev => (prev && secciones.includes(prev)) ? prev : (secciones[0] ?? ''));
  }, [selectedGrade, seccionesPorGrado]);

  const hasChanges = useMemo(() => !isEqual(localDocentes, originalDocentes), [localDocentes, originalDocentes]);

  // Sincronizar estado local cuando no hay cambios pendientes y los datos de Supabase se actualizan
  useEffect(() => {
    if (!hasChanges && !isSaving) {
      const editable = sanitizeDocentes((initialDocentes ?? []).map(docenteToEditable));
      setLocalDocentes(editable);
      setOriginalDocentes(editable.map(cloneDocenteEditable));
    }
  }, [initialDocentes, hasChanges, isSaving, sanitizeDocentes]);

  const ensureMainAssignmentForDocente = useCallback((docente: DocenteEditable, grado: string, seccion: string) => {
    const asignaciones = docente.asignaciones ? [...docente.asignaciones] : [];
    const existing = asignaciones.find(a => a.grado === grado && a.seccion === seccion && !a.areaId);

    if (existing) {
      return { asignaciones, main: existing };
    }

    const gradoSeccionId = getGradoSeccionId?.(grado, seccion);
    const defaultRol: AsignacionRol = docente.rol === 'Auxiliar' ? 'Auxiliar' : 'Docente';
    const newMain: DocenteAsignacion = {
      id: crypto.randomUUID(),
      grado,
      seccion,
      rol: defaultRol,
      gradoSeccionId,
    };

    return { asignaciones: [...asignaciones, newMain], main: newMain };
  }, [getGradoSeccionId]);

  const handleToggleArea = useCallback((docenteId: string, area: AreaCurricular, checked: boolean) => {
    if (!selectedGrade || !selectedSection) {
      return;
    }

    setLocalDocentes(prev => prev.map(docente => {
      if (docente.numeroDocumento !== docenteId) {
        return docente;
      }

      const { asignaciones, main } = ensureMainAssignmentForDocente(docente, selectedGrade, selectedSection);

      if (docente.rol === 'Auxiliar' && checked) {
        return {
          ...docente,
          asignaciones,
        };
      }

      if (checked) {
        const alreadyAssigned = asignaciones.some(a => a.grado === selectedGrade && a.seccion === selectedSection && a.areaId === area.id);
        if (alreadyAssigned) {
          return docente;
        }

        const newAsignacion: DocenteAsignacion = {
          id: crypto.randomUUID(),
          grado: selectedGrade,
          seccion: selectedSection,
          rol: (main?.rol ?? 'Docente') as AsignacionRol,
          areaId: area.id,
          horasSemanales: main?.horasSemanales,
          gradoSeccionId: main?.gradoSeccionId ?? getGradoSeccionId?.(selectedGrade, selectedSection),
        };

        return {
          ...docente,
          asignaciones: [...asignaciones, newAsignacion],
        };
      }

      let filteredAsignaciones = asignaciones.filter(a => !(a.grado === selectedGrade && a.seccion === selectedSection && a.areaId === area.id));

      const stillHasAreas = filteredAsignaciones.some(a => a.grado === selectedGrade && a.seccion === selectedSection && a.areaId);
      if (!stillHasAreas) {
        filteredAsignaciones = filteredAsignaciones.filter(a => {
          const isMain = a.grado === selectedGrade && a.seccion === selectedSection && !a.areaId;
          if (!isMain) return true;
          return a.rol === 'Docente y Tutor';
        });
      }

      return {
        ...docente,
        asignaciones: filteredAsignaciones,
      };
    }));
  }, [selectedGrade, selectedSection, ensureMainAssignmentForDocente, getGradoSeccionId]);

  const handleToggleTutor = useCallback((docenteId: string, checked: boolean) => {
    if (!selectedGrade || !selectedSection) {
      return;
    }

    setLocalDocentes(prev => prev.map(docente => {
      const isTarget = docente.numeroDocumento === docenteId;

      if (!isTarget && !checked) {
        return docente;
      }

      if (isTarget) {
        const { asignaciones, main } = ensureMainAssignmentForDocente(docente, selectedGrade, selectedSection);
        const updatedAsignaciones = asignaciones.map(asignacion => {
          if (asignacion.grado === selectedGrade && asignacion.seccion === selectedSection && !asignacion.areaId) {
            return {
              ...asignacion,
              rol: (checked ? 'Docente y Tutor' : 'Docente') as AsignacionRol,
            };
          }
          return asignacion;
        });

        if (!checked) {
          const hasAreas = updatedAsignaciones.some(a => a.grado === selectedGrade && a.seccion === selectedSection && a.areaId);
          if (!hasAreas) {
            const filtered = updatedAsignaciones.filter(a => !(a.grado === selectedGrade && a.seccion === selectedSection && !a.areaId));
            return {
              ...docente,
              asignaciones: filtered,
            };
          }
        }

        return {
          ...docente,
          asignaciones: updatedAsignaciones,
        };
      }

      if (checked && docente.asignaciones) {
        const updatedAsignaciones = docente.asignaciones.map(asignacion => {
          if (
            asignacion.grado === selectedGrade &&
            asignacion.seccion === selectedSection &&
            !asignacion.areaId &&
            asignacion.rol === 'Docente y Tutor'
          ) {
            return {
              ...asignacion,
              rol: 'Docente' as AsignacionRol,
            };
          }
          return asignacion;
        });

        if (updatedAsignaciones !== docente.asignaciones) {
          return {
            ...docente,
            asignaciones: updatedAsignaciones,
          };
        }
      }

      return docente;
    }));
  }, [selectedGrade, selectedSection, ensureMainAssignmentForDocente]);

  const handleToggleAuxiliarSection = useCallback((docenteId: string, grado: string, seccion: string, checked: boolean) => {
    if (!grado || !seccion) {
      return;
    }

    setLocalDocentes(prev => prev.map(docente => {
      if (docente.numeroDocumento !== docenteId || docente.rol !== 'Auxiliar') {
        return docente;
      }

      const currentAsignaciones = docente.asignaciones ? [...docente.asignaciones] : [];

      if (checked) {
        const alreadyAssigned = currentAsignaciones.some(asignacion => asignacion.grado === grado && asignacion.seccion === seccion && !asignacion.areaId);
        if (alreadyAssigned) {
          return docente;
        }

        const { asignaciones } = ensureMainAssignmentForDocente(docente, grado, seccion);
        return {
          ...docente,
          asignaciones,
        };
      }

      const filtered = currentAsignaciones.filter(asignacion => !(asignacion.grado === grado && asignacion.seccion === seccion && !asignacion.areaId));
      return {
        ...docente,
        asignaciones: filtered,
      };
    }));
  }, [ensureMainAssignmentForDocente]);

  const saveChanges = async () => {
    setIsSaving(true);
    const startTime = performance.now();
    let docentesConCambios: DocenteEditable[] = [];
    try {
      docentesConCambios = localDocentes.filter(docente => {
        const original = originalDocentes.find(o => o.numeroDocumento === docente.numeroDocumento);
        if (!original) {
          return true;
        }

        if (docente.apellidoPaterno !== original.apellidoPaterno ||
            docente.apellidoMaterno !== original.apellidoMaterno ||
            docente.nombres !== original.nombres ||
            docente.email !== original.email ||
            docente.telefono !== original.telefono ||
            docente.rol !== original.rol) {
          return true;
        }

        return !isEqual(docente.asignaciones, original.asignaciones);
      });

      const success = docentesConCambios.length === 0
        ? true
        : await setGlobalDocentes(docentesConCambios.map(editableToDocente));
      if (success) {
        setOriginalDocentes(localDocentes.map(cloneDocenteEditable));
        if (isSheetOpen) {
          setIsSheetOpen(false);
          setSelectedDocenteId(null);
        }
        toast({
          title: 'Carga académica actualizada',
          description: 'Los cambios en las asignaciones han sido guardados en Supabase.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al guardar',
          description: 'No se pudieron guardar los cambios. Reintenta más tarde.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'Ocurrió un error inesperado al guardar los cambios.',
      });
    } finally {
      setIsSaving(false);
      const totalDurationMs = performance.now() - startTime;
      const totalAsignaciones = localDocentes.reduce((acc, docente) => acc + (docente.asignaciones?.length ?? 0), 0);
      const asignacionesCambiadas = docentesConCambios.reduce((acc, docente) => acc + (docente.asignaciones?.length ?? 0), 0);

      console.info('CargaAcadémica::saveChanges', {
        durationMs: Number(totalDurationMs.toFixed(2)),
        docentesTotales: localDocentes.length,
        docentesConCambios: docentesConCambios.length,
        asignacionesTotales: totalAsignaciones,
        asignacionesCambiadas,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const docenteAsignacionesPorGradoSeccion = useMemo(() => {
    if (!selectedGrade || !selectedSection) return new Map<string, { areaIds: Set<string>; tutor: boolean }>();

    const map = new Map<string, { areaIds: Set<string>; tutor: boolean }>();
    localDocentes.forEach(docente => {
      const areaIds = new Set<string>();
      let tutor = false;

      docente.asignaciones?.forEach(asignacion => {
        if (asignacion.grado === selectedGrade && asignacion.seccion === selectedSection) {
          if (asignacion.areaId) {
            areaIds.add(asignacion.areaId);
          } else if (asignacion.rol === 'Docente y Tutor') {
            tutor = true;
          }
        }
      });

      map.set(docente.numeroDocumento, { areaIds, tutor });
    });

    return map;
  }, [localDocentes, selectedGrade, selectedSection]);

  const filteredDocentes = useMemo(() => {
    if (!localDocentes) return [];
    const term = searchTerm.toLowerCase();

    return localDocentes.filter(docente => {
      const fullName = `${docente.nombres} ${docente.apellidoPaterno} ${docente.apellidoMaterno}`.trim().toLowerCase();
      const matchesSearch = !term || fullName.includes(term) || docente.numeroDocumento.includes(term);
      if (!matchesSearch) return false;

      if (!showOnlyChanged) return true;

      const original = originalDocentes.find(o => o.numeroDocumento === docente.numeroDocumento);
      if (!original) return true;

      return !isEqual(original.asignaciones, docente.asignaciones);
    });
  }, [localDocentes, originalDocentes, searchTerm, showOnlyChanged]);
  
  const areasForGrade = useMemo(() => (selectedGrade ? (areasPorGrado?.[selectedGrade] || []) : []), [selectedGrade, areasPorGrado]);
  const sectionsForGrade = useMemo(() => (selectedGrade ? (seccionesPorGrado?.[selectedGrade] || []) : []), [selectedGrade, seccionesPorGrado]);

  const areasCatalog = useMemo(() => {
    const map = new Map<string, AreaCurricular>();
    if (areasPorGrado) {
      Object.values(areasPorGrado).forEach(areaList => {
        areaList?.forEach(area => {
          map.set(area.id, area);
        });
      });
    }
    return map;
  }, [areasPorGrado]);

  const docentesOrdenados = useMemo(() => {
    const sorted = [...filteredDocentes];
    sorted.sort((a, b) => {
      const nameA = `${a.apellidoPaterno ?? ''} ${a.apellidoMaterno ?? ''} ${a.nombres ?? ''}`.trim().toLowerCase();
      const nameB = `${b.apellidoPaterno ?? ''} ${b.apellidoMaterno ?? ''} ${b.nombres ?? ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
    return sorted;
  }, [filteredDocentes]);

  const hasSelection = Boolean(selectedGrade && selectedSection);

  const docentesConCambios = useMemo(() => {
    if (!hasSelection) return new Set<string>();
    const changed = new Set<string>();

    localDocentes.forEach(docente => {
      const original = originalDocentes.find(o => o.numeroDocumento === docente.numeroDocumento);
      if (!original) {
        changed.add(docente.numeroDocumento);
        return;
      }

      if (!isEqual(original.asignaciones, docente.asignaciones)) {
        changed.add(docente.numeroDocumento);
      }
    });

    return changed;
  }, [hasSelection, localDocentes, originalDocentes]);

  const totalCambiosPendientes = docentesConCambios.size;

  const docentesPendientes = useMemo(() => {
    if (!hasSelection) return [];
    return docentesOrdenados.filter(docente => docentesConCambios.has(docente.numeroDocumento));
  }, [docentesOrdenados, docentesConCambios, hasSelection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGrade, selectedSection, showOnlyChanged]);

  const totalDocentes = docentesOrdenados.length;
  const totalPages = Math.max(1, Math.ceil(totalDocentes / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(prev => (prev > totalPages ? totalPages : prev));
  }, [totalPages]);

  const paginatedDocentes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return docentesOrdenados.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, docentesOrdenados]);

  const pageStart = totalDocentes === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = totalDocentes === 0 ? 0 : Math.min(totalDocentes, currentPage * ITEMS_PER_PAGE);
  const docentesSummary = totalDocentes === 0 ? '0 docente(s)' : `${pageStart}-${pageEnd} de ${totalDocentes} docente(s)`;
  const areasSummary = `${areasForGrade.length} área(s)`;

  const docentesAsignados = useMemo(() => {
    if (!hasSelection) return [] as { docente: Docente; areas: AreaCurricular[]; esTutor: boolean }[];

    return docentesOrdenados
      .map(docente => {
        const snapshot = docenteAsignacionesPorGradoSeccion.get(docente.numeroDocumento);
        const areaIds = Array.from(snapshot?.areaIds ?? []);
        const areasAsignadas = areaIds
          .map(areaId => areasForGrade.find(area => area.id === areaId))
          .filter((area): area is AreaCurricular => Boolean(area));

        const esTutor = snapshot?.tutor ?? false;

        return {
          docente,
          areas: areasAsignadas,
          esTutor,
        };
      })
      .filter(entry => entry.areas.length > 0 || entry.esTutor);
  }, [areasForGrade, docenteAsignacionesPorGradoSeccion, docentesOrdenados, hasSelection]);

  const areasConDocentes = useMemo(() => {
    if (!hasSelection) return [] as { area: AreaCurricular; docentes: Docente[] }[];

    return areasForGrade.map(area => {
      const docentes = docentesOrdenados.filter(docente => {
        const snapshot = docenteAsignacionesPorGradoSeccion.get(docente.numeroDocumento);
        return snapshot?.areaIds.has(area.id) ?? false;
      });

      return { area, docentes };
    });
  }, [areasForGrade, docentesOrdenados, docenteAsignacionesPorGradoSeccion, hasSelection]);

  const tutoresGlobales = useMemo(() => {
    const registros: { docente: Docente; grado?: string; seccion?: string }[] = [];

    localDocentes.forEach(docenteEditable => {
      const docente = editableToDocente(docenteEditable);

      docenteEditable.asignaciones?.forEach(asignacion => {
        if (!asignacion.areaId && asignacion.rol === 'Docente y Tutor') {
          registros.push({ docente, grado: asignacion.grado, seccion: asignacion.seccion });
        }
      });
    });

    registros.sort((a, b) => {
      const gradoA = a.grado ?? '';
      const gradoB = b.grado ?? '';
      if (gradoA !== gradoB) return gradoA.localeCompare(gradoB, undefined, { numeric: true, sensitivity: 'base' });
      const seccionA = a.seccion ?? '';
      const seccionB = b.seccion ?? '';
      return seccionA.localeCompare(seccionB, undefined, { numeric: true, sensitivity: 'base' });
    });

    return registros;
  }, [localDocentes]);

  const docentesDetalle = useMemo(() => {
    return localDocentes.map(docenteEditable => {
      const docente = editableToDocente(docenteEditable);
      const agrupado = new Map<string, { grado: string; seccion: string; areas: AreaCurricular[]; esTutor: boolean }>();

      docenteEditable.asignaciones?.forEach(asignacion => {
        const grado = asignacion.grado ?? '—';
        const seccion = asignacion.seccion ?? '—';
        const key = `${grado}::${seccion}`;

        if (!agrupado.has(key)) {
          agrupado.set(key, { grado, seccion, areas: [], esTutor: false });
        }

        const registro = agrupado.get(key)!;

        if (asignacion.areaId) {
          const area = areasCatalog.get(asignacion.areaId);
          if (area) {
            registro.areas.push(area);
          }
        }

        if (!asignacion.areaId && asignacion.rol === 'Docente y Tutor') {
          registro.esTutor = true;
        }
      });

      const detalle = Array.from(agrupado.values()).sort((a, b) => {
        if (a.grado !== b.grado) {
          return a.grado.localeCompare(b.grado, undefined, { numeric: true, sensitivity: 'base' });
        }
        return a.seccion.localeCompare(b.seccion, undefined, { numeric: true, sensitivity: 'base' });
      });

      return { docente, detalle };
    });
  }, [areasCatalog, localDocentes]);

  const gradosSeccionesDetalle = useMemo(() => {
    const map = new Map<string, { grado: string; seccion: string; docentes: Map<string, { docente: Docente; areas: AreaCurricular[]; esTutor: boolean }> }>();

    localDocentes.forEach(docenteEditable => {
      const docente = editableToDocente(docenteEditable);
      docenteEditable.asignaciones?.forEach(asignacion => {
        if (!asignacion.grado || !asignacion.seccion) {
          return;
        }

        const key = `${asignacion.grado}::${asignacion.seccion}`;
        if (!map.has(key)) {
          map.set(key, {
            grado: asignacion.grado,
            seccion: asignacion.seccion,
            docentes: new Map(),
          });
        }

        const entry = map.get(key)!;
        if (!entry.docentes.has(docente.numeroDocumento)) {
          entry.docentes.set(docente.numeroDocumento, {
            docente,
            areas: [],
            esTutor: false,
          });
        }

        const docenteEntry = entry.docentes.get(docente.numeroDocumento)!;

        if (asignacion.areaId) {
          const area = areasCatalog.get(asignacion.areaId);
          if (area) {
            docenteEntry.areas.push(area);
          }
        } else if (asignacion.rol === 'Docente y Tutor') {
          docenteEntry.esTutor = true;
        }
      });
    });

    const detalle = Array.from(map.values()).map(({ grado, seccion, docentes }) => ({
      grado,
      seccion,
      docentes: Array.from(docentes.values()).map(item => ({
        ...item,
        areas: item.areas.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { sensitivity: 'base' })),
      })),
    }));

    detalle.sort((a, b) => {
      if (a.grado !== b.grado) {
        return a.grado.localeCompare(b.grado, undefined, { numeric: true, sensitivity: 'base' });
      }
      return a.seccion.localeCompare(b.seccion, undefined, { numeric: true, sensitivity: 'base' });
    });

    return detalle;
  }, [areasCatalog, localDocentes]);

  const gradeDetailGrades = useMemo(() => Array.from(new Set(gradosSeccionesDetalle.map(item => item.grado))), [gradosSeccionesDetalle]);

  const gradeDetailSections = useMemo(() => {
    if (!gradeDetailFilter) return Array.from(new Set(gradosSeccionesDetalle.map(item => item.seccion)));
    return Array.from(new Set(gradosSeccionesDetalle.filter(item => item.grado === gradeDetailFilter).map(item => item.seccion)));
  }, [gradosSeccionesDetalle, gradeDetailFilter]);

  const filteredGradeDetail = useMemo(() => {
    return gradosSeccionesDetalle.filter(item => {
      if (gradeDetailFilter && item.grado !== gradeDetailFilter) return false;
      if (sectionDetailFilter && item.seccion !== sectionDetailFilter) return false;
      return true;
    });
  }, [gradosSeccionesDetalle, gradeDetailFilter, sectionDetailFilter]);

  useEffect(() => {
    if (!showGradeDetail) return;
    if (gradeDetailFilter && !gradeDetailGrades.includes(gradeDetailFilter)) {
      setGradeDetailFilter('');
      setSectionDetailFilter('');
    }
  }, [showGradeDetail, gradeDetailFilter, gradeDetailGrades]);

  useEffect(() => {
    if (!showGradeDetail) return;
    if (sectionDetailFilter && !gradeDetailSections.includes(sectionDetailFilter)) {
      setSectionDetailFilter('');
    }
  }, [showGradeDetail, sectionDetailFilter, gradeDetailSections]);

  const areasDetalle = useMemo(() => {
    const map = new Map<string, { area: AreaCurricular; asignaciones: { grado: string; seccion: string; docente: Docente; esTutor: boolean }[] }>();

    localDocentes.forEach(docenteEditable => {
      const docente = editableToDocente(docenteEditable);
      const asignaciones = docenteEditable.asignaciones || [];
      asignaciones.forEach(asignacion => {
        if (!asignacion.areaId) return;

        const area = areasCatalog.get(asignacion.areaId);
        if (!area) return;

        const key = area.id;
        if (!map.has(key)) {
          map.set(key, {
            area,
            asignaciones: [],
          });
        }

        const esTutor = asignacion.rol === 'Docente y Tutor';
        map.get(key)!.asignaciones.push({
          grado: asignacion.grado,
          seccion: asignacion.seccion,
          docente,
          esTutor,
        });
      });
    });

    const detalle = Array.from(map.values()).map(entry => ({
      area: entry.area,
      asignaciones: entry.asignaciones.sort((a, b) => {
        if (a.grado !== b.grado) {
          return a.grado.localeCompare(b.grado, undefined, { numeric: true, sensitivity: 'base' });
        }
        return a.seccion.localeCompare(b.seccion, undefined, { numeric: true, sensitivity: 'base' });
      }),
    }));

    detalle.sort((a, b) => a.area.nombre.localeCompare(b.area.nombre, undefined, { sensitivity: 'base' }));
    return detalle;
  }, [areasCatalog, localDocentes]);

  type AreaDocenteAsignacion = { grado: string; seccion: string };
  type AreaDocenteDetalle = { docente: Docente; asignaciones: AreaDocenteAsignacion[] };
  type AreaDetalleAgrupada = { area: AreaCurricular; docentes: AreaDocenteDetalle[] };

  const groupedAreas = useMemo<AreaDetalleAgrupada[]>(() => {
    return areasDetalle.map(entry => ({
      area: entry.area,
      docentes: entry.asignaciones.reduce<AreaDocenteDetalle[]>((acc, asignacion) => {
        const existing = acc.find(item => item.docente.numeroDocumento === asignacion.docente.numeroDocumento);
        if (existing) {
          existing.asignaciones.push({ grado: asignacion.grado, seccion: asignacion.seccion });
        } else {
          acc.push({ docente: asignacion.docente, asignaciones: [{ grado: asignacion.grado, seccion: asignacion.seccion }] });
        }
        return acc;
      }, []),
    }));
  }, [areasDetalle]);

  const areaDetailGrades = useMemo(() => {
    const grades = new Set<string>();
    groupedAreas.forEach(entry => {
      entry.docentes.forEach(({ asignaciones }) => {
        asignaciones.forEach(({ grado }) => grades.add(grado));
      });
    });
    return Array.from(grades).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [groupedAreas]);

  const areaDetailSections = useMemo(() => {
    const sections = new Set<string>();
    groupedAreas.forEach(entry => {
      entry.docentes.forEach(({ asignaciones }) => {
        asignaciones
          .filter(({ grado }) => !areaDetailGradeFilter || grado === areaDetailGradeFilter)
          .forEach(({ seccion }) => sections.add(seccion));
      });
    });
    return Array.from(sections).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [groupedAreas, areaDetailGradeFilter]);

  const filteredAreaDetail = useMemo(() => {
    return groupedAreas.filter(entry => {
      if (areaDetailFilter && entry.area.id !== areaDetailFilter) return false;

      const hasMatch = entry.docentes.some(({ asignaciones }) => {
        return asignaciones.some(({ grado, seccion }) => {
          const matchesGrade = !areaDetailGradeFilter || grado === areaDetailGradeFilter;
          const matchesSection = !areaDetailSectionFilter || seccion === areaDetailSectionFilter;
          return matchesGrade && matchesSection;
        });
      });

      return hasMatch;
    });
  }, [groupedAreas, areaDetailFilter, areaDetailGradeFilter, areaDetailSectionFilter]);

  type TutorDetalle = { docente: Docente; asignaciones: Asignacion[] };
  type TutorAgrupado = { grado: string; seccion: string; docentes: TutorDetalle[] };

  const groupedTutores = useMemo<TutorAgrupado[]>(() => {
    const map = new Map<string, TutorAgrupado>();

    localDocentes.forEach(docenteEditable => {
      const docente = editableToDocente(docenteEditable);
      (docenteEditable.asignaciones || []).forEach(asignacion => {
        if (asignacion.rol !== 'Docente y Tutor') return;
        const key = `${asignacion.grado}|${asignacion.seccion}`;
        if (!map.has(key)) {
          map.set(key, {
            grado: asignacion.grado,
            seccion: asignacion.seccion,
            docentes: [],
          });
        }

        const entry = map.get(key)!;
        const existingDoc = entry.docentes.find(item => item.docente.numeroDocumento === docente.numeroDocumento);
        const asignacionesDocente = (docenteEditable.asignaciones || []).filter(a => a.grado === asignacion.grado && a.seccion === asignacion.seccion);

        if (existingDoc) {
          asignacionesDocente.forEach(asig => {
            if (!existingDoc.asignaciones.some(existing => existing.areaId === asig.areaId)) {
              existingDoc.asignaciones.push(asig);
            }
          });
        } else {
          entry.docentes.push({
            docente,
            asignaciones: [...asignacionesDocente],
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.grado !== b.grado) {
        return a.grado.localeCompare(b.grado, undefined, { numeric: true, sensitivity: 'base' });
      }
      return a.seccion.localeCompare(b.seccion, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [localDocentes]);

  const tutorGrades = useMemo(() => {
    const grades = new Set<string>();
    groupedTutores.forEach(({ grado }) => grades.add(grado));
    return Array.from(grades).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [groupedTutores]);

  const tutorSections = useMemo(() => {
    const sections = new Set<string>();
    groupedTutores
      .filter(entry => !tutorGradeFilter || entry.grado === tutorGradeFilter)
      .forEach(entry => sections.add(entry.seccion));
    return Array.from(sections).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [groupedTutores, tutorGradeFilter]);

  const filteredTutores = useMemo<TutorAgrupado[]>(() => {
    return groupedTutores.filter(entry => {
      if (tutorGradeFilter && entry.grado !== tutorGradeFilter) return false;
      if (tutorSectionFilter && entry.seccion !== tutorSectionFilter) return false;
      return true;
    });
  }, [groupedTutores, tutorGradeFilter, tutorSectionFilter]);

  const tutorGradeSectionMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    groupedTutores.forEach(entry => {
      if (!map.has(entry.grado)) {
        map.set(entry.grado, new Set<string>());
      }
      map.get(entry.grado)!.add(entry.seccion);
    });
    return map;
  }, [groupedTutores]);

  useEffect(() => {
    if (!showTutorDetail) return;
    if (tutorGradeFilter && !tutorGrades.includes(tutorGradeFilter)) {
      setTutorGradeFilter('');
      setTutorSectionFilter('');
    }
  }, [showTutorDetail, tutorGradeFilter, tutorGrades]);

  useEffect(() => {
    if (!showTutorDetail) return;
    if (tutorSectionFilter && !tutorSections.includes(tutorSectionFilter)) {
      setTutorSectionFilter('');
    }
  }, [showTutorDetail, tutorSectionFilter, tutorSections]);

  const uniqueTutores = useMemo(() => {
    const map = new Map<string, { docente: Docente; asignaciones: { grado: string; seccion: string }[] }>();

    groupedTutores.forEach(({ docentes, grado, seccion }) => {
      docentes.forEach(({ docente }) => {
        if (!map.has(docente.numeroDocumento)) {
          map.set(docente.numeroDocumento, {
            docente,
            asignaciones: [],
          });
        }

        const entry = map.get(docente.numeroDocumento)!;
        if (!entry.asignaciones.some(asignacion => asignacion.grado === grado && asignacion.seccion === seccion)) {
          entry.asignaciones.push({ grado, seccion });
        }
      });
    });

    return Array.from(map.values());
  }, [groupedTutores]);

  const docenteActivo = useMemo(() => {
    if (!selectedDocenteId) return null;
    return localDocentes.find(docente => docente.numeroDocumento === selectedDocenteId) ?? null;
  }, [selectedDocenteId, localDocentes]);

  const areasAsignadasDocenteActivo = useMemo(() => {
    if (!docenteActivo || !hasSelection) return new Set<string>();
    const asignadas = new Set<string>();
    docenteActivo.asignaciones?.forEach(asignacion => {
      if (asignacion.grado === selectedGrade && asignacion.seccion === selectedSection && asignacion.areaId) {
        asignadas.add(asignacion.areaId);
      }
    });
    return asignadas;
  }, [docenteActivo, hasSelection, selectedGrade, selectedSection]);

  const seccionesAsignadasDocenteActivo = useMemo(() => {
    if (!docenteActivo) return new Set<string>();
    const asignadas = new Set<string>();
    docenteActivo.asignaciones?.forEach(asignacion => {
      if (!asignacion.areaId && asignacion.grado && asignacion.seccion) {
        asignadas.add(`${asignacion.grado}|${asignacion.seccion}`);
      }
    });
    return asignadas;
  }, [docenteActivo]);

  const seccionesAsignadasEnGradoActual = useMemo(() => {
    if (!selectedGrade) return 0;
    return Array.from(seccionesAsignadasDocenteActivo).filter(key => key.startsWith(`${selectedGrade}|`)).length;
  }, [seccionesAsignadasDocenteActivo, selectedGrade]);

  const tutorActivo = useMemo(() => {
    if (!docenteActivo || !selectedGrade || !selectedSection) return false;
    return (docenteActivo.asignaciones ?? []).some(asignacion => {
      return asignacion.grado === selectedGrade && asignacion.seccion === selectedSection && !asignacion.areaId && asignacion.rol === 'Docente y Tutor';
    });
  }, [docenteActivo, selectedGrade, selectedSection]);

  const docenteActivoEsAuxiliar = docenteActivo?.rol === 'Auxiliar';

  const docenteActivoTieneCambios = docenteActivo
    ? docentesConCambios.has(docenteActivo.numeroDocumento)
    : false;

  const formatAreaBadgeLabel = useCallback((areaId: string) => {
    const area = areasCatalog.get(areaId);
    return area ? area.nombre : areaId;
  }, [areasCatalog]);

  const handleSelectDocente = useCallback((docenteId: string) => {
    if (selectedDocenteId === docenteId && isSheetOpen) {
      setIsSheetOpen(false);
      setSelectedDocenteId(null);
      return;
    }

    setSelectedDocenteId(docenteId);
    setIsSheetOpen(true);
  }, [isSheetOpen, selectedDocenteId]);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setSelectedDocenteId(null);
    }
  }, []);

  const handleCloseDocenteSheet = useCallback(() => {
    setIsSheetOpen(false);
    setSelectedDocenteId(null);
  }, []);

  const handleAssignAllAreas = useCallback(() => {
    if (!docenteActivo || !selectedGrade) return;

    if (docenteActivo.rol === 'Auxiliar') {
      setLocalDocentes(prev => prev.map(docente => {
        if (docente.numeroDocumento !== docenteActivo.numeroDocumento) {
          return docente;
        }

        let updatedAsignaciones = docente.asignaciones ? [...docente.asignaciones] : [];

        sectionsForGrade.forEach(seccion => {
          const { asignaciones } = ensureMainAssignmentForDocente({ ...docente, asignaciones: updatedAsignaciones }, selectedGrade, seccion);
          updatedAsignaciones = asignaciones;
        });

        return {
          ...docente,
          asignaciones: updatedAsignaciones,
        };
      }));
      return;
    }

    if (!selectedSection) return;

    setLocalDocentes(prev => prev.map(docente => {
      if (docente.numeroDocumento !== docenteActivo.numeroDocumento) {
        return docente;
      }

      const { asignaciones, main } = ensureMainAssignmentForDocente(docente, selectedGrade, selectedSection);
      const existingAreaIds = new Set(
        asignaciones
          .filter(asignacion => asignacion.grado === selectedGrade && asignacion.seccion === selectedSection && asignacion.areaId)
          .map(asignacion => asignacion.areaId as string),
      );

      const nuevasAsignaciones: DocenteAsignacion[] = areasForGrade
        .filter(area => !existingAreaIds.has(area.id))
        .map(area => ({
          id: crypto.randomUUID(),
          grado: selectedGrade,
          seccion: selectedSection,
          areaId: area.id,
          rol: (main?.rol ?? (docente.rol === 'Auxiliar' ? 'Auxiliar' : 'Docente')) as AsignacionRol,
          horasSemanales: main?.horasSemanales,
          gradoSeccionId: main?.gradoSeccionId ?? getGradoSeccionId?.(selectedGrade, selectedSection),
        }));

      if (nuevasAsignaciones.length === 0) {
        return {
          ...docente,
          asignaciones,
        };
      }

      return {
        ...docente,
        asignaciones: [...asignaciones, ...nuevasAsignaciones],
      };
    }));
  }, [areasForGrade, docenteActivo, ensureMainAssignmentForDocente, getGradoSeccionId, sectionsForGrade, selectedGrade, selectedSection]);

  const handleClearAreas = useCallback(() => {
    if (!docenteActivo || !selectedGrade || !selectedSection) return;

    setLocalDocentes(prev => prev.map(docente => {
      if (docente.numeroDocumento !== docenteActivo.numeroDocumento) {
        return docente;
      }

      const { asignaciones } = ensureMainAssignmentForDocente(docente, selectedGrade, selectedSection);
      const filtered = asignaciones.filter(asignacion => {
        if (asignacion.grado !== selectedGrade || asignacion.seccion !== selectedSection) {
          return true;
        }

        if (!asignacion.areaId) {
          return asignacion.rol === 'Docente y Tutor';
        }

        return false;
      });

      return {
        ...docente,
        asignaciones: filtered,
      };
    }));
  }, [docenteActivo, ensureMainAssignmentForDocente, selectedGrade, selectedSection]);

  const renderDocentesTable = () => {
    if (docentesOrdenados.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
            Ningún docente coincide con la búsqueda.
          </TableCell>
        </TableRow>
      );
    }

    return paginatedDocentes.map(docente => {
      const snapshot = docenteAsignacionesPorGradoSeccion.get(docente.numeroDocumento);
      const totalAreas = snapshot?.areaIds.size ?? 0;
      const isTutor = snapshot?.tutor ?? false;
      const isActive = selectedDocenteId === docente.numeroDocumento && isSheetOpen;
      const areaBadges = Array.from(snapshot?.areaIds ?? []).slice(0, MAX_VISIBLE_BADGES);
      const hiddenCount = Math.max(0, totalAreas - areaBadges.length);
      const isChanged = docentesConCambios.has(docente.numeroDocumento);

      return (
        <TableRow
          key={docente.numeroDocumento}
          className={`transition-colors ${isActive ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted/30'}`}
        >
          <TableCell className="space-y-1">
            <button
              type="button"
              onClick={() => handleSelectDocente(docente.numeroDocumento)}
              className="text-left text-sm font-semibold text-foreground hover:text-primary"
            >
              {docente.apellidoPaterno} {docente.apellidoMaterno}, {docente.nombres}
            </button>
            <p className="text-xs text-muted-foreground">DNI {docente.numeroDocumento}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className="rounded-full px-2 text-[11px]">
                {totalAreas} área(s)
              </Badge>
              {isChanged && (
                <Badge variant="secondary" className="rounded-full px-2 text-[11px]">
                  Sin guardar
                </Badge>
              )}
            </div>
          </TableCell>
          <TableCell className="text-center text-sm font-medium text-foreground">
            {selectedGrade || '—'}
          </TableCell>
          <TableCell className="text-center text-sm text-muted-foreground">
            {selectedSection || '—'}
          </TableCell>
          <TableCell className="text-center">
            <Checkbox
              checked={isTutor}
              onCheckedChange={(state) => handleToggleTutor(docente.numeroDocumento, state === true)}
              aria-label={`Marcar a ${docente.nombres} como tutor`}
              className="mx-auto"
            />
          </TableCell>
          <TableCell className="text-center text-sm font-semibold text-foreground">
            {totalAreas}
          </TableCell>
          <TableCell>
            {totalAreas === 0 ? (
              <span className="text-xs text-muted-foreground">Sin áreas asignadas</span>
            ) : (
              <ScrollArea className="max-h-24">
                <div className="flex flex-wrap items-center gap-2 pr-4">
                  {areaBadges.map(areaId => (
                    <Badge key={areaId} variant="outline" className="text-[11px]">
                      {formatAreaBadgeLabel(areaId)}
                    </Badge>
                  ))}
                  {hiddenCount > 0 && (
                    <Badge variant="secondary" className="text-[11px]">+{hiddenCount}</Badge>
                  )}
                </div>
              </ScrollArea>
            )}
          </TableCell>
          <TableCell>
            <div className="flex items-center justify-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="icon"
                    aria-label="Editar asignaciones"
                    onClick={() => handleSelectDocente(docente.numeroDocumento)}
                  >
                    {isActive ? (
                      <X className="h-4 w-4" />
                    ) : docente.rol === 'Auxiliar' ? (
                      <UserCheck className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {isActive ? 'Cerrar panel de asignaciones' : 'Editar asignaciones'}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Ver detalle por docente"
                    onClick={() => {
                      setDocenteDetailId(docente.numeroDocumento);
                      setShowDocenteDetail(true);
                    }}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Ver detalle completo
                </TooltipContent>
              </Tooltip>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="space-y-8">
      {hasChanges && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
          <Button size="lg" onClick={saveChanges} disabled={isSaving} className="shadow-lg">
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            {totalCambiosPendientes > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalCambiosPendientes}
              </Badge>
            )}
          </Button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
          Carga Académica
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Administra la asignación de áreas y tutorías para cada docente. Utiliza los filtros y paneles para obtener vistas específicas por docente, grado/sección, área o tutores.
        </p>
      </div>

      <Card className="overflow-hidden border border-border/60 shadow-sm">
        <CardHeader className="space-y-4 border-b border-border/70 bg-muted/20 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))] md:items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="grado-select">Grado</Label>
              <Select value={selectedGrade || undefined} onValueChange={value => setSelectedGrade(value)}>
                <SelectTrigger id="grado-select" aria-label="Seleccionar grado">
                  <SelectValue placeholder="Selecciona un grado" />
                </SelectTrigger>
                <SelectContent>
                  {(grados || []).map(grado => (
                    <SelectItem key={grado} value={grado}>
                      {grado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="seccion-select">Sección</Label>
              <Select
                value={selectedSection || undefined}
                onValueChange={value => setSelectedSection(value)}
                disabled={!selectedGrade || sectionsForGrade.length === 0}
              >
                <SelectTrigger id="seccion-select" aria-label="Seleccionar sección">
                  <SelectValue placeholder={selectedGrade ? 'Selecciona una sección' : 'Elige un grado primero'} />
                </SelectTrigger>
                <SelectContent>
                  {sectionsForGrade.map(seccion => (
                    <SelectItem key={seccion} value={seccion}>
                      {seccion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="buscar-docente">Buscar docente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="buscar-docente"
                  placeholder="Nombre o documento"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground" />
        </CardHeader>

        <CardContent className="p-0">
          {!selectedGrade ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              Selecciona un grado para comenzar a asignar carga académica.
            </div>
          ) : !selectedSection ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              Selecciona una sección disponible para el grado{' '}
              <span className="font-medium text-foreground">{selectedGrade}</span>.
            </div>
          ) : areasForGrade.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No hay áreas configuradas para el grado{' '}
              <span className="font-medium text-foreground">{selectedGrade}</span>.
            </div>
          ) : (
            <div className="space-y-6 p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {docentesSummary}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    {areasSummary}
                  </Badge>
                  {docentesPendientes.length > 0 && (
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                      {docentesPendientes.length} sin guardar
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDocenteDetail(true)} className="gap-2">
                    <BookOpen className="h-4 w-4" /> Ver por docente
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      const normalizedGrade = selectedGrade && gradeDetailGrades.includes(selectedGrade) ? selectedGrade : '';
                      setGradeDetailFilter(normalizedGrade);

                      if (normalizedGrade) {
                        const sectionsForGradeNormalized = Array.from(
                          new Set(gradosSeccionesDetalle.filter(item => item.grado === normalizedGrade).map(item => item.seccion)),
                        );
                        const normalizedSection = selectedSection && sectionsForGradeNormalized.includes(selectedSection) ? selectedSection : '';
                        setSectionDetailFilter(normalizedSection);
                      } else {
                        setSectionDetailFilter('');
                      }

                      setShowGradeDetail(true);
                    }}
                  >
                    <GraduationCap className="h-4 w-4" /> Ver por grado/sección
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      const defaultArea = areaDetailFilter || (groupedAreas[0]?.area.id ?? '');
                      setAreaDetailFilter(defaultArea);

                      if (defaultArea) {
                        const asignaciones = groupedAreas.find(entry => entry.area.id === defaultArea)?.docentes.flatMap(item => item.asignaciones) ?? [];
                        const defaultGrado = asignaciones.some(asignacion => asignacion.grado === selectedGrade) ? selectedGrade : '';
                        setAreaDetailGradeFilter(defaultGrado);

                        if (defaultGrado) {
                          const sectionsForArea = asignaciones
                            .filter(asignacion => asignacion.grado === defaultGrado)
                            .map(asignacion => asignacion.seccion);
                          const defaultSeccion = sectionsForArea.includes(selectedSection) ? selectedSection : '';
                          setAreaDetailSectionFilter(defaultSeccion);
                        } else {
                          setAreaDetailSectionFilter('');
                        }
                      }

                      setShowAreaDetail(true);
                    }}
                  >
                    <Layers className="h-4 w-4" /> Ver por área
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      const defaultGrade = selectedGrade && tutorGrades.includes(selectedGrade) ? selectedGrade : '';
                      setTutorGradeFilter(defaultGrade);

                      if (defaultGrade) {
                        const tutorSectionsForGrade = Array.from(tutorGradeSectionMap.get(defaultGrade) ?? []);
                        const defaultSection = selectedSection && tutorSectionsForGrade.includes(selectedSection) ? selectedSection : '';
                        setTutorSectionFilter(defaultSection);
                      } else {
                        setTutorSectionFilter('');
                      }

                      setShowTutorDetail(true);
                    }}
                  >
                    <Users className="h-4 w-4" /> Ver tutores
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowInsights(true)} className="gap-2">
                    <Sparkles className="h-4 w-4" /> Insights globales
                  </Button>
                </div>
              </div>

              <TooltipProvider delayDuration={150}>
                <div className="overflow-auto rounded-xl border border-border/60 bg-card">
                  <Table className="min-w-[720px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead style={{ width: DOC_COLUMN_WIDTH }}>Docente</TableHead>
                        <TableHead className="w-24 text-center">Grado</TableHead>
                        <TableHead className="w-24 text-center">Sección</TableHead>
                        <TableHead className="w-24 text-center">Tutoría</TableHead>
                        <TableHead className="w-24 text-center">Total áreas</TableHead>
                        <TableHead className="text-center">Áreas asignadas</TableHead>
                        <TableHead className="w-28 text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderDocentesTable()}</TableBody>
                  </Table>
                </div>
              </TooltipProvider>

              <div className="flex flex-col gap-4 border-t border-border/70 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Mostrando{' '}
                  <span className="font-semibold text-foreground">
                    {pageStart}-{pageEnd}
                  </span>{' '}
                  de{' '}
                  <span className="font-semibold text-foreground">{totalDocentes}</span> docente(s)
                </p>
                <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {hasSelection && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold leading-tight">Docentes con cambios pendientes</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Revisa rápidamente quiénes tienen modificaciones sin guardar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {docentesPendientes.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  No hay cambios sin guardar para la selección actual.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {docentesPendientes.map(docente => (
                    <Button
                      key={docente.numeroDocumento}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleSelectDocente(docente.numeroDocumento)}
                    >
                      <span className="text-xs font-medium text-foreground">
                        {docente.apellidoPaterno} {docente.apellidoMaterno}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        DNI {docente.numeroDocumento}
                      </Badge>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {uniqueTutores.length > 0 && (
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold leading-tight">Resumen de tutores ({uniqueTutores.length})</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Docentes con rol de tutoría y sus asignaciones actuales.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScrollArea className="h-40">
                  <div className="space-y-3 pr-2">
                    {uniqueTutores.map(({ docente, asignaciones }) => (
                      <div key={docente.numeroDocumento} className="rounded-lg border bg-muted/10 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {docente.apellidoPaterno} {docente.apellidoMaterno}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{docente.nombres}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {asignaciones.length} sección(es)
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {asignaciones.map(asignacion => (
                            <Badge
                              key={`${docente.numeroDocumento}-${asignacion.grado}-${asignacion.seccion}`}
                              variant="outline"
                              className="text-[11px]"
                            >
                              {asignacion.grado} • {asignacion.seccion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Sheet open={Boolean(docenteActivo) && isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent side="right" className="w-full overflow-hidden px-0 md:w-[33vw] md:max-w-none">
          {docenteActivo && hasSelection ? (
            <div className="flex h-full flex-col">
              <SheetHeader className="px-6 pt-6 pb-4 text-left">
                <SheetTitle className="text-lg font-semibold text-foreground">
                  {docenteActivo.apellidoPaterno} {docenteActivo.apellidoMaterno}, {docenteActivo.nombres}
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  DNI {docenteActivo.numeroDocumento} • {selectedGrade} {selectedSection && `• ${selectedSection}`} • {areasAsignadasDocenteActivo.size} área(s)
                </SheetDescription>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant={docenteActivoTieneCambios ? 'secondary' : 'outline'} className="px-2 py-1">
                    {docenteActivoTieneCambios ? 'Cambios sin guardar' : 'Sin cambios pendientes'}
                  </Badge>
                  <span className="text-muted-foreground">
                    Último guardado global hace instantes tras confirmar cambios.
                  </span>
                </div>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-6 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 text-foreground">
                    <Checkbox
                      checked={tutorActivo}
                      onCheckedChange={(checked) => handleToggleTutor(docenteActivo.numeroDocumento, checked === true)}
                      aria-label="Asignar tutoría"
                    />
                    Tutoría asignada
                  </label>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleAssignAllAreas}>
                      Asignar todas
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleClearAreas}>
                      Limpiar
                    </Button>
                  </div>
                </div>

                <div className="flex-1 rounded-xl border bg-muted/10">
                  {docenteActivoEsAuxiliar ? (
                    <div className="max-h-64 overflow-y-auto">
                      <div className="space-y-3 p-4">
                        {sectionsForGrade.map(seccion => {
                          const key = `${selectedGrade}|${seccion}`;
                          const esSeccionAsignada = seccionesAsignadasDocenteActivo.has(key);

                          return (
                            <label
                              key={key}
                              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${esSeccionAsignada ? 'border-primary bg-primary/10 text-primary-foreground' : 'border-muted bg-background text-foreground hover:bg-muted/50'}`}
                              htmlFor={`${docenteActivo.numeroDocumento}-${key}`}
                            >
                              <div>
                                <p className="font-medium">{selectedGrade} · {seccion}</p>
                                <p className="text-xs text-muted-foreground">
                                  {esSeccionAsignada ? 'Auxiliar asignado a la sección' : 'Disponible'}
                                </p>
                              </div>
                              <Checkbox
                                id={`${docenteActivo.numeroDocumento}-${key}`}
                                checked={esSeccionAsignada}
                                onCheckedChange={(checked) =>
                                  handleToggleAuxiliarSection(docenteActivo.numeroDocumento, selectedGrade, seccion, checked === true)
                                }
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2 p-4 pr-6 sm:grid-cols-2">
                        {areasForGrade.map(area => {
                          const isAssigned = areasAsignadasDocenteActivo.has(area.id);
                          return (
                            <label
                              key={area.id}
                              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${isAssigned ? 'border-primary bg-primary/10 text-primary-foreground' : 'border-muted bg-background text-foreground hover:bg-muted/50'}`}
                              htmlFor={`${docenteActivo.numeroDocumento}-${area.id}`}
                            >
                              <Checkbox
                                id={`${docenteActivo.numeroDocumento}-${area.id}`}
                                checked={isAssigned}
                                onCheckedChange={(checked) => handleToggleArea(docenteActivo.numeroDocumento, area, checked === true)}
                              />
                              <span
                                className="text-sm font-medium text-foreground"
                                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                {area.nombre}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Contexto rápido</p>
                    <p className="mt-1">• {docentesPendientes.length} docente(s) con cambios pendientes.</p>
                    <p>
                      • {docenteActivoEsAuxiliar
                        ? `${Array.from(seccionesAsignadasDocenteActivo).filter(key => key.startsWith(`${selectedGrade}|`)).length} sección(es) asignadas en ${selectedGrade}`
                        : `${areasAsignadasDocenteActivo.size} área(s) asignadas actualmente.`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {docentesPendientes.slice(0, 6).map(docente => (
                      <Button
                        key={docente.numeroDocumento}
                        variant={docente.numeroDocumento === docenteActivo.numeroDocumento ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectDocente(docente.numeroDocumento)}
                      >
                        {docente.apellidoPaterno} {docente.apellidoMaterno}
                      </Button>
                    ))}
                    {docentesPendientes.length === 0 && (
                      <span className="text-xs text-muted-foreground">No hay cambios pendientes.</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={handleCloseDocenteSheet}>Cerrar</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-sm text-muted-foreground">
              Selecciona un docente para editar sus asignaciones.
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={showInsights} onOpenChange={setShowInsights}>
        <SheetContent side="left" className="w-full max-w-3xl overflow-hidden">
          <SheetHeader className="text-left">
            <SheetTitle>Insights de asignaciones</SheetTitle>
            <SheetDescription>
              Vista consolidada de docentes, áreas asignadas y tutores de la institución.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="mt-6 h-[calc(100vh-140px)] pr-4">
            <div className="space-y-6">
              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold leading-tight">Docentes asignados</CardTitle>
                  <CardDescription className="text-xs">Relación de áreas por docente en la selección actual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {hasSelection ? (
                    docentesAsignados.length > 0 ? (
                      <ScrollArea className="h-56">
                        <div className="space-y-3 pr-2">
                          {docentesAsignados.map(({ docente, areas, esTutor }) => (
                            <div key={docente.numeroDocumento} className="rounded-lg border bg-muted/10 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {docente.apellidoPaterno} {docente.apellidoMaterno}
                                  </p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{docente.nombres}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {esTutor && <Badge variant="secondary" className="text-[10px]">Tutor</Badge>}
                                  <Badge variant="outline" className="text-[10px]">{areas.length} área(s)</Badge>
                                </div>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {areas.length > 0 ? areas.map(area => (
                                  <Badge key={`${docente.numeroDocumento}-${area.id}`} variant="outline" className="text-[11px]">
                                    {area.nombre}
                                  </Badge>
                                )) : (
                                  <span className="text-xs italic text-muted-foreground">Sin áreas asignadas</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
                        No hay docentes con áreas asignadas o tutoría en esta selección.
                      </div>
                    )
                  ) : (
                    <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
                      Selecciona grado y sección para ver las asignaciones.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold leading-tight">Áreas asignadas</CardTitle>
                  <CardDescription className="text-xs">Docentes que dictan cada área en la selección actual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {hasSelection ? (
                    areasConDocentes.length > 0 ? (
                      <ScrollArea className="h-56">
                        <div className="space-y-3 pr-2">
                          {areasConDocentes.map(({ area, docentes }) => (
                            <div key={area.id} className="rounded-lg border bg-muted/10 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-foreground line-clamp-1">{area.nombre}</p>
                                <Badge variant="outline" className="text-[10px]">{docentes.length} docente(s)</Badge>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {docentes.length > 0 ? docentes.map(docente => (
                                  <Badge key={`${area.id}-${docente.numeroDocumento}`} variant="secondary" className="text-[11px]">
                                    {docente.apellidoPaterno} {docente.apellidoMaterno}
                                  </Badge>
                                )) : (
                                  <span className="text-xs italic text-muted-foreground">Sin docente asignado</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
                        No hay áreas registradas en este grado y sección.
                      </div>
                    )
                  ) : (
                    <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
                      Selecciona grado y sección para ver las áreas.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold leading-tight">Tutores de la institución</CardTitle>
                  <CardDescription className="text-xs">Listado global de docentes con rol de tutoría.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tutoresGlobales.length > 0 ? (
                    <ScrollArea className="h-56">
                      <div className="space-y-3 pr-2">
                        {tutoresGlobales.map(({ docente, grado, seccion }) => (
                          <div key={`${docente.numeroDocumento}-${grado}-${seccion}`} className="rounded-lg border bg-muted/10 p-3">
                            <p className="text-sm font-medium text-foreground line-clamp-1">
                              {docente.apellidoPaterno} {docente.apellidoMaterno}, {docente.nombres}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {grado ?? 'Grado n/a'} • {seccion ?? 'Sección n/a'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
                      No hay tutores registrados actualmente.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={showDocenteDetail} onOpenChange={setShowDocenteDetail}>
        <SheetContent side="right" className="w-full overflow-hidden md:w-[33vw] md:max-w-none">
          <SheetHeader className="text-left">
            <SheetTitle>Detalle por docente</SheetTitle>
            <SheetDescription>
              Consulta los grados, secciones y áreas asignadas para un docente en particular.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="mt-6 h-[calc(100vh-140px)] px-4 pr-6">
            <div className="space-y-4">
              <div>
                <Select
                  value={docenteDetailId ?? undefined}
                  onValueChange={value => setDocenteDetailId(value)}
                >
                  <SelectTrigger aria-label="Seleccionar docente">
                    <SelectValue placeholder="Selecciona un docente" />
                  </SelectTrigger>
                  <SelectContent>
                    {docentesDetalle.map(({ docente }) => (
                      <SelectItem key={docente.numeroDocumento} value={docente.numeroDocumento}>
                        {docente.apellidoPaterno} {docente.apellidoMaterno}, {docente.nombres}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {docenteDetailId ? (
                (() => {
                  const registro = docentesDetalle.find(entry => entry.docente.numeroDocumento === docenteDetailId);
                  if (!registro) {
                    return (
                      <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                        No se encontraron asignaciones para el docente seleccionado.
                      </div>
                    );
                  }

                  const totalAreas = registro.detalle.reduce((acc, item) => acc + item.areas.length, 0);

                  return (
                    <div className="space-y-4">
                      <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <h3 className="text-base font-semibold text-foreground">
                          {registro.docente.apellidoPaterno} {registro.docente.apellidoMaterno}, {registro.docente.nombres}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          DNI {registro.docente.numeroDocumento}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <Badge variant="secondary">{registro.detalle.length} sección(es)</Badge>
                          <Badge variant="outline">{totalAreas} área(s)</Badge>
                        </div>
                      </div>

                      {registro.detalle.length > 0 ? (
                        <div className="rounded-xl border bg-muted/10">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Grado</TableHead>
                                <TableHead>Sección</TableHead>
                                <TableHead>Áreas</TableHead>
                                <TableHead className="text-center">Tutoría</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {registro.detalle.map(({ grado, seccion, areas, esTutor }) => (
                                <TableRow key={`${grado}-${seccion}`}>
                                  <TableCell className="text-sm font-medium text-foreground">{grado}</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">{seccion}</TableCell>
                                  <TableCell>
                                    {areas.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {areas.map(area => (
                                          <Badge key={`${grado}-${seccion}-${area.id}`} variant="outline" className="text-[11px]">
                                            {area.nombre}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs italic text-muted-foreground">Sin áreas asignadas</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {esTutor ? (
                                      <Badge variant="secondary" className="text-[11px]">Tutor</Badge>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                          Este docente no tiene secciones asignadas actualmente.
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  Selecciona un docente para ver su detalle.
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={showGradeDetail} onOpenChange={setShowGradeDetail}>
        <SheetContent side="right" className="w-full overflow-hidden md:w-[33vw] md:max-w-none">
          <SheetHeader className="text-left">
            <SheetTitle>Detalle por grado y sección</SheetTitle>
            <SheetDescription>
              Identifica los docentes asignados a cada grado y sección, junto con sus áreas y estado de tutoría.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="mt-6 h-[calc(100vh-140px)] px-4 pr-6">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Grado</Label>
                  <Select
                    value={gradeDetailFilter || 'all'}
                    onValueChange={value => {
                      if (value === 'all') {
                        setGradeDetailFilter('');
                        setSectionDetailFilter('');
                      } else {
                        setGradeDetailFilter(value);
                        const sectionsForGrade = Array.from(
                          new Set(gradosSeccionesDetalle.filter(item => item.grado === value).map(item => item.seccion)),
                        );
                        if (!sectionsForGrade.includes(sectionDetailFilter)) {
                          setSectionDetailFilter('');
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los grados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los grados</SelectItem>
                      {gradeDetailGrades.map(grado => (
                        <SelectItem key={grado} value={grado}>
                          {grado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sección</Label>
                  <Select
                    value={sectionDetailFilter || 'all'}
                    onValueChange={value => {
                      if (value === 'all') {
                        setSectionDetailFilter('');
                      } else {
                        setSectionDetailFilter(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las secciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las secciones</SelectItem>
                      {gradeDetailSections.map(seccion => (
                        <SelectItem key={seccion} value={seccion}>
                          {seccion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredGradeDetail.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  No se encontraron docentes para la combinación seleccionada.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGradeDetail.map(({ grado, seccion, docentes }) => (
                    <div key={`${grado}-${seccion}`} className="rounded-xl border bg-muted/10 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{grado}</p>
                          <p className="text-xs text-muted-foreground">Sección {seccion}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {docentes.length} docente(s)
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-3">
                        {docentes.map(({ docente, areas, esTutor }) => (
                          <div key={docente.numeroDocumento} className="rounded-lg border border-dashed bg-background p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {docente.apellidoPaterno} {docente.apellidoMaterno}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{docente.nombres}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {esTutor && <Badge variant="secondary" className="text-[10px]">Tutor</Badge>}
                                <Badge variant="outline" className="text-[10px]">{areas.length} área(s)</Badge>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {areas.length > 0 ? (
                                areas.map(area => (
                                  <Badge key={`${docente.numeroDocumento}-${area.id}`} variant="outline" className="text-[11px]">
                                    {area.nombre}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs italic text-muted-foreground">Sin áreas asignadas</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={showAreaDetail} onOpenChange={setShowAreaDetail}>
        <SheetContent side="right" className="w-full overflow-hidden md:w-[33vw] md:max-w-none">
          <SheetHeader className="text-left">
            <SheetTitle>Detalle por área curricular</SheetTitle>
            <SheetDescription>
              Visualiza qué docentes dictan cada área y en qué grados/secciones se encuentran asignados.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="mt-6 h-[calc(100vh-140px)] px-4 pr-6">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-2 md:col-span-1">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Área</Label>
                  <Select
                    value={areaDetailFilter || 'all'}
                    onValueChange={value => {
                      if (value === 'all') {
                        setAreaDetailFilter('');
                        setAreaDetailGradeFilter('');
                        setAreaDetailSectionFilter('');
                      } else {
                        setAreaDetailFilter(value);
                        const asignaciones = areasDetalle.find(entry => entry.area.id === value)?.asignaciones ?? [];
                        if (!asignaciones.some(asignacion => asignacion.grado === areaDetailGradeFilter)) {
                          setAreaDetailGradeFilter('');
                          setAreaDetailSectionFilter('');
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las áreas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las áreas</SelectItem>
                      {areasDetalle.map(entry => (
                        <SelectItem key={entry.area.id} value={entry.area.id}>
                          {entry.area.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-1">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Grado</Label>
                  <Select
                    value={areaDetailGradeFilter || 'all'}
                    onValueChange={value => {
                      if (value === 'all') {
                        setAreaDetailGradeFilter('');
                        setAreaDetailSectionFilter('');
                      } else {
                        setAreaDetailGradeFilter(value);
                        const sectionsForGrade = Array.from(
                          new Set(
                            areasDetalle
                              .filter(entry => (!areaDetailFilter || entry.area.id === areaDetailFilter))
                              .flatMap(entry => entry.asignaciones
                                .filter(asignacion => asignacion.grado === value)
                                .map(asignacion => asignacion.seccion)),
                          ),
                        );
                        if (!sectionsForGrade.includes(areaDetailSectionFilter)) {
                          setAreaDetailSectionFilter('');
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los grados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los grados</SelectItem>
                      {Array.from(
                        new Set(
                          areasDetalle
                            .filter(entry => !areaDetailFilter || entry.area.id === areaDetailFilter)
                            .flatMap(entry => entry.asignaciones.map(asignacion => asignacion.grado)),
                        ),
                      ).map(grado => (
                        <SelectItem key={grado} value={grado}>
                          {grado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-1">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sección</Label>
                  <Select
                    value={areaDetailSectionFilter || 'all'}
                    onValueChange={value => {
                      if (value === 'all') {
                        setAreaDetailSectionFilter('');
                      } else {
                        setAreaDetailSectionFilter(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las secciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las secciones</SelectItem>
                      {Array.from(
                        new Set(
                          areasDetalle
                            .filter(entry => !areaDetailFilter || entry.area.id === areaDetailFilter)
                            .flatMap(entry => entry.asignaciones
                              .filter(asignacion => !areaDetailGradeFilter || asignacion.grado === areaDetailGradeFilter)
                              .map(asignacion => asignacion.seccion)),
                        ),
                      ).map(seccion => (
                        <SelectItem key={seccion} value={seccion}>
                          {seccion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredAreaDetail.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  No se encontraron docentes para el filtro seleccionado.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAreaDetail.map(({ area, docentes }) => (
                    <div key={area.id} className="rounded-xl border bg-muted/10 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground line-clamp-1">{area.nombre}</p>
                          <p className="text-xs text-muted-foreground">{area.nivel}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {docentes.length} docente(s)
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-3">
                        {docentes.map(({ docente, asignaciones }) => (
                          <div key={`${area.id}-${docente.numeroDocumento}`} className="rounded-lg border border-dashed bg-background p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {docente.apellidoPaterno} {docente.apellidoMaterno}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{docente.nombres}</p>
                              </div>
                              <Badge variant="outline" className="text-[10px]">
                                {asignaciones.length} asignación(es)
                              </Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {asignaciones.map(({ grado, seccion }, index) => (
                                <Badge key={`${area.id}-${docente.numeroDocumento}-${grado}-${seccion}-${index}`} variant="outline" className="text-[11px]">
                                  {grado} • {seccion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={showTutorDetail} onOpenChange={setShowTutorDetail}>
        <SheetContent side="right" className="w-full overflow-hidden md:w-[33vw] md:max-w-none">
          <SheetHeader className="text-left">
            <SheetTitle>Detalle de tutores</SheetTitle>
            <SheetDescription>
              Consulta la red de tutoría por grados y secciones, incluyendo los docentes asignados.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="mt-6 h-[calc(100vh-140px)] px-4 pr-6">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Grado</Label>
                  <Select
                    value={tutorGradeFilter || 'all'}
                    onValueChange={value => {
                      if (value === 'all') {
                        setTutorGradeFilter('');
                        setTutorSectionFilter('');
                      } else {
                        setTutorGradeFilter(value);
                        const sectionsForGrade = Array.from(tutorGradeSectionMap.get(value) ?? []);
                        if (!sectionsForGrade.includes(tutorSectionFilter)) {
                          setTutorSectionFilter('');
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los grados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los grados</SelectItem>
                      {tutorGrades.map(grado => (
                        <SelectItem key={grado} value={grado}>
                          {grado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sección</Label>
                  <Select
                    value={tutorSectionFilter || 'all'}
                    onValueChange={value => {
                      if (value === 'all') {
                        setTutorSectionFilter('');
                      } else {
                        setTutorSectionFilter(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las secciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las secciones</SelectItem>
                      {tutorSections.map(seccion => (
                        <SelectItem key={seccion} value={seccion}>
                          {seccion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredTutores.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  No se encontraron tutores para el filtro seleccionado.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTutores.map(({ grado, seccion, docentes }) => (
                    <div key={`${grado}-${seccion}`} className="rounded-xl border bg-muted/10 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{grado}</p>
                          <p className="text-xs text-muted-foreground">Sección {seccion}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {docentes.length} tutor(es)
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-3">
                        {docentes.map(({ docente, asignaciones }) => (
                          <div key={`${grado}-${seccion}-${docente.numeroDocumento}`} className="rounded-lg border border-dashed bg-background p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">{docente.apellidoPaterno} {docente.apellidoMaterno}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{docente.nombres}</p>
                              </div>
                              <Badge variant="secondary" className="text-[10px]">Tutor</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {asignaciones.map((asignacion, index) => (
                                <Badge key={`${grado}-${seccion}-${docente.numeroDocumento}-${asignacion.areaId ?? 'sin-area'}-${index}`} variant="outline" className="text-[11px]">
                                  {asignacion.areaId ? formatAreaBadgeLabel(asignacion.areaId) : 'Tutor principal'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

    </div>
  );
}
