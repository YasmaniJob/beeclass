# Implementation Plan

- [x] 1. Fix use-matricula-data hook to include Competencias Transversales in allAreas








  - Remove or document the filter that excludes Competencias Transversales from areasPorGrado
  - Ensure allAreas includes Competencias Transversales by keeping only nivel filtering
  - Add clear comments explaining why transversales are in allAreas but not in areasPorGrado
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 3.1, 3.2, 3.4_

- [x] 2. Verify transversal competencies display correctly in docente panel








  - Check browser console logs show transversal areas in allAreas
  - Confirm transversal cards appear for docentes with assigned areas
  - Verify nivel filtering works correctly (Secundaria vs Primaria)
  - Test that each transversal competency gets its own card
  - _Requirements: 1.2, 2.1, 2.2, 2.4_

- [x] 3. Clean up unused imports and variables in mis-clases page





  - Remove unused imports (Link, Docente, CardDescription, Button, Contact2, ArrowRight)
  - Remove unused state variables (toast, activeTab, setActiveTab)
  - _Requirements: 3.3_

- [x] 4. Remove debug console logs from production code


  - Remove or comment out the debug console.log in mis-clases page
  - Keep only essential error logging
  - _Requirements: 3.3_
