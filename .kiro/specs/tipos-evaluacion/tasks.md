# Implementation Plan

- [x] 1. Create TypeScript types and interfaces for evaluation system




  - Define `TipoEvaluacion` type with three evaluation types
  - Create `EvaluationType` interface for evaluation type configuration
  - Create placeholder interfaces for future Lista de Cotejo and Rúbrica data models
  - Export all types from `src/types/evaluacion.ts`
  - _Requirements: 3.1, 3.3, 3.5_

- [x] 2. Implement EvaluationTypeSelector component





  - [x] 2.1 Create component file and basic structure


    - Create `src/components/evaluaciones/evaluation-type-selector.tsx`
    - Define component props interface with selectedType and onTypeChange
    - Set up evaluation types configuration array with icons and availability flags
    - _Requirements: 1.1, 2.1, 4.1_
  

  - [x] 2.2 Implement button rendering and interaction logic





    - Map through evaluation types to render individual buttons
    - Implement click handlers that respect availability status
    - Add conditional styling for selected, available, and disabled states
    - Show "Próximamente" badge for unavailable types
    - _Requirements: 1.2, 2.3, 2.4, 4.1, 4.4_

  
  - [x] 2.3 Add responsive design and accessibility features





    - Implement responsive grid layout (horizontal on desktop, vertical on mobile)
    - Add keyboard navigation support (Tab, Enter, Space)
    - Include ARIA labels and roles for screen readers
    - Add tooltips with descriptions on hover
    - _Requirements: 2.2, 2.5_

- [x] 3. Integrate selector into CalificarSesionPage





  - [x] 3.1 Add state management for evaluation type


    - Import TipoEvaluacion type and useState hook
    - Initialize tipoEvaluacion state with 'directa' as default
    - Create handler function for type changes
    - _Requirements: 1.5, 3.4_
  
  - [x] 3.2 Add EvaluationTypeSelector to page layout


    - Import EvaluationTypeSelector component
    - Position selector between header and statistics cards
    - Pass selectedType and onTypeChange props
    - Apply appropriate spacing (mb-6)
    - _Requirements: 1.1, 2.1_
  
  - [x] 3.3 Implement conditional rendering for evaluation tables


    - Wrap existing CalificacionesSesionTable in conditional for 'directa' type
    - Add PlaceholderContent for 'lista-cotejo' type with appropriate icon and message
    - Add PlaceholderContent for 'rubrica' type with appropriate icon and message
    - Ensure existing functionality remains unchanged
    - _Requirements: 1.2, 3.4, 4.2_

- [x] 4. Add code documentation for future implementations





  - Add TODO comments indicating where ListaCotejoTable should be implemented
  - Add TODO comments indicating where RubricaTable should be implemented
  - Document expected props and behavior for future components
  - Add inline comments explaining the extensibility pattern
  - _Requirements: 3.3_

- [ ] 5. Clean up unused imports and fix linting issues
  - Remove unused imports (CardHeader, CardTitle, CheckCircle2, AlertCircle, router)
  - Add new required imports (ClipboardList, Table2 icons)
  - Ensure all TypeScript types are properly imported
  - Fix any ESLint warnings
  - _Requirements: 3.4_

- [ ] 6. Verify functionality and user experience
  - Test that selector renders correctly on page load
  - Verify "Evaluación Directa" is selected by default
  - Confirm existing direct evaluation functionality works unchanged
  - Test clicking on "Lista de Cotejo" shows placeholder
  - Test clicking on "Rúbrica" shows placeholder
  - Verify responsive behavior on mobile and tablet viewports
  - Test keyboard navigation through selector buttons
  - Verify tooltips appear on hover
  - Check that "Próximamente" badges display correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.5, 4.1, 4.2, 4.4_
