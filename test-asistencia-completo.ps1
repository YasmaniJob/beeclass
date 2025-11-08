# Test completo de asistencias con Google Sheets

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST DE ASISTENCIAS - INKUNA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configuracion
$baseUrl = "http://localhost:9002"
$fecha = Get-Date -Format "yyyy-MM-dd"

Write-Host "Fecha de prueba: $fecha" -ForegroundColor Yellow
Write-Host ""

# Test 1: Verificar que el servidor este corriendo
Write-Host "1. Verificando servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Servidor corriendo en $baseUrl" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Error: Servidor no responde" -ForegroundColor Red
    Write-Host "   Asegurate de que 'pnpm dev' este corriendo" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Limpiar datos previos (opcional)
Write-Host "2. Verificando datos existentes..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/google-sheets/asistencias" -Method GET
    $count = $response.data.Count
    Write-Host "   ✓ Registros actuales: $count" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error al leer datos: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Guardar asistencias de prueba (simulando una seccion completa)
Write-Host "3. Guardando asistencias de prueba..." -ForegroundColor Yellow

$asistencias = @(
    @{
        estudianteId = "12345678"
        grado = "1er Grado"
        seccion = "A"
        fecha = $fecha
        status = "presente"
        registradoPor = "Test Admin"
        observaciones = "Prueba automatica 1"
    },
    @{
        estudianteId = "87654321"
        grado = "1er Grado"
        seccion = "A"
        fecha = $fecha
        status = "tarde"
        registradoPor = "Test Admin"
        observaciones = "Llego 10 minutos tarde"
    },
    @{
        estudianteId = "11223344"
        grado = "1er Grado"
        seccion = "A"
        fecha = $fecha
        status = "falta"
        registradoPor = "Test Admin"
        observaciones = "Sin justificacion"
    },
    @{
        estudianteId = "55667788"
        grado = "1er Grado"
        seccion = "A"
        fecha = $fecha
        status = "permiso"
        registradoPor = "Test Admin"
        observaciones = "Permiso medico"
    }
)

$body = $asistencias | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/google-sheets/asistencias" -Method POST -Body $body -ContentType "application/json"
    if ($response.success) {
        Write-Host "   ✓ Guardadas $($response.count) asistencias" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Error: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Error al guardar: $_" -ForegroundColor Red
    Write-Host "   Detalles: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Verificar que se guardaron
Write-Host "4. Verificando datos guardados..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/google-sheets/asistencias" -Method GET
    $newCount = $response.data.Count
    Write-Host "   ✓ Total de registros: $newCount" -ForegroundColor Green
    
    # Mostrar ultimos registros
    if ($newCount -gt 0) {
        Write-Host "`n   Ultimos registros guardados:" -ForegroundColor Cyan
        $ultimos = $response.data | Select-Object -Last 4
        foreach ($registro in $ultimos) {
            Write-Host "   - Estudiante: $($registro[0]) | Estado: $($registro[4]) | Fecha: $($registro[3])" -ForegroundColor White
        }
    }
} catch {
    Write-Host "   ✗ Error al verificar: $_" -ForegroundColor Red
}

Write-Host ""

# Test 5: Estadisticas
Write-Host "5. Estadisticas del dia:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/google-sheets/asistencias" -Method GET
    $hoy = $response.data | Where-Object { $_[3] -eq $fecha }
    
    $presentes = ($hoy | Where-Object { $_[4] -eq "presente" }).Count
    $tardes = ($hoy | Where-Object { $_[4] -eq "tarde" }).Count
    $faltas = ($hoy | Where-Object { $_[4] -eq "falta" }).Count
    $permisos = ($hoy | Where-Object { $_[4] -eq "permiso" }).Count
    
    Write-Host "   Presentes: $presentes" -ForegroundColor Green
    Write-Host "   Tardes: $tardes" -ForegroundColor Yellow
    Write-Host "   Faltas: $faltas" -ForegroundColor Red
    Write-Host "   Permisos: $permisos" -ForegroundColor Blue
} catch {
    Write-Host "   ✗ Error al calcular estadisticas: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS COMPLETADOS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Verifica tambien en Google Sheets:" -ForegroundColor Yellow
$sheetUrl = "https://docs.google.com/spreadsheets/d/$env:GOOGLE_SHEETS_SPREADSHEET_ID"
Write-Host "$sheetUrl`n" -ForegroundColor White
