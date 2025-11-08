
'use client';

import { useState, useMemo } from 'react';
import { useHorario, ActividadPedagogica } from '@/hooks/use-horario';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HorarioTable } from '@/components/horario/horario-table';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { CalendarOff, Save, Eraser, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Asignacion } from '@/lib/definitions';
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
    
    const [activeSelection, setActiveSelection] = useState<Asignacion | ActividadPedagogica | null>(null);
    const [isClearing, setIsClearing] = useState(false);
    const [isActividadDialogOpen, setIsActividadDialogOpen] = useState(false);

    const handleSaveChanges = () => {
        saveHorario();
        toast({
            title: 'Horario Guardado',
            description: 'Tus cambios en el horario han sido guardados con éxito.'
        });
    }
    
    const handleCellClick = (dia: string, horaId: string) => {
        const key = `${dia}-${horaId}`;
        // Si el modo Limpiar está activo, pasa null. Si no, pasa la asignación activa.
        updateHorarioCell(key, isClearing ? null : activeSelection);
    }
    
    const handleSelectionChange = (selectionId: string) => {
        if (!selectionId) {
            setActiveSelection(null);
            return;
        }

        const allOptions: (Asignacion | ActividadPedagogica)[] = [...asignacionesConArea, ...actividadesPedagogicas];
        const selected = allOptions.find(a => a.id === selectionId);

        setActiveSelection(selected || null);
        setIsClearing(false);
    }

    const handleSaveActividad = (nombre: string) => {
        addActividadPersonalizada(nombre);
        toast({ title: "Actividad añadida", description: `"${nombre}" ahora está disponible en tu lista.`});
    }

    const toggleClearMode = () => {
        setIsClearing(prev => !prev);
        if (!isClearing) { // Si se está activando el modo limpiar
            setActiveSelection(null);
        }
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
                        Selecciona una clase o actividad y luego haz clic en el horario para asignarla.
                    </p>
                </div>
                 {hasChanges && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={discardChanges}>Descartar</Button>
                        <Button onClick={handleSaveChanges}>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                        </Button>
                    </div>
                )}
            </div>

            {asignacionesConArea.length > 0 || actividadesPedagogicas.length > 0 ? (
                <div className="space-y-8">
                    <Card>
                         <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                            <Select 
                                value={activeSelection?.id || ''} 
                                onValueChange={handleSelectionChange}
                            >
                                <SelectTrigger className="w-full md:w-[400px]">
                                    <SelectValue placeholder="Selecciona una clase o actividad..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Mis Clases</SelectLabel>
                                        {asignacionesConNombreArea.map(asig => (
                                            <SelectItem key={asig.id} value={asig.id}>
                                                {asig.areaNombre} ({asig.grado} - {asig.seccion.replace('Sección ','')})
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Otras Actividades</SelectLabel>
                                        {actividadesPedagogicas.map(act => (
                                            <SelectItem key={act.id} value={act.id}>{act.nombre}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <div className='flex items-center gap-2'>
                                <Button 
                                    variant={isClearing ? 'destructive' : 'outline'}
                                    onClick={toggleClearMode}
                                >
                                    <Eraser className="mr-2 h-4 w-4" />
                                    {isClearing ? 'Modo Limpiar Activado' : 'Limpiar Celda'}
                                </Button>
                                <ActividadFormDialog
                                    open={isActividadDialogOpen}
                                    onOpenChange={setIsActividadDialogOpen}
                                    onSave={handleSaveActividad}
                                >
                                    <Button variant="outline">
                                        <PlusCircle className="mr-2 h-4 w-4"/>
                                        Añadir Otro
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

