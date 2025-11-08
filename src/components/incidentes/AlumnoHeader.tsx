
'use client';

import { Estudiante } from '@/lib/definitions';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AlumnoHeaderProps {
  estudiante: Estudiante;
  isEditMode: boolean;
  onReset: () => void;
}

export function AlumnoHeader({
  estudiante,
  isEditMode,
  onReset,
}: AlumnoHeaderProps) {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{`${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.nombres}`}</CardTitle>
          <CardDescription>
            {estudiante.grado} - {estudiante.seccion}
          </CardDescription>
        </div>
        {!isEditMode && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-2 h-4 w-4" />
            Cambiar
          </Button>
        )}
      </CardHeader>
    </Card>
  );
}
