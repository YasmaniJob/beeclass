
'use client';

import { useMemo, useState } from 'react';
import { Calificacion, Estudiante, NotaCualitativa, Competencia } from '@/lib/definitions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { CalificacionDetailSheet } from './calificacion-detail-sheet';
import { NotaBadge } from '../shared/nota-badge';
import { PlaceholderContent } from '../ui/placeholder-content';
import { CheckCheck } from 'lucide-react';


export interface EstudianteConPromedios extends Estudiante {
    promediosPorCompetencia: Record<string, NotaCualitativa | '-'>;
}

interface EvaluacionesTutorTableProps {
  estudiantes: Estudiante[];
  competencias: Competencia[];
  calificaciones: Calificacion[];
}

const notaValues: Record<NotaCualitativa, number> = { 'AD': 4, 'A': 3, 'B': 2, 'C': 1 };
const valueToNota: Record<number, NotaCualitativa> = { 4: 'AD', 3: 'A', 2: 'B', 1: 'C' };

const getNotaPromedio = (notas: (NotaCualitativa | undefined | null)[]): NotaCualitativa | '-' => {
    const validNotas = notas.filter((n): n is NotaCualitativa => !!n);
    if (validNotas.length === 0) return '-';
    const sum = validNotas.reduce((acc, nota) => acc + notaValues[nota], 0);
    const avgValue = Math.round(sum / validNotas.length);
    return valueToNota[avgValue] || '-';
};

export function EvaluacionesTutorTable({ 
    estudiantes,
    competencias, 
    calificaciones,
}: EvaluacionesTutorTableProps) {
    
    const [sheetState, setSheetState] = useState<{
        isOpen: boolean;
        estudiante: Estudiante | null;
        calificaciones: Calificacion[];
    }>({ isOpen: false, estudiante: null, calificaciones: [] });

    const calificacionesPorEstudianteYCompetencia = useMemo(() => {
        const map = new Map<string, Map<string, Calificacion[]>>();
        calificaciones.forEach(c => {
            if (!map.has(c.estudianteId)) {
                map.set(c.estudianteId, new Map());
            }
            const compMap = map.get(c.estudianteId)!;
            if (!compMap.has(c.competenciaId)) {
                compMap.set(c.competenciaId, []);
            }
            compMap.get(c.competenciaId)!.push(c);
        });
        return map;
    }, [calificaciones]);


    const estudiantesConPromedios: EstudianteConPromedios[] = useMemo(() => {
        return estudiantes.map(estudiante => {
            const califsEstudiante = calificacionesPorEstudianteYCompetencia.get(estudiante.numeroDocumento);
            const promediosPorCompetencia: Record<string, NotaCualitativa | '-'> = {};

            competencias.forEach(comp => {
                const notasDeCompetencia = califsEstudiante?.get(comp.id)?.map(c => c.nota) || [];
                promediosPorCompetencia[comp.id] = getNotaPromedio(notasDeCompetencia);
            });

            return { ...estudiante, promediosPorCompetencia };
        });
    }, [estudiantes, competencias, calificacionesPorEstudianteYCompetencia]);

    const handleNotaClick = (estudiante: Estudiante) => {
        const califsEstudiante = calificaciones.filter(c => c.estudianteId === estudiante.numeroDocumento && competencias.some(comp => comp.id === c.competenciaId));
        
        setSheetState({
            isOpen: true,
            estudiante: estudiante,
            calificaciones: califsEstudiante,
        });
    }
    
    if (competencias.length === 0) {
        return <PlaceholderContent icon={CheckCheck} title="Sin competencias transversales" description="No se han configurado competencias transversales para este nivel educativo." className="my-8" />
    }

  return (
    <>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] sticky left-0 bg-card z-10">N°</TableHead>
                    <TableHead className="sticky left-12 bg-card z-10 min-w-[250px]">Apellidos y Nombres</TableHead>
                    {competencias.map((comp, index) => (
                        <TableHead key={comp.id} className="text-center font-bold min-w-[200px]">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Competencia {index + 1}</span>
                                <span className="text-sm font-normal leading-tight">{comp.nombre}</span>
                            </div>
                        </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estudiantesConPromedios.map((estudiante, index) => (
                    <TableRow key={estudiante.numeroDocumento}>
                      <TableCell className="sticky left-0 bg-card z-10">{index + 1}</TableCell>
                      <TableCell className="font-medium sticky left-12 bg-card z-10">
                          {`${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.nombres}`}
                      </TableCell>
                      {competencias.map(comp => (
                          <TableCell key={comp.id} className="text-center">
                              <NotaBadge 
                                nota={estudiante.promediosPorCompetencia[comp.id]} 
                                onClick={() => handleNotaClick(estudiante)}
                                clickable={true}
                              />
                          </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <CalificacionDetailSheet 
            isOpen={sheetState.isOpen}
            onOpenChange={(isOpen) => setSheetState(prev => ({ ...prev, isOpen }))}
            estudiante={sheetState.estudiante}
            calificaciones={sheetState.calificaciones}
        />
    </>
  );
}
