
'use client';

import { usePwaUpdate } from '@/hooks/use-pwa-update';
import { Toast, ToastAction, ToastDescription, ToastTitle } from '@/components/ui/toast';
import { Rocket } from 'lucide-react';

export function PwaUpdateNotification() {
  const { updateAvailable, promptUpdate } = usePwaUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <Toast open={updateAvailable} onOpenChange={() => {}} duration={Infinity}>
        <div className="grid gap-1">
            <ToastTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                ¡Actualización Disponible!
            </ToastTitle>
            <ToastDescription>
                Hay una nueva versión de la aplicación lista. Recarga para obtener las últimas mejoras.
            </ToastDescription>
        </div>
        <ToastAction altText="Actualizar" onClick={promptUpdate}>
            Actualizar
        </ToastAction>
    </Toast>
  );
}
