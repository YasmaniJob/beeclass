
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderContent } from '../ui/placeholder-content';
import { BarChartIcon } from 'lucide-react';

interface ChartItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface ReporteAsistenciaChartProps {
  data: ChartItem[];
}

export function ReporteAsistenciaChart({ data }: ReporteAsistenciaChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución de estados</CardTitle>
        </CardHeader>
        <CardContent>
          <PlaceholderContent
            icon={BarChartIcon}
            title="No hay datos para mostrar"
            description="Ajusta los filtros para visualizar tendencias de asistencia."
            className="py-10"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de estados</CardTitle>
        <CardDescription>Comparativa de asistencia efectiva, tardanzas y faltas frente al total registrado.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                formatter={(value: number, name, props) => [
                  `${value} registros`,
                  `${props.payload.percentage}% (${props.payload.label})`,
                ]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map(item => (
                  <Cell key={item.label} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 text-sm text-muted-foreground">
          {data.map(item => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-muted/40 bg-muted/30 px-3 py-2">
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

