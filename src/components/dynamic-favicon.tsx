'use client';

import { useEffect } from 'react';
import { useAppConfig } from '@/hooks/use-app-config';

export function DynamicFavicon() {
  const { logoUrl, isLoaded } = useAppConfig();

  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;

    const updateFavicon = (iconUrl: string) => {
      // Remover favicons existentes
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(favicon => favicon.remove());

      // Crear nuevo favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = iconUrl;
      document.head.appendChild(link);

      // También crear apple-touch-icon
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = iconUrl;
      document.head.appendChild(appleLink);
    };

    if (logoUrl) {
      updateFavicon(logoUrl);
    } else {
      // Usar el SVG por defecto si no hay logo personalizado
      updateFavicon('/icon.svg');
    }
  }, [logoUrl, isLoaded]);

  return null;
}
