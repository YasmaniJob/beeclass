
'use client';

import { useState } from 'react';
import { SujetoIncidente } from '@/domain/entities/Incidente';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, Check, X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface SujetoSearchComboboxProps {
  sujetos: SujetoIncidente[];
  selectedSujeto: SujetoIncidente | null;
  onSelect: (sujeto: SujetoIncidente | null) => void;
  placeholder?: string;
}

export function AlumnoSearchCombobox({
  sujetos,
  selectedSujeto,
  onSelect,
  placeholder = 'Selecciona o busca...'
}: SujetoSearchComboboxProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (currentValue: string) => {
    const sujeto = sujetos.find(s => s.numeroDocumento.toLowerCase() === currentValue.toLowerCase());
    onSelect(sujeto || null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedSujeto ? (
            <>
              <span className="truncate">{selectedSujeto.nombreCompleto}</span>
              <Badge variant="secondary">
                {'grado' in selectedSujeto ? `${selectedSujeto.grado ?? '—'} - ${selectedSujeto.seccion ?? '—'}` : selectedSujeto.rol}
              </Badge>
            </>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command
          filter={(value, search) => {
            const term = search.toLowerCase();
            const sujeto = sujetos.find(a => a.numeroDocumento.toLowerCase() === value.toLowerCase());
            if (!sujeto) return 0;

            const fullName = sujeto.nombreCompleto.toLowerCase();
            const doc = sujeto.numeroDocumento.toLowerCase();

            if (fullName.includes(term) || doc.includes(term)) {
              return 1;
            }
            return 0;
          }}
        >
          <CommandInput placeholder="Buscar por nombre o documento..." />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              {sujetos.map(sujeto => (
                <CommandItem
                  key={sujeto.numeroDocumento}
                  value={sujeto.numeroDocumento}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedSujeto?.numeroDocumento.toLowerCase() === sujeto.numeroDocumento.toLowerCase()
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col">
                        <span>{sujeto.nombreCompleto}</span>
                        <span className="text-xs text-muted-foreground">
                          {sujeto.identificacionCompleta}
                        </span>
                    </div>
                    <Badge variant={'grado' in sujeto ? "secondary" : "default"}>
                      {'grado' in sujeto ? `${sujeto.grado} - ${sujeto.seccion}` : sujeto.rol}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
