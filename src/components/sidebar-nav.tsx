"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type SVGProps } from "react";
import { usePathname } from "next/navigation";
import {
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  SquareCheckBig,
  ChevronDown,
  LogOut,
  Loader2,
  PanelLeftClose,
  PanelRightOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { menuItems } from "@/lib/menu-config";
import { useAppConfig } from "@/hooks/use-app-config";
import { useCurrentUser } from "@/hooks/use-current-user";
import { SidebarUser } from "./sidebar-user";
import { SidebarNavSkeleton } from "./sidebar-nav-skeleton";

type SectionItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  children?: Array<{ href: string; label: string; isActive: boolean }>;
};

type MenuSection = {
  title: string;
  items: SectionItem[];
};

const SECTION_ORDER: MenuSection["title"][] = ["General", "Docente", "Gestión"];

function resolveSectionTitle(item: (typeof menuItems)[number]): MenuSection["title"] {
  if (item.teacherOnly) return "Docente";
  if (
    item.adminOnly ||
    item.auxiliarOrAdminOnly ||
    item.directorOrAdminOnly ||
    item.directorCoordinatorAdminOnly
  ) {
    return "Gestión";
  }
  return "General";
}

interface RoleFlags {
  isAdmin: boolean;
  isAuxiliar: boolean;
  isTeacher: boolean;
  isDirector: boolean;
  isCoordinador: boolean;
  isSubDirector: boolean;
  hasAsignaciones: boolean;
}

function canAccess(item: { href?: string; adminOnly?: boolean; auxiliarOrAdminOnly?: boolean; teacherOnly?: boolean; directorOrAdminOnly?: boolean; directorCoordinatorAdminOnly?: boolean }, roles: RoleFlags) {
  if (item.adminOnly && !roles.isAdmin) return false;
  if (item.auxiliarOrAdminOnly && !(roles.isAdmin || roles.isAuxiliar)) return false;
  if (item.teacherOnly && !roles.isTeacher) return false;
  if (item.directorOrAdminOnly && !(roles.isAdmin || roles.isDirector || roles.isAuxiliar || roles.isSubDirector || roles.isCoordinador)) {
    return false;
  }
  if (item.directorCoordinatorAdminOnly && !(roles.isAdmin || roles.isDirector || roles.isSubDirector || roles.isCoordinador)) {
    return false;
  }
  if (item.href === "/asistencia/aula" && !roles.hasAsignaciones) return false;
  return true;
}

function buildMenuSections(pathname: string, roles: RoleFlags): MenuSection[] {
  const sections = new Map<MenuSection["title"], SectionItem[]>();

  menuItems.forEach((item) => {
    if (!canAccess(item, roles)) return;

    const sectionTitle = resolveSectionTitle(item);
    const children = (item.subItems || [])
      .filter((sub) => canAccess(sub, roles))
      .map((sub) => ({
        href: sub.href,
        label: sub.label,
        isActive: pathname === sub.href || pathname.startsWith(sub.href + '/'),
      }));

    // Lógica especial para asistencia que tiene rutas dinámicas como /asistencia/[grado]/[seccion]
    const isAsistenciaRoute = item.href.startsWith('/asistencia') && 
                              pathname.startsWith('/asistencia') &&
                              !pathname.startsWith('/asistencia/aula'); // Excluir asistencia de aula
    
    const isActive = children.length
      ? children.some((child) => child.isActive)
      : pathname === item.href || 
        isAsistenciaRoute ||
        (!!item.href && item.href !== "/" && pathname.startsWith(item.href + '/'));

    const entry: SectionItem = {
      href: item.href,
      label: item.label,
      icon: item.icon,
      isActive,
      children: children.length ? children : undefined,
    };

    const current = sections.get(sectionTitle) ?? [];
    current.push(entry);
    sections.set(sectionTitle, current);
  });

  return SECTION_ORDER.filter((title) => sections.has(title)).map((title) => ({
    title,
    items: sections.get(title)!,
  }));
}

export function SidebarNav() {
  const pathname = usePathname();
  const { state, setOpen, open, isMounted } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { appName, institutionName, nivelInstitucion, isLoaded: isConfigLoaded } = useAppConfig();
  const { user, logout, isLoaded: isUserLoaded } = useCurrentUser();

  const rol = user?.rol ?? "";
  const hasAsignaciones = Boolean(user?.asignaciones?.length);

  const roleFlags = useMemo<RoleFlags>(
    () => ({
      isAdmin: rol === "Admin",
      isAuxiliar: rol === "Auxiliar",
      isTeacher: rol === "Docente",
      isDirector: rol === "Director",
      isCoordinador: rol === "Coordinador",
      isSubDirector: rol === "Sub-director",
      hasAsignaciones,
    }),
    [rol, hasAsignaciones],
  );

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const forcedExpandRef = useRef(false);

  useEffect(() => {
    if (!forcedExpandRef.current && isCollapsed) {
      setOpen(true);
      forcedExpandRef.current = true;
    }
  }, [isCollapsed, setOpen]);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (!item.subItems?.length) return;
      if (!canAccess(item, roleFlags)) return;
      const hasActiveChild = item.subItems.some(
        (sub) => pathname.startsWith(sub.href) && canAccess(sub, roleFlags)
      );
      if (hasActiveChild) {
        initial[item.href] = true;
      }
    });
    setExpandedGroups((prev) => {
      let changed = false;
      const next = { ...prev } as Record<string, boolean>;
      Object.entries(initial).forEach(([key, value]) => {
        if (next[key] !== value) {
          next[key] = value;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [pathname, roleFlags]);

  const sections = useMemo(
    () => buildMenuSections(pathname, roleFlags),
    [pathname, roleFlags]
  );
  const showSkeleton = !isMounted || !isUserLoaded || (!isConfigLoaded && !user);
  const institutionLabel = institutionName?.trim() || nivelInstitucion || "Institución educativa";
  const showNivelBadge = Boolean(nivelInstitucion && nivelInstitucion !== institutionLabel);
  const prioritizedItems = useMemo(() => {
    const orderedLabels = ["dashboard", "asistencia general", "mi asistencia", "mis clases", "mi horario"];
    const priorityMap = new Map(orderedLabels.map((label, index) => [label, index]));

    return sections
      .flatMap((section) => section.items)
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const priorityA = priorityMap.get(a.item.label.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
        const priorityB = priorityMap.get(b.item.label.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        return a.index - b.index;
      })
      .map(({ item }) => item);
  }, [sections]);

  if (showSkeleton || !user) {
    return <SidebarNavSkeleton />;
  }

  const brandLinkClasses = cn(
    "flex min-w-0 items-center gap-3 rounded-xl border border-sidebar-border/40 px-3 py-2 text-left transition-colors",
    "hover:border-sidebar-accent hover:bg-sidebar-accent/15",
    isCollapsed ? "h-10 w-10 flex-none justify-center border-transparent p-0" : "flex-1"
  );

  const brandIconClasses = cn(
    "flex items-center justify-center rounded-lg",
    isCollapsed ? "size-8 text-sidebar-foreground" : "size-10 bg-primary/15 text-primary"
  );

  const menuButtonClasses = cn(
    "w-full justify-start gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
    "hover:bg-sidebar-accent/15 hover:text-sidebar-foreground",
    "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
    isCollapsed && "h-11 w-11 justify-center gap-0 rounded-lg bg-transparent p-0 text-sidebar-foreground hover:bg-sidebar-accent/30"
  );

  const childLinkClasses = cn(
    "block rounded-lg px-3 py-1.5 text-sm transition-colors",
    "hover:bg-sidebar-accent/15 hover:text-sidebar-foreground"
  );

  return (
    <div className="flex h-full flex-col border border-sidebar-border/60 bg-sidebar text-sidebar-foreground shadow-lg transition-all duration-200">
      <SidebarHeader className="border-none px-5 pb-3 pt-7 group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:pb-3 group-data-[collapsible=icon]:pt-4">
        <Link href="/" className={brandLinkClasses}>
          <div className={brandIconClasses}>
            <SquareCheckBig className={cn("h-6 w-6", isCollapsed && "h-5 w-5 text-sidebar-foreground")} />
          </div>
          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">{appName}</p>
                <span className="truncate text-xs text-muted-foreground leading-tight">{institutionLabel}</span>
              </div>
              {showNivelBadge && (
                <Badge variant="outline" className="ml-auto hidden text-[10px] font-medium uppercase tracking-wide md:inline-flex">
                  {nivelInstitucion}
                </Badge>
              )}
            </>
          )}
        </Link>
      </SidebarHeader>

      <ScrollArea className="flex-1 px-4 pb-8 pt-1.5 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pb-5 group-data-[collapsible=icon]:pt-2">
        {showSkeleton ? (
          <SidebarNavSkeleton />
        ) : (
          <SidebarMenu className="flex flex-col gap-2 px-0 group-data-[collapsible=icon]:gap-1.5">
            {prioritizedItems.map((item) => {
              const hasChildren = Boolean(item.children?.length);

              if (!hasChildren) {
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={item.label}
                      className={menuButtonClasses}
                    >
                      <Link href={item.href} className="flex flex-1 items-center gap-3">
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <SidebarMenuItem key={item.href}>
                  <Collapsible
                    open={expandedGroups[item.href] ?? false}
                    onOpenChange={(open) => setExpandedGroups((prev) => ({ ...prev, [item.href]: open }))}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={item.isActive}
                        className={cn(menuButtonClasses, "justify-between")}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform group-data-[collapsible=icon]:hidden",
                            expandedGroups[item.href] ? "rotate-180" : "rotate-0"
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                      <div className="space-y-1 py-1 pl-11 pr-2">
                        {item.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              childLinkClasses,
                              child.isActive
                                ? "bg-sidebar-accent/60 text-sidebar-accent-foreground"
                                : "hover:bg-sidebar-accent/30"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        )}
      </ScrollArea>

      <SidebarFooter className="mt-auto border-none px-4 pb-7 pt-5 group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:pb-4 group-data-[collapsible=icon]:pt-3">
        <SidebarMenu className="w-full gap-2 px-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={open ? "Colapsar menú" : "Expandir menú"}
              className={cn(
                "gap-3 rounded-xl bg-sidebar-accent/30 px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/50",
                isCollapsed &&
                  "mx-auto size-11 items-center justify-center rounded-xl bg-transparent p-0 hover:bg-sidebar-accent/40"
              )}
              onClick={() => setOpen(!open)}
            >
              {open ? <PanelLeftClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
              <span className="group-data-[collapsible=icon]:hidden">{open ? "Colapsar" : "Expandir"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarUser />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              disabled={isLoggingOut}
              className={cn(
                "gap-3 rounded-xl bg-sidebar-accent/40 px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/60",
                "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:bg-muted group-data-[collapsible=icon]:p-0"
              )}
              onClick={async () => {
                if (isLoggingOut) return;
                setIsLoggingOut(true);
                try {
                  await logout();
                } catch (error) {
                  console.error("Error al cerrar sesión", error);
                } finally {
                  setIsLoggingOut(false);
                }
              }}
            >
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}
              <span className="group-data-[collapsible=icon]:hidden">Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </div>
  );
}
