
'use client';

import { Docente } from '@/domain/entities/Docente';
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
import { CheckCircle2, CircleOff } from 'lucide-react';
import { Separator } from '../ui/separator';

interface DocentesCalificadoresSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    tituloCompetencia: string;
    calificados: Docente[];
    pendientes: Docente[];
}

export function DocentesCalificadoresSheet({ 
    isOpen, 
    onOpenChange, 
    tituloCompetencia, 
    calificados, 
    pendientes 
}: DocentesCalificadoresSheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Estado de Calificación</SheetTitle>
                    <SheetDescription>
                        Docentes asignados a la sección que deben calificar las competencias transversales.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="space-y-3">
                        <h4 className="font-medium leading-none flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            Docentes que calificaron ({calificados.length})
                        </h4>
                        {calificados.length > 0 ? (
                            <ul className="text-sm text-muted-foreground list-disc pl-5">
                                {calificados.map(d => <li key={d.numeroDocumento}>{d.nombres} {d.apellidoPaterno}</li>)}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground text-center italic py-2">Nadie ha calificado aún.</p>}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <h4 className="font-medium leading-none flex items-center gap-2 text-red-600">
                            <CircleOff className="h-5 w-5" />
                            Docentes pendientes ({pendientes.length})
                        </h4>
                        {pendientes.length > 0 ? (
                            <ul className="text-sm text-muted-foreground list-disc pl-5">
                                {pendientes.map(d => <li key={d.numeroDocumento}>{d.nombres} {d.apellidoPaterno}</li>)}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground text-center italic py-2">¡Todos han calificado!</p>}
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="secondary">Cerrar</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
