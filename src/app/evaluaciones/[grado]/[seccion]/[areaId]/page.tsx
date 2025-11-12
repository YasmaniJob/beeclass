
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { BookDashed, Save, Plus } from 'lucide-react';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useCalificaciones } from '@/hooks/use-calificaciones';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSesiones } from '@/hooks/use-sesiones';
import { SesionesSheet } from '@/components/evaluaciones/sesiones-sheet';
import { useToast } from '@/hooks/use-toast';
import { useEvaluacionConfig } from '@/hooks/use-evaluacion-config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotaBadge } from '@/components/shared/nota-badge';
import { Competencia, Estudiante, Calificacion, SesionAprendizaje, NotaCualitativa } from '@/lib/definitions';
import { CalificacionesDesgloseSheet } from '@/components/evaluaciones/calificaciones-desglose-sheet';
import { EvaluacionesStats } from '@/components/evaluaciones/evaluaciones-stats';
import { useCompetencias } from '@/hooks/use-competencias';
import { useCurrentUser } from '@/hooks/use-current-user';
import { NotaSelector } from '@/components/shared/nota-selector';

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
    const [notasEditadas, setNotasEditadas] = useState<Map<string, NotaCualitativa>>(new Map());
    const [estudiantesModificados, setEstudiantesModificados] = useState<Set<string>>(new Set());
    
    const { addSesion } = useSesiones();
    const { saveCalificacion } = useCompetencias();
    const { user } = useCurrentUser();

    const {
        estudiantesConPromedios,
        calificacionesPorEstudianteYCompetencia,
        sesiones,
        sesionesDelArea,
        isLoading,
    } = useCalificaciones(grado, seccion, areaId);

    const [isSesionSheetOpen, setIsSesionSheetOpen] = useState(false);
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

    // Detectar si es área de competencias transversales
    const esCompetenciasTransversales = useMemo(() => {
        return area?.nombre === 'Competencias Transversales' || areaId.includes('transversal');
    }, [area, areaId]);

    const handleSaveSesion = (titulo: string, competenciaId: string, capacidades?: string[], tipoEvaluacion?: 'directa' | 'lista-cotejo' | 'rubrica') => {
        const newSesion = addSesion(grado, seccion, areaId, titulo, competenciaId, capacidades, tipoEvaluacion);
        toast({
            title: 'Sesión Creada',
            description: `La sesión "${titulo}" ha sido creada con éxito.`,
        });
        setIsSesionSheetOpen(false);
        router.push(`/evaluaciones/${encodeURIComponent(grado)}/${encodeURIComponent(seccion)}/${encodeURIComponent(areaId)}/${newSesion.id}`);
    }

    // Calcular progreso de calificaciones por sesión
    const calificacionesPorSesion = useMemo(() => {
        const map = new Map<string, { calificados: number; total: number }>();
        const totalEstudiantes = estudiantesConPromedios.length;

        sesionesDelArea.forEach((sesion: SesionAprendizaje) => {
            const estudiantesCalificados = new Set<string>();
            
            calificacionesPorEstudianteYCompetencia.forEach(compMap => {
                compMap.forEach(calificaciones => {
                    calificaciones.forEach(cal => {
                        if (cal.sesionId === sesion.id) {
                            estudiantesCalificados.add(cal.estudianteId);
                        }
                    });
                });
            });

            map.set(sesion.id, {
                calificados: estudiantesCalificados.size,
                total: totalEstudiantes
            });
        });

        return map;
    }, [sesionesDelArea, calificacionesPorEstudianteYCompetencia, estudiantesConPromedios]);

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

    const handleNotaChange = useCallback((estudianteId: string, competenciaId: string, nota: NotaCualitativa) => {
        const key = `${estudianteId}-${competenciaId}`;
        setNotasEditadas(prev => new Map(prev).set(key, nota));
        setEstudiantesModificados(prev => new Set(prev).add(estudianteId));
    }, []);

    const handleGuardarCambios = useCallback(() => {
        if (!user || !area) return;

        let cambiosGuardados = 0;
        notasEditadas.forEach((nota, key) => {
            const [estudianteId, competenciaId] = key.split('-');
            saveCalificacion({
                estudianteId,
                docenteId: user.numeroDocumento,
                grado,
                seccion,
                areaId: area.id,
                competenciaId,
                nota,
                periodo: `${evaluacionConfig.tipo} ${periodoSeleccionado}`,
                tipoEvaluacion: 'directa',
            });
            cambiosGuardados++;
        });

        toast({
            title: 'Calificaciones guardadas',
            description: `Se han guardado ${cambiosGuardados} calificación(es) para ${estudiantesModificados.size} estudiante(s).`,
        });

        setNotasEditadas(new Map());
        setEstudiantesModificados(new Set());
    }, [user, area, notasEditadas, estudiantesModificados, grado, seccion, evaluacionConfig, periodoSeleccionado, saveCalificacion, toast]);

    const getNotaActual = useCallback((estudianteId: string, competenciaId: string): NotaCualitativa | '-' => {
        const key = `${estudianteId}-${competenciaId}`;
        if (notasEditadas.has(key)) {
            return notasEditadas.get(key)!;
        }
        const estudiante = estudiantesConPromedios.find(e => e.numeroDocumento === estudianteId);
        return estudiante?.promediosPorCompetencia[competenciaId]?.nota || '-';
    }, [notasEditadas, estudiantesConPromedios]);

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
                    <Button onClick={() => setIsSesionSheetOpen(true)}>
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
                                    <TableHead key={c.id} className="text-center min-w-[200px] border-l">
                                        <div className="flex flex-col gap-1 py-2">
                                            <span className="text-xs text-muted-foreground font-normal">Competencia {index + 1}</span>
                                            <span className="text-sm font-semibold leading-tight">{c.nombre}</span>
                                        </div>
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
                                        const notaActual = getNotaActual(estudiante.numeroDocumento, c.id);
                                        const fueModificado = notasEditadas.has(`${estudiante.numeroDocumento}-${c.id}`);
                                        
                                        return (
                                             <TableCell key={c.id} className={`text-center border-l p-2 ${fueModificado ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                                                {esCompetenciasTransversales ? (
                                                    <NotaSelector
                                                        value={notaActual === '-' ? null : notaActual}
                                                        onValueChange={(nota: NotaCualitativa) => handleNotaChange(estudiante.numeroDocumento, c.id, nota)}
                                                    />
                                                ) : (
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
                                                )}
                                             </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {esCompetenciasTransversales && estudiantesModificados.size > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <Button size="lg" onClick={handleGuardarCambios} className="shadow-lg">
                        <Save className="mr-2 h-5 w-5" />
                        Guardar Cambios
                        <Badge variant="secondary" className="ml-2">{estudiantesModificados.size}</Badge>
                    </Button>
                </div>
            )}
            <SesionesSheet
                open={isSesionSheetOpen}
                onOpenChange={setIsSesionSheetOpen}
                area={area}
                grado={grado}
                seccion={seccion}
                sesiones={sesionesDelArea}
                onCreateSesion={handleSaveSesion}
                calificacionesPorSesion={calificacionesPorSesion}
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
