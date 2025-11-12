'use client';

import { NotaCualitativa, NotaCualitativaEnum } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const notaOptions = NotaCualitativaEnum.options;

// Colores para cada nota
const notaColors = {
    'AD': 'bg-green-500 hover:bg-green-600 text-white border-green-600',
    'A': 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600',
    'B': 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600',
    'C': 'bg-red-500 hover:bg-red-600 text-white border-red-600',
} as const;

interface NotaSelectorProps {
    value: NotaCualitativa | null;
    onValueChange: (value: NotaCualitativa) => void;
}

export function NotaSelector({ value, onValueChange }: NotaSelectorProps) {
    return (
        <div className="flex items-center justify-center gap-1.5">
            {notaOptions.map(nota => {
                const isSelected = value === nota;
                return (
                    <Button
                        key={nota}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onValueChange(nota)}
                        className={cn(
                            'h-9 w-12 text-sm font-bold transition-all',
                            isSelected ? notaColors[nota] : 'hover:scale-105',
                            !isSelected && 'text-muted-foreground'
                        )}
                    >
                        {nota}
                    </Button>
                );
            })}
        </div>
    );
}
