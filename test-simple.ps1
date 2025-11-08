# Test simple de asistencias

Write-Host "`nTEST DE ASISTENCIAS - INKUNA`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:9002"
$fecha = Get-Date -Format "yyyy-MM-dd"

# Test 1: Servidor
Write-Host "1. Verificando servidor..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing
Write-Host "   OK - Servidor corriendo`n" -ForegroundColor Green

# Test 2: Datos actuales
Write-Host "2. Datos actuales..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/api/google-sheets/asistencias" -Method GET
Write-Host "   Registros: $($response.data.Count)`n" -ForegroundColor Green

# Test 3: Guardar asistencias
Write-Host "3. Guardando 4 asistencias de prueba..." -ForegroundColor Yellow

$asistencias = @(
    @{
        estudianteId = "TEST001"
        grado = "1er Grado"
        seccion = "A"
        fecha = $fecha
        status = "presente"
        registradoPor = "Test Admin"
        observaciones = "Prueba 1"
    },
    @{
        estudianteId = "TEST002"
        grado = "1er Grado"
        seccion = "A"
        fecha = $fecha
        status = "tarde"
        registradoPor = "Test Admin"
        observaciones = "Prueba 2"
    },
    @{
        estudianteId = "TEST003"
        grado = "1er Grado"
        seccion = "A"
        fecha = $fecha
        status = "falta"
        registradoPor = "Test Admin"
        observaciones = "Prueba 3"
    },
    @{
        estudianteId = "TEST004"
        grado = "1er Grado"
        seccion = "A"
        fecha = $fecha
        status = "permiso"
        registradoPor = "Test Admin"
        observaciones = "Prueba 4"
    }
)

$body = $asistencias | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$baseUrl/api/google-sheets/asistencias" -Method POST -Body $body -ContentType "application/json"

if ($response.success) {
    Write-Host "   OK - Guardadas $($response.count) asistencias`n" -ForegroundColor Green
} else {
    Write-Host "   ERROR: $($response.error)`n" -ForegroundColor Red
}

# Test 4: Verificar
Write-Host "4. Verificando datos guardados..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/api/google-sheets/asistencias" -Method GET
Write-Host "   Total: $($response.data.Count) registros`n" -ForegroundColor Green

# Mostrar ultimos
if ($response.data.Count -gt 0) {
    Write-Host "Ultimos 4 registros:" -ForegroundColor Cyan
    $ultimos = $response.data | Select-Object -Last 4
    foreach ($reg in $ultimos) {
        Write-Host "  - $($reg[0]) | $($reg[4]) | $($reg[3])" -ForegroundColor White
    }
}

Write-Host "`nTESTS COMPLETADOS!`n" -ForegroundColor Green
