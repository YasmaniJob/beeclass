
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/filtros/search-input';
import { CheckCircle2 } from 'lucide-react';
import { AsistenciaAulaState, Action } from '@/hooks/use-asistencia-aula';
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

interface AsistenciaAulaToolbarProps {
  state: AsistenciaAulaState;
  dispatch: React.Dispatch<Action>;
  onMarkAllPresent: () => void;
  currentGrado: string;
  currentSeccion: string;
}

export function AsistenciaAulaToolbar({
  state,
  dispatch,
  onMarkAllPresent,
  currentGrado,
  currentSeccion,
}: AsistenciaAulaToolbarProps) {
  const { searchTerm } = state;
  const { grados, seccionesPorGrado } = useMatriculaData();
  const router = useRouter();

  const [selectedGrado, setSelectedGrado] = useState(currentGrado);
  const [selectedSeccion, setSelectedSeccion] = useState(currentSeccion);

  useEffect(() => {
    setSelectedGrado(currentGrado);
    setSelectedSeccion(currentSeccion);
  }, [currentGrado, currentSeccion]);

  const handleGradoChange = (grado: string) => {
    setSelectedGrado(grado);
    // Reset section when grade changes
    const primeraSeccion = (seccionesPorGrado[grado] || [])[0];
    if (primeraSeccion) {
      setSelectedSeccion(primeraSeccion);
      router.push(
        `/asistencia/aula/${encodeURIComponent(grado)}/${encodeURIComponent(
          primeraSeccion
        )}`
      );
    }
  };

  const handleSeccionChange = (seccion: string) => {
    setSelectedSeccion(seccion);
    if (selectedGrado) {
      router.push(
        `/asistencia/aula/${encodeURIComponent(selectedGrado)}/${encodeURIComponent(
          seccion
        )}`
      );
    }
  };

  const seccionesOptions = selectedGrado
    ? seccionesPorGrado[selectedGrado] || []
    : [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex w-full flex-col sm:flex-row gap-4">
          <Select onValueChange={handleGradoChange} value={selectedGrado}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
          <Select
            onValueChange={handleSeccionChange}
            value={selectedSeccion}
            disabled={!selectedGrado}
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
           <div className="w-full flex-grow">
              <SearchInput
                searchTerm={searchTerm}
                onSearchTermChange={term =>
                  dispatch({ type: 'SET_SEARCH_TERM', payload: term })
                }
                placeholder="Buscar por nombre, apellidos o n° doc..."
              />
            </div>
            <Button onClick={onMarkAllPresent} className="w-full sm:w-auto">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Marcar todo Presente
            </Button>
        </div>
      </div>
    </div>
  );
}
