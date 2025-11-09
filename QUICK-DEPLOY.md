# 🚀 Despliegue Rápido en Vercel (GitHub)

## ⚡ Guía Express (5 minutos)

### 1️⃣ Push al Repositorio de GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2️⃣ Conectar GitHub con Vercel
1. Ve a [vercel.com/new](https://vercel.com/new)
2. Si es tu primera vez, autoriza Vercel a acceder a GitHub
3. Selecciona tu repositorio de Beeclass
4. Vercel detectará automáticamente que es Next.js
5. **NO hagas click en Deploy todavía** - primero configura las variables

### 3️⃣ Configurar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables, agrega:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-cuenta@proyecto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=tu_spreadsheet_id

# Build Config
NODE_OPTIONS=--max-old-space-size=4096
```

⚠️ **Importante:** Para `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, los `\n` deben ser literales, no saltos de línea reales.

### 4️⃣ Desplegar
1. Ahora sí, click en **"Deploy"**
2. Espera 3-5 minutos mientras Vercel construye tu app
3. ✅ ¡Listo! Vercel te dará una URL como `https://beeclass-xxx.vercel.app`

### 📝 Nota sobre Cuenta Free de Vercel
- ✅ Despliegues ilimitados
- ✅ Despliegues automáticos con cada push a GitHub
- ✅ HTTPS automático
- ✅ 100GB de ancho de banda/mes
- ✅ Suficiente para proyectos pequeños/medianos

### 5️⃣ Configurar CORS en Supabase
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Settings → API
3. Agrega tu URL de Vercel a "Site URL" y "Redirect URLs"

---

## ✅ Verificación Rápida

Después del despliegue, verifica:
- [ ] La app carga
- [ ] Login funciona
- [ ] Datos se cargan

---

## 📖 Documentación Completa

**Despliegue desde GitHub (Recomendado):** Ver **`GITHUB-VERCEL-DEPLOY.md`**

Para instrucciones generales, ver: **`DEPLOYMENT.md`**

Para troubleshooting, ver: **`VERCEL-DEPLOYMENT-AUDIT.md`**
