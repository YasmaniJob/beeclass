
'use client';

import { useMemo } from 'react';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { FileLock, Calendar, FileText, Link as LinkIcon, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { usePermisos } from '@/hooks/use-permisos';
import { Separator } from '../ui/separator';

interface PermisoFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    estudiante: Estudiante;
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

export function PermisoFormSheet({ open, onOpenChange, estudiante }: PermisoFormSheetProps) {
    const { getPermisosForEstudiante } = usePermisos();
    const permisos = useMemo(() => {
        return getPermisosForEstudiante(estudiante.numeroDocumento);
    }, [getPermisosForEstudiante, estudiante.numeroDocumento]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Historial de Permisos</SheetTitle>
                    <div className="text-sm text-muted-foreground pt-2 space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-foreground">{estudiante.nombreCompleto}</span>
                        </div>
                        <Badge variant="secondary">{estudiante.grado ?? '—'} - {estudiante.seccion ?? '—'}</Badge>
                    </div>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
                    {permisos.length > 0 ? (
                        <div className="space-y-4">
                            {permisos.map(p => (
                                <Card key={`${p.id}-${p.fechaInicio.toISOString()}`}>
                                    <CardContent className="p-4 space-y-4">
                                        <DetailItem icon={Calendar} label="Fechas del Permiso" iconClassName="text-green-500">
                                            {format(p.fechaInicio, 'PPP', {locale: es})} - {format(p.fechaFin, 'PPP', {locale: es})}
                                        </DetailItem>
                                        <Separator />
                                        <DetailItem icon={FileText} label="Motivo" iconClassName="text-yellow-500">
                                            <p className="text-sm font-normal whitespace-pre-wrap">{p.motivo}</p>
                                        </DetailItem>
                                        <Separator />
                                        <DetailItem icon={LinkIcon} label="Documento" iconClassName="text-red-500">
                                            {p.documento ? (
                                                <a
                                                    href={p.documento}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary underline break-all"
                                                >
                                                    Ver documento
                                                </a>
                                            ) : (
                                                <span className="text-sm font-normal text-muted-foreground italic">Sin documento</span>
                                            )}
                                        </DetailItem>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <PlaceholderContent
                            icon={FileLock}
                            title="Sin permisos registrados"
                            description="Este estudiante no tiene permisos ni justificaciones registradas en el sistema."
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
