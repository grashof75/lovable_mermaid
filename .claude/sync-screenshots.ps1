# Script PowerShell per sincronizzare automaticamente gli screenshot
# Esegui questo script in background mentre lavori con Claude

param(
    [string]$SourcePath = "G:\My Drive\_CLAUDE.CODE\SCREENSHOT",
    [string]$DestPath = ".claude\SCREENSHOT",
    [int]$IntervalSeconds = 5
)

Write-Host "Screenshot Auto-Sync attivo" -ForegroundColor Green
Write-Host "Da: $SourcePath" -ForegroundColor Cyan
Write-Host "A: $DestPath" -ForegroundColor Cyan
Write-Host "Controllo ogni $IntervalSeconds secondi..." -ForegroundColor Yellow
Write-Host "Premi Ctrl+C per fermare" -ForegroundColor Red
Write-Host ""

$lastSync = Get-Date

while ($true) {
    try {
        # Verifica che la cartella sorgente esista
        if (Test-Path $SourcePath) {
            # Copia nuovi file o file modificati
            $files = Get-ChildItem -Path $SourcePath -File -Include *.png,*.jpg,*.jpeg,*.gif

            foreach ($file in $files) {
                $destFile = Join-Path $DestPath $file.Name

                # Copia solo se il file non esiste o è più recente
                if (-not (Test-Path $destFile) -or ($file.LastWriteTime -gt (Get-Item $destFile).LastWriteTime)) {
                    Copy-Item $file.FullName -Destination $destFile -Force
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Copiato: $($file.Name)" -ForegroundColor Green
                }
            }
        }

        Start-Sleep -Seconds $IntervalSeconds

    } catch {
        Write-Host "Errore: $_" -ForegroundColor Red
        Start-Sleep -Seconds $IntervalSeconds
    }
}
