# 🔄 Scripts di Sincronizzazione GitHub

Questa cartella contiene script automatizzati per gestire la sincronizzazione del repository **mermaid-sketcher-451** con GitHub.

## 📁 Scopo della Sincronizzazione

**✅ SINCRONIZZATO**: Repository GitHub `mermaid-sketcher-451`
- Codice sorgente del progetto Mermaid Sketcher
- File di configurazione (package.json, etc.)
- Database fixes e migrazioni
- Documentazione del progetto

**❌ NON SINCRONIZZATO**: Cartella `20250821_ADR` 
- Directory di lavoro temporanea di Claude Code
- File di sessione e cache locali
- Non fa parte del repository del progetto

## 📋 Scripts Disponibili

### 1. `sync-to-github.bat` - Sincronizzazione verso GitHub
**Uso**: Carica le modifiche locali su GitHub
**Processo**:
- ✅ Verifica status repository
- ✅ Aggiunge file modificati (src/, database-fixes/, *.json, *.md)
- ✅ Crea commit con messaggio personalizzato
- ✅ Push verso GitHub (branch master)
- ✅ Verifica finale

```bash
# Doppio click sul file o da cmd:
sync-to-github.bat
```

### 2. `sync-from-github.bat` - Sincronizzazione da GitHub  
**Uso**: Scarica gli aggiornamenti da GitHub
**Processo**:
- ✅ Backup automatico modifiche locali (git stash)
- ✅ Fetch/pull da GitHub
- ✅ Opzione per ripristinare modifiche locali
- ✅ Gestione conflitti automatica

```bash
# Doppio click sul file o da cmd:
sync-from-github.bat
```

### 3. `quick-commit.bat` - Commit Rapido
**Uso**: Crea commit veloce senza push
**Processo**:
- ✅ Mostra modifiche attuali
- ✅ Richiede messaggio commit
- ✅ Aggiunge e commita file modificati

```bash
# Doppio click sul file o da cmd:
quick-commit.bat
```

## 🚀 Flusso di Lavoro Consigliato

### Prima di iniziare a lavorare:
```
1. Esegui sync-from-github.bat
2. Verifica che tutto sia aggiornato
```

### Dopo aver lavorato:
```
1. Esegui quick-commit.bat (per salvare modifiche localmente)
2. Esegui sync-to-github.bat (per caricare su GitHub)
```

### Per aggiornamenti urgenti:
```
1. sync-from-github.bat
2. Risolvi conflitti se necessario  
3. sync-to-github.bat
```

## ⚠️ Note Importanti

- **Backup Automatico**: sync-from-github.bat fa backup automatico delle modifiche locali
- **File Ignorati**: I script ignorano automaticamente node_modules e .env
- **Branch**: Tutti gli script operano sul branch `master`
- **Conflitti**: In caso di conflitti, gli script si fermano per risoluzione manuale

## 🛠️ Personalizzazione

Per modificare i percorsi o il comportamento:
1. Modifica la variabile `cd /d "c:\CLAUDEcode2025\mermaid-sketcher-451"`  
2. Cambia i pattern di file in `git add` se necessario
3. Modifica il branch da `master` ad altro se richiesto

## 📊 Status Repository

Per verificare manualmente lo status:
```bash
cd "c:\CLAUDEcode2025\mermaid-sketcher-451"
git status
git log --oneline -5
```

---

*Creato da Claude Code Assistant - 2025-08-22*