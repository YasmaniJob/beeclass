
'use client';

import { PermisoForm } from '@/components/permisos/permiso-form';
import { Card, CardContent } from '@/components/ui/card';

export default function NuevoPermisoPage() {
    return (
        <div className="space-y-8">
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Registrar Nuevo Permiso</h1>
                    <p className="text-muted-foreground mt-1">Busca un estudiante y completa el formulario para registrar una justificación.</p>
                </div>
            </div>
            <PermisoForm />
        </div>
    );
}
