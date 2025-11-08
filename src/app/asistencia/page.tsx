
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Esta página redirige a la subruta correcta para evitar una página vacía.
export default function AsistenciaRedirectPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/asistencia/estudiantes');
    }, [router]);

    return null;
}
