
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { cn } from '@/lib/utils';

interface AsistenciaSeccionCardProps {
    grado: string;
    seccion: string;
    totalEstudiantes: number;
}

export function AsistenciaSeccionCard({ grado, seccion, totalEstudiantes }: AsistenciaSeccionCardProps) {
    const { docentes } = useMatriculaData();
    const seccionEncoded = encodeURIComponent(seccion);
    const gradoEncoded = encodeURIComponent(grado);

     const tutor = docentes.find(d => 
        d.asignaciones?.some(a => 
            a.grado === grado && 
            a.seccion === seccion && 
            a.rol === 'Docente y Tutor'
        )
    );
    
    const simpleGrado = grado.replace(' Grado', '').replace(' Secundaria', '').replace(' Años', '');


    return (
        <Link href={`/asistencia/${gradoEncoded}/${seccionEncoded}`} className="group block">
            <Card className="h-full transition-all duration-200 group-hover:border-primary group-hover:shadow-lg group-hover:-translate-y-1 flex flex-col">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{simpleGrado} - {seccion.replace('Sección ', '')}</CardTitle>
                        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                     {tutor && <CardDescription className="!mt-2">Tutor: {tutor.nombres.split(' ')[0]} {tutor.apellidoPaterno}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{totalEstudiantes} estudiantes</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
