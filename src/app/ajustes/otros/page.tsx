
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderContent } from "@/components/ui/placeholder-content";
import { Settings } from "lucide-react";

export default function OtrosAjustesPage() {
    return (
        <Card>
            <CardHeader>
                <CardDescription>
                    Otras opciones de configuración de la aplicación se añadirán aquí en el futuro.
                </CardDescription>
            </CardHeader>
            <CardContent>
              <PlaceholderContent
                icon={Settings}
                title="En construcción"
                description="Este espacio está reservado para futuras configuraciones."
                className="py-10 text-sm"
              />
            </CardContent>
        </Card>
    );
}
