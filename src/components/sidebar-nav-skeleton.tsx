'use client';

import { SidebarMenu, SidebarMenuSkeleton } from '@/components/ui/sidebar';

export function SidebarNavSkeleton() {
  return (
    <SidebarMenu className="gap-2 px-0">
      <SidebarMenuSkeleton showIcon />
      <SidebarMenuSkeleton showIcon />
      <SidebarMenuSkeleton showIcon />
    </SidebarMenu>
  );
}
