
'use client';

import { AuthGuard } from "@/components/auth-guard";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceholderContent } from "@/components/ui/placeholder-content";
import { AlertTriangle } from "lucide-react";

export default function AjustesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.rol !== 'Admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.rol !== 'Admin') {
    return (
        <AuthGuard>
            <Card>
                <CardContent className="p-10">
                    <PlaceholderContent
                        icon={AlertTriangle}
                        title="Acceso Denegado"
                        description="No tienes permiso para acceder a esta sección."
                    />
                </CardContent>
            </Card>
        </AuthGuard>
    );
  }
  
  return (
    <AuthGuard>
      <div className="space-y-8">
        <main>
            {children}
        </main>
      </div>
    </AuthGuard>
  );
}
