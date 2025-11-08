
'use client';

import { useAppConfig } from '@/hooks/use-app-config';

export function AppName() {
    const { appName } = useAppConfig();
    return <span className="group-data-[collapsible=icon]:hidden">{appName}</span>
}
