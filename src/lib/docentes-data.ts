
import { Docente, DocenteInput } from '@/domain/entities/Docente';
import { normalizeTipoDocumento } from '@/domain/mappers/entity-builders';

type RawDocente = Omit<DocenteInput, 'tipoDocumento'> & {
    tipoDocumento: string;
};

const rawDocentes: RawDocente[] = [
    {
        tipoDocumento: 'DNI',
        numeroDocumento: '60708090',
        apellidoPaterno: 'SILVA',
        apellidoMaterno: 'CASTRO',
        nombres: 'RICARDO ANDRES',
        email: 'ricardo.silva@example.com',
        telefono: '943210987',
        rol: 'Admin',
        asignaciones: [],
    },
    {
        tipoDocumento: 'DNI',
        numeroDocumento: '50607080',
        apellidoPaterno: 'FLORES',
        apellidoMaterno: 'RAMOS',
        nombres: 'ISABEL CRISTINA',
        email: 'isabel.flores@example.com',
        telefono: '954321098',
        rol: 'Director',
        asignaciones: [],
    },
    {
        tipoDocumento: 'DNI',
        numeroDocumento: '40506070',
        apellidoPaterno: 'DIAZ',
        apellidoMaterno: 'PEREZ',
        nombres: 'JORGE LUIS',
        email: 'jorge.diaz@example.com',
        telefono: '965432109',
        rol: 'Sub-director',
        asignaciones: [],
    },
    {
        tipoDocumento: 'DNI',
        numeroDocumento: '30405060',
        apellidoPaterno: 'SANCHEZ',
        apellidoMaterno: 'GOMEZ',
        nombres: 'LUISA FERNANDA',
        email: 'luisa.sanchez@example.com',
        telefono: '976543210',
        rol: 'Coordinador',
        asignaciones: [
            { id: '1er Grado-Sección A-30405060', grado: '1er Grado', seccion: 'Sección A', rol: 'Docente' },
            { id: '1er Grado-Sección B-30405060', grado: '1er Grado', seccion: 'Sección B', rol: 'Docente' },
            { id: '2do Grado-Sección A-30405060', grado: '2do Grado', seccion: 'Sección A', rol: 'Docente' },
        ],
    },
    {
        tipoDocumento: 'DNI',
        numeroDocumento: '10203040',
        apellidoPaterno: 'GARCIA',
        apellidoMaterno: 'LOPEZ',
        nombres: 'ANA MARIA',
        email: 'ana.garcia@example.com',
        telefono: '987654321',
        rol: 'Docente',
        asignaciones: [
            { id: '1er Grado-Sección A-10203040', grado: '1er Grado', seccion: 'Sección A', rol: 'Docente' },
            { id: '1er Grado-Sección A-10203040-p-com', grado: '1er Grado', seccion: 'Sección A', rol: 'Docente', areaId: 'p-com' },
            { id: '1er Grado-Sección B-10203040', grado: '1er Grado', seccion: 'Sección B', rol: 'Docente y Tutor' },
            { id: '1er Grado-Sección B-10203040-p-mat', grado: '1er Grado', seccion: 'Sección B', rol: 'Docente', areaId: 'p-mat' },
            { id: '1er Grado-Sección B-10203040-p-ps', grado: '1er Grado', seccion: 'Sección B', rol: 'Docente', areaId: 'p-ps' },
        ],
        horario: {
            'Lunes-1': '1er Grado-Sección B-10203040-p-mat',
            'Lunes-2': '1er Grado-Sección B-10203040-p-mat',
            'Martes-3': '1er Grado-Sección A-10203040-p-com',
            'Miércoles-1': '1er Grado-Sección B-10203040-p-mat',
            'Jueves-4': '1er Grado-Sección A-10203040-p-com',
            'Viernes-2': '1er Grado-Sección B-10203040-p-ps',
        },
    },
    {
        tipoDocumento: 'DNI',
        numeroDocumento: '20304050',
        apellidoPaterno: 'MARTINEZ',
        apellidoMaterno: 'RODRIGUEZ',
        nombres: 'CARLOS JAVIER',
        email: 'carlos.martinez@example.com',
        telefono: '912345678',
        rol: 'Auxiliar',
        asignaciones: [
            { id: '1er Grado--20304050', grado: '1er Grado', seccion: 'Sección A', rol: 'Auxiliar' },
            { id: '1er Grado--20304050-b', grado: '1er Grado', seccion: 'Sección B', rol: 'Auxiliar' },
        ],
    },
    {
        tipoDocumento: 'CE',
        numeroDocumento: 'Y1234567X',
        apellidoPaterno: 'PETROV',
        apellidoMaterno: 'IVANOVA',
        nombres: 'ELENA',
        email: 'elena.petrov@example.com',
        telefono: '998877665',
        rol: 'Docente',
        asignaciones: [
            { id: '2do Grado-Sección A-Y1234567X', grado: '2do Grado', seccion: 'Sección A', rol: 'Docente' },
            { id: '2do Grado-Sección A-Y1234567X-p-cyt', grado: '2do Grado', seccion: 'Sección A', rol: 'Docente', areaId: 'p-cyt' },
        ],
    },
    {
        tipoDocumento: 'DNI',
        numeroDocumento: '70809010',
        apellidoPaterno: 'MENDOZA',
        apellidoMaterno: 'CRUZ',
        nombres: 'SOFIA VERONICA',
        email: 'sofia.mendoza@example.com',
        telefono: '932109876',
        rol: 'Docente',
        asignaciones: [
            { id: '1er Grado-Sección A-70809010', grado: '1er Grado', seccion: 'Sección A', rol: 'Docente y Tutor' },
            { id: '1er Grado-Sección A-70809010-p-com', grado: '1er Grado', seccion: 'Sección A', rol: 'Docente', areaId: 'p-com' },
            { id: '1er Grado-Sección A-70809010-p-ps', grado: '1er Grado', seccion: 'Sección A', rol: 'Docente', areaId: 'p-ps' },
        ],
    },
    {
        tipoDocumento: 'DNI',
        numeroDocumento: '80901020',
        apellidoPaterno: 'CASTILLO',
        apellidoMaterno: 'PAREDES',
        nombres: 'MANUEL ALEJANDRO',
        email: 'manuel.castillo@example.com',
        telefono: '921098765',
        rol: 'Docente',
        asignaciones: [
            { id: '1er Grado-Sección A-80901020', grado: '1er Grado', seccion: 'Sección A', rol: 'Docente' },
            { id: '1er Grado-Sección A-80901020-p-mat', grado: '1er Grado', seccion: 'Sección A', rol: 'Docente', areaId: 'p-mat' },
        ],
    },
    {
        tipoDocumento: 'DNI',
        numeroDocumento: '90102030',
        apellidoPaterno: 'RUIZ',
        apellidoMaterno: 'SANTOS',
        nombres: 'GABRIELA LUCIA',
        email: 'gabriela.ruiz@example.com',
        telefono: '910987654',
        rol: 'Docente',
        asignaciones: [],
    },
    {
        tipoDocumento: 'DNI',
        numeroDocumento: '11223345',
        apellidoPaterno: 'ORTEGA',
        apellidoMaterno: 'MORALES',
        nombres: 'FERNANDO JOSE',
        email: 'fernando.ortega@example.com',
        telefono: '987654321',
        rol: 'Docente',
        asignaciones: [],
    },
    {
        tipoDocumento: 'DNI',
        numeroDocumento: '22334455',
        apellidoPaterno: 'JIMENEZ',
        apellidoMaterno: 'NUÑEZ',
        nombres: 'VALENTINA',
        email: 'valentina.jimenez@example.com',
        telefono: '976543210',
        rol: 'Docente',
        asignaciones: [],
    },
];

export const initialDocentes: Docente[] = rawDocentes.map(raw => {
    const docenteResult = Docente.crear({
        ...raw,
        tipoDocumento: normalizeTipoDocumento(raw.tipoDocumento),
    });

    if (!docenteResult.isSuccess) {
        throw docenteResult.error;
    }

    return docenteResult.value;
});
