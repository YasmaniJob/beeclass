# Implementation Plan - Vercel Deployment Preparation

- [ ] 1. Crear archivo de variables de entorno de ejemplo
  - Crear archivo `.env.example` en la raíz del proyecto con todas las variables necesarias sin valores sensibles
  - Documentar cada variable con comentarios explicativos sobre su propósito y formato
  - Incluir variables de Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
  - Incluir variables de Google Sheets (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, GOOGLE_SHEETS_SPREADSHEET_ID)
  - Incluir variables opcionales (NEXT_PUBLIC_APP_URL, NODE_ENV)
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Crear archivo de configuración de Vercel
  - Crear archivo `vercel.json` en la raíz del proyecto
  - Configurar framework como "nextjs" y comandos de build con pnpm
  - Agregar headers de seguridad (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
  - Configurar headers específicos para service worker PWA (/sw.js)
  - Configurar Cache-Control para archivos estáticos
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Consolidar y optimizar configuración de Next.js
  - Revisar y consolidar next.config.ts y next.config.js en un solo archivo
  - Integrar webpack fallbacks en next.config.ts
  - Evaluar y ajustar ignoreBuildErrors basado en ambiente (development vs production)
  - Verificar que todas las optimizaciones de paquetes estén incluidas
  - Asegurar que la configuración de PWA esté correcta para producción
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Actualizar archivo .gitignore
  - Verificar que .env* esté en .gitignore (excepto .env.example)
  - Asegurar que .vercel esté excluido
  - Confirmar que archivos sensibles (google_cloud.json, cuenta_personal_google.json) estén excluidos
  - Verificar que node_modules, .next, y archivos de build estén excluidos
  - Mantener archivos de documentación (.md) incluidos en el repositorio
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Crear documentación de despliegue
  - Crear archivo `DEPLOYMENT.md` en la raíz del proyecto
  - Documentar pre-requisitos (cuenta de Vercel, acceso al repositorio, credenciales)
  - Incluir instrucciones paso a paso para configurar variables de entorno en Vercel Dashboard
  - Documentar proceso de primer despliegue (conectar repositorio, configurar proyecto)
  - Incluir instrucciones para despliegues subsecuentes (git push automático)
  - Documentar cómo verificar que el despliegue fue exitoso (smoke tests)
  - Agregar sección de troubleshooting con problemas comunes y soluciones
  - Incluir instrucciones para configurar CORS en Supabase
  - Documentar cómo configurar dominios personalizados (opcional)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. Validar build local
  - Ejecutar comando de limpieza y build local (pnpm clean && pnpm install && pnpm build)
  - Verificar que el directorio .next se genere correctamente
  - Identificar y documentar cualquier error de TypeScript crítico
  - Verificar que no haya errores de dependencias faltantes
  - Confirmar que el tamaño del bundle sea razonable
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7. Optimizar dependencias del proyecto
  - Revisar package.json para identificar dependencias no utilizadas
  - Verificar que dependencias estén en la sección correcta (dependencies vs devDependencies)
  - Mover @types/* y herramientas de desarrollo a devDependencies si están en dependencies
  - Verificar que las optimizaciones de tree-shaking en next.config.ts incluyan todos los paquetes grandes
  - Confirmar que no haya vulnerabilidades críticas ejecutando pnpm audit
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. Configurar URLs y dominios
  - Buscar URLs hardcodeadas en el código fuente (src/app, src/components, src/lib)
  - Reemplazar URLs hardcodeadas con variables de entorno donde sea necesario
  - Agregar NEXT_PUBLIC_APP_URL a .env.example y documentar su uso
  - Crear helper function para obtener la URL base de la aplicación
  - Documentar en DEPLOYMENT.md cómo configurar CORS en Supabase para el dominio de Vercel
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9. Crear script de validación de variables de entorno
  - Crear archivo `src/lib/env-validation.ts` con schema de Zod para validar variables
  - Implementar función que valide variables de entorno en build time
  - Agregar validación al inicio de la aplicación (layout.tsx o middleware)
  - Proveer mensajes de error claros cuando falten variables requeridas
  - _Requirements: 1.4, 6.3_

- [ ] 10. Configurar Vercel Analytics y Speed Insights
  - Verificar que @vercel/analytics y @vercel/speed-insights estén instalados
  - Confirmar que los componentes estén importados en el layout principal
  - Documentar en DEPLOYMENT.md cómo habilitar analytics en Vercel Dashboard
  - _Requirements: 3.1_
