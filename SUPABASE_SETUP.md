# Guida all'installazione di Supabase Self-Hosted sul VPS

Questa guida ti aiuterà a installare Supabase sul tuo VPS utilizzando Docker.

## Prerequisiti

- VPS con almeno 4GB RAM (raccomandato 8GB)
- Sistema operativo Linux (Ubuntu 20.04+ raccomandato)
- Accesso SSH al VPS
- Dominio (opzionale ma raccomandato per la produzione)

## Struttura del Progetto

```
.
├── docker-compose.yml              # Configurazione Docker dei servizi Supabase
├── .env.supabase                   # Template delle variabili d'ambiente
├── deploy-supabase.sh              # Script automatico di deployment
├── supabase/
│   ├── migrations/
│   │   └── 00001_initial_schema.sql  # Schema iniziale del database
│   ├── kong.yml                    # Configurazione API Gateway
│   ├── vector.yml                  # Configurazione logging
│   └── functions/                  # Edge Functions (opzionale)
└── SUPABASE_SETUP.md              # Questa guida
```

## Opzione 1: Installazione Automatica (Raccomandato)

### Passo 1: Connettiti al tuo VPS

```bash
ssh root@your-vps-ip
```

### Passo 2: Clona il repository o carica i file

```bash
# Se usi git
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo

# Oppure carica i file manualmente via SCP
scp -r /percorso/locale/lovable_mermaid root@your-vps-ip:/root/
```

### Passo 3: Esegui lo script di deployment

```bash
cd /root/lovable_mermaid
sudo ./deploy-supabase.sh
```

Lo script ti guiderà attraverso:
- Installazione di Docker e Docker Compose
- Generazione automatica di chiavi sicure
- Configurazione delle variabili d'ambiente
- Avvio dei servizi Supabase

### Passo 4: Configura il firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 3000/tcp  # Supabase Studio
sudo ufw allow 8000/tcp  # API Gateway
sudo ufw allow 22/tcp    # SSH
sudo ufw enable

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

### Passo 5: Accedi a Supabase Studio

Apri il browser e vai su: `http://your-vps-ip:3000`

Credenziali predefinite:
- Username: `supabase`
- Password: `this_password_is_insecure_and_should_be_updated`

**IMPORTANTE**: Cambia immediatamente la password!

## Opzione 2: Installazione Manuale

### Passo 1: Installa Docker

```bash
# Aggiorna i pacchetti
sudo apt update && sudo apt upgrade -y

# Installa Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Avvia Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verifica l'installazione
docker --version
```

### Passo 2: Installa Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### Passo 3: Genera le chiavi di sicurezza

```bash
# Genera JWT Secret
openssl rand -base64 32

# Genera altre chiavi (ripeti per ogni chiave necessaria)
openssl rand -base64 32
```

### Passo 4: Configura il file .env

Copia il template e modifica i valori:

```bash
cp .env.supabase .env
nano .env
```

Modifica almeno questi valori:
- `POSTGRES_PASSWORD`: Password del database
- `JWT_SECRET`: Chiave JWT generata
- `SECRET_KEY_BASE`: Chiave segreta per realtime
- `LOGFLARE_API_KEY`: Chiave API per logging
- `PUBLIC_SUPABASE_URL`: URL del tuo VPS (es. `http://your-vps-ip:8000`)
- `SITE_URL`: URL della tua applicazione

Per generare `ANON_KEY` e `SERVICE_ROLE_KEY`, puoi usare:

```bash
# Usa il generatore JWT online o crea uno script
# Esempio con Python:
python3 << 'EOF'
import jwt
import datetime

secret = "YOUR_JWT_SECRET"

# Anon key
anon_payload = {
    "iss": "supabase",
    "ref": "localhost",
    "role": "anon",
    "iat": datetime.datetime.utcnow(),
    "exp": datetime.datetime(2033, 5, 18)
}
anon_token = jwt.encode(anon_payload, secret, algorithm="HS256")
print(f"ANON_KEY={anon_token}")

# Service role key
service_payload = {
    "iss": "supabase",
    "ref": "localhost",
    "role": "service_role",
    "iat": datetime.datetime.utcnow(),
    "exp": datetime.datetime(2033, 5, 18)
}
service_token = jwt.encode(service_payload, secret, algorithm="HS256")
print(f"SERVICE_ROLE_KEY={service_token}")
EOF
```

### Passo 5: Aggiorna Kong con le chiavi

Modifica il file `supabase/kong.yml` e sostituisci `YOUR_GENERATED_KEY` con le chiavi generate.

### Passo 6: Avvia i servizi

```bash
# Scarica le immagini Docker
docker-compose pull

# Avvia i servizi in background
docker-compose up -d

# Verifica lo stato
docker-compose ps
```

## Configurazione Post-Installazione

### 1. Configura SMTP per le email

Modifica il file `.env` con i tuoi dati SMTP:

```env
SMTP_ADMIN_EMAIL=admin@tuodominio.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tua-email@gmail.com
SMTP_PASS=tua-app-password
SMTP_SENDER_NAME=Il Tuo Nome App
```

Per Gmail, devi creare una App Password:
1. Vai su https://myaccount.google.com/security
2. Abilita la verifica in due passaggi
3. Genera una App Password

Dopo aver modificato `.env`, riavvia i servizi:

```bash
docker-compose restart auth
```

### 2. Configura SSL/TLS (Produzione)

Per la produzione, è consigliato usare un reverse proxy con SSL.

#### Opzione A: Nginx con Let's Encrypt

```bash
# Installa Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Configura Nginx
sudo nano /etc/nginx/sites-available/supabase
```

Aggiungi questa configurazione:

```nginx
server {
    server_name supabase.tuodominio.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /realtime/v1/ {
        proxy_pass http://localhost:8000/realtime/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}

server {
    server_name studio.tuodominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Abilita il sito
sudo ln -s /etc/nginx/sites-available/supabase /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Ottieni certificato SSL
sudo certbot --nginx -d supabase.tuodominio.com -d studio.tuodominio.com
```

Aggiorna `.env`:

```env
PUBLIC_SUPABASE_URL=https://supabase.tuodominio.com
```

Riavvia i servizi:

```bash
docker-compose down
docker-compose up -d
```

#### Opzione B: Caddy (più semplice)

```bash
# Installa Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Crea il Caddyfile
sudo nano /etc/caddy/Caddyfile
```

Aggiungi:

```caddy
supabase.tuodominio.com {
    reverse_proxy localhost:8000
}

studio.tuodominio.com {
    reverse_proxy localhost:3000
}
```

```bash
# Riavvia Caddy
sudo systemctl reload caddy
```

### 3. Aggiorna l'applicazione React

Aggiorna il file `.env` della tua applicazione con i nuovi valori:

```env
VITE_SUPABASE_URL=https://supabase.tuodominio.com
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Comandi Utili

### Visualizzare i log

```bash
# Tutti i servizi
docker-compose logs -f

# Un servizio specifico
docker-compose logs -f db
docker-compose logs -f auth
docker-compose logs -f rest
```

### Riavviare i servizi

```bash
# Tutti i servizi
docker-compose restart

# Un servizio specifico
docker-compose restart auth
```

### Fermare i servizi

```bash
docker-compose down
```

### Backup del database

```bash
# Backup
docker exec supabase-db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20231201.sql | docker exec -i supabase-db psql -U postgres postgres
```

### Aggiornare Supabase

```bash
# Scarica le nuove immagini
docker-compose pull

# Riavvia con le nuove immagini
docker-compose up -d
```

## Monitoraggio delle Risorse

### Verifica utilizzo risorse

```bash
docker stats
```

### Spazio disco

```bash
df -h
docker system df
```

### Pulizia volumi inutilizzati

```bash
docker system prune -a
docker volume prune
```

## Troubleshooting

### I servizi non si avviano

```bash
# Verifica i log
docker-compose logs

# Verifica spazio disco
df -h

# Verifica memoria
free -h
```

### Database non accessibile

```bash
# Verifica che il container sia in esecuzione
docker-compose ps

# Accedi al container del database
docker exec -it supabase-db psql -U postgres

# Verifica le connessioni
SELECT * FROM pg_stat_activity;
```

### Errori di autenticazione

```bash
# Verifica le chiavi in .env
cat .env | grep KEY

# Riavvia il servizio auth
docker-compose restart auth
```

## Sicurezza

1. **Cambia tutte le password predefinite**
2. **Abilita il firewall** e permetti solo le porte necessarie
3. **Usa SSL/TLS** in produzione
4. **Backup regolari** del database
5. **Aggiorna regolarmente** Docker e le immagini Supabase
6. **Limita l'accesso SSH** (usa chiavi SSH, disabilita password)
7. **Monitora i log** per attività sospette

## Supporto

- Documentazione Supabase: https://supabase.com/docs
- Self-hosting guide: https://supabase.com/docs/guides/self-hosting
- Community: https://github.com/supabase/supabase/discussions

## Architettura dei Servizi

- **PostgreSQL (porta 5432)**: Database principale
- **Studio (porta 3000)**: Interfaccia admin di Supabase
- **Kong (porta 8000)**: API Gateway
- **GoTrue (auth)**: Servizio di autenticazione
- **PostgREST (rest)**: API REST automatica
- **Realtime**: WebSocket server per realtime
- **Storage**: Gestione file e immagini
- **Edge Functions**: Serverless functions (Deno)
- **Analytics**: Logging e analytics

## Risorse Consigliate VPS

- **Minimo**: 2 CPU, 4GB RAM, 40GB SSD
- **Raccomandato**: 4 CPU, 8GB RAM, 100GB SSD
- **Produzione**: 8 CPU, 16GB RAM, 200GB SSD

Buon deployment! 🚀
