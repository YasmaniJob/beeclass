
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderContent } from '../ui/placeholder-content';
import { CalendarDays } from 'lucide-react';

export function ProximasActividades() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Próximas Actividades</CardTitle>
                <CardDescription>Calendario de eventos institucionales.</CardDescription>
            </CardHeader>
            <CardContent>
                 <PlaceholderContent
                    icon={CalendarDays}
                    title="En construcción"
                    description="El calendario de actividades estará disponible aquí próximamente."
                    className="py-8 text-sm"
                />
            </CardContent>
        </Card>
    )
}
