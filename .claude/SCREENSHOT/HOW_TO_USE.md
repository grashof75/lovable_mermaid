# Come usare il sistema di Screenshot Auto-Sync

Questo sistema ti permette di condividere rapidamente centinaia di screenshot con Claude mentre lavorate insieme.

## Setup Rapido

### Per Windows (con PowerShell)

1. **Apri PowerShell** nella directory del progetto:
   ```powershell
   cd path\to\lovable_mermaid
   ```

2. **Avvia lo script di sincronizzazione**:
   ```powershell
   .\.claude\sync-screenshots.ps1
   ```

3. **Fai screenshot** come al solito e salvali in:
   `G:\My Drive\_CLAUDE.CODE\SCREENSHOT\`

4. Gli screenshot vengono **copiati automaticamente** ogni 5 secondi in `.claude/SCREENSHOT/`

### Per Linux/Mac/WSL

1. **Apri terminale** nella directory del progetto:
   ```bash
   cd /path/to/lovable_mermaid
   ```

2. **Avvia lo script**:
   ```bash
   ./.claude/sync-screenshots.sh "/mnt/g/My Drive/_CLAUDE.CODE/SCREENSHOT" ".claude/SCREENSHOT" 5
   ```

## Come funziona

1. **Fai uno screenshot** e salvalo in `G:\My Drive\_CLAUDE.CODE\SCREENSHOT\`
2. Lo script **copia automaticamente** in `.claude/SCREENSHOT/`
3. Claude può **leggere immediatamente** lo screenshot
4. **Nessun commit manuale** richiesto durante il lavoro

## Workflow Consigliato

```
Tu fai screenshot → Salvi in Google Drive → Script auto-copia → Claude legge
     (0 sec)              (istantaneo)           (5 sec max)      (istantaneo)
```

## Comandi Utili

### Vedere gli screenshot disponibili
```bash
ls -la .claude/SCREENSHOT/
```

### Chiedere a Claude di leggere uno screenshot
```
"Leggi lo screenshot screenshot_20241110_123456.png"
```

### Fermare la sincronizzazione
Premi `Ctrl+C` nel terminale dove gira lo script

### Personalizzare l'intervallo
```powershell
# Controlla ogni 2 secondi invece di 5
.\.claude\sync-screenshots.ps1 -IntervalSeconds 2
```

## Commit (alla fine della sessione)

Quando hai finito di lavorare, fai un commit di tutti gli screenshot:

```bash
git add .claude/SCREENSHOT/
git commit -m "docs: add session screenshots"
git push
```

## Suggerimenti

1. **Nomina gli screenshot in modo descrittivo**:
   - ✅ `vps-dashboard.png`
   - ✅ `network-config-01.png`
   - ❌ `screenshot1.png`

2. **Elimina screenshot non necessari** prima del commit finale

3. **Raggruppa per sessione**:
   ```
   session-2024-11-10/
   ├── vps-dashboard.png
   ├── supabase-config.png
   └── error-message.png
   ```

4. **Usa lo screenshot per errori complessi** invece di copiarli come testo

## Troubleshooting

### Lo script non trova la cartella sorgente
Verifica il percorso:
```powershell
Test-Path "G:\My Drive\_CLAUDE.CODE\SCREENSHOT"
```

### Gli screenshot non vengono copiati
Controlla che i file siano `.png`, `.jpg`, `.jpeg` o `.gif`

### Troppo lento
Riduci l'intervallo a 2-3 secondi:
```powershell
.\.claude\sync-screenshots.ps1 -IntervalSeconds 2
```

## Alternative Veloci

Se lo script non funziona, puoi sempre:

1. **Copia manuale rapida**:
   ```powershell
   copy "G:\My Drive\_CLAUDE.CODE\SCREENSHOT\*.png" ".claude\SCREENSHOT\"
   ```

2. **Drag & drop** da Google Drive a `.claude\SCREENSHOT\`

3. **Usa GitHub Issues**: Trascina lo screenshot in un commento e copia l'URL generato
