# 🚀 Tu Despliegue Paso a Paso - Beeclass

**Repositorio:** https://github.com/YasmaniJob/beeclass.git  
**Usuario:** YasmaniJob  
**Fecha:** 8 de Noviembre, 2025

---

## ✅ Estado Actual

- ✅ Código corregido y listo
- ✅ Build verificado y funcionando
- ✅ Documentación completa creada
- ✅ Variables de entorno documentadas
- ⏳ **Pendiente:** Push a GitHub y despliegue en Vercel

---

## 🎯 Paso 1: Push a GitHub (AHORA)

Tienes cambios pendientes que necesitas subir a GitHub:

```bash
# 1. Agregar todos los archivos nuevos y modificados
git add .

# 2. Commitear con mensaje descriptivo
git commit -m "Preparar aplicación para despliegue en Vercel - Correcciones críticas y documentación"

# 3. Pushear a GitHub
git push origin main
```

**Ejecuta estos comandos ahora** ⬆️

---

## 🎯 Paso 2: Ir a Vercel

1. Abre tu navegador
2. Ve a: **https://vercel.com/new**
3. Si no tienes cuenta, haz click en **"Continue with GitHub"**
4. Si ya tienes cuenta, inicia sesión

---

## 🎯 Paso 3: Importar tu Repositorio

1. Vercel te mostrará tus repositorios de GitHub
2. Busca: **"beeclass"** o **"YasmaniJob/beeclass"**
3. Click en **"Import"** junto a tu repositorio

---

## 🎯 Paso 4: Configurar el Proyecto

Vercel detectará automáticamente:
- ✅ Framework: Next.js
- ✅ Build Command: `pnpm build`
- ✅ Output Directory: `.next`

**NO cambies nada aquí.** Todo está configurado correctamente en `vercel.json`.

---

## 🎯 Paso 5: Configurar Variables de Entorno (CRÍTICO)

⚠️ **IMPORTANTE:** Configura TODAS estas variables ANTES de hacer deploy.

### Cómo Agregar Variables:

1. En la página de configuración, expande **"Environment Variables"**
2. Para cada variable:
   - Escribe el **Name**
   - Pega el **Value** (de tu archivo `.env` local)
   - Marca las 3 opciones: **Production**, **Preview**, **Development**
   - Click en **"Add"**

### Variables a Configurar:

#### 1. NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://uicpvgzzgmllnepziaws.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Copia el valor completo de tu .env]
Environments: ✓ Production ✓ Preview ✓ Development
```

#### 3. SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Copia el valor completo de tu .env]
Environments: ✓ Production ✓ Preview ✓ Development
```

#### 4. GOOGLE_SERVICE_ACCOUNT_EMAIL
```
Name: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: inkuna-sheets@clean-respect-476520-e3.iam.gserviceaccount.com
Environments: ✓ Production ✓ Preview ✓ Development
```

#### 5. GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
```
Name: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
Value: [Copia el valor completo de tu .env - INCLUYENDO las comillas]
Environments: ✓ Production ✓ Preview ✓ Development
```

⚠️ **ATENCIÓN ESPECIAL:** Esta variable debe incluir:
- Las comillas dobles al inicio y final
- Los `\n` como literales (no como saltos de línea)
- El `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`

#### 6. GOOGLE_SHEETS_SPREADSHEET_ID
```
Name: GOOGLE_SHEETS_SPREADSHEET_ID
Value: 12LhhTp5aCDzMj8fZ_-RvOicvYCIC4hdF_Rauay0WxZs
Environments: ✓ Production ✓ Preview ✓ Development
```

#### 7. NODE_OPTIONS
```
Name: NODE_OPTIONS
Value: --max-old-space-size=4096
Environments: ✓ Production ✓ Preview ✓ Development
```

### ✅ Verificación

Después de agregar todas, deberías ver **7 variables** en la lista.

---

## 🎯 Paso 6: Desplegar

1. **Revisa** que las 7 variables estén configuradas
2. Click en el botón verde **"Deploy"**
3. **Espera** 3-5 minutos mientras Vercel construye tu aplicación

Verás logs en tiempo real:
```
Installing dependencies...
Running "pnpm install"
Building application...
Running "pnpm build"
Optimizing production build...
✓ Build completed successfully
```

---

## 🎯 Paso 7: ¡Éxito! 🎉

Cuando termine, verás:
- ✅ "Congratulations!"
- 🌐 Tu URL: `https://beeclass-xxx.vercel.app`

**Copia esta URL**, la necesitarás en el siguiente paso.

---

## 🎯 Paso 8: Configurar CORS en Supabase

Para que la autenticación funcione:

1. Ve a: **https://supabase.com/dashboard**
2. Selecciona tu proyecto: **uicpvgzzgmllnepziaws**
3. Ve a: **Settings** → **API**
4. En **"Site URL"**, cambia a: `https://tu-app-vercel.app` (tu URL de Vercel)
5. En **"Redirect URLs"**, agrega: `https://tu-app-vercel.app/**`
6. Click en **"Save"**

---

## 🎯 Paso 9: Actualizar NEXT_PUBLIC_APP_URL

1. En Vercel, ve a tu proyecto
2. Click en **Settings** → **Environment Variables**
3. Click en **"Add New"**
4. Agrega:
   ```
   Name: NEXT_PUBLIC_APP_URL
   Value: https://tu-app-vercel.app (tu URL de Vercel)
   Environments: Solo marca Production
   ```
5. Click en **"Save"**

6. Ve a **Deployments**
7. Click en los 3 puntos (...) del último deployment
8. Click en **"Redeploy"**
9. Espera 2-3 minutos

---

## 🎯 Paso 10: Verificar que Todo Funcione

Abre tu aplicación en: `https://tu-app-vercel.app`

Verifica:
- [ ] La página principal carga
- [ ] Puedes hacer login
- [ ] Los datos se cargan
- [ ] No hay errores en la consola (F12)

---

## 🎉 ¡Listo!

Tu aplicación está desplegada en Vercel.

### Despliegues Automáticos

Ahora, cada vez que hagas:
```bash
git push origin main
```

Vercel desplegará automáticamente. Recibirás un email cuando termine.

---

## 📊 Monitoreo

### Ver tus Deployments

1. Ve a: **https://vercel.com/dashboard**
2. Click en tu proyecto **"beeclass"**
3. Verás todos tus deployments

### Habilitar Analytics (Opcional)

1. En tu proyecto, click en **"Analytics"**
2. Click en **"Enable Analytics"**
3. Es gratis para hasta 100k eventos/mes

---

## 🔧 Si Algo Sale Mal

### Build Falla

1. Ve a Vercel → Deployments → Click en el deployment fallido
2. Revisa los logs para ver el error específico
3. Verifica que `NODE_OPTIONS=--max-old-space-size=4096` esté configurado

### No Puedes Hacer Login

1. Verifica que las 3 variables de Supabase estén correctas
2. Confirma que configuraste CORS en Supabase (Paso 8)
3. Revisa la consola del navegador (F12) para ver errores

### Google Sheets No Funciona

1. Verifica que `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` tenga el formato correcto
2. Confirma que la cuenta de servicio tenga permisos en la hoja
3. Verifica que el `GOOGLE_SHEETS_SPREADSHEET_ID` sea correcto

---

## 📞 Recursos

- **Documentación completa:** Ver `GITHUB-VERCEL-DEPLOY.md`
- **Troubleshooting:** Ver `DEPLOYMENT.md`
- **Variables de entorno:** Ver `.env.example`

---

## ✅ Checklist Final

- [ ] Push a GitHub completado
- [ ] Proyecto importado en Vercel
- [ ] 7 variables configuradas
- [ ] Primer deployment exitoso
- [ ] CORS configurado en Supabase
- [ ] NEXT_PUBLIC_APP_URL actualizada
- [ ] Aplicación verificada

---

**¡Empieza con el Paso 1!** ⬆️

Ejecuta los comandos de git para pushear a GitHub, y luego continúa con los siguientes pasos.

**¡Éxito con tu despliegue!** 🚀
