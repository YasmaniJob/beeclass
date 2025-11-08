// src/presentation/examples/AsistenciaPageExample.tsx
'use client';

/**
 * EJEMPLO DE USO: Página completa usando la nueva arquitectura hexagonal
 *
 * Este archivo muestra cómo integrar completamente la nueva arquitectura
 * en una página real de la aplicación.
 */

import React from 'react';
import { AsistenciaFormHexagonal } from '../components/asistencia/AsistenciaFormHexagonal';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function AsistenciaPageExample() {
  const { allEstudiantes } = useMatriculaData();
  const { user } = useCurrentUser();

  // Configuración de Google Sheets desde environment
  const googleSheetsConfig = React.useMemo(() => {
    if (typeof window === 'undefined') return undefined;

    return process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID ? {
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID,
      credentials: JSON.parse(process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS || '{}')
    } : undefined;
  }, []);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Debe iniciar sesión para acceder al control de asistencias.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Información sobre la nueva arquitectura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Nueva Arquitectura Hexagonal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Esta página usa la nueva arquitectura con Domain Driven Design (DDD),
            Arquitectura Hexagonal y Zustand para state management.
          </div>
        </CardContent>
      </Card>

      {/* Componente principal con nueva arquitectura */}
      <AsistenciaFormHexagonal
        grado="1er Grado"
        seccion="A"
        googleSheetsConfig={googleSheetsConfig}
        currentUser={{ numeroDocumento: user.numeroDocumento }}
        estudiantes={allEstudiantes}
      />
    </div>
  );
}
