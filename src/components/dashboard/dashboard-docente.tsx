'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CalendarDays, 
  Clock, 
  BookOpen, 
  Users, 
  GraduationCap,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORAS_DIA = ['1', '2', '3', '4', '5', '6', '7', '8'];

interface ClaseDelDia {
  hora: string;
  grado: string;
  seccion: string;
  area?: string;
  horaInicio?: string;
  horaFin?: string;
}

export function DashboardDocente() {
  const { user } = useCurrentUser();
  const { areas } = useMatriculaData();
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(format(now, 'PPPP', { locale: es }));
    const dayIndex = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    // Convertir a índice de DIAS_SEMANA (0 = Lunes)
    const weekDayIndex = dayIndex === 0 ? -1 : dayIndex - 1;
    setCurrentDay(weekDayIndex >= 0 && weekDayIndex < 5 ? DIAS_SEMANA[weekDayIndex] : '');
    setIsMounted(true);
  }, []);

  // Obtener clases del día actual
  const clasesDelDia = useMemo<ClaseDelDia[]>(() => {
    if (!user?.horario || !currentDay) return [];

    const clases: ClaseDelDia[] = [];
    const horario = user.horario;

    HORAS_DIA.forEach(hora => {
      const key = `${currentDay}-${hora}`;
      const asignacionId = horario[key];
      
      if (asignacionId) {
        // Buscar la asignación correspondiente
        const asignacion = user.asignaciones?.find(a => a.id === asignacionId);
        if (asignacion) {
          // Buscar el área si existe
          const area = asignacion.areaId 
            ? areas.find(a => a.id === asignacion.areaId)
            : null;

          clases.push({
            hora,
            grado: asignacion.grado,
            seccion: asignacion.seccion,
            area: area?.nombre,
            horaInicio: getHoraInicio(hora),
            horaFin: getHoraFin(hora),
          });
        }
      }
    });

    return clases;
  }, [user, currentDay, areas]);

  // Estadísticas del docente
  const stats = useMemo(() => {
    const totalSecciones = new Set(
      user?.asignaciones?.map(a => `${a.grado}-${a.seccion}`) || []
    ).size;

    const totalAreas = new Set(
      user?.asignaciones?.filter(a => a.areaId).map(a => a.areaId) || []
    ).size;

    const esTutor = user?.asignaciones?.some(a => a.rol === 'Docente y Tutor') || false;

    return {
      clasesHoy: clasesDelDia.length,
      totalSecciones,
      totalAreas,
      esTutor,
    };
  }, [user, clasesDelDia]);

  const nombreDocente = user ? `${user.nombres} ${user.apellidoPaterno}` : '';
  const primerNombre = user?.nombres?.split(' ')[0] || '';

  if (!isMounted) {
    return <DashboardDocenteSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header con saludo personalizado */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            ¡Hola, {primerNombre}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentDay ? (
              <>
                Hoy tienes <span className="font-semibold text-foreground">{stats.clasesHoy} {stats.clasesHoy === 1 ? 'clase' : 'clases'}</span> programadas
              </>
            ) : (
              'Disfruta tu fin de semana'
            )}
          </p>
        </div>
        {currentDate && (
          <Badge variant="outline" className="text-base flex items-center gap-2 h-10 px-4 border-primary text-primary bg-primary/10">
            <CalendarDays className="h-4 w-4" />
            <span>{currentDate}</span>
          </Badge>
        )}
      </div>

      {/* Cards de estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clases Hoy</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clasesHoy}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentDay || 'Fin de semana'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secciones</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSecciones}</div>
            <p className="text-xs text-muted-foreground mt-1">
              A tu cargo
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Áreas</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAreas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Que enseñas
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-l-4",
          stats.esTutor ? "border-l-amber-500" : "border-l-gray-300"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rol</CardTitle>
            <Award className={cn(
              "h-4 w-4",
              stats.esTutor ? "text-amber-500" : "text-gray-400"
            )} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.esTutor ? 'Tutor' : 'Docente'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.esTutor ? 'Con tutoría' : 'Sin tutoría'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Horario del día */}
      {currentDay && clasesDelDia.length > 0 && (
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Tu horario de hoy</CardTitle>
            </div>
            <CardDescription>
              {currentDay}, {format(new Date(), 'd \'de\' MMMM', { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clasesDelDia.map((clase, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-lg p-3 min-w-[80px]">
                    <Clock className="h-4 w-4 mb-1" />
                    <span className="text-sm font-bold">Hora {clase.hora}</span>
                    {clase.horaInicio && (
                      <span className="text-xs text-muted-foreground">
                        {clase.horaInicio}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {clase.grado} - {clase.seccion}
                      </span>
                    </div>
                    {clase.area && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {clase.area}
                        </span>
                      </div>
                    )}
                  </div>

                  <Badge variant="outline" className="hidden sm:flex">
                    {clase.horaInicio} - {clase.horaFin}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay clases */}
      {currentDay && clasesDelDia.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes clases programadas hoy</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Aprovecha este tiempo para planificar tus próximas sesiones o revisar el progreso de tus estudiantes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Mensaje de fin de semana */}
      {!currentDay && (
        <Card className="border-dashed bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">¡Disfruta tu fin de semana!</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Descansa y recarga energías para la próxima semana.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DashboardDocenteSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

// Funciones auxiliares para obtener horarios
function getHoraInicio(hora: string): string {
  const horarios: Record<string, string> = {
    '1': '08:00',
    '2': '08:45',
    '3': '09:30',
    '4': '10:30',
    '5': '11:15',
    '6': '12:00',
    '7': '14:00',
    '8': '14:45',
  };
  return horarios[hora] || '';
}

function getHoraFin(hora: string): string {
  const horarios: Record<string, string> = {
    '1': '08:45',
    '2': '09:30',
    '3': '10:15',
    '4': '11:15',
    '5': '12:00',
    '6': '12:45',
    '7': '14:45',
    '8': '15:30',
  };
  return horarios[hora] || '';
}
