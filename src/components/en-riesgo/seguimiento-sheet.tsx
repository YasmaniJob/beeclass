
'use client';

import { useState, useEffect } from 'react';
import { Estudiante, Seguimiento } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Badge } from '../ui/badge';
import { User, History, PlusCircle, AlertTriangle, FileText, Calendar, NotebookPen } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '../ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlaceholderContent } from '../ui/placeholder-content';
import { EstudianteEnRiesgo } from '@/hooks/use-en-riesgo-data';
import { Separator } from '../ui/separator';

interface SeguimientoSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    estudiante: EstudianteEnRiesgo;
    onAddSeguimiento: (data: Omit<Seguimiento, 'id'>) => void;
    getSeguimientosForEstudiante: (estudianteId: string) => Seguimiento[];
    canManage: boolean;
}

export function SeguimientoSheet({ 
    isOpen, 
    onOpenChange, 
    estudiante,
    onAddSeguimiento,
    getSeguimientosForEstudiante,
    canManage,
}: SeguimientoSheetProps) {
    const { user } = useCurrentUser();
    const { toast } = useToast();
    const [accion, setAccion] = useState('');
    const [detalles, setDetalles] = useState('');
    const [historial, setHistorial] = useState<Seguimiento[]>([]);
    
    useEffect(() => {
        if(isOpen) {
            setHistorial(getSeguimientosForEstudiante(estudiante.numeroDocumento));
        } else {
            // Reset form on close
            setAccion('');
            setDetalles('');
        }
    }, [isOpen, estudiante, getSeguimientosForEstudiante])

    const handleAdd = () => {
        if (!accion.trim() || !detalles.trim() || !user || !canManage) return;
        const newSeguimiento: Omit<Seguimiento, 'id'> = {
            estudianteId: estudiante.numeroDocumento,
            fecha: new Date(),
            accion,
            detalles,
            realizadoPor: `${user.nombres} ${user.apellidoPaterno} (${user.rol})`,
        }
        onAddSeguimiento(newSeguimiento);
        setHistorial(prev => [newSeguimiento as Seguimiento, ...prev]);
        setAccion('');
        setDetalles('');
        toast({ title: 'Acción registrada', description: 'El seguimiento ha sido añadido al historial.' });
    };
    
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Plan de Seguimiento</SheetTitle>
                    <div className="text-sm text-muted-foreground pt-2 space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-foreground">{`${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.nombres}`}</span>
                        </div>
                        <Badge variant="secondary">{estudiante.grado} - {estudiante.seccion}</Badge>
                    </div>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-6">
                    <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                        <CardHeader className="pb-3">
                           <h3 className="font-semibold text-sm flex items-center gap-2 text-amber-800 dark:text-amber-200">
                                <AlertTriangle className="h-4 w-4" /> Indicadores de Riesgo Detectados
                            </h3>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3">
                            {estudiante.faltasCount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span>Faltas injustificadas:</span>
                                    <Badge variant="destructive">{estudiante.faltasCount}</Badge>
                                </div>
                            )}
                             {estudiante.incidentesCount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span>Incidentes reportados:</span>
                                    <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">{estudiante.incidentesCount}</Badge>
                                </div>
                            )}
                             {estudiante.notasBajasCount > 0 && (
                                <div>
                                    <div className="flex justify-between items-center">
                                        <span>Notas desaprobadas (C):</span>
                                        <Badge variant="destructive" className="bg-yellow-500 text-black hover:bg-yellow-600">{estudiante.notasBajasCount}</Badge>
                                    </div>
                                    <ul className="list-disc list-inside mt-1 pl-4 text-xs text-muted-foreground">
                                        {estudiante.areasConNotasBajas.map(area => (
                                            <li key={area.area}>
                                                <span className="font-medium text-foreground">{area.area}:</span> {area.count}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <NotebookPen className="h-4 w-4" /> Registrar Nueva Acción
                            </h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="accion">Tipo de Acción</Label>
                                <Input
                                    id="accion"
                                    value={accion}
                                    onChange={e => setAccion(e.target.value)}
                                    placeholder="Ej: Llamada a padres, Reunión, Derivación..."
                                    disabled={!canManage}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="detalles">Detalles / Acuerdos</Label>
                                <Textarea
                                    id="detalles"
                                    value={detalles}
                                    onChange={e => setDetalles(e.target.value)}
                                    placeholder="Describe la acción realizada y los acuerdos tomados..."
                                    disabled={!canManage}
                                />
                            </div>
                             <Button onClick={handleAdd} disabled={!canManage || !accion.trim() || !detalles.trim()}>Guardar Acción</Button>
                        </CardContent>
                    </Card>
                    
                    <div className="space-y-4">
                        <h3 className="font-medium text-sm flex items-center gap-2">
                           <History className="h-4 w-4" /> Historial de Seguimiento
                        </h3>

                        {historial.length > 0 ? (
                           <div className="space-y-3">
                               {historial.map(s => (
                                   <Card key={s.id} className="bg-muted/30">
                                       <CardContent className="p-3 text-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-semibold text-primary">{s.accion}</p>
                                                <p className="text-xs text-muted-foreground">{format(s.fecha, 'dd/MM/yy HH:mm', { locale: es })}</p>
                                            </div>
                                            <p className="mb-2 text-muted-foreground">{s.detalles}</p>
                                            <p className="text-xs text-right text-muted-foreground/80">Por: {s.realizadoPor}</p>
                                       </CardContent>
                                   </Card>
                               ))}
                           </div>
                        ) : (
                            <PlaceholderContent 
                                icon={History}
                                title="Sin acciones registradas"
                                description="Aún no se han tomado acciones de seguimiento para este estudiante."
                                className="py-8 text-xs"
                            />
                        )}
                    </div>
                </div>
                 <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" variant="secondary">Cerrar</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
