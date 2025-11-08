
'use client';

import { IncidenteForm } from '@/components/incidentes/incidente-form';

export default function NuevoIncidentePage() {
    return (
        <div className="space-y-8">
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Registrar Nuevo Incidente</h1>
                    <p className="text-muted-foreground mt-1">Busca un estudiante y completa el formulario para registrar un incidente.</p>
                </div>
            </div>
            <IncidenteForm />
        </div>
    );
}
