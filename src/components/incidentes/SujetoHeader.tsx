
'use client';

import { SujetoIncidente } from '@/domain/entities/Incidente';
import { Estudiante } from '@/domain/entities/Estudiante';
import { Docente } from '@/domain/entities/Docente';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface SujetoHeaderProps {
  sujeto: SujetoIncidente;
  isEditMode: boolean;
  onReset: () => void;
}

export function SujetoHeader({
  sujeto,
  isEditMode,
  onReset,
}: SujetoHeaderProps) {
  const isEstudiante = (sujeto: SujetoIncidente): sujeto is Estudiante => {
    return sujeto instanceof Estudiante || 'grado' in sujeto;
  };

  const isDocente = (sujeto: SujetoIncidente): sujeto is Docente => {
    return sujeto instanceof Docente || (!isEstudiante(sujeto) && 'rol' in sujeto);
  };

  return (
    <Card className="bg-muted/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{sujeto.nombreCompleto}</CardTitle>
          <div className={cn("text-sm text-muted-foreground", "pt-1")}>
            {isEstudiante(sujeto) && (
              <Badge variant="secondary">{sujeto.grado ?? '—'} - {sujeto.seccion ?? '—'}</Badge>
            )}
            {isDocente(sujeto) && (
              <Badge variant="default">{sujeto.rol}</Badge>
            )}
          </div>
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
