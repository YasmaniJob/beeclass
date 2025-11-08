
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useIncidentes } from '@/hooks/use-incidentes';
import { IncidentesTable } from '@/components/incidentes/incidentes-table';
import { SearchInput } from '@/components/filtros/search-input';
import { PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Incidente } from '@/lib/definitions';

export default function IncidentesPage() {
    const { user } = useCurrentUser();
    const { incidentes, deleteIncidente, getIncidentesByDocente } = useIncidentes();
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const handleDeleteIncidente = (id: string) => {
        deleteIncidente(id);
        toast({
            title: 'Incidente eliminado',
            description: 'El registro de incidente ha sido eliminado.',
        });
    }

    const { 
        studentIncidentes, 
        staffIncidentes, 
        teacherRegisteredIncidents,
        isTeacherView 
    } = useMemo(() => {
        const isAdminOrAux = user?.rol === 'Admin' || user?.rol === 'Auxiliar';
        
        if (!user) {
            return { studentIncidentes: [], staffIncidentes: [], teacherRegisteredIncidents: [], isTeacherView: false };
        }

        if (isAdminOrAux) {
            return {
                studentIncidentes: incidentes.filter(i => 'grado' in i.sujeto),
                staffIncidentes: incidentes.filter(i => !('grado' in i.sujeto)),
                teacherRegisteredIncidents: [],
                isTeacherView: false,
            };
        }

        // Vista para Docente
        const teacherSections = new Set(user.asignaciones?.map(a => `${a.grado}|${a.seccion}`));
        
        const allStudentIncidentsForTeacher = incidentes.filter(i => {
            if ('grado' in i.sujeto) {
                const studentSectionId = `${i.sujeto.grado}|${i.sujeto.seccion}`;
                return teacherSections.has(studentSectionId);
            }
            return false;
        });

        const teacherOnlyIncidents = getIncidentesByDocente(user.numeroDocumento);

        return {
            studentIncidentes: allStudentIncidentsForTeacher,
            staffIncidentes: [],
            teacherRegisteredIncidents: teacherOnlyIncidents,
            isTeacherView: true,
        };

    }, [incidentes, user, getIncidentesByDocente]);

    const filterIncidents = (incidents: Incidente[], term: string) => {
        if (!term) return incidents;
        const lowerCaseTerm = term.toLowerCase();
        return incidents.filter(i => {
            const fullName = `${i.sujeto.apellidoPaterno} ${i.sujeto.apellidoMaterno} ${i.sujeto.nombres}`.toLowerCase();
            return fullName.includes(lowerCaseTerm) || 
                   i.sujeto.numeroDocumento.includes(lowerCaseTerm) || 
                   i.descripcion.toLowerCase().includes(lowerCaseTerm);
        });
    }

    const filteredStudentIncidentes = filterIncidents(studentIncidentes, searchTerm);
    const filteredStaffIncidentes = filterIncidents(staffIncidentes, searchTerm);
    const filteredTeacherRegisteredIncidents = filterIncidents(teacherRegisteredIncidents, searchTerm);


    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {isTeacherView ? 'Centro de Incidentes' : 'Gestión de Incidentes'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isTeacherView 
                            ? 'Consulta y gestiona el historial de incidentes de los estudiantes en tus secciones asignadas.'
                            : 'Busca, consulta y gestiona el historial de incidentes de estudiantes y personal.'
                        }
                    </p>
                </div>
                <Button asChild>
                    <Link href="/incidentes/nuevo">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Registrar Nuevo Incidente
                    </Link>
                </Button>
            </div>
            
            <div className="w-full">
                <SearchInput 
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    placeholder="Buscar por nombre, apellidos o documento..."
                />
            </div>

            {isTeacherView ? (
                <Tabs defaultValue="mis-incidencias" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-sm">
                        <TabsTrigger value="mis-incidencias">Mis incidencias</TabsTrigger>
                        <TabsTrigger value="institucional">Institucional</TabsTrigger>
                    </TabsList>
                    <TabsContent value="mis-incidencias" className="pt-4">
                        <Card>
                            <CardContent className="p-0">
                                <IncidentesTable
                                    incidentes={filteredTeacherRegisteredIncidents} 
                                    onDelete={handleDeleteIncidente}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="institucional" className="pt-4">
                        <Card>
                            <CardContent className="p-0">
                                <IncidentesTable
                                    incidentes={filteredStudentIncidentes} 
                                    onDelete={handleDeleteIncidente}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                <Tabs defaultValue="estudiantes" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:max-w-xs">
                        <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                    </TabsList>
                    <TabsContent value="estudiantes" className="pt-4">
                        <Card>
                            <CardContent className="p-0">
                                <IncidentesTable
                                    incidentes={filteredStudentIncidentes} 
                                    onDelete={handleDeleteIncidente}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="personal" className="pt-4">
                        <Card>
                            <CardContent className="p-0">
                                <IncidentesTable
                                    incidentes={filteredStaffIncidentes} 
                                    onDelete={handleDeleteIncidente}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
