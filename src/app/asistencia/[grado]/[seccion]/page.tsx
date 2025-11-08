
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AsistenciaToolbar } from '@/components/asistencia/asistencia-toolbar';
import { useAsistencia } from '@/hooks/use-asistencia';
import { AsistenciaStats } from '@/components/asistencia/asistencia-stats';
import { AsistenciaTable } from '@/components/asistencia/asistencia-table';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { startOfDay } from 'date-fns';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Subject } from '@/hooks/use-asistencia';
import { Estudiante } from '@/domain/entities/Estudiante';

export default function AsistenciaPage() {
  const params = useParams<{ grado: string; seccion: string }>();
  const pathname = usePathname();
  const { user } = useCurrentUser();

  const grado = decodeURIComponent(params.grado);
  const seccion = decodeURIComponent(params.seccion);
  
  const isAulaView = pathname.includes('/asistencia/aula');
  const baseUrl = isAulaView ? '/asistencia/aula' : '/asistencia';
  const pageTitle = isAulaView ? 'Asistencia de Aula' : 'Asistencia';
  // En la vista normal (no de aula), los roles de Director y Sub-director son de solo lectura.
  // En la vista de aula, el docente siempre puede editar.
  const isReadOnly = !isAulaView && (user?.rol === 'Director' || user?.rol === 'Sub-director');


  const { toast } = useToast();
  const {
    state,
    dispatch,
    markAllAsPresent,
    subjects,
    permisos,
    incidentes,
    isLoading,
    isSaving,
    saveToGoogleSheets,
  } = useAsistencia('estudiantes', grado, seccion);

  const estudiantes = useMemo(() => subjects.filter((subject): subject is Estudiante => subject instanceof Estudiante), [subjects]);
  const { asistencia, initialAsistencia, currentDate, statusFilter, searchTerm } =
    state;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSave = async () => {
    const success = await saveToGoogleSheets();
    if (success) {
      toast({
        title: 'Guardado con éxito',
        description: 'El registro de asistencia ha sido guardado en Google Sheets.',
      });
    }
  };

  const estudiantesFiltrados = useMemo(() => {
    if (isLoading || !isClient) return [];
    return estudiantes.filter(estudiante => {
      const record = asistencia[estudiante.numeroDocumento];
      if (!record) return false;
      const statusMatch =
        statusFilter === 'todos' || record.status === statusFilter;
      const searchTermLower = searchTerm.toLowerCase();
      const fullName = estudiante.nombreCompleto.toLowerCase();
      const searchMatch =
        fullName.includes(searchTermLower) ||
        estudiante.numeroDocumento.toLowerCase().includes(searchTermLower);
      return statusMatch && searchMatch;
    });
  }, [statusFilter, searchTerm, asistencia, estudiantes, isLoading, isClient]);

  const changedCount = useMemo(() => {
    if (isLoading || !isClient) return 0;
    return Object.keys(asistencia).reduce((acc, doc) => {
      if (asistencia[doc]?.status !== initialAsistencia[doc]?.status) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }, [asistencia, initialAsistencia, isLoading, isClient]);
  
  const incidentesDelDia = useMemo(() => {
    if (!currentDate) return [];
    const hoy = startOfDay(currentDate);
    return incidentes.filter(incidente => 
      incidente.sujeto instanceof Estudiante &&
      startOfDay(new Date(incidente.fecha)).getTime() === hoy.getTime() && 
      estudiantes.some(e => e.numeroDocumento === incidente.sujeto.numeroDocumento)
    );
  }, [incidentes, currentDate, estudiantes]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            {pageTitle}
          </h1>
          <div className="text-muted-foreground mt-1">
            {isClient && currentDate ? (
              <>
                Mostrando asistencia para el día{' '}
                <span className="font-semibold text-foreground">
                  {format(currentDate, 'PPPP', { locale: es })}
                </span>
                .
              </>
            ) : (
              <Skeleton className="h-5 w-80" />
            )}
          </div>
        </div>
        <DatePicker 
            date={currentDate} 
            onDateChange={(date) => dispatch({ type: 'SET_DATE', payload: date })} 
        />
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <AsistenciaToolbar
          state={state}
          dispatch={dispatch}
          onMarkAllPresent={markAllAsPresent}
          currentGrado={grado}
          currentSeccion={seccion}
          baseUrl={baseUrl}
          isReadOnly={isReadOnly}
        />
      </div>

      {isLoading || !isClient ? (
        <div className="space-y-6">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <>
          <AsistenciaStats
            asistencia={asistencia}
            totalSubjects={estudiantes.length}
            incidentesCount={incidentesDelDia.length}
            statusFilter={statusFilter}
            onFilterChange={status =>
              dispatch({ type: 'SET_FILTER', payload: status })
            }
          />

          <AsistenciaTable
            estudiantes={estudiantesFiltrados}
            asistencia={asistencia}
            permisos={permisos}
            incidentes={incidentes}
            onStatusChange={(numeroDocumento, status) =>
              dispatch({
                type: 'SET_ASISTENCIA_STATUS',
                payload: { numeroDocumento, status },
              })
            }
            isReadOnly={isReadOnly}
          />
        </>
      )}

      {!isReadOnly && changedCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
          <Button 
            size="lg" 
            onClick={handleSave} 
            className="shadow-lg"
            disabled={isSaving}
          >
            <Save className={`mr-2 h-5 w-5 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            {!isSaving && (
              <Badge variant="secondary" className="ml-2">
                {changedCount}
              </Badge>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
