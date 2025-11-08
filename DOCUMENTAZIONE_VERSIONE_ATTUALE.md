# Documentazione Sistema di Diagrammi Mermaid - Versione Attuale

## Panoramica Generale

Il sistema è un editor avanzato per diagrammi Mermaid che combina editing manuale, generazione AI, gestione viste sofisticata e sistema di commenti integrato. L'applicazione supporta funzionalità collaborative attraverso un sistema di viste nidificate e commenti collegati.

---

## 1. Sistema di Editing dei Diagrammi

### Funzionalità
- Editor di codice Mermaid con syntax highlighting
- Anteprima in tempo reale con rendering automatico
- Supporto per tutti i tipi di diagrammi Mermaid (flowchart, sequence, class, etc.)
- Gestione degli errori di sintassi
- Tabs per alternare tra codice e prompt AI

### Tabelle Backend Proposte

#### TABLE_01: `diagrams`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico del diagramma |
| user_id | UUID | Proprietario del diagramma |
| title | VARCHAR(255) | Titolo del diagramma |
| mermaid_code | TEXT | Codice Mermaid del diagramma |
| description | TEXT | Descrizione opzionale |
| is_public | BOOLEAN | Visibilità pubblica del diagramma |
| version | INTEGER | Versione del diagramma per tracking modifiche |
| tags | TEXT[] | Array di tag per categorizzazione |
| created_at | TIMESTAMP | Data di creazione |
| updated_at | TIMESTAMP | Data ultima modifica |

**Operatività**: Salvataggio automatico, versioning, condivisione pubblica/privata, categorizzazione tramite tags.

---

## 2. Sistema di Generazione AI

### Funzionalità
- Integrazione con OpenAI GPT-4o-mini
- Generazione diagrammi da prompt in linguaggio naturale
- Gestione API key locale
- Sistema di fallback con mock per demo
- Templates pre-definiti per diversi tipi di diagramma

### Tabelle Backend Proposte

#### TABLE_02: `ai_prompts`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico del prompt |
| user_id | UUID | Utente che ha eseguito il prompt |
| diagram_id | UUID | Diagramma generato/modificato |
| prompt_text | TEXT | Testo del prompt originale |
| generated_code | TEXT | Codice Mermaid generato |
| model_used | VARCHAR(50) | Modello AI utilizzato |
| tokens_used | INTEGER | Token consumati per la generazione |
| execution_time_ms | INTEGER | Tempo di esecuzione in millisecondi |
| created_at | TIMESTAMP | Data di esecuzione |

#### TABLE_03: `prompt_pool`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico del template |
| prompt_key | VARCHAR(100) | Chiave identificativa del prompt |
| template | TEXT | Template del prompt con placeholder |
| category | VARCHAR(50) | Categoria (flowchart, sequence, class, etc.) |
| complexity | VARCHAR(20) | Livello di complessità (basic, intermediate, advanced) |
| usage_count | INTEGER | Numero di utilizzi del template |
| success_rate | DECIMAL(3,2) | Tasso di successo (0.00-1.00) |
| tokens_avg | INTEGER | Media token utilizzati |
| created_at | TIMESTAMP | Data di creazione |
| updated_at | TIMESTAMP | Data ultima modifica |

**Operatività**: Raccolta prompt patterns, ottimizzazione suggerimenti, analytics utilizzo AI, gestione quota token.

---

## 3. Sistema di Gestione Viste Avanzato

### Funzionalità
- Salvataggio viste con zoom e posizione pan specifici
- **Nidificazione gerarchica** delle viste con drag-and-drop
- Sistema di cartelle virtuali per organizzazione
- Riordinamento tramite frecce direzionali
- History con undo/redo (fino a 50 operazioni)
- Sorting per nome, data, livello zoom
- Toast notifications configurabili
- Selezione vista con indicatori visivi

### Tabelle Backend Proposte

#### TABLE_04: `saved_views`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico della vista |
| user_id | UUID | Proprietario della vista |
| diagram_id | UUID | Diagramma di riferimento |
| name | VARCHAR(255) | Nome della vista |
| zoom_level | DECIMAL(4,2) | Livello di zoom (0.10-5.00) |
| pan_x | DECIMAL(10,2) | Posizione X del pan |
| pan_y | DECIMAL(10,2) | Posizione Y del pan |
| parent_id | UUID | ID della vista padre per nidificazione |
| is_folder | BOOLEAN | Se è una cartella virtuale |
| expanded | BOOLEAN | Stato espansione nella UI |
| sort_order | INTEGER | Ordine di visualizzazione |
| created_at | TIMESTAMP | Data di creazione |
| updated_at | TIMESTAMP | Data ultima modifica |

#### TABLE_05: `view_history`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico della history entry |
| user_id | UUID | Utente proprietario |
| diagram_id | UUID | Diagramma di riferimento |
| operation_type | VARCHAR(50) | Tipo operazione (create, update, delete, reorder, nest) |
| views_snapshot | JSONB | Snapshot dello stato delle viste |
| operation_data | JSONB | Dati specifici dell'operazione |
| created_at | TIMESTAMP | Data dell'operazione |

**Operatività**: Persistenza stato nidificazione, ripristino configurazioni, sincronizzazione multi-dispositivo, backup automatico configurazioni vista.

---

## 4. Sistema di Commenti e Viste Provvisorie

### Funzionalità
- Commenti associabili a viste specifiche
- **Viste provvisorie** create dai commenti con stato attuale zoom/pan
- Linking/unlinking commenti-viste
- Editing inline dei commenti
- Sistema di applicazione viste provvisorie a viste salvate
- Contatori commenti per vista
- Auto-apertura form commento da vista specifica

### Tabelle Backend Proposte

#### TABLE_06: `comments`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico del commento |
| user_id | UUID | Autore del commento |
| diagram_id | UUID | Diagramma di riferimento |
| text | TEXT | Contenuto del commento |
| linked_view_id | UUID | Vista collegata (saved o provisional) |
| is_resolved | BOOLEAN | Stato risoluzione commento |
| created_at | TIMESTAMP | Data di creazione |
| updated_at | TIMESTAMP | Data ultima modifica |

#### TABLE_07: `provisional_views`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico della vista provvisoria |
| user_id | UUID | Creatore della vista |
| diagram_id | UUID | Diagramma di riferimento |
| comment_id | UUID | Commento che ha generato la vista |
| name | VARCHAR(255) | Nome della vista provvisoria |
| zoom_level | DECIMAL(4,2) | Livello di zoom al momento della creazione |
| pan_x | DECIMAL(10,2) | Posizione X del pan |
| pan_y | DECIMAL(10,2) | Posizione Y del pan |
| created_at | TIMESTAMP | Data di creazione |

#### TABLE_08: `view_comment_associations`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico dell'associazione |
| view_id | UUID | Vista di riferimento |
| comment_id | UUID | Commento associato |
| association_type | VARCHAR(20) | Tipo (direct, provisional, inherited) |
| created_at | TIMESTAMP | Data di associazione |

**Operatività**: Tracciamento discussioni per vista, gestione feedback visivi, workflow review collaborativo, persistenza stato discussioni.

---

## 5. Sistema di Anteprima Interattiva

### Funzionalità
- Rendering Mermaid in tempo reale
- **Zoom con mousewheel** (0.1x - 5.0x)
- **Pan tramite drag** con cursore dinamico
- **Reset vista** con doppio click
- Indicatore zoom visuale
- Loading states con animazioni
- Gestione errori di rendering
- Tema automatico (light/dark)

### Tabelle Backend Proposte

#### TABLE_09: `view_interactions`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico dell'interazione |
| user_id | UUID | Utente che ha interagito |
| diagram_id | UUID | Diagramma interessato |
| interaction_type | VARCHAR(50) | Tipo (zoom, pan, reset, save_view) |
| zoom_before | DECIMAL(4,2) | Zoom prima dell'interazione |
| zoom_after | DECIMAL(4,2) | Zoom dopo l'interazione |
| pan_before | JSONB | Posizione pan prima |
| pan_after | JSONB | Posizione pan dopo |
| duration_ms | INTEGER | Durata dell'interazione |
| created_at | TIMESTAMP | Timestamp dell'interazione |

**Operatività**: Analytics comportamento utente, ottimizzazione UX, pattern usage analysis, performance monitoring.

---

## 6. Sistema di Esportazione

### Funzionalità
- Esportazione SVG con nome file intelligente
- Generazione nome da prima riga diagramma
- Sanitizzazione nome file automatica
- Toast feedback operazioni
- Mantenimento qualità vettoriale

### Tabelle Backend Proposte

#### TABLE_10: `exports`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico dell'export |
| user_id | UUID | Utente che ha esportato |
| diagram_id | UUID | Diagramma esportato |
| export_format | VARCHAR(20) | Formato (svg, png, pdf) |
| filename | VARCHAR(255) | Nome file generato |
| file_size_bytes | INTEGER | Dimensione file in bytes |
| export_settings | JSONB | Impostazioni usate per l'export |
| created_at | TIMESTAMP | Data dell'export |

**Operatività**: Tracking utilizzo export, statistiche formati, gestione quota storage, history export per utente.

---

## 7. Sistema di Tema e Configurazione

### Funzionalità
- Toggle light/dark mode
- Persistenza preferenza tema
- Ri-rendering automatico diagrammi al cambio tema
- Configurazioni UI (toast notifications, shortcuts)
- Theme-aware component styling

### Tabelle Backend Proposte

#### TABLE_11: `user_preferences`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico delle preferenze |
| user_id | UUID | Utente proprietario |
| theme_preference | VARCHAR(20) | Tema (light, dark, system) |
| toast_notifications_enabled | BOOLEAN | Abilitazione toast |
| keyboard_shortcuts_enabled | BOOLEAN | Abilitazione shortcuts |
| auto_save_interval | INTEGER | Intervallo auto-save in secondi |
| default_zoom_level | DECIMAL(4,2) | Zoom di default per nuovi diagrammi |
| ui_layout_config | JSONB | Configurazione layout pannelli |
| created_at | TIMESTAMP | Data di creazione |
| updated_at | TIMESTAMP | Data ultima modifica |

**Operatività**: Personalizzazione esperienza utente, sincronizzazione multi-dispositivo, backup configurazioni, analytics preferenze.

---

## 8. Sistema di Collaborazione (Futuro)

### Funzionalità Previste
- Condivisione diagrammi tramite link
- Collaborazione real-time
- Gestione permessi (view, comment, edit)
- History modifiche collaborative

### Tabelle Backend Proposte

#### TABLE_12: `collaborators`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico della collaborazione |
| diagram_id | UUID | Diagramma condiviso |
| user_id | UUID | Collaboratore |
| invited_by | UUID | Utente che ha invitato |
| permission_level | VARCHAR(20) | Livello (view, comment, edit, admin) |
| status | VARCHAR(20) | Stato (pending, accepted, declined, revoked) |
| created_at | TIMESTAMP | Data invito |
| updated_at | TIMESTAMP | Data ultima modifica |

#### TABLE_13: `diagram_shares`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico della condivisione |
| diagram_id | UUID | Diagramma condiviso |
| shared_by | UUID | Utente che ha condiviso |
| share_token | VARCHAR(255) | Token per accesso pubblico |
| is_public | BOOLEAN | Condivisione pubblica |
| password_hash | VARCHAR(255) | Hash password per accesso protetto |
| expires_at | TIMESTAMP | Data scadenza condivisione |
| view_count | INTEGER | Numero visualizzazioni |
| created_at | TIMESTAMP | Data di creazione |

#### TABLE_14: `table_metadata` (Tabella Centralizzata di Metadati)
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Identificatore unico del record |
| table_identifier | VARCHAR(20) | Identificatore univoco (TABLE_01, TABLE_02, etc.) |
| table_name | VARCHAR(100) | Nome effettivo della tabella nel database |
| display_name | VARCHAR(150) | Nome visualizzato nell'interfaccia |
| description | TEXT | Descrizione della funzione della tabella |
| entity_type | VARCHAR(50) | Tipologia entità (core, system, analytics, etc.) |
| created_at | TIMESTAMP | Data creazione |
| updated_at | TIMESTAMP | Data ultima modifica |

**Operatività**: Gestione accessi granulare, tracking utilizzo condivisioni, sicurezza accessi, audit trail modifiche collaborative. La tabella `table_metadata` mantiene la mappatura centralizzata tra identificatori logici (TABLE_XX) e nomi fisici delle tabelle, facilitando manutenzione e refactoring del database.

---

## Architettura Tecnica

### Stack Frontend
- **React 18** con TypeScript
- **Tailwind CSS** per styling con design system
- **Radix UI** per componenti base
- **Mermaid.js** per rendering diagrammi
- **DnD Kit** per drag-and-drop
- **React Hook Form** per gestione form

### Integrazione Backend Prevista
- **Supabase** per database PostgreSQL
- **Row Level Security (RLS)** per sicurezza dati
- **Real-time subscriptions** per collaborazione
- **Storage** per esportazioni e cache
- **Edge Functions** per logica AI e processing

### Ottimizzazioni Performance
- Lazy loading componenti
- Memoization React per re-render
- Debouncing per auto-save
- Virtualization per liste lunghe
- Service Workers per caching

---

## Prossimi Sviluppi Raccomandati

1. **Migrazione Database**: Implementare tutte le tabelle proposte
2. **Sistema Autenticazione**: Integrazione auth completa
3. **Real-time Collaboration**: WebSocket per editing simultaneo
4. **Mobile Responsive**: Ottimizzazione touch devices
5. **Advanced Export**: Supporto PNG, PDF, formati multipli
6. **Template System**: Libreria template predefiniti
7. **Plugin Architecture**: Estensibilità tramite plugin
8. **Enterprise Features**: SSO, audit log, compliance