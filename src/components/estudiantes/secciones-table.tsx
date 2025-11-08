
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  Users,
} from 'lucide-react';
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
import { PlaceholderContent } from '../ui/placeholder-content';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Docente } from '@/domain/entities/Docente';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMatriculaData } from '@/hooks/use-matricula-data';

interface SeccionesTableProps {
  grado: string;
  secciones: string[];
  estudiantesPorSeccion: Record<string, Estudiante[]>;
  onDeleteSeccion: (seccion: string) => void;
}

export function SeccionesTable({
  grado,
  secciones,
  estudiantesPorSeccion,
  onDeleteSeccion,
}: SeccionesTableProps) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { docentes } = useMatriculaData();
  const isAdmin = user?.rol === 'Admin';


  if (secciones.length === 0) {
    return (
      <PlaceholderContent
        icon={Users}
        title="No hay secciones"
        description={isAdmin ? "Añade una nueva sección para empezar a matricular estudiantes." : "No hay secciones configuradas para este grado."}
        className="my-8"
      />
    );
  }

  const getTutorForSeccion = (grado: string, seccion: string): Docente | null => {
    return docentes.find(d => 
        d.asignaciones?.some(a => 
            a.grado === grado && 
            a.seccion === seccion && 
            a.rol === 'Docente y Tutor'
        )
    ) || null;
  }
  
  const getDocentesDeAreaForSeccion = (grado: string, seccion: string): Docente[] => {
    const docenteIds = new Set<string>();
    docentes.forEach(d => {
        if (d.asignaciones?.some(a =>
            a.grado === grado &&
            a.seccion === seccion &&
            a.areaId 
        )) {
            docenteIds.add(d.numeroDocumento);
        }
    });
    return docentes.filter(d => docenteIds.has(d.numeroDocumento));
  }

  const getAuxiliaresForSeccion = (grado: string, seccion: string): Docente[] => {
    return docentes.filter(d =>
        d.asignaciones?.some(a =>
            a.grado === grado &&
            a.seccion === seccion &&
            a.rol === 'Auxiliar'
        )
    );
  }


  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre de la Sección</TableHead>
            <TableHead>Estudiantes</TableHead>
            <TableHead>Personal Asignado</TableHead>
            {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {secciones.map(seccion => {
            const key = `${grado}-${seccion}`;
            const count = (estudiantesPorSeccion[key] || []).length;
            const seccionEncoded = encodeURIComponent(seccion);
            const gradoEncoded = encodeURIComponent(grado);
            const tutor = getTutorForSeccion(grado, seccion);
            const docentesDeArea = getDocentesDeAreaForSeccion(grado, seccion);
            const auxiliares = getAuxiliaresForSeccion(grado, seccion);

            return (
              <TableRow 
                key={seccion} 
              >
                <TableCell 
                    className="font-medium cursor-pointer"
                    onClick={() => router.push(`/estudiantes/${gradoEncoded}/${seccionEncoded}`)}
                >
                    {seccion.replace('Sección ', '')}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{count} estudiantes</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 flex-wrap">
                    {tutor ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="cursor-default border-primary text-primary">Tutor: {`${tutor.nombres.split(' ')[0]} ${tutor.apellidoPaterno}`}</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-semibold">Tutor Principal</p>
                            <p>{`${tutor.nombres} ${tutor.apellidoPaterno} ${tutor.apellidoMaterno}`}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : <Badge variant="destructive">Sin tutor</Badge>}

                     {docentesDeArea.length > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="cursor-default">{docentesDeArea.length} docentes</Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold">Docentes de Área</p>
                                    <ul className="list-disc pl-4">
                                        {docentesDeArea.map(d => (
                                            <li key={d.numeroDocumento}>{`${d.nombres} ${d.apellidoPaterno}`}</li>
                                        ))}
                                    </ul>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {auxiliares.length > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="default" className="cursor-default">{auxiliares.length} auxiliares</Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold">Auxiliares Asignados</p>
                                    <ul className="list-disc pl-4">
                                        {auxiliares.map(d => (
                                            <li key={d.numeroDocumento}>{`${d.nombres} ${d.apellidoPaterno}`}</li>
                                        ))}
                                    </ul>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                {isAdmin && (
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                                disabled={count > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar Sección</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>
                                  ¿Confirmas la eliminación?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                  Se eliminará la sección "{seccion}". Esta acción solo es posible si no tiene estudiantes matriculados.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel  onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteSeccion(seccion);
                                  }}
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                  Eliminar
                              </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
