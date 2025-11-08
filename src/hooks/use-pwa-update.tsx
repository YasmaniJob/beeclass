
'use client';

import { useState, useEffect, useCallback } from 'react';

export const usePwaUpdate = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [wb, setWb] = useState<any>(null); // Almacenará la instancia de Workbox

    useEffect(() => {
        // Esta validación asegura que el código solo se ejecute en el navegador
        // y que el Service Worker haya sido registrado por la librería PWA.
        if (typeof window !== 'undefined' && 'workbox' in window) {
            const workbox = (window as any).workbox;
            setWb(workbox);

            const handleWaiting = () => {
                setUpdateAvailable(true);
            };

            // El evento 'waiting' es disparado por Workbox cuando un nuevo
            // Service Worker está instalado pero esperando para activarse.
            workbox.addEventListener('waiting', handleWaiting);

            // Limpieza del efecto: eliminar el listener cuando el componente se desmonte.
            return () => {
                workbox.removeEventListener('waiting', handleWaiting);
            };
        }
    }, []);

    const promptUpdate = useCallback(() => {
        if (!wb) return;

        // Le decimos al nuevo Service Worker que se salte la espera.
        // Esto hará que se active inmediatamente.
        wb.messageSkipWaiting();

        // Una vez que el nuevo SW está activo, recargamos la página para que
        // los nuevos recursos cacheados sean utilizados.
        // El listener 'controlling' asegura que la recarga ocurra solo después de que el nuevo SW tome el control.
        wb.addEventListener('controlling', () => {
            window.location.reload();
        });

    }, [wb]);

    return { updateAvailable, promptUpdate };
};
