
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookCopy, LineChart, Settings, GraduationCap, Siren } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-current-user';
import { UserRole } from '@/lib/definitions';

const allAccesos = [
    { href: "/docentes", icon: Users, label: "Gestionar Personal", roles: ['Admin', 'Director', 'Sub-director'] },
    { href: "/estudiantes", icon: GraduationCap, label: "Gestión Estudiantes", roles: ['Admin', 'Auxiliar', 'Coordinador'] },
    { href: "/carga-academica", icon: BookCopy, label: "Carga Académica", roles: ['Admin'] },
    { href: "/incidentes", icon: Siren, label: "Ver Incidentes", roles: ['Admin', 'Auxiliar', 'Coordinador'] },
    { href: "/reportes", icon: LineChart, label: "Ver Reportes", roles: ['Admin', 'Director', 'Sub-director', 'Coordinador', 'Auxiliar'] },
    { href: "/ajustes", icon: Settings, label: "Configuración", roles: ['Admin'] },
]

export function AccesosRapidos() {
    const { user } = useCurrentUser();

    if (!user) {
        return null;
    }

    const accesosPermitidos = allAccesos.filter(item => item.roles.includes(user.rol));

    if (accesosPermitidos.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                {accesosPermitidos.map(item => (
                    <Button key={item.href} variant="outline" asChild className="h-auto py-3 flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors">
                        <Link href={item.href}>
                            <item.icon className="h-6 w-6 text-primary" />
                            <span className="text-xs text-center font-medium text-foreground">{item.label}</span>
                        </Link>
                    </Button>
                ))}
            </CardContent>
        </Card>
    )
}
