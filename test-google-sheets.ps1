# Script para probar Google Sheets API

Write-Host "🧪 Probando Google Sheets API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: GET - Leer asistencias
Write-Host "📖 Test 1: Leer asistencias (GET)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:9002/api/google-sheets/asistencias" -Method GET
    Write-Host "✅ Success: $($response.success)" -ForegroundColor Green
    Write-Host "📊 Datos: $($response.data.Count) registros" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: POST - Guardar asistencia
Write-Host "💾 Test 2: Guardar asistencia (POST)" -ForegroundColor Yellow
$asistencia = @{
    estudianteId = "12345678"
    grado = "1er Grado"
    seccion = "A"
    fecha = (Get-Date -Format "yyyy-MM-dd")
    status = "presente"
    registradoPor = "Admin Test"
    observaciones = "Prueba de integración - $(Get-Date -Format 'HH:mm:ss')"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:9002/api/google-sheets/asistencias" -Method POST -Body $asistencia -ContentType "application/json"
    Write-Host "✅ Success: $($response.success)" -ForegroundColor Green
    Write-Host "📝 Asistencia guardada correctamente" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: GET - Verificar que se guardó
Write-Host "🔍 Test 3: Verificar datos guardados (GET)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:9002/api/google-sheets/asistencias" -Method GET
    Write-Host "✅ Success: $($response.success)" -ForegroundColor Green
    Write-Host "📊 Total de registros: $($response.data.Count)" -ForegroundColor Green
    
    if ($response.data.Count -gt 0) {
        Write-Host ""
        Write-Host "📋 Último registro:" -ForegroundColor Cyan
        $ultimo = $response.data[-1]
        Write-Host "   Estudiante: $($ultimo[0])" -ForegroundColor White
        Write-Host "   Grado: $($ultimo[1])" -ForegroundColor White
        Write-Host "   Sección: $($ultimo[2])" -ForegroundColor White
        Write-Host "   Fecha: $($ultimo[3])" -ForegroundColor White
        Write-Host "   Estado: $($ultimo[4])" -ForegroundColor White
        Write-Host "   Registrado por: $($ultimo[5])" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "✨ Tests completados!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Verifica también en Google Sheets:" -ForegroundColor Cyan
$sheetUrl = "https://docs.google.com/spreadsheets/d/$env:GOOGLE_SHEETS_SPREADSHEET_ID"
Write-Host "   $sheetUrl" -ForegroundColor White
