
'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { AreaCurricular } from '@/lib/definitions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AreaCalificacionCardProps {
    area: AreaCurricular;
    grado: string;
    seccion: string;
    totalEstudiantes: number;
    totalCalificados: number;
    isTransversal?: boolean;
}

export function AreaCalificacionCard({ area, grado, seccion, totalEstudiantes, totalCalificados, isTransversal = false }: AreaCalificacionCardProps) {
    const seccionEncoded = encodeURIComponent(seccion);
    const gradoEncoded = encodeURIComponent(grado);
    const areaIdEncoded = encodeURIComponent(area.id);

    const href = isTransversal 
        ? `/evaluaciones/transversal/${gradoEncoded}/${seccionEncoded}`
        : `/evaluaciones/${gradoEncoded}/${seccionEncoded}/${areaIdEncoded}`;
    
    const buttonText = isTransversal ? 'Ver Consolidado' : 'Evaluar';

    const progreso = totalEstudiantes > 0 ? (totalCalificados / totalEstudiantes) * 100 : 0;

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{area.nombre}</CardTitle>
                {area.competencias.length > 0 && !isTransversal && (
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-none">
                            <AccordionTrigger className="text-sm text-muted-foreground hover:no-underline py-1">Ver Competencias</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc pl-5 text-xs space-y-1 text-muted-foreground">
                                   {area.competencias.map(c => <li key={c.id}>{c.nombre}</li>)}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </CardHeader>
            <CardContent className="space-y-3 flex-1 pt-0">
                <div>
                    <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
                        <span className="font-medium flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-green-500" /> Progreso</span>
                        <span>{totalCalificados} de {totalEstudiantes} estudiantes</span>
                    </div>
                    <Progress value={progreso} />
                </div>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href={href}>
                        {buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
