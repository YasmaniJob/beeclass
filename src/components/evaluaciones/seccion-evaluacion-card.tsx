
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMatriculaData } from '@/hooks/use-matricula-data';

interface SeccionEvaluacionCardProps {
    grado: string;
    seccion: string;
    totalEstudiantes: number;
    isTutorView?: boolean;
}

export function SeccionEvaluacionCard({ grado, seccion, totalEstudiantes, isTutorView = false }: SeccionEvaluacionCardProps) {
    const { user } = useCurrentUser();
    const { docentes } = useMatriculaData();

    const tutor = useMemo(() => {
        return docentes.find(d => 
            d.asignaciones?.some(a => 
                a.grado === grado && 
                a.seccion === seccion && 
                a.rol === 'Docente y Tutor'
            )
        );
    }, [grado, seccion, docentes]);

    const seccionEncoded = encodeURIComponent(seccion);
    const gradoEncoded = encodeURIComponent(grado);
    const simpleGrado = grado.replace(' Grado', '').replace(' Secundaria', '').replace(' Años', '');

    const href = isTutorView ? `/evaluaciones/transversal/${gradoEncoded}/${seccionEncoded}` : `/evaluaciones/${gradoEncoded}/${seccionEncoded}`;

    return (
        <Link href={href} className="group block">
            <Card className="h-full transition-all duration-200 group-hover:border-primary group-hover:shadow-lg group-hover:-translate-y-1 flex flex-col">
                <CardHeader>
                     <CardTitle className="flex items-center justify-between">
                        <span>{simpleGrado} - {seccion.replace('Sección ', '')}</span>
                        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                    </CardTitle>
                    <div className="text-sm text-muted-foreground pt-1">
                       <div className="flex flex-col gap-2">
                            {isTutorView && <Badge className="w-fit">Competencias Transversales</Badge>}
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{totalEstudiantes} estudiantes</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                    {/* Contenido adicional si es necesario en el futuro */}
                </CardContent>
                <CardFooter>
                    {tutor && <Badge variant="outline" className="text-xs">Tutor: {tutor.nombres.split(' ')[0]} {tutor.apellidoPaterno}</Badge>}
                </CardFooter>
            </Card>
        </Link>
    );
}
