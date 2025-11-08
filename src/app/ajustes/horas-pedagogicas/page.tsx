
'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { useHorasPedagogicasSupabase, HoraPedagogica } from '@/hooks/use-horas-pedagogicas-supabase';
import { Clock, Plus, Trash2, Edit, Coffee } from 'lucide-react';
import { HoraFormSheet } from '@/components/horas/hora-form-sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function HorasPedagogicasPage() {
    const { horas, loading, isLoaded, addHora, updateHora, deleteHora } = useHorasPedagogicasSupabase();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedHora, setSelectedHora] = useState<HoraPedagogica | null>(null);

    const handleAddClick = () => {
        setSelectedHora(null);
        setIsSheetOpen(true);
    };

    const handleEditClick = (hora: HoraPedagogica) => {
        setSelectedHora(hora);
        setIsSheetOpen(true);
    };

    const handleSave = async (horaData: Omit<HoraPedagogica, 'id' | 'activo'>) => {
        if (selectedHora) {
            return await updateHora(selectedHora.id, horaData);
        } else {
            return await addHora(horaData);
        }
    };

    const nextOrden = horas.length > 0 ? Math.max(...horas.map(h => h.orden)) + 1 : 1;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Horas Pedagógicas
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Configura los bloques de horario que se usan en la institución.
                    </p>
                </div>
                <Button onClick={handleAddClick} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Hora
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>Horario Escolar</CardTitle>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                        <span className="text-2xl font-bold text-primary">{horas.length}</span>
                        <span className="text-sm font-medium text-muted-foreground">horas pedagógicas</span>
                    </div>
                </CardHeader>
                <CardContent>
                    {!isLoaded ? (
                        <div className="space-y-2">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : horas.length > 0 ? (
                        <div className="space-y-2">
                            {horas.map(hora => (
                                <div
                                    key={hora.id}
                                    className={`group/item flex items-center justify-between rounded-md border p-4 transition-colors ${
                                        hora.es_recreo
                                            ? 'bg-primary/10 border-primary/50 hover:bg-primary/20'
                                            : 'bg-background hover:bg-muted/40'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary font-bold">
                                            {hora.orden}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{hora.nombre}</p>
                                                {hora.es_recreo && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Coffee className="h-3 w-3" />
                                                        Recreo
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {hora.hora_inicio} - {hora.hora_fin}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover/item:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleEditClick(hora)}
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Editar</span>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Eliminar</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Se eliminará el bloque de horario:
                                                        <strong className="font-medium block mt-2">{hora.nombre}</strong>
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteHora(hora.id)}
                                                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                                    >
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
                        <PlaceholderContent
                            icon={Clock}
                            title="No hay bloques de horario"
                            description="Añade tu primer bloque para empezar a configurar las horas pedagógicas."
                            className="py-10"
                        />
                    )}
                </CardContent>
            </Card>

            <HoraFormSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                onSave={handleSave}
                horaToEdit={selectedHora}
                nextOrden={nextOrden}
            />
        </div>
    );
}
