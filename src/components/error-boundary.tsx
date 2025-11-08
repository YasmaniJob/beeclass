'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report error to Sentry if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      Sentry.withScope((scope) => {
        scope.setExtra('componentStack', errorInfo.componentStack);
        Sentry.captureException(error);
      });
    }

    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-destructive/10 rounded-full p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <h2 className="text-xl font-semibold mb-2">Algo salió mal</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Ha ocurrido un error inesperado. El equipo ha sido notificado y estamos trabajando para solucionarlo.
      </p>

      {process.env.NODE_ENV === 'development' && error && (
        <details className="mb-4 p-4 bg-muted rounded-md text-sm max-w-2xl w-full">
          <summary className="cursor-pointer font-medium">Detalles del error (desarrollo)</summary>
          <pre className="mt-2 text-xs overflow-auto">{error.message}</pre>
          {error.stack && (
            <pre className="mt-2 text-xs overflow-auto text-muted-foreground">
              {error.stack}
            </pre>
          )}
        </details>
      )}

      <div className="flex gap-2">
        <Button onClick={resetError} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
        <Button onClick={() => window.location.href = '/'} className="gap-2">
          <Home className="h-4 w-4" />
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}

// Hook para usar error boundaries en componentes funcionales
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
