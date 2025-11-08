
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/filtros/search-input';
import { CheckCircle2 } from 'lucide-react';
import { AsistenciaState, Action } from '@/hooks/use-asistencia';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useCurrentUser } from '@/hooks/use-current-user';

interface AsistenciaToolbarProps {
  state: AsistenciaState;
  dispatch: React.Dispatch<Action>;
  onMarkAllPresent: () => void;
  currentGrado: string;
  currentSeccion: string;
  baseUrl: string;
  isReadOnly?: boolean;
}

export function AsistenciaToolbar({
  state,
  dispatch,
  onMarkAllPresent,
  currentGrado,
  currentSeccion,
  baseUrl,
  isReadOnly = false,
}: AsistenciaToolbarProps) {
  const { searchTerm } = state;
  const { grados, seccionesPorGrado } = useMatriculaData();
  const router = useRouter();
  const { user } = useCurrentUser();
  
  const isTeacherView = user?.rol === 'Docente';
  
  const { gradosParaSelector, seccionesParaSelector } = useMemo(() => {
    // Vista para Admin, Director, Auxiliar, etc.
    if (!isTeacherView) {
      return { gradosParaSelector: grados, seccionesParaSelector: seccionesPorGrado };
    }
    
    // Vista para Docente
    const asignaciones = user?.asignaciones?.filter(a => !a.areaId) || [];
    const gradosAsignados = [...new Set(asignaciones.map(a => a.grado))].sort();
    
    const seccionesAsignadas: Record<string, string[]> = {};
    asignaciones.forEach(a => {
      if (!seccionesAsignadas[a.grado]) seccionesAsignadas[a.grado] = [];
      if (!seccionesAsignadas[a.grado].includes(a.seccion)) {
        seccionesAsignadas[a.grado].push(a.seccion);
      }
    });
    Object.values(seccionesAsignadas).forEach(s => s.sort());

    return { gradosParaSelector: gradosAsignados, seccionesParaSelector: seccionesAsignadas };
  }, [isTeacherView, user, grados, seccionesPorGrado]);


  const handleNavigation = (grado: string, seccion: string) => {
    if (grado && seccion) {
        router.push(`${baseUrl}/${encodeURIComponent(grado)}/${encodeURIComponent(seccion)}`);
    }
  }

  const handleGradoChange = (grado: string) => {
    const primeraSeccion = (seccionesParaSelector[grado] || [])[0];
    if (primeraSeccion) {
      handleNavigation(grado, primeraSeccion);
    }
  };

  const handleSeccionChange = (seccion: string) => {
    if (currentGrado) {
      handleNavigation(currentGrado, seccion);
    }
  };

  const seccionesOptions = currentGrado
    ? seccionesParaSelector[currentGrado] || []
    : [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex w-full flex-col sm:flex-row gap-4">
          {!isTeacherView ? (
            <>
              <Select onValueChange={handleGradoChange} value={currentGrado}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Selecciona un grado" />
                </SelectTrigger>
                <SelectContent>
                  {gradosParaSelector.map(grado => (
                    <SelectItem key={grado} value={grado}>
                      {grado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={handleSeccionChange}
                value={currentSeccion}
                disabled={!currentGrado}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Sección" />
                </SelectTrigger>
                <SelectContent>
                  {seccionesOptions.map(seccion => (
                    <SelectItem key={seccion} value={seccion}>
                      {seccion.replace('Sección ', '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
             <Select onValueChange={(value) => { const [g, s] = value.split('|'); handleNavigation(g, s); }} value={`${currentGrado}|${currentSeccion}`}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Selecciona una clase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Mis Asignaciones</SelectLabel>
                    {gradosParaSelector.flatMap(grado => 
                       (seccionesParaSelector[grado] || []).map(seccion => (
                         <SelectItem key={`${grado}-${seccion}`} value={`${grado}|${seccion}`}>
                          {grado} - {seccion.replace('Sección ', '')}
                        </SelectItem>
                       ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
          )}

          <div className="w-full flex-grow">
            <SearchInput
              searchTerm={searchTerm}
              onSearchTermChange={term =>
                dispatch({ type: 'SET_SEARCH_TERM', payload: term })
              }
              placeholder="Buscar por nombre, apellidos o n° doc..."
            />
          </div>
          {!isReadOnly && (
            <Button onClick={onMarkAllPresent} className="w-full sm:w-auto">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Marcar todo Presente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
