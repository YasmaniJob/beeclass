
'use client';

import { useState } from 'react';
import { AreaCurricular, Competencia } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from '../ui/badge';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { CompetenciaFormDialog } from './competencia-form-dialog';

interface AreaDetailSheetProps {
    area: AreaCurricular;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onDeleteArea: (areaId: string) => void;
    onAddCompetencia: (areaId: string, nombre: string) => void;
    onUpdateCompetencia: (areaId: string, competenciaId: string, nuevoNombre: string) => void;
    onDeleteCompetencia: (areaId: string, competenciaId: string) => void;
    isLoading?: boolean;
}

export function AreaDetailSheet({
    area,
    isOpen,
    onOpenChange,
    onDeleteArea,
    onAddCompetencia,
    onUpdateCompetencia,
    onDeleteCompetencia,
    isLoading = false,
}: AreaDetailSheetProps) {
    const { toast } = useToast();
    const [isCompetenciaDialogOpen, setIsCompetenciaDialogOpen] = useState(false);
    const [editingCompetencia, setEditingCompetencia] = useState<Competencia | null>(null);

    const handleOpenCompetenciaDialog = (competencia?: Competencia) => {
        setEditingCompetencia(competencia || null);
        setIsCompetenciaDialogOpen(true);
    }

    const handleSaveCompetencia = (competenciaData: Competencia) => {
        if (editingCompetencia) {
            onUpdateCompetencia(area.id, competenciaData.id, competenciaData.nombre);
            toast({ title: 'Competencia actualizada' });
        } else {
            onAddCompetencia(area.id, competenciaData.nombre);
            toast({ title: 'Competencia añadida' });
        }
    };
    
    const handleDeleteAreaClick = () => {
        onDeleteArea(area.id);
        toast({ title: 'Área eliminada', description: 'El área y sus competencias han sido eliminadas.' });
        onOpenChange(false);
    }
    
    const handleDeleteCompetenciaClick = (competenciaId: string) => {
        onDeleteCompetencia(area.id, competenciaId);
        toast({ title: 'Competencia eliminada' });
    }

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent className="flex flex-col sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>{area.nombre}</SheetTitle>
                        <SheetDescription>
                            Gestiona las competencias para el área en el nivel <Badge variant="secondary">{area.nivel}</Badge>.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-4">
                        <h4 className="font-medium">Competencias</h4>
                        <div className="space-y-2">
                             {isLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                             ) : area.competencias && area.competencias.length > 0 ? (
                                <div className="space-y-2 rounded-md border">
                                    {area.competencias.map(competencia => (
                                        <div key={competencia.id} className="group/item flex items-center justify-between text-sm p-3 border-b last:border-b-0">
                                            <span className="flex-1 pr-2">{competencia.nombre}</span>
                                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenCompetenciaDialog(competencia)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Eliminar Competencia</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Se eliminará la competencia: "{competencia.nombre}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteCompetenciaClick(competencia.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                                                Eliminar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic py-4 text-center">No hay competencias definidas.</p>
                            )}
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => handleOpenCompetenciaDialog()}>
                            <Plus className="mr-2 h-4 w-4"/>
                            Añadir Competencia
                        </Button>
                    </div>
                    <SheetFooter className="flex-col sm:flex-row sm:justify-between">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Eliminar Área</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Se eliminará el área "{area.nombre}" y todas sus competencias. Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAreaClick} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                        Eliminar Área
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="secondary" onClick={() => onOpenChange(false)}>Cerrar</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <CompetenciaFormDialog
                open={isCompetenciaDialogOpen}
                onOpenChange={setIsCompetenciaDialogOpen}
                onSave={handleSaveCompetencia}
                area={area}
                competenciaToEdit={editingCompetencia}
            />
        </>
    );
}

