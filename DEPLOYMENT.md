# Guía de Despliegue en Vercel - Beeclass

Esta guía te llevará paso a paso por el proceso de desplegar la aplicación Beeclass en Vercel.

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:

- [ ] Cuenta de Vercel (gratuita en [vercel.com](https://vercel.com))
- [ ] Repositorio Git con el código (GitHub, GitLab, o Bitbucket)
- [ ] Proyecto de Supabase configurado
- [ ] Cuenta de servicio de Google Cloud con acceso a Sheets API
- [ ] Hoja de cálculo de Google Sheets creada

## 🚀 Primer Despliegue

### Paso 1: Preparar el Repositorio

1. Asegúrate de que todos los cambios estén commiteados:
   ```bash
   git add .
   git commit -m "Preparar para despliegue en Vercel"
   git push origin main
   ```

2. Verifica que el archivo `.env` NO esté en el repositorio:
   ```bash
   git ls-files | grep "\.env$"
   # No debería mostrar nada
   ```

### Paso 2: Crear Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New..."** → **"Project"**
3. Importa tu repositorio Git:
   - Selecciona tu proveedor (GitHub/GitLab/Bitbucket)
   - Autoriza el acceso si es necesario
   - Selecciona el repositorio de Beeclass

4. Configura el proyecto:
   - **Framework Preset:** Next.js (detectado automáticamente)
   - **Root Directory:** `./` (raíz del proyecto)
   - **Build Command:** `pnpm build` (ya configurado en vercel.json)
   - **Install Command:** `pnpm install` (ya configurado en vercel.json)
   - **Output Directory:** `.next` (automático)

### Paso 3: Configurar Variables de Entorno

⚠️ **IMPORTANTE:** Este es el paso más crítico. Configura todas las variables antes del primer despliegue.

1. En la página de configuración del proyecto, ve a **"Environment Variables"**

2. Agrega las siguientes variables (obtén los valores de tu archivo `.env` local):

#### Variables de Supabase (REQUERIDAS)

```
NEXT_PUBLIC_SUPABASE_URL
Valor: https://tu-proyecto.supabase.co
Environments: Production, Preview, Development
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
Valor: [Tu clave anon de Supabase]
Environments: Production, Preview, Development
```

```
SUPABASE_SERVICE_ROLE_KEY
Valor: [Tu clave service_role de Supabase]
Environments: Production, Preview, Development
```

#### Variables de Google Sheets (REQUERIDAS)

```
GOOGLE_SERVICE_ACCOUNT_EMAIL
Valor: tu-cuenta@proyecto.iam.gserviceaccount.com
Environments: Production, Preview, Development
```

```
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
Valor: "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
Environments: Production, Preview, Development
```

⚠️ **ATENCIÓN ESPECIAL para GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:**
- Copia la clave COMPLETA incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Los saltos de línea deben ser `\n` literales (no saltos de línea reales)
- Debe estar entre comillas dobles
- Ejemplo correcto:
  ```
  "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
  ```

```
GOOGLE_SHEETS_SPREADSHEET_ID
Valor: [ID de tu hoja de cálculo]
Environments: Production, Preview, Development
```

#### Variables de Aplicación (RECOMENDADAS)

```
NEXT_PUBLIC_APP_URL
Valor: https://tu-app.vercel.app (lo obtendrás después del primer deploy)
Environments: Production
```

```
NODE_OPTIONS
Valor: --max-old-space-size=4096
Environments: Production, Preview, Development
```

💡 **Tip:** Puedes dejar `NEXT_PUBLIC_APP_URL` vacía por ahora y agregarla después del primer despliegue.

### Paso 4: Desplegar

1. Click en **"Deploy"**
2. Espera a que el build termine (puede tomar 3-5 minutos)
3. Si todo está correcto, verás ✅ **"Deployment Ready"**

### Paso 5: Verificar el Despliegue

1. Click en **"Visit"** para abrir tu aplicación
2. Verifica que la página cargue correctamente
3. Prueba el login con Supabase
4. Verifica que la conexión a Google Sheets funcione

### Paso 6: Configurar CORS en Supabase

Para que la autenticación funcione correctamente:

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. En **"Site URL"**, agrega tu dominio de Vercel:
   ```
   https://tu-app.vercel.app
   ```
5. En **"Redirect URLs"**, agrega:
   ```
   https://tu-app.vercel.app/**
   ```
6. Click en **"Save"**

### Paso 7: Actualizar NEXT_PUBLIC_APP_URL

1. Copia la URL de tu aplicación (ej: `https://tu-app.vercel.app`)
2. En Vercel, ve a **Settings** → **Environment Variables**
3. Agrega o actualiza:
   ```
   NEXT_PUBLIC_APP_URL = https://tu-app.vercel.app
   ```
4. Selecciona **Production** environment
5. Click en **"Save"**
6. Ve a **Deployments** y click en **"Redeploy"** en el último deployment

## 🔄 Despliegues Subsecuentes

Una vez configurado, los despliegues son automáticos:

1. Haz cambios en tu código
2. Commitea y pushea a tu repositorio:
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push origin main
   ```
3. Vercel detectará el push y desplegará automáticamente
4. Recibirás notificaciones del estado del despliegue

### Despliegue Manual

Si necesitas redesplegar sin cambios:

1. Ve a tu proyecto en Vercel
2. Click en **"Deployments"**
3. Click en los tres puntos (...) del último deployment
4. Click en **"Redeploy"**

## ✅ Checklist Post-Despliegue

Después del primer despliegue exitoso, verifica:

- [ ] La aplicación carga correctamente
- [ ] El login con Supabase funciona
- [ ] Los datos se cargan desde Supabase
- [ ] La sincronización con Google Sheets funciona
- [ ] El PWA se puede instalar (en móvil)
- [ ] No hay errores en la consola del navegador
- [ ] Las imágenes cargan correctamente
- [ ] La navegación entre páginas funciona

## 🔧 Troubleshooting

### Error: "Build failed"

**Síntoma:** El build falla en Vercel

**Soluciones:**
1. Verifica que `NODE_OPTIONS=--max-old-space-size=4096` esté configurado
2. Revisa los logs de build en Vercel para errores específicos
3. Asegúrate de que el build funcione localmente: `pnpm build`

### Error: "Cannot connect to Supabase"

**Síntoma:** Errores de autenticación o conexión a base de datos

**Soluciones:**
1. Verifica que las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctas
2. Confirma que el dominio de Vercel esté en la lista de URLs permitidas en Supabase
3. Revisa la configuración de CORS en Supabase

### Error: "Google Sheets API authentication failed"

**Síntoma:** No se pueden leer/escribir datos en Google Sheets

**Soluciones:**
1. Verifica que `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` tenga el formato correcto:
   - Debe incluir `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
   - Los saltos de línea deben ser `\n` literales
   - Debe estar entre comillas dobles
2. Confirma que la cuenta de servicio tenga permisos de editor en la hoja
3. Verifica que `GOOGLE_SHEETS_SPREADSHEET_ID` sea correcto

### Error: "Dynamic server usage"

**Síntoma:** Warnings sobre rutas que no pueden ser estáticas

**Solución:** Esto es normal y esperado. La aplicación usa cookies para autenticación, lo que hace que las páginas sean dinámicas. No es un error.

### Error: "Module not found"

**Síntoma:** Errores sobre módulos faltantes

**Soluciones:**
1. Asegúrate de que todas las dependencias estén en `package.json`
2. Verifica que `pnpm-lock.yaml` esté commiteado
3. Intenta limpiar y reinstalar: `pnpm clean && pnpm install`

### Build muy lento o timeout

**Síntoma:** El build toma más de 10 minutos o falla por timeout

**Soluciones:**
1. Verifica que `NODE_OPTIONS=--max-old-space-size=4096` esté configurado
2. Considera actualizar tu plan de Vercel si el problema persiste
3. Revisa si hay dependencias innecesarias que puedan eliminarse

## 🌐 Configurar Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. En Vercel, ve a **Settings** → **Domains**
2. Click en **"Add"**
3. Ingresa tu dominio (ej: `beeclass.tudominio.com`)
4. Sigue las instrucciones para configurar DNS:
   - **Tipo A:** Apunta a la IP de Vercel
   - **Tipo CNAME:** Apunta a `cname.vercel-dns.com`
5. Espera a que la verificación DNS complete (puede tomar hasta 48 horas)
6. Actualiza `NEXT_PUBLIC_APP_URL` con tu nuevo dominio
7. Actualiza las URLs en Supabase con tu nuevo dominio

## 📊 Monitoreo y Analytics

### Vercel Analytics

Vercel Analytics ya está configurado en la aplicación. Para habilitarlo:

1. Ve a tu proyecto en Vercel
2. Click en **"Analytics"** en el menú lateral
3. Click en **"Enable Analytics"**
4. Los datos comenzarán a aparecer después de algunas visitas

### Vercel Speed Insights

Speed Insights también está configurado. Para verlo:

1. Ve a **"Speed Insights"** en el menú lateral
2. Revisa las métricas de Web Vitals
3. Identifica páginas lentas para optimizar

## 🔐 Seguridad

### Mejores Prácticas

- ✅ Nunca commitees archivos `.env` al repositorio
- ✅ Rota las credenciales regularmente (cada 3-6 meses)
- ✅ Usa diferentes credenciales para desarrollo y producción
- ✅ Revisa los logs de Vercel regularmente para detectar errores
- ✅ Mantén las dependencias actualizadas: `pnpm update`
- ✅ Habilita 2FA en tu cuenta de Vercel

### Variables Sensibles

Las siguientes variables son sensibles y deben protegerse:
- `SUPABASE_SERVICE_ROLE_KEY` - Acceso completo a la base de datos
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` - Acceso a Google Sheets

Nunca las compartas públicamente ni las incluyas en el código.

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs en Vercel: **Deployments** → Click en el deployment → **"View Function Logs"**
2. Revisa la documentación de Vercel: [vercel.com/docs](https://vercel.com/docs)
3. Revisa la documentación de Next.js: [nextjs.org/docs](https://nextjs.org/docs)
4. Contacta al equipo de desarrollo

## 📝 Rollback

Si necesitas volver a una versión anterior:

1. Ve a **Deployments** en Vercel
2. Encuentra el deployment que funcionaba correctamente
3. Click en los tres puntos (...) → **"Promote to Production"**
4. Confirma la acción

El rollback es instantáneo y no requiere rebuild.

---

**¡Felicidades!** 🎉 Tu aplicación Beeclass está ahora desplegada en Vercel.
