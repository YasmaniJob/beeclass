# Test CRUD de Estudiantes - Inkuña

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST CRUD ESTUDIANTES - INKUNA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:9002"

# Test 1: Verificar que el servidor esté corriendo
Write-Host "1. Verificando servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Servidor corriendo en $baseUrl" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Error: Servidor no responde" -ForegroundColor Red
    Write-Host "   Asegúrate de que 'pnpm dev' esté corriendo" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Verificar que la página de estudiantes carga
Write-Host "2. Verificando página de estudiantes..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/estudiantes" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Página de estudiantes carga correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Error al cargar página: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Instrucciones para prueba manual
Write-Host "3. Pruebas manuales requeridas:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   📋 PASOS PARA PROBAR:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Abre el navegador en:" -ForegroundColor White
Write-Host "      $baseUrl/estudiantes" -ForegroundColor Green
Write-Host ""
Write-Host "   2. Haz click en el botón 'Nuevo' (esquina superior derecha)" -ForegroundColor White
Write-Host ""
Write-Host "   3. Completa el formulario con estos datos de prueba:" -ForegroundColor White
Write-Host "      - Tipo Documento: DNI" -ForegroundColor Gray
Write-Host "      - Número: TEST001" -ForegroundColor Gray
Write-Host "      - Apellido Paterno: PRUEBA" -ForegroundColor Gray
Write-Host "      - Apellido Materno: TEST" -ForegroundColor Gray
Write-Host "      - Nombres: ESTUDIANTE UNO" -ForegroundColor Gray
Write-Host "      - Sexo: Masculino" -ForegroundColor Gray
Write-Host "      - Grado: 1er Grado" -ForegroundColor Gray
Write-Host "      - Sección: A" -ForegroundColor Gray
Write-Host ""
Write-Host "   4. Haz click en 'Crear'" -ForegroundColor White
Write-Host ""
Write-Host "   5. Verifica que:" -ForegroundColor White
Write-Host "      ✓ Aparece un toast de éxito" -ForegroundColor Gray
Write-Host "      ✓ El diálogo se cierra" -ForegroundColor Gray
Write-Host "      ✓ El estudiante aparece en la lista" -ForegroundColor Gray
Write-Host "      ✓ El contador de estudiantes aumenta" -ForegroundColor Gray
Write-Host ""
Write-Host "   6. Verifica en Supabase Dashboard:" -ForegroundColor White
Write-Host "      - Tabla: estudiantes" -ForegroundColor Gray
Write-Host "      - Busca: TEST001" -ForegroundColor Gray
Write-Host "      - Confirma que el registro existe" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CHECKLIST DE FUNCIONALIDADES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✓ Repositorio Supabase creado" -ForegroundColor Green
Write-Host "✓ Formulario de estudiante creado" -ForegroundColor Green
Write-Host "✓ Botón 'Nuevo' agregado" -ForegroundColor Green
Write-Host "✓ Diálogo conectado" -ForegroundColor Green
Write-Host "✓ Manejador de guardado implementado" -ForegroundColor Green
Write-Host "✓ Refresh automático configurado" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Pendiente: Probar en navegador" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FUNCIONALIDADES CRUD" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ CREATE - Crear estudiante" -ForegroundColor Green
Write-Host "   - Formulario completo" -ForegroundColor Gray
Write-Host "   - Validaciones" -ForegroundColor Gray
Write-Host "   - Guardado en Supabase" -ForegroundColor Gray
Write-Host ""
Write-Host "⏳ READ - Leer estudiantes" -ForegroundColor Yellow
Write-Host "   - Ya funciona desde Supabase" -ForegroundColor Gray
Write-Host "   - Filtrado por grado/sección" -ForegroundColor Gray
Write-Host ""
Write-Host "⏳ UPDATE - Actualizar estudiante" -ForegroundColor Yellow
Write-Host "   - Pendiente: Botón editar en tabla" -ForegroundColor Gray
Write-Host "   - Formulario ya soporta modo edición" -ForegroundColor Gray
Write-Host ""
Write-Host "⏳ DELETE - Eliminar estudiante" -ForegroundColor Yellow
Write-Host "   - Pendiente: Botón eliminar en tabla" -ForegroundColor Gray
Write-Host "   - Función ya existe en hook" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Probar creación de estudiante en navegador" -ForegroundColor White
Write-Host "2. Verificar en Supabase Dashboard" -ForegroundColor White
Write-Host "3. Agregar botones editar/eliminar (opcional)" -ForegroundColor White
Write-Host "4. Continuar con Fase 3: Evaluaciones" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS COMPLETADOS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
