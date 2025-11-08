
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AreaCurricular, Nivel, AsignacionRol } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { useDocentes } from '@/hooks/use-docentes';
import { DocenteEditable, cloneDocenteEditable, docenteToEditable, editableToDocente } from '@/domain/mappers/docente-editable';
import { DocenteAsignacion } from '@/domain/entities/Docente';

interface DocenteAsignacionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    docente: DocenteEditable;
    onSave: (updatedDocente: DocenteEditable) => void;
}

export function DocenteAsignacionDialog({ 
    open, 
    onOpenChange, 
    docente, 
    onSave, 
}: DocenteAsignacionDialogProps) {
    const { toast } = useToast();
    const { docentes: allDocentes, areasPorGrado, seccionesPorGrado, gradoSeccionCatalog, getGradoSeccionId } = useMatriculaData();
    const { setDocentes } = useDocentes();

    const allDocentesEditable = useMemo(() => allDocentes.map(docenteToEditable), [allDocentes]);

    const sanitizeDocente = useCallback((docenteToSanitize: DocenteEditable) => {
        if (docenteToSanitize.rol !== 'Auxiliar' || !docenteToSanitize.asignaciones) {
            return docenteToSanitize;
        }

        return {
            ...docenteToSanitize,
            asignaciones: docenteToSanitize.asignaciones.filter(asignacion => !asignacion.areaId),
        };
    }, []);

    const [docenteState, setDocenteState] = useState<DocenteEditable>(() => sanitizeDocente(cloneDocenteEditable(docente)));
    const [isSaving, setIsSaving] = useState(false);
    const [activeSectionByGrade, setActiveSectionByGrade] = useState<Record<string, string>>({});
    const [selectedGrade, setSelectedGrade] = useState<string>('');

    // Detectar si hay cambios en el diálogo
    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(docenteState.asignaciones) !== JSON.stringify(docente.asignaciones);
    }, [docenteState.asignaciones, docente.asignaciones]);

    useEffect(() => {
        setDocenteState(sanitizeDocente(cloneDocenteEditable(docente)));
    }, [docente, sanitizeDocente]);

    // Resetear el estado cuando se abre el diálogo
    useEffect(() => {
        if (open) {
            setDocenteState(sanitizeDocente(cloneDocenteEditable(docente)));
        }
    }, [open, docente, sanitizeDocente]);

    const groupedByGrado = useMemo(() => {
        const grados = Object.keys(seccionesPorGrado).sort((a, b) => a.localeCompare(b));
        return grados.map(grado => {
            const secciones = (seccionesPorGrado[grado] || []).map(seccion => ({
                key: `${grado}|${seccion}`,
                grado,
                seccion,
                areas: areasPorGrado[grado] || [],
            }));
            return { grado, secciones };
        }).filter(group => group.secciones.length > 0);
    }, [areasPorGrado, seccionesPorGrado]);

    useEffect(() => {
        if (!open) return;

        if (groupedByGrado.length === 0) {
            setSelectedGrade('');
            return;
        }

        setActiveSectionByGrade(prev => {
            const next = { ...prev };
            groupedByGrado.forEach(group => {
                if (!next[group.grado]) {
                    next[group.grado] = group.secciones[0]?.key ?? '';
                } else {
                    const exists = group.secciones.some(sec => sec.key === next[group.grado]);
                    if (!exists) {
                        next[group.grado] = group.secciones[0]?.key ?? '';
                    }
                }
            });
            return next;
        });

        setSelectedGrade(prev => {
            if (prev && groupedByGrado.some(group => group.grado === prev)) {
                return prev;
            }
            return groupedByGrado[0].grado;
        });
    }, [open, groupedByGrado]);

    const resolveAsignaciones = useCallback(() => {
        const docenteAsignaciones = docenteState.asignaciones || [];
        const result: Record<string, {
            main?: DocenteAsignacion;
            areas: DocenteAsignacion[];
        }> = {};
        docenteAsignaciones.forEach(asignacion => {
            const key = `${asignacion.grado}|${asignacion.seccion}`;
            if (!result[key]) {
                result[key] = { areas: [] };
            }
            if (asignacion.areaId) {
                result[key].areas.push(asignacion);
            } else {
                result[key].main = asignacion;
            }
        });
        return result;
    }, [docenteState.asignaciones]);
    const assignmentsByGroup = useMemo(() => resolveAsignaciones(), [resolveAsignaciones]);

    const seccionesAsignadas = useMemo(() => {
        const set = new Set<string>();
        (docenteState.asignaciones || []).forEach(asignacion => {
            if (!asignacion.areaId && asignacion.grado && asignacion.seccion) {
                set.add(`${asignacion.grado}|${asignacion.seccion}`);
            }
        });
        return set;
    }, [docenteState.asignaciones]);

    const ensureMainAssignment = useCallback((list: DocenteAsignacion[], grado: string, seccion: string, rolPorDefecto: AsignacionRol) => {
        const existing = list.find(a => a.grado === grado && a.seccion === seccion && !a.areaId);
        if (existing) {
            return { list: [...list], main: existing };
        }

        const gradoSeccionId = getGradoSeccionId(grado, seccion);
        const newMain: DocenteAsignacion = {
            id: crypto.randomUUID(),
            grado,
            seccion,
            rol: rolPorDefecto,
            gradoSeccionId,
        };

        return { list: [...list, newMain], main: newMain };
    }, [getGradoSeccionId]);

    const handleToggleTutor = useCallback((grado: string, seccion: string, checked: boolean) => {
        if (checked) {
            const otherTutor = allDocentes.find(d =>
                d.numeroDocumento !== docente.numeroDocumento &&
                d.asignaciones?.some(a => a.grado === grado && a.seccion === seccion && !a.areaId && a.rol === 'Docente y Tutor')
            );
            if (otherTutor) {
                toast({
                    variant: 'destructive',
                    title: 'Tutoría ya asignada',
                    description: `La sección ${grado} - ${seccion} ya tiene un tutor asignado: ${otherTutor.nombres}.`,
                });
                return;
            }
        }

        setDocenteState(prev => {
            const current = prev.asignaciones || [];
            const rolPorDefecto = prev.rol === 'Auxiliar' ? 'Auxiliar' : 'Docente';
            const { list: listWithMain } = ensureMainAssignment(current, grado, seccion, rolPorDefecto);
            const updated = listWithMain.map(asignacion => {
                if (asignacion.grado === grado && asignacion.seccion === seccion && !asignacion.areaId) {
                    return { ...asignacion, rol: (checked ? 'Docente y Tutor' : 'Docente') as AsignacionRol };
                }
                return asignacion;
            });
            return {
                ...prev,
                asignaciones: updated,
            };
        });
    }, [allDocentes, docente.numeroDocumento, ensureMainAssignment, toast]);

    const handleToggleAuxiliarSection = useCallback((grado: string, seccion: string, checked: boolean) => {
        setDocenteState(prev => {
            if (prev.rol !== 'Auxiliar') {
                return prev;
            }

            const current = prev.asignaciones || [];

            if (checked) {
                const already = current.some(asignacion => asignacion.grado === grado && asignacion.seccion === seccion && !asignacion.areaId);
                if (already) {
                    return prev;
                }

                const { list: asignaciones } = ensureMainAssignment(current, grado, seccion, 'Auxiliar');
                return {
                    ...prev,
                    asignaciones,
                };
            }

            const filtered = current.filter(asignacion => !(asignacion.grado === grado && asignacion.seccion === seccion && !asignacion.areaId));
            return {
                ...prev,
                asignaciones: filtered,
            };
        });
    }, [ensureMainAssignment]);

    const handleToggleArea = useCallback((grado: string, seccion: string, area: AreaCurricular, checked: boolean) => {
        setDocenteState(prev => {
            if (prev.rol === 'Auxiliar' && checked) {
                const currentAsignaciones = prev.asignaciones || [];
                const filtered = currentAsignaciones.filter(asignacion => asignacion.grado !== grado || asignacion.seccion !== seccion || asignacion.areaId);
                return {
                    ...prev,
                    asignaciones: filtered,
                };
            }

            const current = prev.asignaciones || [];
            const rolPorDefecto = prev.rol === 'Auxiliar' ? 'Auxiliar' : 'Docente';
            const { list: listWithMain, main } = ensureMainAssignment(current, grado, seccion, rolPorDefecto);

            if (checked) {
                const already = listWithMain.some(a => a.grado === grado && a.seccion === seccion && a.areaId === area.id);
                if (already) {
                    return prev;
                }
                const newArea: DocenteAsignacion = {
                    id: crypto.randomUUID(),
                    grado,
                    seccion,
                    rol: main.rol,
                    areaId: area.id,
                    horasSemanales: main.horasSemanales,
                    gradoSeccionId: main.gradoSeccionId,
                };
                return {
                    ...prev,
                    asignaciones: [...listWithMain, newArea],
                };
            }

            const filtered = listWithMain.filter(a => !(a.grado === grado && a.seccion === seccion && a.areaId === area.id));
            return {
                ...prev,
                asignaciones: filtered,
            };
        });
    }, [ensureMainAssignment]);

    const handleToggleAllAreas = useCallback((grado: string, seccion: string, areas: AreaCurricular[]) => {
        setDocenteState(prev => {
            const current = prev.asignaciones || [];
            const rolPorDefecto = prev.rol === 'Auxiliar' ? 'Auxiliar' : 'Docente';
            const { list: listWithMain, main } = ensureMainAssignment(current, grado, seccion, rolPorDefecto);
            const areaIds = areas.map(a => a.id);
            const currentAssigned = listWithMain.filter(a => a.grado === grado && a.seccion === seccion && a.areaId);
            const allSelected = areaIds.every(id => currentAssigned.some(a => a.areaId === id));

            const filtered = listWithMain.filter(a => !(a.grado === grado && a.seccion === seccion && a.areaId));
            if (allSelected) {
                return {
                    ...prev,
                    asignaciones: filtered,
                };
            }
            const newAsignaciones: DocenteAsignacion[] = areas.map(area => ({
                id: crypto.randomUUID(),
                grado,
                seccion,
                rol: main.rol as AsignacionRol,
                areaId: area.id,
                horasSemanales: main.horasSemanales,
                gradoSeccionId: main.gradoSeccionId,
            }));
            return {
                ...prev,
                asignaciones: [...filtered, ...newAsignaciones],
            };
        });
    }, [ensureMainAssignment]);

    const handleSave = useCallback(async () => {
        if (!hasUnsavedChanges) {
            onOpenChange(false);
            return;
        }

        setIsSaving(true);
        try {
            const updatedEditable = sanitizeDocente(docenteState);
            const updatedDocentesEditable = allDocentesEditable.map(d =>
                d.numeroDocumento === docente.numeroDocumento ? updatedEditable : cloneDocenteEditable(d)
            );

            const success = await setDocentes(updatedDocentesEditable.map(editableToDocente));

            if (success) {
                onSave(updatedEditable);
                onOpenChange(false);
                toast({
                    title: 'Carga académica sincronizada',
                    description: 'Los cambios fueron guardados en Supabase.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error al guardar',
                    description: 'No se pudo sincronizar con Supabase. Intenta nuevamente.',
                });
            }
        } catch (error) {
            console.error('Error saving docente assignments:', error);
            toast({
                variant: 'destructive',
                title: 'Error inesperado',
                description: 'Ocurrió un error al guardar. Revisa la consola para más detalles.',
            });
        } finally {
            setIsSaving(false);
        }
    }, [hasUnsavedChanges, allDocentesEditable, docente.numeroDocumento, docenteState, setDocentes, onSave, onOpenChange, toast, sanitizeDocente]);

    const isAuxiliar = docenteState.rol === 'Auxiliar';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>
                        {isAuxiliar ? 'Gestionar secciones de apoyo' : 'Gestionar carga académica'} de {docente.nombres}
                        {hasUnsavedChanges && <span className="text-orange-500 ml-2">•</span>}
                    </SheetTitle>
                    <SheetDescription>
                        {isAuxiliar ? (
                            <>Define en qué secciones apoya el auxiliar.</>
                        ) : (
                            <>Define qué rol y qué áreas dicta en cada sección asignada.</>
                        )}
                        {hasUnsavedChanges && (
                            <span className="text-orange-500 block mt-1 text-sm">
                                Hay cambios sin aplicar
                            </span>
                        )}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 -mx-6 flex flex-col">
                    {groupedByGrado.length > 0 ? (
                        <ScrollArea className="flex-1 px-6 space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-medium">Selecciona un grado</Label>
                                <div className="overflow-x-auto">
                                    <div className="flex gap-2 w-max">
                                        {groupedByGrado.map(({ grado, secciones }) => (
                                            <Button
                                                key={grado}
                                                type="button"
                                                variant={selectedGrade === grado ? 'default' : 'outline'}
                                                size="sm"
                                                className="flex items-center gap-2 whitespace-nowrap"
                                                onClick={() => setSelectedGrade(grado)}
                                            >
                                                <span>{grado}</span>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {secciones.length}
                                                </Badge>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {selectedGrade ? (
                                (() => {
                                    const gradeGroup = groupedByGrado.find(group => group.grado === selectedGrade);
                                    if (!gradeGroup) {
                                        return (
                                            <div className="py-6 text-sm text-muted-foreground">
                                                No hay información para el grado seleccionado.
                                            </div>
                                        );
                                    }

                                    if (isAuxiliar) {
                                        const secciones = gradeGroup.secciones;
                                        if (secciones.length === 0) {
                                            return (
                                                <div className="py-6 text-sm text-muted-foreground">
                                                    No hay secciones definidas para este grado.
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-4">
                                                <div className="rounded-lg border bg-card p-5 shadow-sm">
                                                    <h3 className="text-sm font-semibold text-foreground">Asignaciones actuales en {selectedGrade}</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Secciones asignadas: {Array.from(seccionesAsignadas)
                                                            .filter(key => key.startsWith(`${selectedGrade}|`)).length} / {secciones.length}
                                                    </p>
                                                </div>

                                                <div className="grid gap-3">
                                                    {secciones.map(({ grado, seccion, key }) => {
                                                        const isAssigned = seccionesAsignadas.has(key);
                                                        return (
                                                            <label
                                                                key={key}
                                                                htmlFor={`aux-${key}`}
                                                                className={`flex items-center justify-between rounded-lg border px-4 py-3 transition ${isAssigned ? 'border-primary bg-primary/10' : 'border-muted bg-background hover:bg-muted/50'}`}
                                                            >
                                                                <div>
                                                                    <p className="text-sm font-medium text-foreground">{grado} · {seccion.replace('Sección ', '')}</p>
                                                                    <p className="text-xs text-muted-foreground">{isAssigned ? 'Auxiliar asignado' : 'Disponible'}</p>
                                                                </div>
                                                                <Checkbox
                                                                    id={`aux-${key}`}
                                                                    checked={isAssigned}
                                                                    onCheckedChange={checked => handleToggleAuxiliarSection(grado, seccion, !!checked)}
                                                                />
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    }

                                    const sections = gradeGroup.secciones;
                                    if (sections.length === 0) {
                                        return (
                                            <div className="py-6 text-sm text-muted-foreground">
                                                No hay secciones definidas para este grado.
                                            </div>
                                        );
                                    }

                                    const activeSectionKey = activeSectionByGrade[selectedGrade] || sections[0].key;
                                    const handleSectionChange = (value: string) => {
                                        setActiveSectionByGrade(prev => ({ ...prev, [selectedGrade]: value }));
                                    };

                                    return (
                                        <Tabs
                                            value={activeSectionKey}
                                            onValueChange={handleSectionChange}
                                            className="flex flex-col gap-5"
                                        >
                                            <TabsList className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-2">
                                                {sections.map(({ key, seccion }) => {
                                                    const isAssigned = Boolean(assignmentsByGroup[key]?.main);
                                                    return (
                                                        <TabsTrigger
                                                            key={key}
                                                            value={key}
                                                            className="justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium shadow-sm transition data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                                        >
                                                            <span>{seccion.replace('Sección ', '')}</span>
                                                            {isAssigned && (
                                                                <Badge variant="secondary" className="text-[10px]">
                                                                    Asignada
                                                                </Badge>
                                                            )}
                                                        </TabsTrigger>
                                                    );
                                                })}
                                            </TabsList>

                                            <div className="flex-1">
                                                {sections.map(({ key, grado, seccion, areas }) => {
                                                    const main = assignmentsByGroup[key]?.main;
                                                    const isTutor = main?.rol === 'Docente y Tutor';
                                                    const assignedAreas = new Set((assignmentsByGroup[key]?.areas || []).map(a => a.areaId));
                                                    const nivelSeccion: Nivel | null | undefined = gradoSeccionCatalog[key]?.nivel ?? null;
                                                    const showMarcarTodos = nivelSeccion === 'Inicial' || nivelSeccion === 'Primaria';

                                                    return (
                                                        <TabsContent key={key} value={key} className="mt-0">
                                                            <div className="space-y-4">
                                                                <div className="rounded-lg border bg-card p-5 shadow-sm space-y-4">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div>
                                                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Sección</p>
                                                                            <h3 className="text-lg font-semibold">
                                                                                {grado} · {seccion.replace('Sección ', '')}
                                                                            </h3>
                                                                        </div>
                                                                        <Badge variant="default" className="text-xs">
                                                                            Asignación activa
                                                                        </Badge>
                                                                    </div>

                                                                    <div className="rounded-md bg-muted/40 p-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <div>
                                                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tutoría</p>
                                                                                <p className="text-sm font-medium">Marcar como tutor</p>
                                                                            </div>
                                                                            <Switch
                                                                                id={`tutor-${key}`}
                                                                                checked={isTutor}
                                                                                onCheckedChange={checked => handleToggleTutor(grado, seccion, checked)}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                                            <div>
                                                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Áreas curriculares</p>
                                                                                <p className="text-sm font-medium">Selecciona las áreas que dicta en esta sección</p>
                                                                            </div>
                                                                            {showMarcarTodos && (
                                                                                <Button
                                                                                    variant="link"
                                                                                    size="sm"
                                                                                    onClick={() => handleToggleAllAreas(grado, seccion, areas)}
                                                                                >
                                                                                    Marcar/Desmarcar todos
                                                                                </Button>
                                                                            )}
                                                                        </div>

                                                                        <div className="rounded-md border bg-muted/20 p-3">
                                                                            {areas.length > 0 ? (
                                                                                <div className="space-y-2">
                                                                                    {areas.map(area => (
                                                                                        <label
                                                                                            key={area.id}
                                                                                            htmlFor={`${key}-${area.id}`}
                                                                                            className="flex items-center gap-3 rounded-md bg-background px-3 py-2 shadow-sm hover:bg-muted/50"
                                                                                        >
                                                                                            <Checkbox
                                                                                                id={`${key}-${area.id}`}
                                                                                                checked={assignedAreas.has(area.id)}
                                                                                                onCheckedChange={checked => handleToggleArea(grado, seccion, area, !!checked)}
                                                                                            />
                                                                                            <span className="text-sm font-medium">{area.nombre}</span>
                                                                                        </label>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    No hay áreas configuradas para este grado.
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TabsContent>
                                                    );
                                                })}
                                            </div>
                                        </Tabs>
                                    );
                                })()
                            ) : (
                                <div className="py-6 text-sm text-muted-foreground">
                                    Selecciona un grado para gestionar sus secciones.
                                </div>
                            )}
                        </ScrollArea>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-sm text-muted-foreground text-center py-10 px-6">
                                No hay secciones a las que asignar.
                            </p>
                        </div>
                    )}
                </div>

                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" variant="secondary">
                            Cancelar
                        </Button>
                    </SheetClose>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Aplicando...' : 'Aplicar cambios'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
