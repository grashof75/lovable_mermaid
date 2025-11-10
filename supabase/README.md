# Supabase Configuration

Questa directory contiene i file di configurazione per Supabase self-hosted.

## Contenuto

- **migrations/** - Schema SQL del database e migrazioni
  - `00001_initial_schema.sql` - Schema iniziale con tutte le tabelle, indici, RLS policies e funzioni

- **kong.yml** - Configurazione dell'API Gateway Kong
  - Routing delle API REST, Auth, Realtime, Storage, Functions
  - Configurazione CORS
  - Autenticazione con chiavi API

- **vector.yml** - Configurazione del sistema di logging
  - Raccolta log da Docker e Kong
  - Invio log a Logflare (Analytics)

- **functions/** - Edge Functions (Deno runtime)
  - Directory per le serverless functions

## Schema Database

Il file `migrations/00001_initial_schema.sql` include:

### Tabelle
- `profiles` - Profili utente
- `diagrams` - Diagrammi Mermaid
- `saved_views` - Viste salvate per i diagrammi
- `comments` - Commenti sui diagrammi
- `provisional_views` - Viste provvisorie legate ai commenti
- `ai_prompts` - Storico prompts AI per generazione diagrammi
- `diagram_shares` - Condivisioni pubbliche/private dei diagrammi
- `collaborators` - Collaboratori sui diagrammi
- `user_api_keys` - Chiavi API crittografate degli utenti
- `prompt_pool` - Pool di template per prompts AI

### Funzioni RPC
- `get_table_info(table_num)` - Informazioni su una tabella
- `list_all_tables()` - Elenca tutte le tabelle
- `search_tables(search_term)` - Cerca tabelle per nome
- `get_user_stats(user_uuid)` - Statistiche utente
- `cleanup_expired_data()` - Pulizia dati scaduti
- `get_prompt_recommendation(description_text, preferred_category)` - Raccomandazioni prompts
- `validate_database_integrity()` - Validazione integrità database

### Sicurezza
- Row Level Security (RLS) abilitato su tutte le tabelle
- Policies per controllo accessi granulare
- Trigger per aggiornamento automatico `updated_at`

## Note

- Non committare mai il file `.env` con le chiavi reali
- Le migrazioni vengono eseguite automaticamente all'avvio del database
- Per modifiche allo schema, crea nuove migrazioni incrementali
