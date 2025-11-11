
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { menuItems, MenuItem } from '@/lib/menu-config';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useSesiones } from '@/hooks/use-sesiones';
import { useMatriculaData } from '@/hooks/use-matricula-data';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const findLabelInMenu = (href: string, menu: MenuItem[]): string | null => {
    for (const item of menu) {
        if (item.href === href) return item.label;
        if (item.subItems) {
            const subItem = item.subItems.find(sub => sub.href === href);
            if (subItem) return subItem.label;
        }
    }
    return null;
}

const Breadcrumb = () => {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { getSesionById } = useSesiones();
  const { areas } = useMatriculaData();
  
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    return null;
  }

  let breadcrumbs: BreadcrumbItem[] = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    let label = decodeURIComponent(segment);
    
    const staticLabel = findLabelInMenu(href, menuItems);
    if (staticLabel) {
        label = staticLabel;
    } else {
        // Handle dynamic segments
        const parentPath = `/${pathSegments.slice(0, index).join('/')}`;
        if (parentPath.startsWith('/evaluaciones')) {
            if (index === 1) label = `Grado: ${decodeURIComponent(segment)}`;
            if (index === 2) label = `Sección: ${decodeURIComponent(segment)}`;
            if (index === 3) {
                const area = areas.find(a => a.id === decodeURIComponent(segment));
                label = area?.nombre || 'Área';
            }
            if (index === 4) {
                 const sesion = getSesionById(decodeURIComponent(segment));
                 label = sesion?.titulo || 'Sesión';
            }
        } else if (parentPath.startsWith('/estudiantes')) {
            if (index === 1) label = `Grado: ${decodeURIComponent(segment)}`;
            if (index === 2) label = `Sección: ${decodeURIComponent(segment)}`;
        } else if (parentPath.startsWith('/asistencia')) {
             if (index === 1 && segment === 'aula') {
                label = 'Asistencia de Aula';
             } else if (index === 1) {
                label = `Grado: ${decodeURIComponent(segment)}`;
             }
             if (index === 2) {
                label = `Sección: ${decodeURIComponent(segment)}`;
             }
        } else {
             label = label.charAt(0).toUpperCase() + label.slice(1);
        }
    }
    
    return { href, label };
  });
  
  // Teacher-specific override for evaluations
  if (user?.rol === 'Docente' && pathname.startsWith('/evaluaciones')) {
      const misClasesCrumb = { href: '/docentes/mis-clases', label: 'Mis Clases y Áreas' };
      breadcrumbs = [misClasesCrumb, ...breadcrumbs.slice(1)];
  }


  if (breadcrumbs.length <= 1) {
    const rootItem = menuItems.find(item => item.href === pathname);
    if(rootItem && !rootItem.subItems) return null;
  }

  const showBackButton = pathname.startsWith('/estudiantes/') && pathSegments.length >= 3;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <div className="flex items-center justify-between">
        <ol className="flex items-center space-x-1.5 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => {
            // Determinar si este breadcrumb debe ser un enlace
            const isLast = index === breadcrumbs.length - 1;
            const isGradoInEstudiantes = pathname.startsWith('/estudiantes') && index === 1;
            const isGradoBreadcrumb = crumb.label.startsWith('Grado:');
            const shouldBeLink = !isLast && !isGradoInEstudiantes && !isGradoBreadcrumb;
            
            return (
              <li key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4" />}
                
                {shouldBeLink ? (
                    <Link
                        href={crumb.href}
                        className={cn('ml-1.5 hover:text-foreground')}
                    >
                        {crumb.label}
                    </Link>
                ) : (
                    <span className={cn('ml-1.5', isLast && 'font-medium text-foreground')}>
                        {crumb.label}
                    </span>
                )}
              </li>
            );
          })}
        </ol>
        
        {showBackButton && (
          <Link
            href="/estudiantes"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <span>← Volver</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Breadcrumb;
