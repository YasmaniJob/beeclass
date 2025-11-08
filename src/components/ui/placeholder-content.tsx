import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PlaceholderContentProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function PlaceholderContent({
  icon: Icon,
  title,
  description,
  className,
  ...props
}: PlaceholderContentProps) {
  return (
    <div
      className={cn(
        "text-center py-16 border-2 border-dashed rounded-lg",
        className
      )}
      {...props}
    >
      <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
