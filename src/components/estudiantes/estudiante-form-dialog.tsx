'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Estudiante } from '@/domain/entities/Estudiante';
import { EstudianteInput } from '@/domain/entities/EstudianteInput';
import { normalizeTipoDocumento } from '@/domain/mappers/entity-builders';

interface EstudianteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudiante?: Estudiante | null;
  onSave: (estudiante: EstudianteInput) => Promise<boolean>;
  mode: 'create' | 'edit';
}

const GRADOS = [
  '3 Años', '4 Años', '5 Años',
  '1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado',
  '1ero Secundaria', '2do Secundaria', '3ero Secundaria', '4to Secundaria', '5to Secundaria'
];

const SECCIONES = ['A', 'B', 'C', 'D', 'E', 'F'];

export function EstudianteFormDialog({ open, onOpenChange, estudiante, onSave, mode }: EstudianteFormDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EstudianteInput & {
    sexo?: 'M' | 'F';
    direccion?: string;
    telefono?: string;
    email?: string;
    fechaNacimiento?: Date;
    nombreApoderado?: string;
    telefonoApoderado?: string;
    neeDescripcion?: string;
  }>({
    tipoDocumento: normalizeTipoDocumento('DNI'),
    numeroDocumento: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombres: '',
    grado: '1er Grado',
    seccion: 'A',
  });
  const [neeActivo, setNeeActivo] = useState(false);

  useEffect(() => {
    if (estudiante && mode === 'edit') {
      setFormData({
        tipoDocumento: estudiante.tipoDocumento,
        numeroDocumento: estudiante.numeroDocumento,
        apellidoPaterno: estudiante.apellidoPaterno,
        apellidoMaterno: estudiante.apellidoMaterno,
        nombres: estudiante.nombres,
        grado: estudiante.grado,
        seccion: estudiante.seccion,
        neeDescripcion: estudiante.nee ?? '',
        neeDocumentos: estudiante.neeDocumentos,
      });
      setNeeActivo(Boolean(estudiante.nee));
    } else if (mode === 'create') {
      setFormData({
        tipoDocumento: normalizeTipoDocumento('DNI'),
        numeroDocumento: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        nombres: '',
        grado: '1er Grado',
        seccion: 'A',
      });
      setNeeActivo(false);
    }
  }, [estudiante, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.numeroDocumento || !formData.apellidoPaterno || !formData.nombres || !formData.grado || !formData.seccion) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const payload: EstudianteInput = {
        numeroDocumento: formData.numeroDocumento,
        tipoDocumento: formData.tipoDocumento,
        nombres: formData.nombres,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        grado: formData.grado,
        seccion: formData.seccion,
        nee: neeActivo ? formData.neeDescripcion?.trim() || undefined : undefined,
        neeDocumentos: formData.neeDocumentos,
      };

      const success = await onSave(payload);

      if (success) {
        toast({
          title: 'Éxito',
          description: mode === 'create' ? 'Estudiante creado correctamente' : 'Estudiante actualizado correctamente',
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el estudiante',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuevo Estudiante' : 'Editar Estudiante'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Completa los datos del nuevo estudiante' 
              : 'Modifica los datos del estudiante'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Datos Personales */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Datos Personales</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
                <Select
                  value={formData.tipoDocumento}
                  onValueChange={(value) => setFormData({ ...formData, tipoDocumento: normalizeTipoDocumento(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroDocumento">Número de Documento *</Label>
                <Input
                  id="numeroDocumento"
                  value={formData.numeroDocumento}
                  onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                  placeholder="12345678"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
                <Input
                  id="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                <Input
                  id="apellidoMaterno"
                  value={formData.apellidoMaterno || ''}
                  onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input
                id="nombres"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value ? new Date(e.target.value) : undefined })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo *</Label>
                <Select
                  value={formData.sexo ?? 'M'}
                  onValueChange={(value) => setFormData({ ...formData, sexo: value as 'M' | 'F' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Contacto</h3>
            
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion || ''}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Apoderado */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Apoderado</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nombreApoderado">Nombre del Apoderado</Label>
              <Input
                id="nombreApoderado"
                value={formData.nombreApoderado || ''}
                onChange={(e) => setFormData({ ...formData, nombreApoderado: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefonoApoderado">Teléfono del Apoderado</Label>
              <Input
                id="telefonoApoderado"
                value={formData.telefonoApoderado || ''}
                onChange={(e) => setFormData({ ...formData, telefonoApoderado: e.target.value })}
              />
            </div>
          </div>

          {/* Matrícula */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Matrícula</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grado">Grado *</Label>
                <Select
                  value={formData.grado}
                  onValueChange={(value) => setFormData({ ...formData, grado: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADOS.map((grado) => (
                      <SelectItem key={grado} value={grado}>
                        {grado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seccion">Sección *</Label>
                <Select
                  value={formData.seccion}
                  onValueChange={(value) => setFormData({ ...formData, seccion: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECCIONES.map((seccion) => (
                      <SelectItem key={seccion} value={seccion}>
                        {seccion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* NEE */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nee"
                checked={neeActivo}
                onChange={(event) => setNeeActivo(event.target.checked)}
                className="h-4 w-4 rounded border border-input"
              />
              <Label htmlFor="nee" className="cursor-pointer">
                Necesidades Educativas Especiales (NEE)
              </Label>
            </div>

            {neeActivo && (
              <div className="space-y-2">
                <Label htmlFor="descripcionNee">Descripción de NEE</Label>
                <Textarea
                  id="descripcionNee"
                  value={formData.neeDescripcion || ''}
                  onChange={(e) => setFormData({ ...formData, neeDescripcion: e.target.value })}
                  placeholder="Describe las necesidades educativas especiales..."
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
