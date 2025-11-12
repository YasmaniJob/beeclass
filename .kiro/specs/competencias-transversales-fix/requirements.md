# Requirements Document

## Introduction

Este documento define los requisitos para corregir la visualización de las Competencias Transversales en el panel de docentes. Actualmente, las competencias transversales no se muestran porque están siendo filtradas en el hook `use-matricula-data`, lo que impide que los docentes puedan calificarlas.

## Glossary

- **Sistema**: La aplicación web de gestión educativa
- **Docente**: Usuario con rol de profesor que califica estudiantes
- **Competencias Transversales**: Áreas curriculares especiales que aplican a todos los docentes con áreas asignadas, independientemente de si son tutores
- **Panel de Docentes**: Página `/docentes/mis-clases` donde los docentes ven sus asignaciones
- **Hook de Matrícula**: `use-matricula-data.tsx` que carga y gestiona los datos de áreas curriculares
- **allAreas**: Array que contiene todas las áreas curriculares disponibles en el sistema

## Requirements

### Requirement 1

**User Story:** Como docente con áreas asignadas, quiero ver las competencias transversales en mi panel, para poder calificar a mis estudiantes en estas competencias.

#### Acceptance Criteria

1. WHEN el Sistema carga las áreas curriculares, THE Sistema SHALL incluir las Competencias Transversales en el array `allAreas`
2. WHEN un Docente tiene al menos un área asignada en una sección, THE Sistema SHALL mostrar las Competencias Transversales para esa sección
3. WHEN el Sistema filtra áreas por nivel, THE Sistema SHALL mantener las Competencias Transversales que coincidan con el nivel de la institución
4. THE Sistema SHALL NOT filtrar las Competencias Transversales del array `allAreas` en el Hook de Matrícula

### Requirement 2

**User Story:** Como docente, quiero que las competencias transversales se muestren correctamente según el nivel educativo, para asegurar que califico las competencias apropiadas.

#### Acceptance Criteria

1. WHEN el nivel de la institución es Secundaria, THE Sistema SHALL mostrar solo las Competencias Transversales de Secundaria
2. WHEN el nivel de la institución es Primaria, THE Sistema SHALL mostrar solo las Competencias Transversales de Primaria
3. WHEN el Sistema detecta el nivel de un grado, THE Sistema SHALL usar la lógica correcta para grados 1-5 de Secundaria
4. THE Sistema SHALL crear una tarjeta separada para cada competencia transversal individual

### Requirement 3

**User Story:** Como desarrollador, quiero que el código sea mantenible y no tenga filtros duplicados, para facilitar futuras modificaciones.

#### Acceptance Criteria

1. THE Sistema SHALL eliminar el filtro explícito de Competencias Transversales en la línea 237 del Hook de Matrícula
2. THE Sistema SHALL mantener solo el filtro por nivel de institución para todas las áreas
3. WHEN se actualiza la lógica de áreas, THE Sistema SHALL aplicar cambios de forma consistente en todo el código
4. THE Sistema SHALL incluir comentarios explicativos sobre por qué las Competencias Transversales se incluyen en `allAreas`
