
'use client';

import { useParams } from 'next/navigation';
import { usePermisos } from '@/hooks/use-permisos';
import { PermisoForm } from '@/components/permisos/permiso-form';
import { useEffect, useState } from 'react';
import { Permiso } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditarPermisoPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const { getPermisoById } = usePermisos();
    const [permiso, setPermiso] = useState<Permiso | null | undefined>(undefined);

    useEffect(() => {
        if (id) {
            const fetchedPermiso = getPermisoById(id as string);
            setPermiso(fetchedPermiso);
        }
    }, [id, getPermisoById]);

    return (
        <div className="space-y-8">
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Editar Permiso</h1>
                    <p className="text-muted-foreground mt-1">Modifica la información del permiso y guarda los cambios.</p>
                </div>
            </div>
            {permiso === undefined && <Skeleton className="h-96 w-full" />}
            {permiso === null && <div>Permiso no encontrado</div>}
            {permiso && <PermisoForm permisoToEdit={permiso} />}
        </div>
    );
}
