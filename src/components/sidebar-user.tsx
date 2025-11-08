
'use client';

import { useCurrentUser } from "@/hooks/use-current-user";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SidebarMenuButton } from "./ui/sidebar";
import { Tooltip, TooltipContent } from "./ui/tooltip";

export function SidebarUser() {
    const { user } = useCurrentUser();

    if (!user) {
        return null;
    }

    const fullName = user.nombreCompleto;
    const role = user.rol;
    const identification = user.identificacionCompleta;
    const initials = fullName
        .replace(/[,]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('') || role.charAt(0).toUpperCase();

    return (
        <SidebarMenuButton
            asChild
            tooltip={{
                children: (
                    <>
                        <p className="font-semibold">{fullName}</p>
                        <p className="text-muted-foreground">{role}</p>
                        <p className="text-xs text-muted-foreground">{identification}</p>
                    </>
                ),
                side: "right",
                align: "center",
                className: "group-data-[collapsible=icon]:block hidden"
            }}
            className="h-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
        >
            <div className="flex items-center gap-3">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium leading-tight truncate">{fullName}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{role}</span>
                </div>
            </div>
        </SidebarMenuButton>
    );
}
