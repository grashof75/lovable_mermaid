@echo off
REM Script per sincronizzazione verso GitHub
REM Autore: Claude Code Assistant
REM Data: 2025-08-22

echo ================================================
echo SINCRONIZZAZIONE VERSO GITHUB
echo ================================================

cd /d "c:\CLAUDEcode2025\mermaid-sketcher-451"

echo.
echo [1/5] Verifica status repository...
git status

echo.
echo [2/5] Aggiunta file modificati...
git add src/ database-fixes/ --ignore-errors
git add *.json *.md --ignore-errors

echo.
echo [3/5] Creazione commit...
set /p commit_msg="Inserisci messaggio commit (o premi INVIO per messaggio default): "
if "%commit_msg%"=="" (
    set "commit_msg=Update: modifiche locali sincronizzate"
)

git commit -m "%commit_msg%"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERRORE: Impossibile creare commit
    echo    - Verifica che ci siano modifiche da committare
    echo    - Controlla eventuali conflitti
    pause
    exit /b 1
)

echo.
echo [4/5] Push verso GitHub...
git push origin master

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERRORE: Impossibile fare push su GitHub
    echo    - Verifica connessione internet
    echo    - Controlla autenticazione GitHub
    echo    - Risolvi eventuali conflitti con pull
    pause
    exit /b 1
)

echo.
echo [5/5] Verifica finale...
git log --oneline -3

echo.
echo ✅ SINCRONIZZAZIONE COMPLETATA CON SUCCESSO!
echo    Repository locale sincronizzato con GitHub
echo.
pause