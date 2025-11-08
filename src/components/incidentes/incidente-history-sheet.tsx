
'use client';

import { Estudiante } from '@/domain/entities/Estudiante';
import { Incidente } from '@/domain/entities/Incidente';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Siren, Calendar, FileText, User, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';

interface IncidenteHistorySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    estudiante: Estudiante;
    incidentes: Incidente[];
    onRegisterNew: () => void;
}

function DetailItem({ icon: Icon, label, children, iconClassName }: { icon: React.ElementType, label: string, children: React.ReactNode, iconClassName?: string }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${iconClassName}`} />
            <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <div className="font-medium text-sm">{children}</div>
            </div>
        </div>
    );
}

export function IncidenteHistorySheet({ open, onOpenChange, estudiante, incidentes, onRegisterNew }: IncidenteHistorySheetProps) {
    
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Historial de Incidentes</SheetTitle>
                    <SheetDescription>
                        Consulta los incidentes registrados para el estudiante.
                    </SheetDescription>
                    <div className="text-sm text-muted-foreground pt-2 space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-foreground">{estudiante.nombreCompleto}</span>
                        </div>
                        <Badge variant="secondary">{estudiante.grado ?? '—'} - {estudiante.seccion ?? '—'}</Badge>
                    </div>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
                    {incidentes.length > 0 ? (
                        <div className="space-y-4">
                            {incidentes.map(i => (
                                <Card key={`${i.id}-${new Date(i.fecha).getTime()}`}>
                                    <CardContent className="p-4 space-y-4">
                                        <div className='flex items-center justify-between'>
                                            <DetailItem icon={Calendar} label="Fecha" iconClassName="text-green-500">
                                                {format(new Date(i.fecha), 'PPP', {locale: es})}
                                            </DetailItem>
                                        </div>
                                        <Separator />
                                        <DetailItem icon={FileText} label="Descripción" iconClassName="text-yellow-500">
                                            <p className="text-sm font-normal whitespace-pre-wrap">{i.descripcion}</p>
                                        </DetailItem>
                                        <Separator />
                                        <DetailItem icon={User} label="Reportado por" iconClassName="text-cyan-500">
                                            {i.reportadoPor}
                                        </DetailItem>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <PlaceholderContent
                            icon={Siren}
                            title="Sin incidentes registrados"
                            description="Este estudiante no tiene incidentes registrados en el sistema."
                            className="py-10"
                        />
                    )}
                </div>
                 <SheetFooter className="flex-col sm:flex-row sm:justify-between items-center gap-2">
                    <Button onClick={onRegisterNew} className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Registrar Nuevo Incidente
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cerrar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
