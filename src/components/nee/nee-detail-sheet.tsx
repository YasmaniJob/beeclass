
'use client';

import { NeeEntry } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, FileText, Link as LinkIcon, Clock, Pencil } from 'lucide-react';

interface NeeDetailSheetProps {
    entry: NeeEntry | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onEdit?: (entry: NeeEntry) => void;
    canManage?: boolean;
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

export function NeeDetailSheet({ entry, isOpen, onOpenChange, onEdit, canManage = false }: NeeDetailSheetProps) {
    if (!entry) return null;

    const { estudiante } = entry;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Detalles de NEE del Estudiante</SheetTitle>
                    <SheetDescription>
                        Información detallada sobre las necesidades educativas especiales del estudiante.
                    </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 py-6 overflow-y-auto flex-1 pr-2">
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-base">Datos del Estudiante</h3>
                        <DetailItem icon={User} label="Estudiante" iconClassName="text-blue-500">
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">{`${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.nombres}`}</span>
                                <span className="text-xs text-muted-foreground">{estudiante.tipoDocumento}: {estudiante.numeroDocumento}</span>
                            </div>
                        </DetailItem>
                        <DetailItem icon={User} label="Grado y Sección" iconClassName="text-blue-500">
                             <Badge variant="secondary">{estudiante.grado ?? 'Sin grado'} - {estudiante.seccion ?? 'Sin sección'}</Badge>
                        </DetailItem>
                    </div>

                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                         <h3 className="font-semibold text-base">Detalles de la NEE</h3>
                        <DetailItem icon={FileText} label="Descripción / Diagnóstico" iconClassName="text-yellow-500">
                            <p className="text-sm font-normal whitespace-pre-wrap">{entry.descripcion}</p>
                        </DetailItem>
                        <Separator />
                        <DetailItem icon={LinkIcon} label="Documento" iconClassName="text-green-500">
                            {entry.documentoUrl ? (
                                <Button variant="link" className="justify-start px-0" asChild>
                                    <a href={entry.documentoUrl} target="_blank" rel="noopener noreferrer" className="truncate max-w-full">
                                        {entry.documentoUrl}
                                    </a>
                                </Button>
                            ) : (
                                <span className="text-sm font-normal text-muted-foreground italic">Sin documento adjunto</span>
                            )}
                        </DetailItem>
                        <DetailItem icon={Clock} label="Última actualización" iconClassName="text-purple-500">
                            <span className="text-sm text-muted-foreground">
                                {entry.updatedAt.toLocaleString('es-PE')}
                            </span>
                        </DetailItem>
                        <DetailItem icon={User} label="Registrado por" iconClassName="text-slate-500">
                            <span className="text-sm text-muted-foreground">{entry.registradoPor}</span>
                        </DetailItem>
                    </div>
                </div>

                <SheetFooter>
                    {canManage && onEdit && (
                        <Button variant="outline" onClick={() => onEdit(entry)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar registro
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cerrar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
