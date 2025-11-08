
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { BookDashed, Save, Plus, AlertCircle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useCalificaciones } from '@/hooks/use-calificaciones';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSesiones } from '@/hooks/use-sesiones';
import { SesionFormDialog } from '@/components/evaluaciones/sesion-form-dialog';
import { useToast } from '@/hooks/use-toast';
import { useEvaluacionConfig } from '@/hooks/use-evaluacion-config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { NotaBadge } from '@/components/shared/nota-badge';
import { Competencia, Estudiante, Calificacion, SesionAprendizaje } from '@/lib/definitions';
import { CalificacionesDesgloseSheet } from '@/components/evaluaciones/calificaciones-desglose-sheet';
import { EvaluacionesStats } from '@/components/evaluaciones/evaluaciones-stats';
import { AlertaNotasFaltantes } from '@/components/evaluaciones/alerta-notas-faltantes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type FilterType = 'todos' | 'completos' | 'incompletos';

export default function LibretaDeNotasPage() {
    const params = useParams<{ grado: string; seccion: string; areaId: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const { areas } = useMatriculaData();
    const { config: evaluacionConfig } = useEvaluacionConfig();

    const areaId = decodeURIComponent(params.areaId);
    const grado = decodeURIComponent(params.grado);
    const seccion = decodeURIComponent(params.seccion);
    
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('1');
    const [filter, setFilter] = useState<FilterType>('todos');
    const { addSesion } = useSesiones();

    const {
        estudiantesConPromedios,
        calificacionesPorEstudianteYCompetencia,
        sesiones,
        isLoading,
    } = useCalificaciones(grado, seccion, areaId);

    const [isSesionDialogOpen, setIsSesionDialogOpen] = useState(false);
    const [desgloseState, setDesgloseState] = useState<{
        isOpen: boolean;
        estudiante: Estudiante | null;
        competencia: Competencia | null;
        calificaciones: Calificacion[];
        sesiones: SesionAprendizaje[];
    }>({ isOpen: false, estudiante: null, competencia: null, calificaciones: [], sesiones: [] });

    const filteredEstudiantes = useMemo(() => {
        if (filter === 'todos') return estudiantesConPromedios;
        if (filter === 'completos') return estudiantesConPromedios.filter(e => !e.tieneNotasFaltantes);
        if (filter === 'incompletos') return estudiantesConPromedios.filter(e => e.tieneNotasFaltantes);
        return [];
    }, [filter, estudiantesConPromedios]);

    const periodosOptions = useMemo(() => {
        return Array.from({ length: evaluacionConfig.cantidad }, (_, i) => {
            const num = i + 1;
            return {
                value: `${num}`,
                label: `${evaluacionConfig.tipo} ${num}`
            }
        });
    }, [evaluacionConfig]);

    useEffect(() => {
        setPeriodoSeleccionado('1');
    }, [evaluacionConfig]);

    const area = useMemo(() => {
        return areas.find(a => a.id === areaId);
    }, [areaId, areas]);

    const handleSaveSesion = (titulo: string, competenciaId: string, capacidades?: string[]) => {
        const newSesion = addSesion(grado, seccion, areaId, titulo, competenciaId, capacidades);
        toast({
            title: 'Sesión Creada',
            description: `La sesión "${titulo}" ha sido creada con éxito.`,
        });
        setIsSesionDialogOpen(false);
        router.push(`/evaluaciones/${encodeURIComponent(grado)}/${encodeURIComponent(seccion)}/${encodeURIComponent(areaId)}/${newSesion.id}`);
    }

    const handleOpenDesglose = (estudiante: Estudiante, competencia: Competencia) => {
        const calificacionesEstudiante = calificacionesPorEstudianteYCompetencia.get(estudiante.numeroDocumento)?.get(competencia.id) || [];
        
        setDesgloseState({
            isOpen: true,
            estudiante,
            competencia,
            calificaciones: calificacionesEstudiante,
            sesiones: sesiones,
        });
    }

    if (isLoading) {
         return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <Skeleton className="h-9 w-1/2" />
                        <Skeleton className="h-5 w-3/4 mt-2" />
                    </div>
                </div>
                <Card>
                    <CardContent className="p-4 space-y-2">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    </CardContent>
                </Card>
            </div>
         )
    }

    if (!area) {
        return (
             <PlaceholderContent
                icon={BookDashed}
                title="Área no encontrada"
                description="No se pudo encontrar el área curricular especificada."
            />
        )
    }
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {area.nombre}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {`${grado} - ${seccion.replace('Sección ','')}`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar periodo" />
                        </SelectTrigger>
                        <SelectContent>
                            {periodosOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setIsSesionDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Sesión
                    </Button>
                </div>
            </div>

             <EvaluacionesStats 
                estudiantes={estudiantesConPromedios}
                activeFilter={filter}
                onFilterChange={setFilter}
            />

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px] sticky left-0 bg-card z-10">N°</TableHead>
                                <TableHead className="sticky left-10 bg-card z-10 min-w-[200px]">Apellidos y Nombres</TableHead>
                                {area.competencias.map((c, index) => (
                                    <TableHead key={c.id} className="text-center min-w-[120px] border-l">
                                         <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" className="font-bold">C{index + 1}</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Competencia {index + 1}</DialogTitle>
                                                    <DialogDescription>
                                                        {c.nombre}
                                                    </DialogDescription>
                                                </DialogHeader>
                                            </DialogContent>
                                        </Dialog>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEstudiantes.map((estudiante, index) => (
                                <TableRow key={estudiante.numeroDocumento}>
                                    <TableCell className={`sticky left-0 z-10 ${estudiante.tieneNotasFaltantes ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-card'}`}>{index + 1}</TableCell>
                                    <TableCell className={`font-medium sticky left-10 z-10 ${estudiante.tieneNotasFaltantes ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-card'}`}>
                                        <div className="flex items-center gap-2">
                                            <span>{`${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.nombres}`}</span>
                                        </div>
                                    </TableCell>
                                    {area.competencias.map(c => {
                                        const promedio = estudiante.promediosPorCompetencia[c.id];
                                        return (
                                             <TableCell key={c.id} className="text-center border-l p-2">
                                                <div className="relative inline-flex items-center justify-center">
                                                    <NotaBadge
                                                        nota={promedio.nota}
                                                        onClick={() => handleOpenDesglose(estudiante, c)}
                                                        clickable={promedio.nota !== '-'}
                                                    />
                                                    {promedio.faltanNotas > 0 && (
                                                        <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 justify-center p-0 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-full">{promedio.faltanNotas}</Badge>
                                                    )}
                                                </div>
                                             </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {false && ( // changedStudentIds.size > 0
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <Button size="lg" onClick={() => {}} className="shadow-lg">
                        <Save className="mr-2 h-5 w-5" />
                        Guardar Cambios
                        <Badge variant="secondary" className="ml-2">{0}</Badge>
                    </Button>
                </div>
            )}
            <SesionFormDialog
                open={isSesionDialogOpen}
                onOpenChange={setIsSesionDialogOpen}
                onSave={handleSaveSesion}
                area={area}
            />

            <CalificacionesDesgloseSheet
                isOpen={desgloseState.isOpen}
                onOpenChange={(open) => setDesgloseState(prev => ({ ...prev, isOpen: open }))}
                estudiante={desgloseState.estudiante}
                competencia={desgloseState.competencia}
                calificaciones={desgloseState.calificaciones}
                sesiones={desgloseState.sesiones}
            />
        </div>
    );
}
