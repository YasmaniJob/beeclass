
'use client';

import { useState, useMemo } from 'react';
import { useHorario, ActividadPedagogica } from '@/hooks/use-horario';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HorarioTable } from '@/components/horario/horario-table';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { CalendarOff, Save, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DocenteAsignacion } from '@/domain/entities/Docente';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { ActividadFormDialog } from '@/components/horario/actividad-form-dialog';


export default function MiHorarioPage() {
    const { 
        horario, 
        horas, 
        dias, 
        isLoading,
        asignacionesConArea,
        actividadesPedagogicas,
        addActividadPersonalizada,
        updateHorarioCell,
        saveHorario,
        hasChanges,
        discardChanges,
        currentTimeInfo
    } = useHorario();
    const { toast } = useToast();
    const { allAreas } = useMatriculaData();
    
    const [activeSelection, setActiveSelection] = useState<DocenteAsignacion | ActividadPedagogica | null>(null);
    const [isActividadDialogOpen, setIsActividadDialogOpen] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const success = await saveHorario();
            if (success) {
                toast({
                    title: 'Horario Guardado',
                    description: 'Tus cambios en el horario han sido guardados con éxito.'
                });
            } else {
                toast({
                    title: 'Error al guardar',
                    description: 'No se pudo guardar el horario. Intenta nuevamente.',
                    variant: 'destructive'
                });
            }
        } finally {
            setIsSaving(false);
        }
    }
    
    const handleCellClick = (dia: string, horaId: string) => {
        const key = `${dia}-${horaId}`;
        const currentCell = horario.get(key);
        
        // Si no hay selección activa, no hacer nada
        if (!activeSelection) {
            return;
        }
        
        // Toggle inteligente:
        // - Si la celda está vacía → asignar
        // - Si la celda tiene la MISMA asignación → eliminar (toggle)
        // - Si la celda tiene OTRA asignación → cambiar
        if (currentCell && currentCell.asignacionId === activeSelection.id) {
            // Click en la misma clase → eliminar (toggle)
            updateHorarioCell(key, null);
        } else {
            // Celda vacía o diferente clase → asignar/cambiar
            updateHorarioCell(key, activeSelection);
        }
    }
    
    const handleSelectionChange = (selectionId: string) => {
        if (!selectionId) {
            setActiveSelection(null);
            return;
        }

        const allOptions = [...asignacionesConArea, ...actividadesPedagogicas];
        const selected = allOptions.find(a => a.id === selectionId);

        setActiveSelection(selected || null);
    }

    const handleSaveActividad = (nombre: string) => {
        addActividadPersonalizada(nombre);
        toast({ title: "Actividad añadida", description: `"${nombre}" ahora está disponible en tu lista.`});
    }
    
    const asignacionesConNombreArea = useMemo(() => {
        return asignacionesConArea
            .map(asig => {
                const area = allAreas.find(a => a.id === asig.areaId);
                return { ...asig, areaNombre: area?.nombre || 'Área Desconocida' };
            })
            .sort((a,b) => `${a.grado}-${a.seccion}-${a.areaNombre}`.localeCompare(`${b.grado}-${b.seccion}-${b.areaNombre}`));
    }, [asignacionesConArea, allAreas]);


    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Mi Horario
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Selecciona una clase y haz clic en el horario para asignarla. Click nuevamente en la misma celda para eliminarla.
                    </p>
                </div>
                 {hasChanges && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={discardChanges} disabled={isSaving}>
                            Descartar
                        </Button>
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                )}
            </div>

            {asignacionesConArea.length > 0 || actividadesPedagogicas.length > 0 ? (
                <div className="space-y-8">
                    <Card>
                         <CardContent className="p-6">
                            <div className="flex items-end gap-3">
                                {/* Selector de clase/actividad */}
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-medium">
                                        Selecciona una clase o actividad
                                    </label>
                                    <Select 
                                        value={activeSelection?.id ?? ''} 
                                        onValueChange={handleSelectionChange}
                                    >
                                        <SelectTrigger className="w-full h-10">
                                            <SelectValue placeholder="Elige qué asignar al horario..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Mis Clases</SelectLabel>
                                                {asignacionesConNombreArea.map(asig => (
                                                    <SelectItem key={asig.id ?? ''} value={asig.id ?? ''}>
                                                        {asig.areaNombre} ({asig.grado} - {asig.seccion.replace('Sección ','')})
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                            {actividadesPedagogicas.length > 0 && (
                                                <SelectGroup>
                                                    <SelectLabel>Otras Actividades</SelectLabel>
                                                    {actividadesPedagogicas.map(act => (
                                                        <SelectItem key={act.id} value={act.id}>{act.nombre}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                {/* Botón añadir actividad */}
                                <ActividadFormDialog
                                    open={isActividadDialogOpen}
                                    onOpenChange={setIsActividadDialogOpen}
                                    onSave={handleSaveActividad}
                                >
                                    <Button variant="outline" className="h-10">
                                        <PlusCircle className="mr-2 h-4 w-4"/>
                                        Añadir Otra
                                    </Button>
                                </ActividadFormDialog>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Horario Semanal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HorarioTable 
                                horario={horario} 
                                horas={horas} 
                                dias={dias} 
                                onCellClick={handleCellClick}
                                currentTimeInfo={currentTimeInfo}
                            />
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card>
                    <CardContent>
                        <PlaceholderContent 
                            icon={CalendarOff}
                            title="No tienes áreas asignadas"
                            description="Para gestionar tu horario, un administrador primero debe asignarte áreas en la sección de 'Carga Académica'."
                            className="py-20"
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

