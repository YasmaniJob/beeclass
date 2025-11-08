
'use client';

import { useMemo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { useAsistencia } from '@/hooks/use-asistencia';
import { AsistenciaStats } from '@/components/asistencia/asistencia-stats';
import { AsistenciaPersonalTable } from '@/components/asistencia-personal/asistencia-personal-table';
import { SearchInput } from '@/components/filtros/search-input';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Subject } from '@/hooks/use-asistencia';
import { Docente } from '@/domain/entities/Docente';

export default function AsistenciaPersonalPage() {
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const {
    state,
    dispatch,
    subjects,
    isLoading,
    isSaving,
    handleHorasChange,
    saveToGoogleSheets,
  } = useAsistencia('personal');

  const personal = useMemo(() => {
    return subjects.filter((subject): subject is Docente => subject instanceof Docente || 'rol' in subject);
  }, [subjects]);
  const { asistencia, initialAsistencia, currentDate, statusFilter, searchTerm } =
    state;
  const [isClient, setIsClient] = useState(false);
  const isReadOnly = user?.rol === 'Sub-director';

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSave = async () => {
    const success = await saveToGoogleSheets();
    if (!success) {
      // El error ya se muestra en el hook
      return;
    }
  };

  const personalFiltrado = useMemo(() => {
    if (isLoading || !isClient) return [];
    return personal.filter((p) => {
      if (!('numeroDocumento' in p)) return false;
      const record = asistencia[p.numeroDocumento];
      if (!record) return false;
      const statusMatch =
        statusFilter === 'todos' || record.status === statusFilter;
      const searchTermLower = searchTerm.toLowerCase();
      const fullName = p.nombreCompleto.toLowerCase();
      const searchMatch =
        fullName.includes(searchTermLower) ||
        p.numeroDocumento.toLowerCase().includes(searchTermLower);
      return statusMatch && searchMatch;
    });
  }, [statusFilter, searchTerm, asistencia, personal, isLoading, isClient]);

  const changedCount = useMemo(() => {
    if (isLoading || !isClient) return 0;
    return Object.keys(asistencia).reduce((acc, doc) => {
      if (asistencia[doc]?.status !== initialAsistencia[doc]?.status) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }, [asistencia, initialAsistencia, isLoading, isClient]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Asistencia de Personal
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

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm p-4">
          <SearchInput
            searchTerm={searchTerm}
            onSearchTermChange={term =>
              dispatch({ type: 'SET_SEARCH_TERM', payload: term })
            }
            placeholder="Buscar por nombre, apellidos o n° doc..."
          />
      </div>

      {isLoading || !isClient ? (
        <div className="space-y-6">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <>
          <AsistenciaStats
            asistencia={asistencia}
            totalSubjects={personal.length}
            incidentesCount={0} // No se muestran incidentes para personal aquí
            statusFilter={statusFilter}
            onFilterChange={status =>
              dispatch({ type: 'SET_FILTER', payload: status })
            }
            isPersonal={true}
          />

          <AsistenciaPersonalTable
            personal={personalFiltrado}
            asistencia={asistencia}
            onStatusChange={(numeroDocumento, status) =>
              dispatch({
                type: 'SET_ASISTENCIA_STATUS',
                payload: { numeroDocumento, status },
              })
            }
            onHorasChange={handleHorasChange}
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
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            <Badge variant="secondary" className="ml-2">
              {changedCount}
            </Badge>
          </Button>
        </div>
      )}
    </div>
  );
}
