
import { Nivel, AreaCurricular } from './definitions';

export const initialNiveles: {id: string, nombre: Nivel}[] = [
    { id: 'inicial', nombre: 'Inicial' },
    { id: 'primaria', nombre: 'Primaria' },
    { id: 'secundaria', nombre: 'Secundaria' },
];

export const initialAreas: AreaCurricular[] = [
    // --- PRIMARIA ---
    {
        id: 'p-mat',
        nombre: 'Matemática',
        nivel: 'Primaria',
        competencias: [
            { id: 'p-mat-c1', nombre: 'Resuelve problemas de cantidad', capacidades: ['Traduce cantidades a expresiones numéricas.', 'Comunica su comprensión sobre los números y las operaciones.', 'Usa estrategias y procedimientos de estimación y cálculo.', 'Argumenta afirmaciones sobre las relaciones numéricas y las operaciones.'] },
            { id: 'p-mat-c2', nombre: 'Resuelve problemas de regularidad, equivalencia y cambio', capacidades: ['Traduce datos y condiciones a expresiones algebraicas y gráficas.', 'Comunica su comprensión sobre las relaciones algebraicas.', 'Usa estrategias y procedimientos para encontrar equivalencias y reglas generales.', 'Argumenta afirmaciones sobre relaciones de cambio y equivalencia.'] },
            { id: 'p-mat-c3', nombre: 'Resuelve problemas de forma, movimiento y localización', capacidades: ['Modela objetos con formas geométricas y sus transformaciones.', 'Comunica su comprensión sobre las formas y relaciones geométricas.', 'Usa estrategias y procedimientos para orientarse en el espacio.', 'Argumenta afirmaciones sobre relaciones geométricas.'] },
            { id: 'p-mat-c4', nombre: 'Resuelve problemas de gestión de datos e incertidumbre', capacidades: ['Representa datos con gráficos y medidas estadísticas o probabilísticas.', 'Comunica su comprensión de los conceptos estadísticos y probabilísticos.', 'Usa estrategias y procedimientos para recopilar y procesar datos.', 'Sustenta conclusiones o decisiones con base en la información obtenida.'] },
        ]
    },
    {
        id: 'p-com',
        nombre: 'Comunicación',
        nivel: 'Primaria',
        competencias: [
            { id: 'p-com-c1', nombre: 'Se comunica oralmente en su lengua materna', capacidades: ['Obtiene información del texto oral.', 'Infiere e interpreta información del texto oral.', 'Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada.', 'Utiliza recursos no verbales y paraverbales de forma estratégica.', 'Interactúa estratégicamente con distintos interlocutores.', 'Reflexiona y evalúa la forma, el contenido y contexto del texto oral.'] },
            { id: 'p-com-c2', nombre: 'Lee diversos tipos de textos escritos en su lengua materna', capacidades: ['Obtiene información del texto escrito.', 'Infiere e interpreta información del texto.', 'Reflexiona y evalúa la forma, el contenido y contexto del texto escrito.'] },
            { id: 'p-com-c3', nombre: 'Escribe diversos tipos de textos en su lengua materna', capacidades: ['Adecúa el texto a la situación comunicativa.', 'Organiza y desarrolla las ideas de forma coherente y cohesionada.', 'Utiliza convenciones del lenguaje escrito de forma pertinente.', 'Reflexiona y evalúa la forma, el contenido y contexto del texto escrito.'] },
        ]
    },
    {
        id: 'p-ps',
        nombre: 'Personal Social',
        nivel: 'Primaria',
        competencias: [
            { id: 'p-ps-c1', nombre: 'Construye su identidad', capacidades: ['Se valora a sí mismo.', 'Autorregula sus emociones.', 'Reflexiona y argumenta éticamente.', 'Vive su sexualidad de manera integral y responsable de acuerdo a su etapa de desarrollo y madurez.'] },
            { id: 'p-ps-c2', nombre: 'Convive y participa democráticamente en la búsqueda del bien común', capacidades: ['Interactúa con todas las personas.', 'Construye normas y asume acuerdos y leyes.', 'Maneja conflictos de manera constructiva.', 'Delibera sobre asuntos públicos.', 'Participa en acciones que promueven el bienestar común.'] },
        ]
    },
    {
        id: 'p-cyt',
        nombre: 'Ciencia y Tecnología',
        nivel: 'Primaria',
        competencias: [
            { id: 'p-cyt-c1', nombre: 'Indaga mediante métodos científicos para construir sus conocimientos', capacidades: ['Problematiza situaciones para hacer indagación.', 'Diseña estrategias para hacer indagación.', 'Genera y registra datos e información.', 'Analiza datos e información.', 'Evalúa y comunica el proceso y resultados de su indagación.'] },
            { id: 'p-cyt-c2', nombre: 'Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo', capacidades: ['Comprende y usa conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo.', 'Evalúa las implicancias del saber y del quehacer científico y tecnológico.'] },
        ]
    },
    
    // --- SECUNDARIA ---
     {
        id: 's-mat',
        nombre: 'Matemática',
        nivel: 'Secundaria',
        competencias: [
            { id: 's-mat-c1', nombre: 'Resuelve problemas de cantidad', capacidades: ['Traduce cantidades a expresiones numéricas.', 'Comunica su comprensión sobre los números y las operaciones.', 'Usa estrategias y procedimientos de estimación y cálculo.', 'Argumenta afirmaciones sobre las relaciones numéricas y las operaciones.'] },
            { id: 's-mat-c2', nombre: 'Resuelve problemas de regularidad, equivalencia y cambio', capacidades: ['Traduce datos y condiciones a expresiones algebraicas y gráficas.', 'Comunica su comprensión sobre las relaciones algebraicas.', 'Usa estrategias y procedimientos para encontrar equivalencias y reglas generales.', 'Argumenta afirmaciones sobre relaciones de cambio y equivalencia.'] },
            { id: 's-mat-c3', nombre: 'Resuelve problemas de forma, movimiento y localización', capacidades: ['Modela objetos con formas geométricas y sus transformaciones.', 'Comunica su comprensión sobre las formas y relaciones geométricas.', 'Usa estrategias y procedimientos para orientarse en el espacio.', 'Argumenta afirmaciones sobre relaciones geométricas.'] },
            { id: 's-mat-c4', nombre: 'Resuelve problemas de gestión de datos e incertidumbre', capacidades: ['Representa datos con gráficos y medidas estadísticas o probabilísticas.', 'Comunica su comprensión de los conceptos estadísticos y probabilísticos.', 'Usa estrategias y procedimientos para recopilar y procesar datos.', 'Sustenta conclusiones o decisiones con base en la información obtenida.'] },
        ]
    },
    {
        id: 's-com',
        nombre: 'Comunicación',
        nivel: 'Secundaria',
        competencias: [
            { id: 's-com-c1', nombre: 'Se comunica oralmente en su lengua materna', capacidades: ['Obtiene información del texto oral.', 'Infiere e interpreta información del texto oral.', 'Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada.', 'Utiliza recursos no verbales y paraverbales de forma estratégica.', 'Interactúa estratégicamente con distintos interlocutores.', 'Reflexiona y evalúa la forma, el contenido y contexto del texto oral.'] },
            { id: 's-com-c2', nombre: 'Lee diversos tipos de textos escritos en su lengua materna', capacidades: ['Obtiene información del texto escrito.', 'Infiere e interpreta información del texto.', 'Reflexiona y evalúa la forma, el contenido y contexto del texto escrito.'] },
            { id: 's-com-c3', nombre: 'Escribe diversos tipos de textos en su lengua materna', capacidades: ['Adecúa el texto a la situación comunicativa.', 'Organiza y desarrolla las ideas de forma coherente y cohesionada.', 'Utiliza convenciones del lenguaje escrito de forma pertinente.', 'Reflexiona y evalúa la forma, el contenido y contexto del texto escrito.'] },
        ]
    },
    {
        id: 's-dpcc',
        nombre: 'Desarrollo Personal, Ciudadanía y Cívica',
        nivel: 'Secundaria',
        competencias: [
            { id: 's-dpcc-c1', nombre: 'Construye su identidad', capacidades: ['Se valora a sí mismo.', 'Autorregula sus emociones.', 'Reflexiona y argumenta éticamente.', 'Vive su sexualidad de manera integral y responsable de acuerdo a su etapa de desarrollo y madurez.'] },
            { id: 's-dpcc-c2', nombre: 'Convive y participa democráticamente en la búsqueda del bien común', capacidades: ['Interactúa con todas las personas.', 'Construye normas y asume acuerdos y leyes.', 'Maneja conflictos de manera constructiva.', 'Delibera sobre asuntos públicos.', 'Participa en acciones que promueven el bienestar común.'] },
        ]
    },
    {
        id: 's-cs',
        nombre: 'Ciencias Sociales',
        nivel: 'Secundaria',
        competencias: [
            { id: 's-cs-c1', nombre: 'Construye interpretaciones históricas', capacidades: ['Interpreta críticamente fuentes diversas.', 'Comprende el tiempo histórico.', 'Elabora explicaciones sobre procesos históricos.'] },
            { id: 's-cs-c2', nombre: 'Gestiona responsablemente el espacio y el ambiente', capacidades: ['Comprende las relaciones entre los elementos naturales y sociales.', 'Maneja fuentes de información para comprender el espacio geográfico y el ambiente.', 'Genera acciones para conservar el ambiente local y global.'] },
        ]
    },
    {
        id: 's-cyt',
        nombre: 'Ciencia y Tecnología',
        nivel: 'Secundaria',
        competencias: [
            { id: 's-cyt-c1', nombre: 'Indaga mediante métodos científicos para construir conocimientos', capacidades: ['Problematiza situaciones.', 'Diseña estrategias para hacer indagación.', 'Genera y registra datos e información.', 'Analiza datos e información.', 'Evalúa y comunica el proceso y resultados de su indagación.'] },
            { id: 's-cyt-c2', nombre: 'Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo', capacidades: ['Comprende y usa conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo.', 'Evalúa las implicancias del saber y del quehacer científico y tecnológico.'] },
            { id: 's-cyt-c3', nombre: 'Diseña y construye soluciones tecnológicas para resolver problemas de su entorno', capacidades: ['Determina una alternativa de solución tecnológica.', 'Diseña la alternativa de solución tecnológica.', 'Implementa y valida la alternativa de solución tecnológica.', 'Evalúa y comunica el funcionamiento y los impactos de su alternativa de solución tecnológica.'] },
        ]
    },
    
    // Competencias transversales (sin área específica, aplicables a todos)
    {
        id: 't-primaria',
        nombre: 'Competencias Transversales',
        nivel: 'Primaria',
        competencias: [
            { id: 't-c1', nombre: 'Gestiona su aprendizaje de manera autónoma', capacidades: [] },
            { id: 't-c2', nombre: 'Se desenvuelve en entornos virtuales generados por las TICs', capacidades: [] },
        ]
    },
    {
        id: 't-secundaria',
        nombre: 'Competencias Transversales',
        nivel: 'Secundaria',
        competencias: [
            { id: 't-c1', nombre: 'Gestiona su aprendizaje de manera autónoma', capacidades: [] },
            { id: 't-c2', nombre: 'Se desenvuelve en entornos virtuales generados por las TICs', capacidades: [] },
        ]
    }
];
