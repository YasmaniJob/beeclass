
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppConfig } from '@/hooks/use-app-config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { Nivel } from '@/lib/definitions';

export default function PersonalizacionPage() {
  const { toast } = useToast();
  const { niveles } = useMatriculaData();
  const { 
    appName, 
    setAppName, 
    institutionName, 
    setInstitutionName, 
    themeColor, 
    setThemeColor, 
    logoUrl,
    setLogoUrl,
    loginImageUrl,
    setLoginImageUrl,
    nivelInstitucion,
    setNivelInstitucion,
    saveConfig 
  } = useAppConfig();
  
  const [localAppName, setLocalAppName] = useState(appName);
  const [localInstitutionName, setLocalInstitutionName] = useState(institutionName);
  const [localThemeColor, setLocalThemeColor] = useState(themeColor);
  const [localLogoUrl, setLocalLogoUrl] = useState(logoUrl);
  const [localLoginImageUrl, setLocalLoginImageUrl] = useState(loginImageUrl);
  const [localNivelInstitucion, setLocalNivelInstitucion] = useState(nivelInstitucion);

  useEffect(() => {
    setLocalAppName(appName);
    setLocalInstitutionName(institutionName);
    setLocalThemeColor(themeColor);
    setLocalLogoUrl(logoUrl);
    setLocalLoginImageUrl(loginImageUrl);
    setLocalNivelInstitucion(nivelInstitucion);
  }, [appName, institutionName, themeColor, logoUrl, loginImageUrl, nivelInstitucion]);

  const handleSaveAppConfig = () => {
    setAppName(localAppName);
    setInstitutionName(localInstitutionName);
    setThemeColor(localThemeColor);
    setLogoUrl(localLogoUrl);
    setLoginImageUrl(localLoginImageUrl);
    setNivelInstitucion(localNivelInstitucion);
    saveConfig({ 
        appName: localAppName, 
        institutionName: localInstitutionName, 
        themeColor: localThemeColor,
        logoUrl: localLogoUrl,
        loginImageUrl: localLoginImageUrl,
        nivelInstitucion: localNivelInstitucion,
    });
    toast({
      title: 'Personalización guardada',
      description: 'La identidad de la aplicación ha sido actualizada.',
    });
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Personalización
            </h1>
            <p className="text-muted-foreground mt-1">
                Modifica el nombre, logo, colores y más para que la aplicación se ajuste a la identidad de tu institución.
            </p>
            </div>
        </div>
        <Card>
            <CardContent className="space-y-8 pt-6">
                 <div className="space-y-2">
                    <Label htmlFor="nivel-institucion">Nivel Educativo Principal</Label>
                    <Select value={localNivelInstitucion} onValueChange={(v) => setLocalNivelInstitucion(v as Nivel)}>
                        <SelectTrigger id="nivel-institucion">
                            <SelectValue placeholder="Seleccione el nivel" />
                        </SelectTrigger>
                        <SelectContent>
                            {niveles.map(nivel => (
                                <SelectItem key={nivel.id} value={nivel.nombre}>{nivel.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <p className="text-xs text-muted-foreground">Este nivel se usará para filtrar los grados y secciones en toda la aplicación.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="app-name">Nombre de la App</Label>
                        <Input
                            id="app-name"
                            value={localAppName}
                            onChange={(e) => setLocalAppName(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="institution-name">Nombre de la Institución</Label>
                        <Input
                            id="institution-name"
                            value={localInstitutionName}
                            onChange={(e) => setLocalInstitutionName(e.target.value)}
                        />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="logo-url">URL del Logo</Label>
                    <Input
                        id="logo-url"
                        value={localLogoUrl}
                        onChange={(e) => setLocalLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-muted-foreground">Pega la URL de un logo alojado en un servicio externo (formatos recomendados: .png, .svg).</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="login-image-url">URL de Imagen de Fondo</Label>
                    <Input
                        id="login-image-url"
                        value={localLoginImageUrl}
                        onChange={(e) => setLocalLoginImageUrl(e.target.value)}
                        placeholder="https://example.com/background.jpg"
                    />
                     <p className="text-xs text-muted-foreground">URL de una imagen para usar como fondo en ciertas secciones (formatos recomendados: .jpg, .png).</p>
                </div>

                <div className="space-y-3">
                    <Label>Color Principal (Acento)</Label>
                    <p className="text-xs text-muted-foreground">Este color se usará en botones, enlaces y otros elementos interactivos.</p>
                    <div className="flex items-center gap-4">
                        <Input
                            id="theme-color-picker"
                            type="color"
                            value={localThemeColor}
                            onChange={(e) => setLocalThemeColor(e.target.value)}
                            className="p-1 h-12 w-14 cursor-pointer"
                        />
                        <Input
                            id="theme-color-hex"
                            value={localThemeColor.toUpperCase()}
                            onChange={(e) => setLocalThemeColor(e.target.value)}
                            className="flex-1 font-mono text-center tracking-widest text-lg"
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={handleSaveAppConfig}>Guardar Cambios</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
