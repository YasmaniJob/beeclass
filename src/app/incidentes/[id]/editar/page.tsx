
'use client';

import { useParams } from 'next/navigation';
import { useIncidentes } from '@/hooks/use-incidentes';
import { IncidenteForm } from '@/components/incidentes/incidente-form';
import { useEffect, useState } from 'react';
import { Incidente } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditarIncidentePage() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const { getIncidenteById } = useIncidentes();
    const [incidente, setIncidente] = useState<Incidente | null | undefined>(undefined);

    useEffect(() => {
        if (id) {
            const fetchedIncidente = getIncidenteById(id as string);
            setIncidente(fetchedIncidente);
        }
    }, [id, getIncidenteById]);

    return (
        <div className="space-y-8">
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Editar Incidente</h1>
                    <p className="text-muted-foreground mt-1">Modifica la información del incidente y guarda los cambios.</p>
                </div>
            </div>
            {incidente === undefined && <Skeleton className="h-96 w-full" />}
            {incidente === null && <div>Incidente no encontrado</div>}
            {incidente && <IncidenteForm incidenteToEdit={incidente} />}
        </div>
    );
}
