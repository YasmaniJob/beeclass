'use client';

import { useState } from 'react';
import { NotaCualitativa, NotaCualitativaEnum } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { NotaBadge } from './nota-badge';
import { cn } from '@/lib/utils';


const notaOptions = NotaCualitativaEnum.options;

interface NotaSelectorProps {
    value: NotaCualitativa | null;
    onValueChange: (value: NotaCualitativa) => void;
}

export function NotaSelector({ value, onValueChange }: NotaSelectorProps) {

    const handleSelect = (nota: NotaCualitativa) => {
        onValueChange(nota);
    }

    return (
        <div className="flex items-center justify-center gap-1">
            <NotaBadge nota={value} />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {notaOptions.map(nota => {
                        const isSelected = value === nota;
                        return (
                            <DropdownMenuItem key={nota} onSelect={() => handleSelect(nota)} className={cn('font-semibold', isSelected && 'bg-accent')}>
                                <NotaBadge nota={nota} className="mr-2 border-0 bg-transparent" />
                                {nota}
                            </DropdownMenuItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
