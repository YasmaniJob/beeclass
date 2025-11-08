
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaCurricular } from "@/lib/definitions";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { AreaFormDialog } from "@/components/curricular/area-form-dialog";
import { useToast } from "@/hooks/use-toast";
import { PlaceholderContent } from "@/components/ui/placeholder-content";
import { LibraryBig } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreasTable } from "@/components/curricular/areas-table";
import { AreaDetailSheet } from "@/components/curricular/area-detail-sheet";
import { useAreasCurriculares } from "@/hooks/use-supabase-data";
import { Badge } from "@/components/ui/badge";
import { useAppConfig } from "@/hooks/use-app-config";

export default function AreasCurricularesPage() {
    const { areas, niveles, loading, refresh } = useAreasCurriculares();
    const { toast } = useToast();
    const { nivelInstitucion } = useAppConfig();
    const [nivelSeleccionado, setNivelSeleccionado] = useState<string>('');
    const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<AreaCurricular | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Inicializar con el nivel de la institución o el primero disponible
    useEffect(() => {
        if (niveles.length > 0 && !nivelSeleccionado) {
            // Buscar el nivel configurado en la institución
            const nivelConfig = niveles.find(n => n.nombre === nivelInstitucion);
            const nivelInicial = nivelConfig ? nivelConfig.id : niveles[0].id;
            
            setNivelSeleccionado(nivelInicial);
            
            // Cargar áreas con competencias del nivel seleccionado
            refresh(nivelInicial);
        }
    }, [niveles, nivelInstitucion, nivelSeleccionado, refresh]);

    const handleManageArea = (area: AreaCurricular) => {
        // Las competencias ya están cargadas, solo abrir el sheet
        setSelectedArea(area);
        setIsSheetOpen(true);
    };
    
    const handleSheetOpenChange = (open: boolean) => {
        setIsSheetOpen(open);
        if (!open) {
            setSelectedArea(null);
        }
    }

    // Calcular áreas del nivel seleccionado
    const areasDelNivelActual = nivelSeleccionado ? (() => {
        const nivel = niveles.find(n => n.id === nivelSeleccionado);
        if (!nivel) return [];
        return areas.filter(a => {
            const areaNivel = (a.nivel || '').trim().toLowerCase();
            const nivelNombre = (nivel.nombre || '').trim().toLowerCase();
            return areaNivel === nivelNombre;
        });
    })() : [];

    const renderContentForNivel = (nivelId: string) => {
        const nivel = niveles.find(n => n.id === nivelId);
        if (!nivel) return null;

        // Filtrar áreas por nivel
        const areasDelNivel = areas.filter(a => {
            // Comparación case-insensitive y trimmed
            const areaNivel = (a.nivel || '').trim().toLowerCase();
            const nivelNombre = (nivel.nombre || '').trim().toLowerCase();
            return areaNivel === nivelNombre;
        });

        console.log('🔍 Filtrado de áreas:', {
            nivelId,
            nivelNombre: nivel.nombre,
            todasLasAreas: areas.length,
            areasDelNivel: areasDelNivel.length,
            areas: areas.map(a => ({ nombre: a.nombre, nivel: a.nivel })),
        });

        return (
            <div className="space-y-4 pt-4">
                {areasDelNivel.length > 0 ? (
                    <Card>
                        <CardContent className="p-0">
                            <AreasTable areas={areasDelNivel} onManage={handleManageArea} />
                        </CardContent>
                    </Card>
                ) : (
                    <PlaceholderContent
                        icon={LibraryBig}
                        title="No hay áreas definidas"
                        description="Añade tu primera área curricular para este nivel para empezar a construir la estructura."
                        className="py-10"
                    />
                )}

            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Áreas Curriculares
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Define los niveles, áreas y competencias que se enseñan en la institución. Selecciona un nivel para gestionar las áreas asociadas.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refresh(nivelSeleccionado)}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setIsAreaDialogOpen(true)}
                        disabled={loading || niveles.length === 0}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Área
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle>Áreas Curriculares</CardTitle>
                        {nivelSeleccionado && niveles.find(n => n.id === nivelSeleccionado) && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Nivel: <Badge variant="secondary">{niveles.find(n => n.id === nivelSeleccionado)?.nombre}</Badge>
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                        <span className="text-2xl font-bold text-primary">{areasDelNivelActual.length}</span>
                        <span className="text-sm font-medium text-muted-foreground">áreas</span>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ) : !nivelSeleccionado ? (
                        <PlaceholderContent
                            icon={LibraryBig}
                            title="Configura el nivel educativo"
                            description="Ve a Ajustes → Personalización para configurar el nivel educativo de tu institución."
                            className="py-10"
                        />
                    ) : (
                        renderContentForNivel(nivelSeleccionado)
                    )}
                </CardContent>
            </Card>

            {selectedArea && (
                <AreaDetailSheet 
                    area={selectedArea}
                    isOpen={isSheetOpen}
                    onOpenChange={handleSheetOpenChange}
                    onDeleteArea={() => {}}
                    onAddCompetencia={() => {}}
                    onUpdateCompetencia={() => {}}
                    onDeleteCompetencia={() => {}}
                />
            )}

            <AreaFormDialog
                open={isAreaDialogOpen}
                onOpenChange={setIsAreaDialogOpen}
                onSuccess={() => refresh(nivelSeleccionado)}
                nivel={niveles.find(n => n.id === nivelSeleccionado)?.nombre}
            />
        </div>
    );
}
