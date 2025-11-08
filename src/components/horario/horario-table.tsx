
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HorarioMap } from "@/hooks/use-horario";
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';

interface HorarioTableProps {
    horario: HorarioMap;
    horas: { id: string; nombre: string }[];
    dias: string[];
    onCellClick: (dia: string, horaId: string) => void;
    currentTimeInfo: { dia: string, horaId: string | null };
}

export function HorarioTable({ horario, horas, dias, onCellClick, currentTimeInfo }: HorarioTableProps) {
    const { isMobile } = useIsMobile();
    const [selectedDay, setSelectedDay] = useState(currentTimeInfo.dia || dias[0]);
    
    const renderDesktopView = () => (
        <div className="border rounded-lg overflow-hidden">
            <Table className="min-w-full border-separate border-spacing-0">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[120px] text-center font-bold sticky left-0 z-20 bg-card border-b">Hora</TableHead>
                        {dias.map(dia => (
                            <TableHead 
                                key={dia} 
                                className={cn(
                                    "text-center font-bold min-w-[150px] border-b border-l transition-colors",
                                    currentTimeInfo.dia === dia && "bg-primary/10"
                                )}
                            >
                                {dia}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {horas.map(hora => (
                        <TableRow key={hora.id}>
                            <TableCell className={cn(
                                "font-semibold text-center sticky left-0 z-20 bg-card border-t transition-colors",
                                currentTimeInfo.horaId === hora.id && "bg-primary/10"
                            )}>
                                {hora.nombre}
                            </TableCell>
                            {dias.map(dia => {
                                const key = `${dia}-${hora.id}`;
                                const cellData = horario.get(key);
                                const isCurrentDay = currentTimeInfo.dia === dia;
                                const isCurrentHour = currentTimeInfo.horaId === hora.id;
                                return (
                                    <TableCell 
                                        key={key} 
                                        className={cn(
                                            "p-0.5 text-center align-middle border-l border-t cursor-pointer hover:bg-muted/50 transition-all duration-150 relative",
                                            cellData?.color,
                                            isCurrentDay && "bg-opacity-40",
                                            isCurrentHour && "bg-opacity-40",
                                            isCurrentDay && isCurrentHour && "ring-2 ring-primary ring-inset z-10",
                                            'hover:ring-2 hover:ring-ring'
                                        )}
                                        onClick={() => onCellClick(dia, hora.id)}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full p-2 rounded-sm min-h-[4rem]">
                                            <p className="font-bold text-sm leading-tight">{cellData?.label}</p>
                                            {cellData?.subLabel && (
                                                <p className="text-xs">{cellData.subLabel}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    const renderMobileView = () => (
        <div className="space-y-4">
            <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona un día" />
                </SelectTrigger>
                <SelectContent>
                    {dias.map(dia => (
                        <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Card>
                <div className="divide-y">
                    {horas.map(hora => {
                        const key = `${selectedDay}-${hora.id}`;
                        const cellData = horario.get(key);
                        const isCurrentHour = currentTimeInfo.dia === selectedDay && currentTimeInfo.horaId === hora.id;
                        
                        return (
                            <div 
                                key={key} 
                                className={cn(
                                    "flex items-center p-3 cursor-pointer hover:bg-muted/50",
                                    isCurrentHour && "bg-primary/10",
                                    'hover:ring-1 hover:ring-ring rounded-lg'
                                )}
                                onClick={() => onCellClick(selectedDay, hora.id)}
                            >
                                <div className="w-20 font-semibold text-sm text-center">{hora.nombre}</div>
                                <div className={cn(
                                    "flex-1 p-2 rounded-md h-16 flex flex-col items-center justify-center text-center",
                                    cellData?.color || 'bg-muted/30'
                                )}>
                                    <p className="font-bold text-sm leading-tight">{cellData?.label}</p>
                                    {cellData?.subLabel && (
                                        <p className="text-xs">{cellData.subLabel}</p>
                                    )}
                                    {!cellData && (
                                        <p className="text-xs text-muted-foreground italic">Libre</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    );

    return (
        <>
            {isMobile ? renderMobileView() : renderDesktopView()}
        </>
    );
}
