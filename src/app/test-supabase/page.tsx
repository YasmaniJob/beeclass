// src/app/test-supabase/page.tsx
'use client';

import { useSupabaseData, useEstudiantes, usePersonal, useAreasCurriculares } from '@/hooks/use-supabase-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Users, GraduationCap, BookOpen, CheckCircle2, XCircle } from 'lucide-react';

export default function TestSupabasePage() {
  const { isLoaded } = useSupabaseData();
  const { estudiantes, loading: loadingEstudiantes, refresh: refreshEstudiantes } = useEstudiantes();
  const { personal, loading: loadingPersonal, refresh: refreshPersonal } = usePersonal();
  const { areas, niveles, loading: loadingAreas, refresh: refreshAreas } = useAreasCurriculares();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧪 Prueba de Conexión Supabase</h1>
          <p className="text-muted-foreground mt-2">
            Verifica que los datos se están cargando correctamente desde Supabase
          </p>
        </div>
        <Badge variant={isLoaded ? "default" : "secondary"} className="text-sm">
          {isLoaded ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Conectado
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 mr-1" />
              Cargando...
            </>
          )}
        </Badge>
      </div>

      {/* Grid de Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card: Estudiantes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estudiantes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingEstudiantes ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{estudiantes.length}</div>
                <p className="text-xs text-muted-foreground">
                  estudiantes registrados
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={refreshEstudiantes}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card: Personal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Personal
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingPersonal ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{personal.length}</div>
                <p className="text-xs text-muted-foreground">
                  docentes y personal
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={refreshPersonal}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card: Áreas Curriculares */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Áreas Curriculares
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingAreas ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{areas.length}</div>
                <p className="text-xs text-muted-foreground">
                  áreas configuradas
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={refreshAreas}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de Estudiantes */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Lista de Estudiantes</CardTitle>
          <CardDescription>
            Primeros 10 estudiantes cargados desde Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingEstudiantes ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : estudiantes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay estudiantes registrados</p>
              <p className="text-sm mt-2">
                Ejecuta el script de migración para cargar datos
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {estudiantes.slice(0, 10).map((estudiante) => (
                <div
                  key={estudiante.numeroDocumento}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{estudiante.nombreCompleto}</p>
                    <p className="text-sm text-muted-foreground">
                      {estudiante.tipoDocumento}: {estudiante.numeroDocumento}
                    </p>
                  </div>
                  <div className="text-right">
                    {estudiante.grado && estudiante.seccion && (
                      <Badge variant="secondary">
                        {estudiante.grado} - {estudiante.seccion}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {estudiantes.length > 10 && (
                <p className="text-sm text-muted-foreground text-center pt-4">
                  ... y {estudiantes.length - 10} más
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Personal */}
      <Card>
        <CardHeader>
          <CardTitle>👨‍🏫 Lista de Personal</CardTitle>
          <CardDescription>
            Personal docente y administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPersonal ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : personal.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay personal registrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {personal.map((persona) => (
                <div
                  key={persona.numeroDocumento}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{persona.nombreCompleto}</p>
                    <p className="text-sm text-muted-foreground">
                      {persona.email || persona.numeroDocumento}
                    </p>
                  </div>
                  <Badge variant="outline">{persona.rol}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Niveles y Áreas */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Áreas Curriculares por Nivel</CardTitle>
          <CardDescription>
            Distribución de áreas por nivel educativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAreas ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : niveles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay niveles configurados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {niveles.map((nivel) => {
                const areasDelNivel = areas.filter(a => a.nivel === nivel.nombre);
                return (
                  <div key={nivel.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{nivel.nombre}</h3>
                      <Badge>{areasDelNivel.length} áreas</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {areasDelNivel.map((area) => (
                        <Badge key={area.id} variant="secondary">
                          {area.nombre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de Conexión */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">ℹ️ Información de Conexión</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado:</span>
            <span className="font-medium">
              {isLoaded ? '✅ Conectado' : '⏳ Cargando...'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fuente de datos:</span>
            <span className="font-medium">Supabase PostgreSQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Modo:</span>
            <span className="font-medium">Híbrido (Supabase + Sheets)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
