'use client';

import { useEffect } from 'react';
import { useAppConfig } from '@/hooks/use-app-config';

export function DynamicManifest() {
  const { themeColor, isLoaded } = useAppConfig();

  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;

    // Solo actualizar theme-color dinámicamente
    // El manifest se mantiene estático en /public/manifest.json
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = themeColor;
  }, [themeColor, isLoaded]);

  return null;
}
