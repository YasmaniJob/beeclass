
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IncidentesList } from '@/components/ajustes/incidentes-list';

export default function IncidentesComunesPage() {
  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Incidentes Comunes
            </h1>
            <p className="text-muted-foreground mt-1">
                Añade o elimina plantillas de incidentes para agilizar el registro, diferenciando entre estudiantes y personal.
            </p>
            </div>
        </div>
        <Tabs defaultValue="estudiantes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-sm">
                <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
            </TabsList>
            <TabsContent value="estudiantes" className="pt-4">
                <IncidentesList tipo="estudiantes" />
            </TabsContent>
            <TabsContent value="personal" className="pt-4">
                <IncidentesList tipo="personal" />
            </TabsContent>
        </Tabs>
    </div>
  );
}
