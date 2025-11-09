# Design Document - Vercel Deployment Preparation

## Overview

Este documento describe el diseño técnico para preparar la aplicación BeeClass (Inkuña) para su despliegue en Vercel. La aplicación es un sistema de gestión educativa construido con Next.js 15.3.3, TypeScript, Supabase, y Google Sheets API. El diseño se enfoca en crear una configuración robusta que permita despliegues exitosos y repetibles, manteniendo la seguridad de las credenciales y optimizando el rendimiento.

## Architecture

### Deployment Pipeline

```
Local Development → Git Repository → Vercel Build → Production Deployment
                                          ↓
                                    Environment Variables
                                          ↓
                                    Build Optimization
                                          ↓
                                    Static Generation
```

### Configuration Layers

1. **Environment Configuration Layer**
   - Variables de entorno separadas por ambiente (development, production)
   - Archivo .env.example como plantilla
   - Variables públicas (NEXT_PUBLIC_*) vs privadas

2. **Build Configuration Layer**
   - next.config.ts con optimizaciones para producción
   - vercel.json con configuraciones específicas de la plataforma
   - TypeScript y ESLint configurados para builds exitosos

3. **Deployment Configuration Layer**
   - Configuración de dominios y URLs
   - Headers y redirects
   - Configuración de PWA para producción

## Components and Interfaces

### 1. Environment Variables Manager

**Purpose:** Gestionar y documentar todas las variables de entorno necesarias

**Structure:**
```typescript
interface EnvironmentVariables {
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Google Sheets Configuration
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: string;
  GOOGLE_SHEETS_SPREADSHEET_ID: string;
  
  // Application Configuration
  NEXT_PUBLIC_APP_URL?: string;
  NODE_ENV: 'development' | 'production' | 'test';
}
```

**Files:**
- `.env.example` - Template sin valores sensibles
- `.env.local` - Variables locales (no commiteado)
- Vercel Dashboard - Variables de producción

**Key Considerations:**
- La clave privada de Google debe manejarse correctamente en Vercel (reemplazar `\n` literales)
- Variables NEXT_PUBLIC_* son expuestas al cliente
- SUPABASE_SERVICE_ROLE_KEY solo debe usarse en server-side

### 2. Vercel Configuration File

**Purpose:** Definir configuraciones específicas de Vercel

**File:** `vercel.json`

**Structure:**
```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
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

**Key Features:**
- Headers de seguridad para todas las rutas
- Configuración especial para service worker (PWA)
- Comandos de build usando pnpm

### 3. Next.js Configuration Optimization

**Purpose:** Asegurar que next.config.ts esté optimizado para producción

**Current State Analysis:**
- ✅ PWA configurado con @ducanh2912/next-pwa
- ✅ Optimizaciones de paquetes (optimizePackageImports)
- ✅ Configuración de imágenes con WebP/AVIF
- ⚠️ ignoreBuildErrors: true (necesita revisión)
- ⚠️ Dos archivos de configuración (next.config.ts y next.config.js)

**Design Decision:**
Consolidar configuraciones en un solo archivo `next.config.ts` y evaluar si los errores de TypeScript deben corregirse o ignorarse.

**Merged Configuration:**
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
    // Evaluar si mantener o remover
    ignoreBuildErrors: process.env.VERCEL_ENV === 'production' ? false : true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
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

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      // ... resto de paquetes
    ],
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      // ... patrones existentes
    ],
  },

  compress: true,
  poweredByHeader: false,
};

export default withPWA(nextConfig);
```

### 4. Build Validation System

**Purpose:** Validar que el build funcione antes de desplegar

**Process:**
1. Limpiar builds anteriores: `rm -rf .next`
2. Instalar dependencias: `pnpm install`
3. Ejecutar build: `pnpm build`
4. Verificar output en `.next` directory

**Success Criteria:**
- Build completa sin errores críticos
- Directorio `.next` generado correctamente
- Tamaño del bundle dentro de límites razonables
- No hay warnings críticos de seguridad

### 5. Documentation System

**Purpose:** Proveer documentación clara para el proceso de despliegue

**File:** `DEPLOYMENT.md`

**Sections:**
1. Pre-requisitos
2. Configuración de Variables de Entorno en Vercel
3. Primer Despliegue
4. Despliegues Subsecuentes
5. Verificación Post-Despliegue
6. Troubleshooting Común
7. Rollback Procedures

## Data Models

### Environment Variable Schema

```typescript
// Validation schema using Zod
import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // Google Sheets
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().min(1),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().min(1),
  
  // Optional
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export type Env = z.infer<typeof envSchema>;
```

### Vercel Configuration Schema

```typescript
interface VercelConfig {
  framework: 'nextjs';
  buildCommand: string;
  devCommand: string;
  installCommand: string;
  headers?: HeaderConfig[];
  redirects?: RedirectConfig[];
  rewrites?: RewriteConfig[];
}

interface HeaderConfig {
  source: string;
  headers: Array<{
    key: string;
    value: string;
  }>;
}
```

## Error Handling

### Build Errors

**TypeScript Errors:**
- **Strategy:** Evaluar cada error individualmente
- **Critical Errors:** Deben corregirse antes del despliegue
- **Non-Critical Errors:** Pueden ignorarse temporalmente con ignoreBuildErrors
- **Long-term:** Crear plan para corregir todos los errores

**Dependency Errors:**
- **Missing Dependencies:** Ejecutar `pnpm install` para resolver
- **Version Conflicts:** Revisar pnpm-lock.yaml y resolver conflictos
- **Peer Dependencies:** Asegurar que todas las peer dependencies estén instaladas

### Runtime Errors

**Environment Variable Errors:**
- **Missing Variables:** Validar en build time usando el schema de Zod
- **Invalid Format:** Proveer mensajes de error claros
- **Fallback Values:** Definir valores por defecto donde sea apropiado

**API Connection Errors:**
- **Supabase:** Verificar que las URLs y keys sean correctas
- **Google Sheets:** Validar formato de la clave privada
- **CORS:** Configurar dominios permitidos en Supabase dashboard

### Deployment Errors

**Build Timeout:**
- **Cause:** Build toma más de 45 minutos (límite de Vercel)
- **Solution:** Optimizar dependencias, usar cache de build

**Out of Memory:**
- **Cause:** Build consume más memoria de la disponible
- **Solution:** Optimizar imports, usar dynamic imports

**Failed to Deploy:**
- **Cause:** Errores en el código o configuración
- **Solution:** Revisar logs de Vercel, corregir errores específicos

## Testing Strategy

### Pre-Deployment Testing

**Local Build Test:**
```bash
# Limpiar y construir
pnpm clean
pnpm install
pnpm build

# Verificar que el build fue exitoso
# Debe crear directorio .next sin errores críticos
```

**Environment Variables Test:**
```bash
# Crear archivo .env.local con variables de prueba
# Ejecutar aplicación localmente
pnpm dev

# Verificar que todas las integraciones funcionen:
# - Autenticación con Supabase
# - Conexión a Google Sheets
# - PWA funcionalidad
```

**Production Build Test:**
```bash
# Simular ambiente de producción
NODE_ENV=production pnpm build
pnpm start

# Verificar en http://localhost:3000
```

### Post-Deployment Testing

**Smoke Tests:**
1. Verificar que la aplicación cargue correctamente
2. Probar autenticación de usuarios
3. Verificar conexión a Supabase
4. Probar funcionalidad de Google Sheets
5. Verificar que PWA se instale correctamente

**Performance Tests:**
1. Lighthouse score > 90 en todas las categorías
2. First Contentful Paint < 1.5s
3. Time to Interactive < 3.5s
4. Cumulative Layout Shift < 0.1

**Security Tests:**
1. Verificar headers de seguridad
2. Confirmar que variables sensibles no estén expuestas
3. Validar CORS configuration
4. Verificar HTTPS en todas las conexiones

## Implementation Phases

### Phase 1: Configuration Setup
- Crear .env.example
- Crear vercel.json
- Consolidar next.config files
- Actualizar .gitignore

### Phase 2: Build Validation
- Ejecutar build local
- Identificar y corregir errores críticos
- Optimizar dependencias
- Validar output

### Phase 3: Documentation
- Crear DEPLOYMENT.md
- Documentar variables de entorno
- Crear guía de troubleshooting
- Documentar proceso de rollback

### Phase 4: Deployment
- Configurar proyecto en Vercel
- Configurar variables de entorno
- Ejecutar primer despliegue
- Verificar funcionalidad

### Phase 5: Post-Deployment
- Ejecutar smoke tests
- Configurar dominio personalizado (si aplica)
- Configurar CORS en Supabase
- Monitorear logs y errores

## Security Considerations

### Secrets Management
- Nunca commitear archivos .env
- Usar Vercel Environment Variables para producción
- Rotar credenciales regularmente
- Usar diferentes credenciales para dev/prod

### API Keys Protection
- NEXT_PUBLIC_* solo para datos no sensibles
- Service role keys solo en server-side
- Validar origen de requests
- Implementar rate limiting donde sea apropiado

### CORS Configuration
- Configurar dominios permitidos en Supabase
- Restringir acceso a Google Sheets API
- Validar headers de seguridad
- Implementar CSP (Content Security Policy)

## Performance Optimizations

### Bundle Size Optimization
- Tree-shaking habilitado
- Dynamic imports para rutas pesadas
- Optimización de imágenes con WebP/AVIF
- Code splitting automático de Next.js

### Caching Strategy
- Static Generation donde sea posible
- ISR (Incremental Static Regeneration) para datos dinámicos
- Cache de imágenes con CDN de Vercel
- Service Worker para cache offline (PWA)

### Loading Performance
- Lazy loading de componentes pesados
- Prefetch de rutas críticas
- Optimización de fonts
- Minimización de JavaScript inicial

## Monitoring and Maintenance

### Vercel Analytics
- Habilitar Vercel Analytics para métricas de rendimiento
- Monitorear Web Vitals
- Trackear errores de runtime
- Analizar patrones de uso

### Error Tracking
- Configurar Sentry (opcional, ya está en el código)
- Monitorear logs de Vercel
- Alertas para errores críticos
- Dashboard de salud del sistema

### Continuous Improvement
- Revisar métricas semanalmente
- Optimizar rutas lentas
- Actualizar dependencias regularmente
- Implementar feedback de usuarios
