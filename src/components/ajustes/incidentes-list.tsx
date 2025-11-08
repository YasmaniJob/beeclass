'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceholderContent } from '@/components/ui/placeholder-content';
import { useIncidentesComunes } from '@/hooks/use-incidentes-comunes';
import { useToast } from '@/hooks/use-toast';
import { List, Plus, Trash2, X } from 'lucide-react';

type TipoIncidente = 'estudiantes' | 'personal';

interface IncidentesListProps {
  tipo: TipoIncidente;
}

export function IncidentesList({ tipo }: IncidentesListProps) {
  const { incidentesComunes, addIncidenteComun, deleteIncidenteComun } = useIncidentesComunes();
  const [newIncidente, setNewIncidente] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const listaActual = incidentesComunes[tipo] || [];

  const handleAdd = () => {
    if (newIncidente.trim()) {
      addIncidenteComun(newIncidente.trim(), tipo);
      toast({
        title: 'Incidente común añadido',
        description: `Se ha añadido "${newIncidente.trim()}" a la lista de ${tipo}.`,
      });
      setNewIncidente('');
      setShowAddForm(false);
    }
  };

  const handleDelete = (incidente: string) => {
    deleteIncidenteComun(incidente, tipo);
    toast({
      title: 'Incidente común eliminado',
      description: `Se ha eliminado "${incidente}" de la lista.`,
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {listaActual.length > 0 ? (
          <div className="space-y-3">
            {listaActual.map(incidente => (
              <div
                key={incidente}
                className="group/item flex items-center justify-between rounded-md border bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
              >
                <p className="font-medium">{incidente}</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive md:opacity-0 md:group-hover/item:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará la plantilla de incidente:
                        <strong className="font-medium block mt-2">{incidente}</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(incidente)}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        ) : (
          !showAddForm && (
            <PlaceholderContent
              icon={List}
              title="No hay incidentes comunes"
              description={`Añade tu primer incidente para ${tipo}.`}
              className="py-10"
            />
          )
        )}
        {showAddForm ? (
          <div className="flex items-center gap-2 pt-4">
            <Input
              value={newIncidente}
              onChange={e => setNewIncidente(e.target.value)}
              placeholder="Ej: No trajo el uniforme adecuado"
              autoFocus
            />
            <Button onClick={handleAdd}>Guardar</Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Añadir Incidente Común
          </Button>
        )}
      </CardContent>
    </Card>
  );
}