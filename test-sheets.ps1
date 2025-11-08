# Test Google Sheets API

Write-Host "Probando Google Sheets API..." -ForegroundColor Cyan

# Test GET
Write-Host "`nTest 1: Leer asistencias" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:9002/api/google-sheets/asistencias" -Method GET
Write-Host "Success: $($response.success)" -ForegroundColor Green
Write-Host "Registros: $($response.data.Count)" -ForegroundColor Green

# Test POST
Write-Host "`nTest 2: Guardar asistencia" -ForegroundColor Yellow
$body = @{
    estudianteId = "12345678"
    grado = "1er Grado"
    seccion = "A"
    fecha = (Get-Date -Format "yyyy-MM-dd")
    status = "presente"
    registradoPor = "Admin Test"
    observaciones = "Prueba de integracion"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:9002/api/google-sheets/asistencias" -Method POST -Body $body -ContentType "application/json"
Write-Host "Success: $($response.success)" -ForegroundColor Green

# Verificar
Write-Host "`nTest 3: Verificar datos guardados" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:9002/api/google-sheets/asistencias" -Method GET
Write-Host "Total registros: $($response.data.Count)" -ForegroundColor Green

if ($response.data.Count -gt 0) {
    Write-Host "`nUltimo registro:" -ForegroundColor Cyan
    $ultimo = $response.data[-1]
    Write-Host "  Estudiante: $($ultimo[0])"
    Write-Host "  Grado: $($ultimo[1])"
    Write-Host "  Seccion: $($ultimo[2])"
    Write-Host "  Fecha: $($ultimo[3])"
    Write-Host "  Estado: $($ultimo[4])"
}

Write-Host "`nTests completados!" -ForegroundColor Green
