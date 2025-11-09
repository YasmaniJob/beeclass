# Requirements Document

## Introduction

Este documento define los requisitos para preparar la aplicación BeeClass (Next.js 15.3.3) para su despliegue en Vercel. La aplicación utiliza Supabase como base de datos, Google Sheets API para sincronización de datos, y está configurada como PWA. El objetivo es asegurar que la aplicación esté correctamente configurada para producción, con todas las variables de entorno, optimizaciones y configuraciones necesarias para un despliegue exitoso en Vercel.

## Glossary

- **Sistema de Despliegue**: El conjunto de configuraciones, archivos y procesos necesarios para desplegar la aplicación en Vercel
- **Vercel**: Plataforma de hosting y despliegue para aplicaciones Next.js
- **Variables de Entorno**: Configuraciones sensibles y específicas del entorno que no deben estar en el código fuente
- **Build Process**: Proceso de compilación y optimización de la aplicación para producción
- **Supabase**: Backend-as-a-Service utilizado para autenticación y base de datos
- **Google Sheets API**: API utilizada para sincronización de datos con hojas de cálculo
- **PWA**: Progressive Web App, aplicación web con capacidades offline
- **TypeScript Errors**: Errores de tipo en el código TypeScript que pueden bloquear el build

## Requirements

### Requirement 1

**User Story:** Como desarrollador, quiero configurar correctamente las variables de entorno para Vercel, para que la aplicación pueda conectarse a los servicios externos en producción

#### Acceptance Criteria

1. WHEN el desarrollador revisa las variables de entorno, THE Sistema de Despliegue SHALL identificar todas las variables necesarias desde los archivos .env
2. THE Sistema de Despliegue SHALL crear un archivo .env.example con todas las variables requeridas sin valores sensibles
3. THE Sistema de Despliegue SHALL documentar cada variable de entorno con su propósito y formato esperado
4. THE Sistema de Despliegue SHALL validar que las variables críticas (SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL) estén definidas
5. WHERE la aplicación usa Google Sheets API, THE Sistema de Despliegue SHALL formatear correctamente la clave privada para Vercel (manejo de saltos de línea)

### Requirement 2

**User Story:** Como desarrollador, quiero crear un archivo vercel.json con la configuración óptima, para que el despliegue utilice las mejores prácticas de Vercel

#### Acceptance Criteria

1. THE Sistema de Despliegue SHALL crear un archivo vercel.json en la raíz del proyecto
2. THE Sistema de Despliegue SHALL configurar el framework como "nextjs" en vercel.json
3. THE Sistema de Despliegue SHALL especificar los comandos de build correctos (next build)
4. THE Sistema de Despliegue SHALL configurar las rutas y redirects necesarios para la aplicación
5. WHERE la aplicación es una PWA, THE Sistema de Despliegue SHALL configurar los headers apropiados para service workers

### Requirement 3

**User Story:** Como desarrollador, quiero optimizar la configuración de Next.js para producción, para que el build sea exitoso y eficiente en Vercel

#### Acceptance Criteria

1. THE Sistema de Despliegue SHALL revisar next.config.ts para asegurar compatibilidad con Vercel
2. WHEN existen errores de TypeScript, THE Sistema de Despliegue SHALL evaluar si ignoreBuildErrors debe mantenerse o corregirse
3. THE Sistema de Despliegue SHALL verificar que las optimizaciones de imágenes estén configuradas correctamente
4. THE Sistema de Despliegue SHALL asegurar que el webpack config tenga los fallbacks necesarios para Node.js APIs
5. THE Sistema de Despliegue SHALL validar que la configuración de PWA no interfiera con el despliegue

### Requirement 4

**User Story:** Como desarrollador, quiero actualizar el .gitignore para excluir archivos innecesarios, para que el repositorio y el despliegue sean limpios

#### Acceptance Criteria

1. THE Sistema de Despliegue SHALL verificar que .env* esté en .gitignore
2. THE Sistema de Despliegue SHALL asegurar que .vercel esté en .gitignore
3. THE Sistema de Despliegue SHALL confirmar que node_modules y .next estén excluidos
4. THE Sistema de Despliegue SHALL verificar que archivos sensibles (google_cloud.json, cuenta_personal_google.json) estén excluidos
5. THE Sistema de Despliegue SHALL mantener los archivos de documentación (.md) fuera del .gitignore

### Requirement 5

**User Story:** Como desarrollador, quiero crear documentación de despliegue, para que cualquier miembro del equipo pueda desplegar la aplicación en Vercel

#### Acceptance Criteria

1. THE Sistema de Despliegue SHALL crear un archivo DEPLOYMENT.md con instrucciones paso a paso
2. THE Sistema de Despliegue SHALL documentar cómo configurar las variables de entorno en Vercel Dashboard
3. THE Sistema de Despliegue SHALL incluir instrucciones para el primer despliegue y despliegues subsecuentes
4. THE Sistema de Despliegue SHALL documentar cómo verificar que el despliegue fue exitoso
5. THE Sistema de Despliegue SHALL incluir troubleshooting común para problemas de despliegue

### Requirement 6

**User Story:** Como desarrollador, quiero validar que el build funcione localmente, para que pueda detectar problemas antes de desplegar a Vercel

#### Acceptance Criteria

1. THE Sistema de Despliegue SHALL ejecutar el comando de build localmente (pnpm build)
2. WHEN el build falla, THE Sistema de Despliegue SHALL identificar los errores específicos
3. THE Sistema de Despliegue SHALL verificar que no haya errores críticos de TypeScript que bloqueen el build
4. THE Sistema de Despliegue SHALL confirmar que todos los módulos necesarios estén instalados
5. THE Sistema de Despliegue SHALL validar que el output del build sea correcto (.next directory)

### Requirement 7

**User Story:** Como desarrollador, quiero optimizar las dependencias del proyecto, para que el bundle size sea mínimo y el despliegue sea rápido

#### Acceptance Criteria

1. THE Sistema de Despliegue SHALL revisar package.json para identificar dependencias no utilizadas
2. THE Sistema de Despliegue SHALL verificar que las dependencias estén en la sección correcta (dependencies vs devDependencies)
3. THE Sistema de Despliegue SHALL confirmar que no haya vulnerabilidades críticas en las dependencias
4. WHERE existen optimizaciones de tree-shaking, THE Sistema de Despliegue SHALL asegurar que estén configuradas en next.config.ts
5. THE Sistema de Despliegue SHALL validar que las importaciones dinámicas estén siendo utilizadas donde sea apropiado

### Requirement 8

**User Story:** Como desarrollador, quiero configurar los dominios y URLs correctamente, para que la aplicación funcione en el dominio de producción de Vercel

#### Acceptance Criteria

1. THE Sistema de Despliegue SHALL identificar todas las URLs hardcodeadas en el código
2. THE Sistema de Despliegue SHALL reemplazar URLs hardcodeadas con variables de entorno donde sea necesario
3. THE Sistema de Despliegue SHALL configurar NEXT_PUBLIC_APP_URL como variable de entorno
4. THE Sistema de Despliegue SHALL actualizar las configuraciones de CORS en Supabase para incluir el dominio de Vercel
5. THE Sistema de Despliegue SHALL documentar cómo configurar dominios personalizados en Vercel
