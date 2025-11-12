'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressToastProps {
  title: string;
  current: number;
  total: number;
  currentItem?: string;
  status: 'processing' | 'success' | 'error';
  onClose?: () => void;
  errorMessage?: string;
}

export function ProgressToast({
  title,
  current,
  total,
  currentItem,
  status,
  onClose,
  errorMessage,
}: ProgressToastProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const newProgress = total > 0 ? (current / total) * 100 : 0;
    setProgress(newProgress);
  }, [current, total]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return (
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200';
      case 'error':
        return 'bg-destructive/10 border-destructive/20';
      default:
        return 'bg-background border-border';
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 w-96 rounded-lg border shadow-lg p-4 transition-all',
        getStatusColor()
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{title}</h3>
            {status === 'processing' && currentItem && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {currentItem}
              </p>
            )}
            {status === 'error' && errorMessage && (
              <p className="text-xs text-destructive mt-0.5">{errorMessage}</p>
            )}
          </div>
        </div>
        {onClose && status !== 'processing' && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {current} de {total}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
