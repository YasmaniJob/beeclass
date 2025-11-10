
'use client';

import { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
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

  const handleSaveAppConfig = async () => {
    try {
      // Guardar en la base de datos y actualizar el contexto
      await saveConfig({ 
          appName: localAppName, 
          institutionName: localInstitutionName, 
          themeColor: localThemeColor,
          logoUrl: localLogoUrl,
          loginImageUrl: localLoginImageUrl,
          nivelInstitucion: localNivelInstitucion,
      });
      
      toast({
        title: 'Personalización guardada',
        description: 'La configuración se ha guardado correctamente y está disponible para todos los usuarios.',
      });
    } catch (error) {
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar la configuración. Verifica que tengas permisos de administrador.',
        variant: 'destructive',
      });
    }
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
            <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>
                    Personaliza la identidad visual de tu institución
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
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
                     <p className="text-xs text-muted-foreground">
                        Este nivel determina las áreas curriculares disponibles. Cambiar el nivel puede afectar la configuración existente.
                    </p>
                </div>
                
                <Separator />
                
                <div>
                    <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
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
                </div>
                
                <Separator />
                
                <div>
                    <h3 className="text-lg font-semibold mb-4">Identidad Visual</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="logo-url">URL del Logo</Label>
                    <Input
                        id="logo-url"
                        value={localLogoUrl}
                        onChange={(e) => setLocalLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        type="url"
                    />
                    <p className="text-xs text-muted-foreground">
                        Pega la URL de un logo alojado en un servicio externo. Formatos: .png, .svg, .jpg
                    </p>
                    {localLogoUrl && (
                        <div className="mt-3 p-4 border rounded-lg bg-muted/30">
                            <p className="text-xs font-medium mb-2">Vista previa:</p>
                            <img 
                                src={localLogoUrl} 
                                alt="Logo preview" 
                                className="h-16 w-auto object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            <p className="text-xs text-destructive mt-2 hidden">
                                ⚠️ No se pudo cargar la imagen. Verifica la URL.
                            </p>
                        </div>
                    )}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="login-image-url">URL de Imagen de Login</Label>
                    <Input
                        id="login-image-url"
                        value={localLoginImageUrl}
                        onChange={(e) => setLocalLoginImageUrl(e.target.value)}
                        placeholder="https://example.com/background.jpg"
                        type="url"
                    />
                     <p className="text-xs text-muted-foreground">
                        Imagen de fondo para la página de login. Formatos: .jpg, .png, .webp
                    </p>
                    {localLoginImageUrl && (
                        <div className="mt-3 p-4 border rounded-lg bg-muted/30">
                            <p className="text-xs font-medium mb-2">Vista previa:</p>
                            <img 
                                src={localLoginImageUrl} 
                                alt="Login image preview" 
                                className="h-32 w-auto object-cover rounded"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            <p className="text-xs text-destructive mt-2 hidden">
                                ⚠️ No se pudo cargar la imagen. Verifica la URL.
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <Label>Color Principal (Acento)</Label>
                    <p className="text-xs text-muted-foreground">Este color se usará en botones, enlaces y otros elementos interactivos. Haz clic en "Guardar Cambios" para aplicar.</p>
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
                            maxLength={7}
                            placeholder="#000000"
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" className="w-full">Vista previa del botón</Button>
                    </div>
                </div>
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
