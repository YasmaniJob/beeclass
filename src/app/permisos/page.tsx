
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePermisos } from '@/hooks/use-permisos';
import { PermisosTable } from '@/components/permisos/permisos-table';
import { SearchInput } from '@/components/filtros/search-input';
import { PlusCircle } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';


export default function PermisosPage() {
    const { permisos, deletePermiso } = usePermisos();
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const { user } = useCurrentUser();
    const canManage = user?.rol === 'Admin' || user?.rol === 'Auxiliar';

    const handleDeletePermiso = (id: string) => {
        deletePermiso(id);
        toast({
            title: 'Permiso eliminado',
            description: 'El registro de permiso ha sido eliminado.',
        });
    }

    const filteredPermisos = permisos.filter(p => {
        const term = searchTerm.toLowerCase();
        const fullName = `${p.estudiante.apellidoPaterno} ${p.estudiante.apellidoMaterno} ${p.estudiante.nombres}`.toLowerCase();
        return fullName.includes(term) || p.estudiante.numeroDocumento.includes(term);
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Permisos</h1>
                    <p className="text-muted-foreground mt-1">Busca, consulta y gestiona el historial de permisos de los estudiantes.</p>
                </div>
                {canManage && (
                    <Button asChild>
                        <Link href="/permisos/nuevo">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Registrar Nuevo Permiso
                        </Link>
                    </Button>
                )}
            </div>

            <Card>
                <div className="p-6 pb-4 border-b">
                     <SearchInput 
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        placeholder="Buscar por nombre, apellidos o documento..."
                    />
                </div>
                <CardContent className="p-0">
                    <PermisosTable 
                        permisos={filteredPermisos} 
                        onDelete={handleDeletePermiso}
                        canManage={canManage}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
