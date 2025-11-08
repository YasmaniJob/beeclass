

'use client';

import { useState, useMemo } from 'react';
import { Docente } from '@/domain/entities/Docente';
import { Card, CardContent } from '@/components/ui/card';
import { DocentesTable } from '@/components/docentes/docentes-table';
import { DocentesFiltros } from '@/components/docentes/docentes-filtros';
import { DocenteFormDialog } from '@/components/docentes/docente-form-dialog';
import { useToast } from '@/hooks/use-toast';
import { DocentesMasivaDialog } from '@/components/docentes/docentes-masiva-dialog';
import { usePersonal } from '@/hooks/use-supabase-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DocenteEditable, docenteToEditable, editableToDocente } from '@/domain/mappers/docente-editable';

export type DocenteFilters = {
    rol: string[];
};

export default function DocentesPage() {
    const { toast } = useToast();
    const { 
        personal: docentes,
        loading,
        refresh,
        add: addDocente,
        update: updateDocente,
        delete: deleteDocente,
    } = usePersonal();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<DocenteFilters>({ rol: [] });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isMasivaOpen, setIsMasivaOpen] = useState(false);
    const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);

    const handleSaveDocente = async (docenteData: Docente) => {
        try {
            if (selectedDocente) { // Modo Edición
                const success = await updateDocente(selectedDocente.numeroDocumento, docenteData);
                if (success) {
                    toast({ title: 'Personal actualizado', description: `${docenteData.nombres} ${docenteData.apellidoPaterno} ha sido actualizado.` });
                }
            } else { // Modo Creación
                const success = await addDocente(docenteData);
                if (success) {
                    toast({ title: 'Personal registrado', description: `${docenteData.nombres} ${docenteData.apellidoPaterno} ha sido añadido.` });
                }
            }
            setSelectedDocente(null);
        } catch (error) {
            toast({ 
                variant: 'destructive',
                title: 'Error', 
                description: 'No se pudo guardar el personal. Intenta de nuevo.' 
            });
        }
    };

    const handleMassSave = async (nuevosDocentes: Docente[]) => {
        try {
            for (const docente of nuevosDocentes) {
                await addDocente(docente);
            }
            toast({ title: 'Importación masiva completa', description: `Se han añadido ${nuevosDocentes.length} nuevos miembros al personal.` });
        } catch (error) {
            toast({ 
                variant: 'destructive',
                title: 'Error', 
                description: 'Error en la importación masiva.' 
            });
        }
    };

    const handleDeleteDocente = async (numeroDocumento: string) => {
        try {
            const success = await deleteDocente(numeroDocumento);
            if (success) {
                toast({ title: 'Personal eliminado', description: 'El miembro del personal ha sido eliminado.' });
            }
        } catch (error) {
            toast({ 
                variant: 'destructive',
                title: 'Error', 
                description: 'No se pudo eliminar el personal.' 
            });
        }
    };
    
    const handleOpenEditDialog = (docenteEditable: DocenteEditable) => {
        try {
            const docente = editableToDocente(docenteEditable);
            setSelectedDocente(docente);
        } catch (error) {
            console.error('Error al convertir docente editable', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo cargar la información del personal para edición.'
            });
            return;
        }
        setIsFormOpen(true);
    };

    const handleOpenFormDialog = (open: boolean) => {
        if (!open) {
            setSelectedDocente(null);
        }
        setIsFormOpen(open);
    }

    const filteredDocentes = useMemo(() => {
        return docentes.filter(docente => {
            const searchTermLower = searchTerm.toLowerCase();
            const searchMatch = (
                `${docente.apellidoPaterno} ${docente.apellidoMaterno} ${docente.nombres}`.toLowerCase().includes(searchTermLower) || 
                docente.numeroDocumento.toLowerCase().includes(searchTermLower)
            );
            const rolMatch = filters.rol.length === 0 || filters.rol.includes(docente.rol);
            return searchMatch && rolMatch;
        });
    }, [searchTerm, filters, docentes]);

    const editableDocentes = useMemo(() => filteredDocentes.map(docenteToEditable), [filteredDocentes]);


    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Gestión de Personal
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Añade, edita y gestiona el personal de la institución. Las asignaciones de cursos se realizan en "Carga Académica".
                    </p>
                </div>
                 <div className="flex items-center gap-2">
                    <Badge variant={loading ? "secondary" : "default"}>
                        {docentes.length} personal
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refresh}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                    <DocentesMasivaDialog 
                        open={isMasivaOpen}
                        onOpenChange={setIsMasivaOpen}
                        onSave={handleMassSave}
                    />
                    <DocenteFormDialog
                        open={isFormOpen}
                        onOpenChange={handleOpenFormDialog}
                        onSave={handleSaveDocente}
                        docenteToEdit={selectedDocente}
                    />
                </div>
            </div>
            
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            ) : (
            <Card>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b">
                   <DocentesFiltros
                        filters={filters}
                        onFiltersChange={setFilters}
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                    />
                </div>
                <CardContent className="p-0">
                    <DocentesTable
                        docentes={editableDocentes}
                        onEdit={handleOpenEditDialog}
                        onDelete={handleDeleteDocente}
                    />
                </CardContent>
            </Card>
            )}
        </div>
    );
}
