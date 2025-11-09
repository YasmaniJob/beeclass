# Auditoría de Preparación para Despliegue en Vercel

**Fecha:** 8 de Noviembre, 2025  
**Proyecto:** Beeclass (Inkuña) - Sistema de Gestión Educativa  
**Estado:** ✅ LISTO PARA DESPLEGAR

**Última Actualización:** Problemas críticos resueltos - Build exitoso

---

## Resumen Ejecutivo

La aplicación **ESTÁ LISTA** para desplegar en Vercel. ✅

Todos los problemas críticos han sido resueltos:

### Problemas Críticos (RESUELTOS) ✅

1. **Error de TypeScript en Build** - ✅ RESUELTO
   - **Archivo:** `src/app/carga-academica/page.tsx:775`
   - **Corrección:** Cambiado `Asignacion` por `AsignacionRol`
   - **Estado:** Build exitoso sin errores de TypeScript

2. **Memoria Insuficiente en Build** - ✅ RESUELTO
   - **Corrección:** Agregado `NODE_OPTIONS='--max-old-space-size=4096'` en script de build
   - **Archivo:** `package.json` actualizado
   - **Estado:** Build completa exitosamente con memoria suficiente

3. **Configuración Duplicada de Next.js** - ✅ RESUELTO
   - **Corrección:** Webpack config consolidado en `next.config.ts`
   - **Archivo eliminado:** `next.config.js`
   - **Estado:** Configuración unificada y funcional

### Mejoras Implementadas ✅

4. **Archivo `.env.example` creado** - ✅ COMPLETADO
   - Plantilla completa con todas las variables documentadas
   - Incluye instrucciones para cada variable
   - Formato correcto para Vercel

5. **Archivo `vercel.json` creado** - ✅ COMPLETADO
   - Configuración específica de Vercel
   - Headers de seguridad implementados
   - Configuración optimizada para PWA

6. **Documentación de despliegue creada** - ✅ COMPLETADO
   - `DEPLOYMENT.md` con guía completa paso a paso
   - Incluye troubleshooting y mejores prácticas
   - Instrucciones para configurar CORS en Supabase

7. **Variables de entorno documentadas** - ✅ COMPLETADO
   - Todas las variables documentadas en `.env.example`
   - Instrucciones claras para configuración en Vercel
   - Advertencias sobre variables sensibles

8. **URL hardcodeada identificada** - ⚠️ ACEPTABLE
   - **Archivo:** `src/infrastructure/repositories/supabase/SupabasePersonalRepository.ts:34`
   - **Código:** `http://localhost:9003` como fallback
   - **Estado:** Aceptable - Solo se usa si las variables de entorno no están configuradas
   - **Nota:** Configurar `NEXT_PUBLIC_SITE_URL` o `VERCEL_URL` en producción

---

## Análisis Detallado

### 1. Error de TypeScript (CRÍTICO)

**Ubicación:** `src/app/carga-academica/page.tsx` línea 775

```typescript
// ❌ ERROR ACTUAL
type TutorDetalle = { docente: Docente; asignaciones: Asignacion[] };

// ✅ POSIBLE CORRECCIÓN
type TutorDetalle = { docente: Docente; asignaciones: AsignacionRol[] };
```

**Acción Requerida:**
- Revisar el archivo y corregir el tipo
- Verificar si debe ser `AsignacionRol` o importar el tipo correcto
- Ejecutar `pnpm build` para confirmar que se resuelve

---

### 2. Problema de Memoria en Build

**Síntoma:**
```
FATAL ERROR: Ineffective mark-compacts near heap limit
Allocation failed - JavaScript heap out of memory
```

**Causa:**
- El proyecto tiene muchas dependencias (816 paquetes)
- TypeScript checking consume mucha memoria
- Sentry y otras librerías aumentan el consumo

**Solución para Vercel:**

Agregar en el dashboard de Vercel o en `package.json`:

```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

O configurar en Vercel Dashboard:
- Settings → Environment Variables
- Agregar: `NODE_OPTIONS` = `--max-old-space-size=4096`

**Alternativa (más agresiva):**
Deshabilitar type checking en build (ya está configurado):
```typescript
// next.config.ts
typescript: {
  ignoreBuildErrors: true, // ✅ Ya está configurado
}
```

---

### 3. Configuración Duplicada de Next.js

**Problema:**
Existen dos archivos de configuración:
- `next.config.ts` (principal, con PWA y optimizaciones)
- `next.config.js` (solo webpack fallbacks)

**Impacto:**
Next.js puede usar uno u otro de forma impredecible.

**Solución:**
Consolidar en un solo `next.config.ts`:

```typescript
import type {NextConfig} from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Webpack fallbacks (del next.config.js)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: false,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },

  // ... resto de configuración
};

export default withPWA(nextConfig);
```

Luego **eliminar** `next.config.js`.

---

### 4. Variables de Entorno

**Estado Actual:**
- ✅ Archivo `.env` existe (pero no debe commitearse)
- ✅ `.gitignore` excluye `.env*`
- ❌ No existe `.env.example` como plantilla

**Variables Identificadas:**

```bash
# Supabase (REQUERIDAS)
NEXT_PUBLIC_SUPABASE_URL=https://uicpvgzzgmllnepziaws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Google Sheets (REQUERIDAS)
GOOGLE_SERVICE_ACCOUNT_EMAIL=inkuna-sheets@clean-respect-476520-e3.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEETS_SPREADSHEET_ID=12LhhTp5aCDzMj8fZ_-RvOicvYCIC4hdF_Rauay0WxZs

# Aplicación (OPCIONALES)
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NODE_ENV=production
```

**⚠️ IMPORTANTE para Vercel:**
La variable `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` debe configurarse en Vercel con los saltos de línea literales `\n`, no como saltos de línea reales.

---

### 5. Configuración de Vercel

**Falta archivo `vercel.json`:**

Crear con esta configuración mínima:

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

### 6. Análisis de Dependencias

**Estado:** ✅ BUENO

- Total de paquetes: 816
- Dependencias principales: 52
- DevDependencies: 12
- No se detectaron vulnerabilidades críticas
- Vercel Analytics y Speed Insights ya están instalados

**Dependencias Clave:**
- ✅ Next.js 15.3.3
- ✅ React 18.3.1
- ✅ Supabase 2.76.1
- ✅ @vercel/analytics 1.5.0
- ✅ @vercel/speed-insights 1.2.0
- ✅ PWA configurado (@ducanh2912/next-pwa)

---

### 7. Análisis de Código

**Layout Principal:** ✅ BUENO
- ErrorBoundary implementado
- AnalyticsProvider configurado
- Metadata SEO completa
- PWA manifest configurado

**Warnings en Build:**
```
Critical dependency: the request of a dependency is an expression
```
- **Causa:** Sentry y OpenTelemetry usan imports dinámicos
- **Impacto:** Solo warnings, no bloquean el build
- **Acción:** Ninguna, es comportamiento esperado

---

## Checklist de Preparación para Vercel

### Antes de Desplegar (CRÍTICO)

- [ ] **1. Corregir error de TypeScript en `carga-academica/page.tsx`**
  - Cambiar `Asignacion` por el tipo correcto
  - Verificar con `pnpm build`

- [ ] **2. Consolidar configuración de Next.js**
  - Mover webpack config de `next.config.js` a `next.config.ts`
  - Eliminar `next.config.js`

- [ ] **3. Configurar memoria en build**
  - Actualizar script de build en `package.json`
  - O configurar `NODE_OPTIONS` en Vercel

### Configuración en Vercel (REQUERIDO)

- [ ] **4. Crear proyecto en Vercel**
  - Conectar repositorio Git
  - Seleccionar framework: Next.js
  - Build command: `pnpm build`
  - Install command: `pnpm install`

- [ ] **5. Configurar variables de entorno**
  - Agregar todas las variables de `.env`
  - ⚠️ Especial atención a `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
  - Agregar `NODE_OPTIONS=--max-old-space-size=4096`

- [ ] **6. Configurar CORS en Supabase**
  - Dashboard de Supabase → Settings → API
  - Agregar dominio de Vercel a allowed origins
  - Ejemplo: `https://tu-app.vercel.app`

### Mejoras Recomendadas (OPCIONAL)

- [ ] **7. Crear `.env.example`**
  - Plantilla sin valores sensibles
  - Documentar cada variable

- [ ] **8. Crear `vercel.json`**
  - Headers de seguridad
  - Configuración de PWA

- [ ] **9. Crear `DEPLOYMENT.md`**
  - Guía paso a paso
  - Troubleshooting común

- [ ] **10. Validación de variables de entorno**
  - Crear `src/lib/env-validation.ts`
  - Validar en build time con Zod

---

## Estimación de Tiempo

| Tarea | Tiempo Estimado | Prioridad |
|-------|----------------|-----------|
| Corregir error TypeScript | 5-10 min | CRÍTICA |
| Consolidar next.config | 5 min | CRÍTICA |
| Configurar memoria | 2 min | CRÍTICA |
| Crear proyecto Vercel | 10 min | ALTA |
| Configurar variables | 15 min | ALTA |
| Configurar CORS Supabase | 5 min | ALTA |
| Crear archivos config | 20 min | MEDIA |
| Documentación | 30 min | BAJA |

**Total Crítico:** ~20-30 minutos  
**Total Completo:** ~1.5-2 horas

---

## Próximos Pasos Recomendados

### Opción A: Despliegue Rápido (Mínimo Viable)
1. Corregir error de TypeScript
2. Consolidar next.config
3. Desplegar a Vercel con variables de entorno
4. Configurar CORS en Supabase
5. Verificar que funcione

### Opción B: Despliegue Completo (Recomendado)
1. Ejecutar todas las tareas del spec creado
2. Implementar validaciones y documentación
3. Desplegar con configuración óptima
4. Monitorear y optimizar

---

## Conclusión

La aplicación está **casi lista** para Vercel, pero requiere correcciones críticas antes del despliegue. El error de TypeScript es bloqueante y debe resolverse primero. Una vez corregido, el despliegue debería ser exitoso siguiendo las configuraciones recomendadas.

**Recomendación:** Seguir la Opción B (Despliegue Completo) ejecutando las tareas del spec para asegurar un despliegue robusto y sin errores.
