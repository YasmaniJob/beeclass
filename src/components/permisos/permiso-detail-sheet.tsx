
'use client';

import { Permiso } from '@/domain/entities/Permiso';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, CalendarDays, FileText, Link as LinkIcon, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PermisoDetailSheetProps {
    permiso: Permiso | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

function DetailItem({ icon: Icon, label, children, iconClassName }: { icon: React.ElementType, label: string, children: React.ReactNode, iconClassName?: string }) {
    return (
        <div className="flex items-start gap-4">
            <Icon className={`h-5 w-5 mt-1 flex-shrink-0 ${iconClassName}`} />
            <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <div className="font-medium text-sm">{children}</div>
            </div>
        </div>
    );
}


export function PermisoDetailSheet({ permiso, isOpen, onOpenChange }: PermisoDetailSheetProps) {
    if (!permiso) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Detalles del Permiso</SheetTitle>
                    <SheetDescription>
                        Información detallada sobre el permiso solicitado.
                    </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 py-6 overflow-y-auto flex-1 pr-2">
                    {/* Estudiante Info */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-base">Datos del Estudiante</h3>
                        <DetailItem icon={User} label="Estudiante" iconClassName="text-blue-500">
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">{`${permiso.estudiante.apellidoPaterno} ${permiso.estudiante.apellidoMaterno}, ${permiso.estudiante.nombres}`}</span>
                                <span className="text-xs text-muted-foreground">{permiso.estudiante.tipoDocumento}: {permiso.estudiante.numeroDocumento}</span>
                            </div>
                        </DetailItem>
                        <DetailItem icon={User} label="Grado y Sección" iconClassName="text-blue-500">
                             <Badge variant="secondary">{permiso.estudiante.grado} - {permiso.estudiante.seccion}</Badge>
                        </DetailItem>
                    </div>

                    {/* Permiso Details */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                         <h3 className="font-semibold text-base">Detalles del Permiso</h3>
                        <DetailItem icon={Edit} label="Registrado por" iconClassName="text-cyan-500">
                            {permiso.registradoPor}
                        </DetailItem>
                        <Separator />
                        <DetailItem icon={CalendarDays} label="Fechas del Permiso" iconClassName="text-green-500">
                           {format(permiso.fechaInicio, 'PPP', {locale: es})} - {format(permiso.fechaFin, 'PPP', {locale: es})}
                        </DetailItem>
                        <Separator />
                        <DetailItem icon={FileText} label="Motivo" iconClassName="text-yellow-500">
                            <p className="text-sm font-normal whitespace-pre-wrap">{permiso.motivo}</p>
                        </DetailItem>
                        <Separator />
                        <DetailItem icon={LinkIcon} label="Documento" iconClassName="text-red-500">
                            {permiso.documento ? (
                                <a
                                    href={permiso.documento}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary underline break-all"
                                >
                                    Abrir documento
                                </a>
                            ) : (
                                <span className="text-sm font-normal text-muted-foreground italic">Sin documento disponible</span>
                            )}
                        </DetailItem>
                    </div>
                </div>

                <SheetFooter>
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cerrar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
