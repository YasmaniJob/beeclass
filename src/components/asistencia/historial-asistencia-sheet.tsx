
'use client';

import { useEffect, useMemo } from 'react';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Check, Clock, FileLock, History, User, X } from 'lucide-react';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { Badge } from '../ui/badge';
import { useHistorialAsistencia } from '@/hooks/use-historial-asistencia';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { AsistenciaBadge } from './asistencia-badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface HistorialAsistenciaSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    estudiante: Estudiante;
}

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string; value: number; icon: React.ElementType; colorClass: string; }) => {
    return (
        <div className={cn("flex w-full items-center p-3 rounded-lg border bg-muted/30", colorClass)}>
            <div className={cn("flex items-center justify-center rounded-full h-8 w-8 mr-3 bg-background/50")}>
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{title}</p>
            </div>
        </div>
    );
}

export function HistorialAsistenciaSheet({ open, onOpenChange, estudiante }: HistorialAsistenciaSheetProps) {
    const { historial, loadHistorialForEstudiante } = useHistorialAsistencia();

    useEffect(() => {
        if (open) {
            loadHistorialForEstudiante(estudiante.numeroDocumento);
        }
    }, [open, estudiante, loadHistorialForEstudiante]);

    const stats = useMemo(() => {
        return historial.reduce((acc, record) => {
            acc[record.status] = (acc[record.status] || 0) + 1;
            return acc;
        }, { presente: 0, tarde: 0, falta: 0, permiso: 0 });
    }, [historial]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Historial de Asistencia</SheetTitle>
                    <div className="text-sm text-muted-foreground pt-2 space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-foreground">{estudiante.nombreCompleto}</span>
                        </div>
                        <Badge variant="secondary">{estudiante.grado ?? '—'} - {estudiante.seccion ?? '—'}</Badge>
                    </div>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-4">
                     <div className="grid grid-cols-2 gap-2">
                        <StatCard title="Presente" value={stats.presente} icon={Check} colorClass="text-green-600" />
                        <StatCard title="Tardanzas" value={stats.tarde} icon={Clock} colorClass="text-yellow-600" />
                        <StatCard title="Faltas" value={stats.falta} icon={X} colorClass="text-red-600" />
                        <StatCard title="Permisos" value={stats.permiso} icon={FileLock} colorClass="text-purple-600" />
                    </div>

                    {historial.length > 0 ? (
                        <Card>
                            <CardContent className="p-0">
                                <ul className="divide-y">
                                    {historial.map((record, index) => (
                                        <li key={index} className="flex items-center justify-between p-3">
                                            <span className="font-medium text-sm">
                                                {format(record.fecha, 'PPP', { locale: es })}
                                            </span>
                                            <AsistenciaBadge status={record.status} />
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ) : (
                        <PlaceholderContent
                            icon={History}
                            title="Sin historial registrado"
                            description="Este estudiante no tiene registros de asistencia pasados."
                            className="py-10"
                        />
                    )}
                </div>
                 <SheetFooter>
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cerrar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
