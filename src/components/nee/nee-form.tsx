"use client";

import { useEffect, useMemo, useState } from 'react';
import { Estudiante, NeeEntry } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AlumnoSearchCombobox } from '@/components/alumnos/alumno-search-combobox';

interface NeeFormProps {
  estudiantes: Estudiante[];
  onSubmit: (data: { estudiante: Estudiante; descripcion: string; documentoUrl?: string }) => Promise<void> | void;
  isSaving?: boolean;
  editingEntry?: NeeEntry | null;
  onCancel?: () => void;
}

export function NeeForm({ estudiantes, onSubmit, isSaving = false, editingEntry = null, onCancel }: NeeFormProps) {
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(editingEntry?.estudiante ?? null);
  const [descripcion, setDescripcion] = useState(editingEntry?.descripcion ?? '');
  const [documentoUrl, setDocumentoUrl] = useState(editingEntry?.documentoUrl ?? '');

  const isEditMode = !!editingEntry;

  const estudiantesOrdenados = useMemo(
    () => [...estudiantes].sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno, 'es')),
    [estudiantes]
  );

  useEffect(() => {
    setSelectedEstudiante(editingEntry?.estudiante ?? null);
    setDescripcion(editingEntry?.descripcion ?? '');
    setDocumentoUrl(editingEntry?.documentoUrl ?? '');
  }, [editingEntry]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedEstudiante || !descripcion.trim()) return;

    await onSubmit({
      estudiante: selectedEstudiante,
      descripcion: descripcion.trim(),
      documentoUrl: documentoUrl.trim() ? documentoUrl.trim() : undefined,
    });

    if (!isEditMode) {
      setSelectedEstudiante(null);
      setDescripcion('');
      setDocumentoUrl('');
    }
  };

  const isDisabled = !selectedEstudiante || !descripcion.trim() || isSaving;

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Editar registro NEE' : 'Registrar nueva NEE'}</CardTitle>
          <CardDescription>
            Completa la información del estudiante para registrar o actualizar sus necesidades educativas especiales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Estudiante</Label>
            <AlumnoSearchCombobox
            sujetos={estudiantesOrdenados}
            selectedSujeto={selectedEstudiante}
            onSelect={sujeto => setSelectedEstudiante((sujeto ?? null) as Estudiante | null)}
            placeholder="Selecciona al estudiante..."
          />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nee-descripcion">Descripción o diagnóstico</Label>
            <Textarea
              id="nee-descripcion"
              value={descripcion}
              onChange={event => setDescripcion(event.target.value)}
              placeholder="Ej: Trastorno específico del lenguaje, requiere sesiones semanales de terapia"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nee-documento">Enlace a documento (opcional)</Label>
            <Input
              id="nee-documento"
              type="url"
              value={documentoUrl}
              onChange={event => setDocumentoUrl(event.target.value)}
              placeholder="https://drive.google.com/..."
            />
            {editingEntry?.documentoUrl && editingEntry.documentoUrl !== documentoUrl && (
              <p className="text-xs text-muted-foreground break-all">
                Enlace previo: {editingEntry.documentoUrl}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              {isEditMode ? 'Cancelar edición' : 'Cancelar'}
            </Button>
          )}
          <Button type="submit" disabled={isDisabled}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Guardar cambios' : 'Registrar NEE'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
