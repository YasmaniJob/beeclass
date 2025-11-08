

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Plus,
  X,
  RefreshCw,
} from 'lucide-react';
import { useSupabaseData } from '@/hooks/use-supabase-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeccionesTable } from '@/components/estudiantes/secciones-table';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useAppConfig } from '@/hooks/use-app-config';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { Estudiante } from '@/domain/entities/Estudiante';
import { toEstudianteEntity, estudianteToInput } from '@/domain/mappers/entity-builders';

export default function EstudiantesPage() {
  // Usar Supabase en lugar de datos en memoria
  const {
    estudiantes,
    loading,
    refreshEstudiantes,
  } = useSupabaseData();

  const {
    grados,
    seccionesPorGrado,
    estudiantesPorSeccion,
    setGrados,
    setSecciones,
    loadData,
  } = useMatriculaData();

  const estudiantesPorSeccionMap = useMemo(() => {
    const flattened: Record<string, Estudiante[]> = {};
    Object.entries(estudiantesPorSeccion).forEach(([gradoKey, secciones]) => {
      Object.entries(secciones).forEach(([seccionKey, lista]) => {
        flattened[`${gradoKey}-${seccionKey}`] = lista;
      });
    });
    return flattened;
  }, [estudiantesPorSeccion]);

  const { toast } = useToast();
  const { nivelInstitucion } = useAppConfig();

  // Función para agregar nuevo grado de manera correlacional
  const handleAddGrado = async () => {
    // Definir grados según el nivel educativo
    let todosLosGrados: string[] = [];
    
    if (nivelInstitucion === 'Inicial') {
      todosLosGrados = ['3 Años', '4 Años', '5 Años'];
    } else if (nivelInstitucion === 'Primaria') {
      todosLosGrados = ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'];
    } else if (nivelInstitucion === 'Secundaria') {
      todosLosGrados = ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado'];
    }

    // Encontrar el siguiente grado que no existe
    const siguienteGrado = todosLosGrados.find(g => !grados.includes(g));

    if (siguienteGrado) {
      const result = await setGrados([...grados, siguienteGrado]);
      if (!result) {
        toast({
          title: 'Error',
          description: 'No se pudo crear el grado en la base de datos.',
          variant: 'destructive',
        });
        return;
      }

      const nuevasSecciones = {
        ...seccionesPorGrado,
        [siguienteGrado]: ['A'],
      };
      const seccionesResult = await setSecciones(nuevasSecciones);
      if (!seccionesResult) {
        toast({
          title: 'Error',
          description: 'No se pudo crear la sección inicial del grado.',
          variant: 'destructive',
        });
        return;
      }

      loadData();
      await refreshEstudiantes();
      
      toast({
        title: 'Grado creado',
        description: `Se ha creado el grado: ${siguienteGrado}`,
      });
    } else {
      toast({
        title: 'No hay más grados',
        description: `Ya se han creado todos los grados de ${nivelInstitucion}`,
        variant: 'destructive',
      });
    }
  };

  // Función para eliminar un grado
  const handleDeleteGrado = async (grado: string) => {
    // Obtener todos los estudiantes del grado
    const estudiantesDelGrado = estudiantes.filter(e => e.grado === grado);
    
    // Verificar si hay estudiantes reales
    if (estudiantesDelGrado.length > 0) {
      toast({
        title: 'No se puede eliminar',
        description: `El grado ${grado} tiene ${estudiantesDelGrado.length} estudiante(s). Elimina o traslada los estudiantes primero.`,
        variant: 'destructive',
      });
      return;
    }

    const nuevosGrados = grados.filter(g => g !== grado);
    const result = await setGrados(nuevosGrados);
    if (!result) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el grado en la base de datos.',
        variant: 'destructive',
      });
      return;
    }

    const nuevasSecciones = { ...seccionesPorGrado };
    delete nuevasSecciones[grado];
    await setSecciones(nuevasSecciones);

    loadData();
    await refreshEstudiantes();
    
    toast({
      title: 'Grado eliminado',
      description: `Se ha eliminado el grado: ${grado}`,
    });
  };

  // Función para agregar nueva sección de manera correlacional
  const handleAddSeccion = async (grado: string) => {
    const seccionesActuales = seccionesPorGrado[grado] || [];
    const todasLasSecciones = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    console.log('🔍 Creando sección:', { grado, seccionesActuales, seccionesPorGrado });

    // Encontrar la siguiente sección que no existe
    const siguienteSeccion = todasLasSecciones.find(s => !seccionesActuales.includes(s));

    console.log('📝 Siguiente sección:', siguienteSeccion);

    if (siguienteSeccion) {
      const nuevasSecciones = {
        ...seccionesPorGrado,
        [grado]: [...seccionesActuales, siguienteSeccion],
      };

      const result = await setSecciones(nuevasSecciones);
      if (!result) {
        toast({
          title: 'Error',
          description: 'No se pudo crear la sección en la base de datos.',
          variant: 'destructive',
        });
        return;
      }

      await loadData();
      await refreshEstudiantes();
      
      toast({
        title: 'Sección creada',
        description: `Se ha creado la sección ${siguienteSeccion} en ${grado}`,
      });
    } else {
      toast({
        title: 'No hay más secciones',
        description: 'Ya se han creado todas las secciones disponibles (A-J)',
        variant: 'destructive',
      });
    }
  };

  // Función para eliminar una sección
  const handleDeleteSeccion = async (grado: string, seccion: string) => {
    // Verificar si hay estudiantes en la sección
    const key = `${grado}-${seccion}`;
    const estudiantesEnSeccion = estudiantesPorSeccionMap[key] || [];
    
    if (estudiantesEnSeccion.length > 0) {
      toast({
        title: 'No se puede eliminar',
        description: `La sección ${seccion} tiene ${estudiantesEnSeccion.length} estudiante(s). Elimina o traslada los estudiantes primero.`,
        variant: 'destructive',
      });
      return;
    }

    const nuevasSecciones = {
      ...seccionesPorGrado,
      [grado]: (seccionesPorGrado[grado] || []).filter(s => s !== seccion),
    };

    const result = await setSecciones(nuevasSecciones);
    if (!result) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la sección en la base de datos.',
        variant: 'destructive',
      });
      return;
    }

    await loadData();
    await refreshEstudiantes();
    
    toast({
      title: 'Sección eliminada',
      description: `Se ha eliminado la sección ${seccion} de ${grado}`,
    });
  };

  const { user } = useCurrentUser();
  const isAdmin = user?.rol === 'Admin';
  const { isMobile, isMounted } = useIsMobile();

  const [activeTab, setActiveTab] = useState(grados[0] || '');

  // Update active tab if grados list changes
  useEffect(() => {
    if (grados.length > 0 && !grados.includes(activeTab)) {
      setActiveTab(grados[0]);
    } else if (grados.length === 0) {
      setActiveTab('');
    }
  }, [grados, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const renderContent = (grado: string) => (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Secciones de {grado}</CardTitle>
        {isAdmin && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSeccion(grado)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Sección
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Crea la siguiente sección (A, B, C...)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent>
        <SeccionesTable
            grado={grado}
            secciones={seccionesPorGrado[grado] || []}
            estudiantesPorSeccion={estudiantesPorSeccion}
            onDeleteSeccion={(seccion) => handleDeleteSeccion(grado, seccion)}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Gestión de Estudiantes
          </h1>
          <p className="text-muted-foreground mt-1">
            Organiza los grados, secciones y gestiona los estudiantes de la institución.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={loading.estudiantes ? "secondary" : "default"}>
            {estudiantes.length} estudiantes
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshEstudiantes}
            disabled={loading.estudiantes}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading.estudiantes ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {!isMounted ? (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
      ) : loading.estudiantes ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : grados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No hay estudiantes registrados aún.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Los estudiantes se cargan desde Supabase.
            </p>
            {isAdmin && (
              <Button className="mt-6" onClick={handleAddGrado}>
                Crear primer grado
              </Button>
            )}
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-4">
          <Select onValueChange={handleTabChange} value={activeTab}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un grado" />
            </SelectTrigger>
            <SelectContent>
              {grados.map(grado => (
                <SelectItem key={grado} value={grado}>
                  {grado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeTab && renderContent(activeTab)}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between border-b">
            <TabsList>
              {grados.map(grado => (
                <TabsTrigger key={grado} value={grado}>
                  {grado}
                </TabsTrigger>
              ))}
            </TabsList>
            {isAdmin && (
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddGrado}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Agregar siguiente grado</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {activeTab && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGrado(activeTab)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar grado actual</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
          {grados.map(grado => (
            <TabsContent key={grado} value={grado} className="pt-4">
              {renderContent(grado)}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
    
