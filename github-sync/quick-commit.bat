@echo off
REM Script per commit rapido
REM Autore: Claude Code Assistant  
REM Data: 2025-08-22

echo ================================================
echo COMMIT RAPIDO
echo ================================================

cd /d "c:\CLAUDEcode2025\mermaid-sketcher-451"

echo.
echo Modifiche attuali:
git status --short

echo.
set /p commit_msg="Messaggio commit: "
if "%commit_msg%"=="" (
    echo ❌ ERRORE: Messaggio commit obbligatorio
    pause
    exit /b 1
)

echo.
echo Aggiunta file modificati...
git add src/ database-fixes/ *.json *.md --ignore-errors

echo.
echo Creazione commit...
git commit -m "%commit_msg%"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Commit creato con successo!
    git log --oneline -1
) else (
    echo ❌ Errore nella creazione del commit
)

echo.
pause