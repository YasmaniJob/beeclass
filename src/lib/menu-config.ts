
'use client';
import type { LucideIcon } from "lucide-react";
import { Users, GraduationCap, CheckCheck, ClipboardCheck, FileLock, Accessibility, AlertTriangle, Settings, Siren, DoorOpen, LayoutDashboard, BookUser, LibraryBig, BookCopy, LineChart, ListChecks, CalendarClock } from "lucide-react";

interface SubMenuItem {
    href: string;
    label: string;
    adminOnly?: boolean;
    auxiliarOrAdminOnly?: boolean;
    teacherOnly?: boolean;
    directorOrAdminOnly?: boolean;
    directorCoordinatorAdminOnly?: boolean;
}
export interface MenuItem {
    href: string;
    icon: LucideIcon;
    label: string;
    subItems?: SubMenuItem[];
    adminOnly?: boolean;
    auxiliarOrAdminOnly?: boolean;
    teacherOnly?: boolean;
    directorOrAdminOnly?: boolean;
    directorCoordinatorAdminOnly?: boolean;
}

export const menuItems: MenuItem[] = [
    { 
        href: "/", 
        icon: LayoutDashboard, 
        label: "Dashboard",
    },
    {
        href: '/asistencia/estudiantes',
        icon: ListChecks,
        label: 'Asistencia General',
        directorOrAdminOnly: true,
        subItems: [
            {
                href: "/asistencia/estudiantes",
                label: "Registro de Asistencia",
            },
            { href: "/asistencia/personal", label: "Asistencia de Personal", directorOrAdminOnly: true },
        ]
    },
    {
        href: '/asistencia/estudiantes',
        icon: ListChecks,
        label: 'Mi Asistencia',
        teacherOnly: true,
    },
    {
        href: '/registros',
        icon: LibraryBig,
        label: 'Registros',
        auxiliarOrAdminOnly: true,
    },
    {
        href: '/registros',
        icon: LibraryBig,
        label: 'Registros',
        teacherOnly: true,
    },
    { href: "/docentes/mis-clases", icon: BookUser, label: "Mis Clases", teacherOnly: true },
    { href: "/docentes/mi-horario", icon: CalendarClock, label: "Mi Horario", teacherOnly: true },
    { href: "/estudiantes", icon: GraduationCap, label: "Estudiantes", adminOnly: true },
    { href: "/docentes", icon: Users, label: "Personal", adminOnly: true },
    { href: "/carga-academica", icon: BookCopy, label: "Carga Académica", adminOnly: true },
    { 
        href: "/evaluaciones", 
        icon: CheckCheck, 
        label: "Consolidado Transversal", 
        directorCoordinatorAdminOnly: true 
    },
    { href: "/incidentes", icon: Siren, label: "Incidentes" },
    { href: "/permisos", icon: FileLock, label: "Permisos" },
    { href: "/nee", icon: Accessibility, label: "NEE" },
    { href: "/en-riesgo", icon: AlertTriangle, label: "En Riesgo", auxiliarOrAdminOnly: true },
    { href: "/reportes", icon: LineChart, label: "Reportes", directorOrAdminOnly: true },
    { 
        href: "/ajustes",
        icon: Settings, 
        label: "Ajustes",
        adminOnly: true,
        subItems: [
            { href: "/ajustes/personalizacion", label: "Personalización" },
            { href: "/ajustes/gestion-curricular", label: "Áreas Curriculares" },
            { href: "/ajustes/periodos-evaluacion", label: "Períodos de Evaluación" },
            { href: "/ajustes/riesgo", label: "Criterios de Riesgo" },
            { href: "/ajustes/incidentes", label: "Incidentes Comunes" },
            { href: "/ajustes/horas-pedagogicas", label: "Horas Pedagógicas" },
            { href: "/ajustes/otros", label: "Más Ajustes" },
        ]
    },
];


