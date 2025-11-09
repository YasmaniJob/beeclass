
'use client';

import { Incidente } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, CalendarDays, FileText, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface IncidenteDetailSheetProps {
    incidente: Incidente | null;
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


export function IncidenteDetailSheet({ incidente, isOpen, onOpenChange }: IncidenteDetailSheetProps) {
    if (!incidente) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Detalles del Incidente</SheetTitle>
                    <SheetDescription>
                        Información detallada sobre el incidente reportado.
                    </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 py-6 overflow-y-auto flex-1 pr-2">
                    {/* Sujeto Info */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-base">Datos del Involucrado</h3>
                        <DetailItem icon={User} label="Nombre" iconClassName="text-blue-500">
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">{`${incidente.sujeto.apellidoPaterno} ${incidente.sujeto.apellidoMaterno}, ${incidente.sujeto.nombres}`}</span>
                                <span className="text-xs text-muted-foreground">{incidente.sujeto.tipoDocumento}: {incidente.sujeto.numeroDocumento}</span>
                            </div>
                        </DetailItem>
                        <DetailItem icon={User} label="Rol / Sección" iconClassName="text-blue-500">
                            {'grado' in incidente.sujeto ? (
                                <Badge variant="secondary">{incidente.sujeto.grado} - {incidente.sujeto.seccion}</Badge>
                            ): (
                                <Badge variant="default">{incidente.sujeto.rol}</Badge>
                            )}
                        </DetailItem>
                    </div>

                    {/* Incidente Details */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                         <h3 className="font-semibold text-base">Detalles del Incidente</h3>
                        <DetailItem icon={UserCircle} label="Reportado por" iconClassName="text-cyan-500">
                            {incidente.reportadoPor}
                        </DetailItem>
                        <Separator />
                        <DetailItem icon={CalendarDays} label="Fecha del Incidente" iconClassName="text-green-500">
                           {format(incidente.fecha, 'PPP', {locale: es})}
                        </DetailItem>
                        <Separator />
                        <DetailItem icon={FileText} label="Descripción" iconClassName="text-yellow-500">
                            <p className="text-sm font-normal whitespace-pre-wrap">{incidente.descripcion}</p>
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
