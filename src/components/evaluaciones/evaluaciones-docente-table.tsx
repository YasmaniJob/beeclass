
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CalificacionCompetencia, NotaCualitativa, NotaCualitativaEnum, Estudiante } from '@/lib/definitions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '../ui/button';
import { Save } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

interface EvaluacionesDocenteTableProps {
  calificaciones: CalificacionCompetencia[];
  onSave: (estudianteId: string, updated: Partial<Omit<CalificacionCompetencia, 'estudianteId' | 'docenteId'>>, docenteId: string) => void;
  estudiantes: Estudiante[];
}

type LocalCalificaciones = Record<string, Partial<Omit<CalificacionCompetencia, 'estudianteId' | 'docenteId'>>>;

const notaOptions = NotaCualitativaEnum.options;

export function EvaluacionesDocenteTable({ calificaciones, onSave, estudiantes }: EvaluacionesDocenteTableProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [localCalificaciones, setLocalCalificaciones] = useState<LocalCalificaciones>({});
  const [changedStudentIds, setChangedStudentIds] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (!user) return;
    const initialData: LocalCalificaciones = {};

    estudiantes.forEach(est => {
      const calif = calificaciones.find(c => c.estudianteId === est.numeroDocumento && c.docenteId === user.numeroDocumento);
      if (calif) {
        initialData[est.numeroDocumento] = {
          competencia1: calif.competencia1,
          competencia2: calif.competencia2,
        }
      }
    });
    setLocalCalificaciones(initialData);
    setChangedStudentIds(new Set());
  }, [calificaciones, user, estudiantes]);

  const handleNotaChange = useCallback((estudianteId: string, competencia: 'competencia1' | 'competencia2', nota: NotaCualitativa) => {
    if (!user) return;

    setLocalCalificaciones(prev => ({
        ...prev,
        [estudianteId]: {
            ...prev[estudianteId],
            [competencia]: nota,
        }
    }));
    setChangedStudentIds(prev => new Set(prev).add(estudianteId));
  }, [user]);


  const handleSaveChanges = () => {
    if (!user) return;
    changedStudentIds.forEach(studentId => {
        const califToSave = localCalificaciones[studentId];
        if (califToSave) {
            onSave(studentId, califToSave, user.numeroDocumento);
        }
    });
    setChangedStudentIds(new Set());
    toast({ title: 'Calificaciones guardadas', description: `Se han guardado los cambios para ${changedStudentIds.size} estudiante(s).` });
  }

  const CalificacionSelector = useCallback(({ estudianteId, competencia }: { estudianteId: string, competencia: 'competencia1' | 'competencia2' }) => {
    const value = localCalificaciones[estudianteId]?.[competencia] || '';

    return (
      <Select value={value} onValueChange={(nota: NotaCualitativa) => handleNotaChange(estudianteId, competencia, nota)}>
        <SelectTrigger className="w-24 font-bold">
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent>
          {notaOptions.map(nota => (
            <SelectItem key={nota} value={nota}>{nota}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }, [localCalificaciones, handleNotaChange]);


  if (!user) {
    return <p>Cargando...</p>
  }
  
  return (
    <>
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">N°</TableHead>
                <TableHead>Apellidos y Nombres</TableHead>
                <TableHead className="text-center min-w-[200px]">Gestiona su aprendizaje</TableHead>
                <TableHead className="text-center min-w-[200px]">Se desenvuelve en entornos virtuales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estudiantes.map((estudiante, index) => (
                <TableRow key={estudiante.numeroDocumento} className={changedStudentIds.has(estudiante.numeroDocumento) ? 'bg-blue-50 dark:bg-blue-900/30' : ''}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {`${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.nombres}`}
                  </TableCell>
                  <TableCell className="text-center">
                    <CalificacionSelector estudianteId={estudiante.numeroDocumento} competencia="competencia1" />
                  </TableCell>
                  <TableCell className="text-center">
                    <CalificacionSelector estudianteId={estudiante.numeroDocumento} competencia="competencia2" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    {changedStudentIds.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
            <Button size="lg" onClick={handleSaveChanges} className="shadow-lg">
                <Save className="mr-2 h-5 w-5" />
                Guardar Cambios
                <Badge variant="secondary" className="ml-2">{changedStudentIds.size}</Badge>
            </Button>
        </div>
    )}
    </>
  );
}
