# Configuración de Variables de Entorno para Google Sheets

## Google Sheets Configuration
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your_client_id

## Database Configuration (for hybrid approach)
DATABASE_URL=your_supabase_or_firebase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

## Feature Flags
USE_GOOGLE_SHEETS_FOR_ASISTENCIAS=true
USE_DATABASE_FOR_MAESTROS=true

## Pasos de Configuración:

1. **Crear Service Account en Google Cloud Console:**
   - Ir a Google Cloud Console > IAM & Admin > Service Accounts
   - Crear nueva Service Account con rol "Editor" para Google Sheets API
   - Descargar el archivo JSON con las credenciales

2. **Compartir Google Sheet:**
   - Crear una hoja de cálculo nueva
   - Compartir con el email del Service Account (en GOOGLE_CLIENT_EMAIL)
   - Configurar las siguientes columnas:
     - A: estudianteId
     - B: fecha
     - C: hora
     - D: status
     - E: registradoPor
     - F: timestamp

3. **Configurar Variables de Entorno:**
   - Copiar este archivo como .env.local
   - Reemplazar los valores con tus credenciales reales
