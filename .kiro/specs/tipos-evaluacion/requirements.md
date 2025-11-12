# Requirements Document

## Introduction

Este documento define los requisitos para implementar diferentes tipos de evaluación en el sistema de calificaciones por sesión. Actualmente, el sistema solo soporta evaluación directa (AD, A, B, C). Se requiere agregar la capacidad de evaluar mediante Lista de Cotejo y Rúbrica, permitiendo al docente seleccionar el tipo de evaluación más apropiado para cada sesión de aprendizaje.

## Glossary

- **Sistema de Evaluación**: El módulo de la aplicación que permite a los docentes calificar a los estudiantes en sesiones de aprendizaje
- **Evaluación Directa**: Método actual donde el docente asigna directamente una calificación literal (AD, A, B, C) a cada estudiante
- **Lista de Cotejo**: Instrumento de evaluación que contiene una lista de criterios o indicadores de logro que se marcan como cumplidos o no cumplidos
- **Rúbrica**: Instrumento de evaluación que describe diferentes niveles de desempeño para cada criterio evaluado
- **Sesión de Aprendizaje**: Una clase o actividad específica asociada a una competencia que requiere evaluación
- **Interfaz de Selección**: Componente UI que permite al docente elegir entre los diferentes tipos de evaluación

## Requirements

### Requirement 1

**User Story:** Como docente, quiero poder seleccionar el tipo de evaluación (Directa, Lista de Cotejo, o Rúbrica) para una sesión de aprendizaje, para poder utilizar el instrumento de evaluación más apropiado según la naturaleza de la actividad.

#### Acceptance Criteria

1. WHEN el docente accede a la página de calificación de una sesión, THE Sistema de Evaluación SHALL mostrar controles de selección para elegir entre los tres tipos de evaluación disponibles
2. WHEN el docente selecciona un tipo de evaluación, THE Sistema de Evaluación SHALL actualizar la interfaz para mostrar el método de calificación correspondiente
3. THE Sistema de Evaluación SHALL mantener visible el tipo de evaluación seleccionado durante toda la sesión de calificación
4. WHEN el docente cambia de tipo de evaluación, THE Sistema de Evaluación SHALL preservar las calificaciones ya ingresadas si son compatibles con el nuevo tipo
5. THE Sistema de Evaluación SHALL mostrar "Evaluación Directa" como el tipo predeterminado al cargar la página

### Requirement 2

**User Story:** Como docente, quiero que la interfaz de selección de tipo de evaluación sea clara y accesible, para poder cambiar rápidamente entre métodos sin confusión.

#### Acceptance Criteria

1. THE Sistema de Evaluación SHALL ubicar los controles de selección de tipo de evaluación en una posición prominente cerca del encabezado de la página
2. THE Sistema de Evaluación SHALL utilizar iconos distintivos para cada tipo de evaluación que faciliten su identificación visual
3. THE Sistema de Evaluación SHALL aplicar estilos visuales que indiquen claramente cuál tipo de evaluación está actualmente seleccionado
4. WHEN el usuario pasa el cursor sobre un tipo de evaluación no seleccionado, THE Sistema de Evaluación SHALL mostrar un efecto hover que indique interactividad
5. THE Sistema de Evaluación SHALL mantener un diseño responsive que funcione correctamente en dispositivos móviles y tablets

### Requirement 3

**User Story:** Como desarrollador futuro, quiero que la arquitectura soporte la extensión a Lista de Cotejo y Rúbrica, para poder implementar estas funcionalidades sin refactorizar el código base.

#### Acceptance Criteria

1. THE Sistema de Evaluación SHALL definir una estructura de tipos de evaluación extensible que permita agregar nuevos tipos sin modificar componentes existentes
2. THE Sistema de Evaluación SHALL implementar un patrón de diseño que separe la lógica de selección de tipo de la lógica de calificación específica
3. THE Sistema de Evaluación SHALL incluir comentarios en el código que indiquen dónde se deben implementar las funcionalidades de Lista de Cotejo y Rúbrica
4. THE Sistema de Evaluación SHALL mantener la compatibilidad con el sistema actual de calificaciones directas
5. THE Sistema de Evaluación SHALL utilizar TypeScript types o interfaces que definan la estructura de cada tipo de evaluación

### Requirement 4

**User Story:** Como docente, quiero ver indicadores visuales que me muestren qué tipos de evaluación están disponibles y cuáles están en desarrollo, para entender las capacidades actuales del sistema.

#### Acceptance Criteria

1. WHEN un tipo de evaluación no está implementado, THE Sistema de Evaluación SHALL mostrar un badge o indicador de "Próximamente"
2. WHEN el docente intenta seleccionar un tipo de evaluación no implementado, THE Sistema de Evaluación SHALL mostrar un mensaje informativo sobre la disponibilidad futura
3. THE Sistema de Evaluación SHALL permitir la interacción con el tipo "Evaluación Directa" sin restricciones
4. THE Sistema de Evaluación SHALL deshabilitar visualmente pero mantener visible los tipos de evaluación no implementados
5. THE Sistema de Evaluación SHALL mantener consistencia visual entre los estados habilitado, deshabilitado y seleccionado
