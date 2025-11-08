
'use client';

import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NotaCualitativa } from "@/lib/definitions";

interface NotaBadgeProps extends BadgeProps {
    nota: NotaCualitativa | string | null | undefined;
    clickable?: boolean;
}

export function NotaBadge({ nota, clickable = false, className, ...props }: NotaBadgeProps) {
    if (!nota || nota === '-') {
        return <span className={cn("text-muted-foreground font-semibold text-center w-12 h-7 flex items-center justify-center", className)}>-</span>;
    }

    const colors: Record<NotaCualitativa, string> = {
        AD: 'text-blue-600 border-blue-500/50',
        A: 'text-green-600 border-green-500/50',
        B: 'text-yellow-600 border-yellow-500/50',
        C: 'text-red-600 border-red-500/50',
    };

    const badgeClasses = cn(
        "w-12 h-7 justify-center rounded-md text-sm bg-transparent border",
        colors[nota as NotaCualitativa] || 'border-gray-400 text-gray-500',
        clickable && 'cursor-pointer',
        className
    );
    
    // Si es clickeable, usamos un button, si no un span/div (Badge lo hace)
    if (clickable && props.onClick) {
        return (
            <button onClick={props.onClick} className={badgeClasses} {...props}>
                {nota}
            </button>
        );
    }

    return (
        <Badge variant="outline" className={badgeClasses} {...props}>
            {nota}
        </Badge>
    );
}

