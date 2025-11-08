
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaCurricular } from "@/lib/definitions";
import { Button } from "../ui/button";
import { BookOpen } from "lucide-react";
import { Badge } from "../ui/badge";

interface AreasTableProps {
    areas: AreaCurricular[];
    onManage: (area: AreaCurricular) => void;
}

export function AreasTable({ areas, onManage }: AreasTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Área Curricular</TableHead>
                    <TableHead>Competencias</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {areas.map((area, index) => (
                    <TableRow key={area.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{area.nombre}</TableCell>
                        <TableCell>
                            <Badge variant="secondary">{area.competencias?.length || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => onManage(area)}
                            >
                                <BookOpen className="mr-2 h-4 w-4" />
                                Competencias
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
