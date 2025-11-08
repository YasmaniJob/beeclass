
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, LineChart, Settings, FileSpreadsheet, TrendingUp } from 'lucide-react';

const reportLinks = [
  {
    title: 'Reporte de Asistencia',
    description: 'Filtra asistencia por fechas, grado y sección para detectar tendencias y alertas tempranas.',
    href: '/reportes/asistencia',
    icon: <LineChart className="h-5 w-5" />,
    badge: 'Disponible',
  },
  {
    title: 'Reporte de Permisos',
    description: 'Visualiza permisos concedidos, motivos y responsables (en preparación).',
    href: '#',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    badge: 'Próximamente',
  },
  {
    title: 'Indicadores académicos',
    description: 'Consolida calificaciones y desempeño por área curricular (en preparación).',
    href: '#',
    icon: <TrendingUp className="h-5 w-5" />,
    badge: 'Próximamente',
  },
];

export default function ReportesPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Reportes disponibles</h1>
          <p className="text-muted-foreground">Selecciona un módulo para abrir el reporte correspondiente.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reportLinks.map(link => (
            <Card key={link.title} className="group border-border/70">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-primary">{link.icon}</span>
                    {link.title}
                  </CardTitle>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {link.badge}
                  </span>
                </div>
                <CardDescription className="leading-relaxed">{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  variant={link.href === '#' ? 'outline' : 'default'}
                  className="w-full justify-between"
                  disabled={link.href === '#'}
                >
                  <Link href={link.href === '#' ? '#' : link.href}>
                    {link.href === '#' ? 'En construcción' : 'Abrir reporte'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
