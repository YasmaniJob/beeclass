'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ArrowRight, FileText, Search } from 'lucide-react';
import { AreaCurricular, SesionAprendizaje } from '@/lib/definitions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type ViewMode = 'create' | 'all';

interface SesionesSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    area: AreaCurricular;
    grado: string;
    seccion: string;
    sesiones: SesionAprendizaje[];
    onCreateSesion: (titulo: string, competenciaId: string, capacidades?: string[]) => void;
    calificacionesPorSesion?: Map<string, { calificados: number; total: number }>;
}

export function SesionesSheet({
    open,
    onOpenChange,
    area,
    grado,
    seccion,
    sesiones,
    onCreateSesion,
    calificacionesPorSesion = new Map(),
}: SesionesSheetProps) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<ViewMode>('create');
    const [titulo, setTitulo] = useState('');
    const [competenciaId, setCompetenciaId] = useState('');
    const [capacidadesSeleccionadas, setCapacidadesSeleccionadas] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Sesiones recientes (últimas 5)
    const sesionesRecientes = useMemo(() => {
        return [...sesiones]
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .slice(0, 5);
    }, [sesiones]);

    // Sesiones agrupadas por competencia
    const sesionesPorCompetencia = useMemo(() => {
        const filtered = searchQuery
            ? sesiones.filter(s => s.titulo.toLowerCase().includes(searchQuery.toLowerCase()))
            : sesiones;

        const grouped = new Map<string, SesionAprendizaje[]>();
        filtered.forEach(sesion => {
            if (!grouped.has(sesion.competenciaId)) {
                grouped.set(sesion.competenciaId, []);
            }
            grouped.get(sesion.competenciaId)!.push(sesion);
        });

        // Ordenar sesiones dentro de cada grupo por fecha (más reciente primero)
        grouped.forEach(sesiones => {
            sesiones.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        });

        return grouped;
    }, [sesiones, searchQuery]);

    const competenciaSeleccionada = area.competencias.find(c => c.id === competenciaId);

    const handleToggleCapacidad = (capacidad: string) => {
        setCapacidadesSeleccionadas(prev =>
            prev.includes(capacidad)
                ? prev.filter(c => c !== capacidad)
                : [...prev, capacidad]
        );
    };

    const handleCrearYCalificar = () => {
        if (!titulo.trim() || !competenciaId) return;
        onCreateSesion(titulo, competenciaId, capacidadesSeleccionadas.length > 0 ? capacidadesSeleccionadas : undefined);
        // Limpiar formulario
        setTitulo('');
        setCompetenciaId('');
        setCapacidadesSeleccionadas([]);
    };

    const handleCalificarSesion = (sesionId: string) => {
        onOpenChange(false);
        router.push(`/evaluaciones/${encodeURIComponent(grado)}/${encodeURIComponent(seccion)}/${encodeURIComponent(area.id)}/${sesionId}`);
    };

    const getProgresoVariant = (calificados: number, total: number): 'default' | 'secondary' | 'destructive' => {
        if (calificados === 0) return 'secondary';
        if (calificados === total) return 'default';
        return 'destructive';
    };

    const getProgresoIcon = (calificados: number, total: number): string => {
        if (calificados === 0) return '❌';
        if (calificados === total) return '✅';
        return '⚠️';
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:w-[540px] sm:max-w-[540px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        {viewMode === 'all' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('create')}
                                className="h-8 w-8 p-0"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        {viewMode === 'create' ? 'Gestión de Sesiones' : 'Todas las Sesiones'}
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-80px)] pr-4">
                    {viewMode === 'create' ? (
                        <div className="space-y-6 py-4">
                            {/* Formulario Crear Sesión */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    📝 Crear Nueva Sesión
                                </h3>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="titulo">Título de la sesión</Label>
                                    <Input
                                        id="titulo"
                                        placeholder="Ej: Análisis de textos narrativos"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="competencia">Competencia</Label>
                                    <Select value={competenciaId} onValueChange={setCompetenciaId}>
                                        <SelectTrigger id="competencia">
                                            <SelectValue placeholder="Selecciona una competencia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {area.competencias.map((comp, index) => (
                                                <SelectItem key={comp.id} value={comp.id}>
                                                    C{index + 1}: {comp.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {competenciaSeleccionada && competenciaSeleccionada.capacidades && competenciaSeleccionada.capacidades.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Capacidades (opcional)</Label>
                                        <div className="space-y-2">
                                            {competenciaSeleccionada.capacidades.map((cap) => (
                                                <div key={cap} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={cap}
                                                        checked={capacidadesSeleccionadas.includes(cap)}
                                                        onCheckedChange={() => handleToggleCapacidad(cap)}
                                                    />
                                                    <label
                                                        htmlFor={cap}
                                                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {cap}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleCrearYCalificar}
                                        disabled={!titulo.trim() || !competenciaId}
                                        className="flex-1"
                                    >
                                        Crear y Calificar
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Sesiones Recientes */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    📚 Sesiones Recientes
                                </h3>
                                
                                {sesionesRecientes.length === 0 ? (
                                    <Card className="p-6 text-center text-sm text-muted-foreground">
                                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Aún no has creado sesiones para esta área.</p>
                                        <p className="text-xs mt-1">Crea tu primera sesión arriba.</p>
                                    </Card>
                                ) : (
                                    <div className="space-y-2">
                                        {sesionesRecientes.map((sesion) => {
                                            const competencia = area.competencias.find(c => c.id === sesion.competenciaId);
                                            const progreso = calificacionesPorSesion.get(sesion.id) || { calificados: 0, total: 0 };
                                            const competenciaIndex = area.competencias.findIndex(c => c.id === sesion.competenciaId);

                                            return (
                                                <Card key={sesion.id} className="p-3 hover:bg-accent/50 transition-colors">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-sm truncate">{sesion.titulo}</h4>
                                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                                <span>C{competenciaIndex + 1}</span>
                                                                <span>•</span>
                                                                <span>{formatDistanceToNow(new Date(sesion.fecha), { addSuffix: true, locale: es })}</span>
                                                                <span>•</span>
                                                                <Badge variant={getProgresoVariant(progreso.calificados, progreso.total)} className="text-xs">
                                                                    {getProgresoIcon(progreso.calificados, progreso.total)} {progreso.calificados}/{progreso.total}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleCalificarSesion(sesion.id)}
                                                        >
                                                            Calificar
                                                            <ArrowRight className="ml-1 h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}

                                {sesiones.length > 5 && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setViewMode('all')}
                                    >
                                        Ver todas las sesiones ({sesiones.length})
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            {/* Búsqueda y Nueva Sesión */}
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar sesiones..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => setViewMode('create')}
                                >
                                    + Nueva
                                </Button>
                            </div>

                            {/* Sesiones Agrupadas por Competencia */}
                            <div className="space-y-4">
                                {area.competencias.map((competencia, compIndex) => {
                                    const sesionesDeLaCompetencia = sesionesPorCompetencia.get(competencia.id) || [];
                                    if (sesionesDeLaCompetencia.length === 0 && searchQuery) return null;

                                    return (
                                        <div key={competencia.id} className="space-y-2">
                                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">
                                                    C{compIndex + 1}
                                                </span>
                                                <span className="flex-1 truncate">{competencia.nombre}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {sesionesDeLaCompetencia.length}
                                                </Badge>
                                            </h3>

                                            {sesionesDeLaCompetencia.length === 0 ? (
                                                <Card className="p-4 text-center text-xs text-muted-foreground">
                                                    Sin sesiones creadas
                                                </Card>
                                            ) : (
                                                <div className="space-y-2">
                                                    {sesionesDeLaCompetencia.map((sesion) => {
                                                        const progreso = calificacionesPorSesion.get(sesion.id) || { calificados: 0, total: 0 };

                                                        return (
                                                            <Card key={sesion.id} className="p-3 hover:bg-accent/50 transition-colors">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-medium text-sm">{sesion.titulo}</h4>
                                                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                                            <span>{new Date(sesion.fecha).toLocaleDateString('es-PE')}</span>
                                                                            <span>•</span>
                                                                            <Badge variant={getProgresoVariant(progreso.calificados, progreso.total)} className="text-xs">
                                                                                {getProgresoIcon(progreso.calificados, progreso.total)} {progreso.calificados}/{progreso.total}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleCalificarSesion(sesion.id)}
                                                                    >
                                                                        Calificar
                                                                    </Button>
                                                                </div>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
