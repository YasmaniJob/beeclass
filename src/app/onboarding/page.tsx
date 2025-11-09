'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppConfig } from '@/hooks/use-app-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Nivel } from '@/lib/definitions';
import { GraduationCap, Building2, Sparkles, CheckCircle2 } from 'lucide-react';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export default function OnboardingPage() {
  const router = useRouter();
  const { saveConfig, nivelInstitucion, institutionName, appName } = useAppConfig();
  
  const [step, setStep] = useState(1);
  const [selectedNivel, setSelectedNivel] = useState<Nivel>(nivelInstitucion || 'Primaria');
  const [selectedInstitution, setSelectedInstitution] = useState(institutionName || '');
  const [selectedAppName, setSelectedAppName] = useState(appName || 'Beeclass');

  // Verificar si ya completó el onboarding
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
      if (completed === 'true') {
        router.push('/');
      }
    }
  }, [router]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    // Guardar configuración
    saveConfig({
      appName: selectedAppName,
      institutionName: selectedInstitution,
      nivelInstitucion: selectedNivel,
      themeColor: '#59AB45', // Color por defecto
      logoUrl: '',
      loginImageUrl: '',
    });

    // Marcar onboarding como completado
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    }

    // Redirigir al dashboard
    router.push('/');
  };

  const canProceedStep2 = selectedNivel && selectedNivel.trim() !== '';
  const canProceedStep3 = selectedInstitution.trim() !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Configuración Inicial</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              Paso {step} de {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Paso 1: Bienvenida */}
          {step === 1 && (
            <div className="space-y-6 py-8 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-6">
                  <GraduationCap className="h-16 w-16 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">¡Bienvenido a Beeclass!</h2>
                <CardDescription className="text-base">
                  Vamos a configurar tu institución educativa en solo unos pasos.
                  <br />
                  Esto te tomará menos de 2 minutos.
                </CardDescription>
              </div>
              <div className="flex justify-center pt-4">
                <Button onClick={handleNext} size="lg" className="px-8">
                  Comenzar
                </Button>
              </div>
            </div>
          )}

          {/* Paso 2: Nivel Educativo */}
          {step === 2 && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Nivel Educativo</h2>
                <CardDescription>
                  Selecciona el nivel educativo principal de tu institución.
                  Esto determinará las áreas curriculares disponibles.
                </CardDescription>
              </div>

              <div className="space-y-4">
                <Label htmlFor="nivel" className="text-base">
                  Nivel Educativo <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedNivel} onValueChange={(v) => setSelectedNivel(v as Nivel)}>
                  <SelectTrigger id="nivel" className="h-12">
                    <SelectValue placeholder="Selecciona un nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inicial">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Inicial</span>
                        <span className="text-xs text-muted-foreground">3 a 5 años</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Primaria">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Primaria</span>
                        <span className="text-xs text-muted-foreground">1° a 6° grado</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Secundaria">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Secundaria</span>
                        <span className="text-xs text-muted-foreground">1° a 5° año</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-4">
                <Button onClick={handleBack} variant="outline">
                  Atrás
                </Button>
                <Button onClick={handleNext} disabled={!canProceedStep2}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Paso 3: Información Básica */}
          {step === 3 && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Información Básica</h2>
                <CardDescription>
                  Personaliza el nombre de tu institución y la aplicación.
                </CardDescription>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="institution" className="text-base">
                    Nombre de la Institución <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="institution"
                      value={selectedInstitution}
                      onChange={(e) => setSelectedInstitution(e.target.value)}
                      placeholder="Ej: I.E. San José"
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appname" className="text-base">
                    Nombre de la Aplicación (opcional)
                  </Label>
                  <Input
                    id="appname"
                    value={selectedAppName}
                    onChange={(e) => setSelectedAppName(e.target.value)}
                    placeholder="Beeclass"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este nombre aparecerá en la barra lateral y en los reportes.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button onClick={handleBack} variant="outline">
                  Atrás
                </Button>
                <Button onClick={handleNext} disabled={!canProceedStep3}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {step === 4 && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Confirmación</h2>
                <CardDescription>
                  Revisa tu configuración antes de comenzar.
                </CardDescription>
              </div>

              <div className="space-y-4 rounded-lg border bg-muted/50 p-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Nivel Educativo</p>
                  <p className="text-lg font-semibold">{selectedNivel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Institución</p>
                  <p className="text-lg font-semibold">{selectedInstitution}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Nombre de la Aplicación</p>
                  <p className="text-lg font-semibold">{selectedAppName}</p>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Puedes cambiar esto después</p>
                    <p className="text-xs text-muted-foreground">
                      Todas estas configuraciones se pueden modificar desde Ajustes → Personalización.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button onClick={handleBack} variant="outline">
                  Atrás
                </Button>
                <Button onClick={handleComplete} size="lg" className="px-8">
                  Comenzar a usar la aplicación
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
