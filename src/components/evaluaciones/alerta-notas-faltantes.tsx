
'use client';

import { AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface AlertaNotasFaltantesProps {
    visible: boolean;
    count: number;
}

export function AlertaNotasFaltantes({ visible, count }: AlertaNotasFaltantesProps) {
    if (!visible || count === 0) return null;

    return (
        <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-500/90 text-white gap-1.5 h-6">
            <AlertCircle className="h-3 w-3" />
            Faltan {count}
        </Badge>
    );
}
