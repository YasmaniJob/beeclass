
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { LayoutDashboard, BookUser, Siren, Menu, CalendarClock, CheckCheck, LineChart, ListChecks } from 'lucide-react';
import { useSidebar } from './sidebar';
import { DocenteRol } from '@/domain/entities/Docente';

type AppRole = DocenteRol | 'Admin' | 'Director' | 'Sub-director' | 'Coordinador' | 'Auxiliar';

interface NavItem {
    href: string;
    icon: React.ElementType;
    label: string;
    roles: AppRole[];
}

const allMobileItems: NavItem[] = [
    // --- Items para Admin/Director/Auxiliar ---
    { href: "/", icon: LayoutDashboard, label: "Dashboard", roles: ['Admin', 'Director', 'Sub-director', 'Coordinador', 'Auxiliar'] },
    { href: "/asistencia/estudiantes", icon: ListChecks, label: "Asistencia", roles: ['Admin', 'Director', 'Sub-director', 'Coordinador', 'Auxiliar'] },
    { href: "/incidentes", icon: Siren, label: "Incidentes", roles: ['Admin', 'Director', 'Sub-director', 'Coordinador', 'Auxiliar'] },
    { href: "/reportes", icon: LineChart, label: "Reportes", roles: ['Admin', 'Director', 'Sub-director', 'Coordinador', 'Auxiliar'] },
    
    // --- Items para Docente ---
    { href: "/docentes/mis-clases", icon: BookUser, label: "Mis Clases", roles: ['Docente'] },
    { href: "/docentes/mi-horario", icon: CalendarClock, label: "Mi Horario", roles: ['Docente'] },
    { href: "/incidentes", icon: Siren, label: "Incidentes", roles: ['Docente'] },
    { href: "/evaluaciones", icon: CheckCheck, label: "Evaluar", roles: ['Docente'] },
];

export function BottomNavigation() {
    const { isMobile, isMounted } = useIsMobile();
    const { user } = useCurrentUser();
    const pathname = usePathname();
    const { toggleSidebar } = useSidebar();

    const navItems = useMemo(() => {
        if (!user) return [];
        return allMobileItems.filter(item => item.roles.includes(user.rol));
    }, [user]);

    if (!isMounted || !isMobile || !user) {
        return null;
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-t-lg z-40">
            <nav className="h-full">
                <ul className="flex justify-around items-center h-full">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === '/' ? href === '/' : (href !== '/' && pathname.startsWith(href));
                        return (
                             <li key={href} className="h-full">
                                <Link href={href} className="flex flex-col items-center justify-center h-full w-16 text-center">
                                    <Icon className={cn("h-6 w-6 transition-colors", isActive ? 'text-primary' : 'text-muted-foreground')} />
                                    <span className={cn("text-xs transition-colors mt-0.5", isActive ? 'text-primary font-semibold' : 'text-muted-foreground')}>
                                        {label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                     <li className="h-full">
                        <button onClick={toggleSidebar} className="flex flex-col items-center justify-center h-full w-16 text-center">
                             <Menu className="h-6 w-6 text-muted-foreground" />
                             <span className="text-xs text-muted-foreground mt-0.5">Menú</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}
