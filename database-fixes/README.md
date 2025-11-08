# Database Fixes Directory

## 📁 Struttura Files

- `SQL_FIXES_LOG.md` - **Documentazione master** con storico completo
- `APPLY_XXX_[STATUS].sql` - Files SQL specifici per ogni fix

## 🏷️ Convenzioni Nomi File

- `APPLY_001_APPLICATO.sql` - Fix applicato con successo
- `APPLY_002_APPLICATO.sql` - Fix applicato con successo  
- `APPLY_003_PENDING.sql` - Fix pronto ma non ancora applicato
- `APPLY_004_FALLITO.sql` - Fix che ha dato errori

## 🔄 Processo Standard

1. **Problema identificato** → Console log/errore
2. **Fix preparato** → `APPLY_XXX_PENDING.sql`
3. **Test in Supabase** → SQL Editor
4. **Se successo** → Rinomina a `APPLY_XXX_APPLICATO.sql`
5. **Se errore** → Rinomina a `APPLY_XXX_FALLITO.sql`
6. **Aggiorna log** → `SQL_FIXES_LOG.md`
7. **Test frontend** → Verifica funzionalità

## 📊 Status Corrente

- ✅ APPLY_001 - Zoom Limit (APPLICATO)
- ✅ APPLY_002 - Comments FK (APPLICATO)
- ✅ APPLY_003 - RLS Policies Fix (APPLICATO)

## 🎯 Prossimo Test

**APPLY_003** è stato applicato senza errori.  
**Ora testa**: Selezione nodo + salvataggio commento nel frontend.

### Modifiche APPLY_003:
- ✅ RLS policies separate per INSERT/SELECT/UPDATE/DELETE
- ✅ Rimosse policy generiche problematiche
- ✅ Debug completo applicato