'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImportProgressModalProps {
  isOpen: boolean;
  title: string;
  current: number;
  total: number;
  status: 'processing' | 'success' | 'error';
  onClose?: () => void;
  errorMessage?: string;
}

export function ImportProgressModal({
  isOpen,
  title,
  current,
  total,
  status,
  onClose,
  errorMessage,
}: ImportProgressModalProps) {
  const [progress, setProgress] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(0);

  useEffect(() => {
    const newProgress = total > 0 ? (current / total) * 100 : 0;
    setProgress(newProgress);
  }, [current, total]);

  // Animación del contador
  useEffect(() => {
    if (displayedCount < current) {
      const timer = setTimeout(() => {
        setDisplayedCount(prev => Math.min(prev + 1, current));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [current, displayedCount]);

  // Generar iconos de personas para el efecto visual
  const totalIcons = 20;
  const filledIcons = Math.floor((progress / 100) * totalIcons);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-5 duration-300">
      {/* Modal - Contenido flotante en esquina inferior derecha */}
      <div className="w-96 max-h-[90vh] overflow-y-auto">
        <div className="bg-background rounded-lg shadow-2xl border p-6 space-y-4">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              {status === 'processing' && (
                <div className="relative">
                  <Users className="h-14 w-14 text-primary animate-pulse" />
                </div>
              )}
              {status === 'success' && (
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              )}
              {status === 'error' && (
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold">{title}</h3>
            
            {status === 'error' && errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>

          {/* Visualización de iconos (cajita llenándose) */}
          {status === 'processing' && (
              <div className="relative overflow-hidden rounded-lg">
                <div className="grid grid-cols-10 gap-1 p-3 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20 relative z-10">
                  {Array.from({ length: totalIcons }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'aspect-square rounded-sm transition-all duration-300',
                        index < filledIcons
                          ? 'bg-primary scale-100 opacity-100'
                          : 'bg-muted scale-75 opacity-30'
                      )}
                    />
                  ))}
                </div>
                
                {/* Efecto de onda */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-primary/10 transition-all duration-500 ease-out pointer-events-none"
                  style={{ height: `${progress}%` }}
                />
              </div>
            )}

          {/* Barra de progreso */}
          <div className="space-y-2">
              <Progress 
                value={progress} 
                className="h-2"
              />
              
              {/* Contador animado */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  Progreso
                </span>
                <span className="font-bold text-base tabular-nums">
                  {displayedCount} / {total}
                </span>
              </div>
              
              {/* Porcentaje */}
              <div className="text-center pt-1">
                <span className="text-2xl font-bold text-primary tabular-nums">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}
