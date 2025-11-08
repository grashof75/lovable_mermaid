@echo off
REM Script per sincronizzazione da GitHub
REM Autore: Claude Code Assistant
REM Data: 2025-08-22

echo ================================================
echo SINCRONIZZAZIONE DA GITHUB
echo ================================================

cd /d "c:\CLAUDEcode2025\mermaid-sketcher-451"

echo.
echo [1/5] Verifica status repository locale...
git status

echo.
echo [2/5] Backup modifiche locali non committate...
git stash push -m "Backup automatico prima di sync da GitHub - %date% %time%"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Modifiche locali salvate in stash
) else (
    echo ℹ️ Nessuna modifica locale da salvare
)

echo.
echo [3/5] Fetch da GitHub...
git fetch origin

echo.
echo [4/5] Merge/pull da GitHub...
git pull origin master

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERRORE: Impossibile fare pull da GitHub
    echo    - Verifica connessione internet
    echo    - Risolvi eventuali conflitti manualmente
    echo    - Usa 'git status' per vedere i conflitti
    pause
    exit /b 1
)

echo.
echo [5/5] Ripristino modifiche locali se necessario...
git stash list | findstr "Backup automatico prima di sync"
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ⚠️ ATTENZIONE: Hai modifiche locali in stash
    echo   Per ripristinarle usa: git stash pop
    echo   Per eliminarle usa: git stash drop
    echo.
    set /p restore_stash="Vuoi ripristinare le modifiche locali? (y/N): "
    if /I "%restore_stash%"=="y" (
        git stash pop
        if %ERRORLEVEL% EQU 0 (
            echo ✅ Modifiche locali ripristinate
        ) else (
            echo ❌ Conflitto nel ripristino - risolvi manualmente
        )
    )
)

echo.
echo [6/6] Status finale...
git log --oneline -3
git status

echo.
echo ✅ SINCRONIZZAZIONE DA GITHUB COMPLETATA!
echo    Repository locale aggiornato
echo.
pause