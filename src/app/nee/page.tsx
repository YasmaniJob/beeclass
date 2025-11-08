

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { NeeTable } from '@/components/nee/nee-table';
import { SearchInput } from '@/components/filtros/search-input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { NeeEntry } from '@/lib/definitions';
import { NeeDetailSheet } from '@/components/nee/nee-detail-sheet';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useNee } from '@/hooks/use-nee';

export default function NeePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<NeeEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user } = useCurrentUser();
  const canManage = user?.rol === 'Admin' || user?.rol === 'Auxiliar';
  const router = useRouter();

  const { entries, isLoading, error } = useNee();

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) =>
      a.estudiante.apellidoPaterno.localeCompare(b.estudiante.apellidoPaterno, 'es')
    );
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) {
      return sortedEntries;
    }

    const term = searchTerm.toLowerCase();
    return sortedEntries.filter(entry => {
      const estudiante = entry.estudiante;
      const fullName = `${estudiante.nombres} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno ?? ''}`.toLowerCase();
      return fullName.includes(term) || estudiante.numeroDocumento.includes(term);
    });
  }, [searchTerm, sortedEntries]);

  const handleViewDetails = (entry: NeeEntry) => {
    setSelectedEntry(entry);
    setIsSheetOpen(true);
  };

  const handleEditFromDetail = (entry: NeeEntry) => {
    setIsSheetOpen(false);
    router.push(`/nee/${entry.id}/editar`);
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Estudiantes con NEE
          </h1>
          <p className="text-muted-foreground mt-1">
            Listado de estudiantes con Necesidades Educativas Especiales registradas.
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/nee/nuevo">
              <PlusCircle className="mr-2 h-4 w-4"/>
              Registrar Estudiante con NEE
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <div className="p-4 border-b">
          <SearchInput
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            placeholder="Buscar por nombre, apellidos o documento..."
          />
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Cargando registros...</div>
          ) : error ? (
            <div className="p-6 text-sm text-destructive">{error}</div>
          ) : (
            <NeeTable entries={filteredEntries} onViewDetails={handleViewDetails} />
          )}
        </CardContent>
      </Card>

      <NeeDetailSheet
        entry={selectedEntry}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onEdit={handleEditFromDetail}
        canManage={canManage}
      />
    </div>
  );
}
    
