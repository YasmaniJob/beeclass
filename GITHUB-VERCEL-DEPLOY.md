# 🚀 Despliegue en Vercel desde GitHub (Cuenta Free)

Esta guía está optimizada para desplegar desde GitHub usando una cuenta gratuita de Vercel.

## 📋 Pre-requisitos

- [x] Código en repositorio de GitHub
- [x] Cuenta de Vercel (gratuita) - [Crear cuenta](https://vercel.com/signup)
- [x] Credenciales de Supabase
- [x] Credenciales de Google Sheets API

## 🎯 Paso a Paso

### Paso 1: Preparar el Repositorio en GitHub

1. **Asegúrate de que todos los cambios estén en GitHub:**
   ```bash
   git status
   git add .
   git commit -m "Preparar para despliegue en Vercel"
   git push origin main
   ```

2. **Verifica que el archivo `.env` NO esté en GitHub:**
   ```bash
   # Este comando no debería mostrar nada
   git ls-files | grep "\.env$"
   ```
   
   Si aparece `.env`, significa que está commiteado (¡mal!). Para removerlo:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from repository"
   git push origin main
   ```

### Paso 2: Conectar GitHub con Vercel

1. **Ve a Vercel:**
   - Abre [vercel.com](https://vercel.com)
   - Inicia sesión o crea una cuenta (usa "Continue with GitHub" para más fácil)

2. **Autorizar Vercel en GitHub:**
   - Si es tu primera vez, Vercel te pedirá acceso a GitHub
   - Click en **"Authorize Vercel"**
   - Puedes dar acceso a todos los repos o solo a repos específicos

3. **Importar tu Proyecto:**
   - Click en **"Add New..."** → **"Project"**
   - Verás una lista de tus repositorios de GitHub
   - Busca tu repositorio de Beeclass
   - Click en **"Import"**

### Paso 3: Configurar el Proyecto

Vercel detectará automáticamente que es Next.js. Verás:

```
Framework Preset: Next.js
Build Command: next build (detectado automáticamente)
Output Directory: .next (detectado automáticamente)
Install Command: pnpm install (detectado de package.json)
```

**✅ No cambies nada aquí** - Vercel ya detectó todo correctamente gracias a `vercel.json`.

### Paso 4: Configurar Variables de Entorno

⚠️ **IMPORTANTE:** Configura TODAS las variables ANTES de hacer el primer deploy.

1. **Expande la sección "Environment Variables"**

2. **Agrega cada variable una por una:**

#### Variables de Supabase (REQUERIDAS)

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://tu-proyecto.supabase.co
```
- Obtener en: Supabase Dashboard → Settings → API → Project URL
- Environments: Marca las 3 (Production, Preview, Development)

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Tu clave anon completa]
```
- Obtener en: Supabase Dashboard → Settings → API → anon public
- Environments: Marca las 3

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Tu clave service_role completa]
```
- Obtener en: Supabase Dashboard → Settings → API → service_role
- Environments: Marca las 3
- ⚠️ Esta clave es sensible, nunca la compartas

#### Variables de Google Sheets (REQUERIDAS)

```
Name: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: tu-cuenta@proyecto.iam.gserviceaccount.com
```
- Obtener en: Google Cloud Console → IAM & Admin → Service Accounts
- Environments: Marca las 3

```
Name: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
Value: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0...\n-----END PRIVATE KEY-----\n"
```
- Obtener en: Google Cloud Console → Service Accounts → Keys
- Environments: Marca las 3

**⚠️ ATENCIÓN ESPECIAL para esta variable:**
- Debe incluir las comillas dobles al inicio y final
- Los saltos de línea deben ser `\n` literales (no saltos de línea reales)
- Debe incluir `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Ejemplo correcto:
  ```
  "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...[resto de la clave]...\n-----END PRIVATE KEY-----\n"
  ```

```
Name: GOOGLE_SHEETS_SPREADSHEET_ID
Value: [ID de tu hoja de cálculo]
```
- Obtener de la URL: `https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit`
- Environments: Marca las 3

#### Variables de Configuración (REQUERIDAS)

```
Name: NODE_OPTIONS
Value: --max-old-space-size=4096
```
- Esto es crítico para que el build no falle por falta de memoria
- Environments: Marca las 3

### Paso 5: Desplegar

1. **Revisa que todas las variables estén configuradas** (deberías tener 7 variables)

2. **Click en el botón verde "Deploy"**

3. **Espera el build:**
   - Verás logs en tiempo real
   - El proceso toma 3-5 minutos
   - Verás mensajes como:
     ```
     Installing dependencies...
     Building application...
     Optimizing production build...
     ```

4. **¡Éxito!** 🎉
   - Verás "Congratulations!" cuando termine
   - Vercel te dará una URL como: `https://beeclass-xxx.vercel.app`

### Paso 6: Configurar CORS en Supabase

Para que la autenticación funcione:

1. **Ve a tu Dashboard de Supabase:**
   - [supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto

2. **Configura las URLs:**
   - Ve a **Settings** → **API**
   - En **"Site URL"**, agrega: `https://tu-app.vercel.app`
   - En **"Redirect URLs"**, agrega: `https://tu-app.vercel.app/**`
   - Click en **"Save"**

### Paso 7: Actualizar NEXT_PUBLIC_APP_URL

1. **Copia tu URL de Vercel** (ej: `https://beeclass-xxx.vercel.app`)

2. **Agrega la variable en Vercel:**
   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Click en **"Add New"**
   - Name: `NEXT_PUBLIC_APP_URL`
   - Value: `https://tu-app.vercel.app`
   - Environments: Solo marca **Production**
   - Click en **"Save"**

3. **Redesplegar:**
   - Ve a **Deployments**
   - Click en los 3 puntos (...) del último deployment
   - Click en **"Redeploy"**
   - Espera 2-3 minutos

### Paso 8: Verificar que Todo Funcione

Abre tu aplicación y verifica:

- [ ] La página principal carga
- [ ] Puedes hacer login
- [ ] Los datos de Supabase se cargan
- [ ] La sincronización con Google Sheets funciona
- [ ] No hay errores en la consola del navegador (F12)
- [ ] El PWA se puede instalar (en móvil)

## 🔄 Despliegues Automáticos

¡Buenas noticias! Ahora cada vez que hagas push a GitHub, Vercel desplegará automáticamente:

```bash
# Haces cambios en tu código
git add .
git commit -m "Agregar nueva funcionalidad"
git push origin main

# Vercel detecta el push y despliega automáticamente
# Recibirás un email cuando termine
```

### Ramas y Preview Deployments

Con la cuenta free de Vercel:
- **main/master:** Se despliega a producción automáticamente
- **Otras ramas:** Crean "Preview Deployments" (URLs temporales para probar)

Ejemplo:
```bash
git checkout -b feature/nueva-funcionalidad
# Haces cambios
git push origin feature/nueva-funcionalidad
# Vercel crea un preview deployment con URL única
```

## 📊 Monitoreo

### Ver Logs en Tiempo Real

1. Ve a tu proyecto en Vercel
2. Click en **"Deployments"**
3. Click en cualquier deployment
4. Click en **"View Function Logs"**

### Analytics (Opcional)

Vercel Analytics ya está configurado en tu app:

1. Ve a tu proyecto en Vercel
2. Click en **"Analytics"** en el menú lateral
3. Click en **"Enable Analytics"**
4. Es gratis para hasta 100k eventos/mes

## 🔧 Troubleshooting

### Error: "Build failed - Out of memory"

**Solución:** Verifica que `NODE_OPTIONS=--max-old-space-size=4096` esté configurado en las variables de entorno.

### Error: "Cannot connect to Supabase"

**Soluciones:**
1. Verifica que las 3 variables de Supabase estén correctas
2. Confirma que tu dominio de Vercel esté en CORS de Supabase
3. Revisa los logs en Vercel para ver el error específico

### Error: "Google Sheets authentication failed"

**Soluciones:**
1. Verifica el formato de `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`:
   - Debe tener comillas dobles
   - Los `\n` deben ser literales
   - Debe incluir BEGIN y END
2. Confirma que la cuenta de servicio tenga permisos en la hoja
3. Verifica que el `GOOGLE_SHEETS_SPREADSHEET_ID` sea correcto

### El build es muy lento

**Esto es normal en cuenta free:**
- Primera vez: 5-10 minutos
- Subsecuentes: 2-5 minutos
- Vercel cachea dependencias para acelerar builds futuros

### Límites de la Cuenta Free

- ✅ Despliegues ilimitados
- ✅ 100GB bandwidth/mes
- ✅ 100 GB-hours de build time/mes
- ⚠️ Build timeout: 45 minutos (tu app toma ~3 min, así que está bien)
- ⚠️ Serverless function timeout: 10 segundos

Si llegas a los límites, Vercel te notificará.

## 🎯 Mejores Prácticas

### 1. Protege tu Rama Main

En GitHub:
1. Settings → Branches
2. Add rule para `main`
3. Marca "Require pull request reviews"
4. Así evitas deployments accidentales

### 2. Usa Preview Deployments

Para probar cambios antes de producción:
```bash
git checkout -b test/mi-cambio
# Haces cambios
git push origin test/mi-cambio
# Vercel crea preview deployment
# Pruebas en la URL temporal
# Si funciona, haces merge a main
```

### 3. Monitorea tus Deployments

- Activa notificaciones en Vercel (Settings → Notifications)
- Recibirás emails cuando:
  - Un deployment inicie
  - Un deployment termine exitosamente
  - Un deployment falle

### 4. Mantén las Dependencias Actualizadas

Cada mes:
```bash
pnpm update
pnpm build  # Verifica que funcione
git commit -am "Update dependencies"
git push
```

## 🔐 Seguridad

### Variables de Entorno

- ✅ Nunca commitees `.env` a GitHub
- ✅ Las variables en Vercel están encriptadas
- ✅ Solo tú y tu equipo pueden verlas
- ✅ Rota credenciales cada 3-6 meses

### Acceso al Proyecto

En Vercel, puedes invitar a tu equipo:
1. Settings → Team Members
2. Invite via email
3. Asigna roles (Owner, Member, Viewer)

## 📞 Soporte

### Recursos Útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel + Next.js](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Si Algo Sale Mal

1. Revisa los logs en Vercel
2. Verifica las variables de entorno
3. Prueba el build localmente: `pnpm build`
4. Revisa esta guía de troubleshooting

---

## ✅ Checklist Final

Antes de considerar el despliegue completo:

- [ ] Código pusheado a GitHub
- [ ] Proyecto creado en Vercel
- [ ] 7 variables de entorno configuradas
- [ ] Primer deployment exitoso
- [ ] CORS configurado en Supabase
- [ ] NEXT_PUBLIC_APP_URL actualizada
- [ ] Aplicación verificada y funcionando
- [ ] Analytics habilitado (opcional)

---

**¡Felicidades!** 🎉 Tu aplicación Beeclass está desplegada en Vercel con despliegues automáticos desde GitHub.

Cada push a `main` desplegará automáticamente. ¡Así de fácil!
