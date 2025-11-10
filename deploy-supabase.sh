#!/bin/bash

# Supabase VPS Deployment Script
# This script helps deploy Supabase self-hosted on a VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Supabase Self-Hosted Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32
}

# Function to generate JWT token
generate_jwt() {
    local role=$1
    local secret=$2
    local payload=$(echo -n "{\"iss\":\"supabase\",\"ref\":\"localhost\",\"role\":\"$role\",\"iat\":1681200000,\"exp\":1996776000}" | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
    local header=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
    local signature=$(echo -n "${header}.${payload}" | openssl dgst -sha256 -hmac "$secret" -binary | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
    echo "${header}.${payload}.${signature}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}This script should be run as root or with sudo${NC}"
    echo -e "${YELLOW}Some operations may require root privileges${NC}"
    echo ""
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed!${NC}"
    echo -e "${YELLOW}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}Docker installed successfully!${NC}"
else
    echo -e "${GREEN}Docker is already installed${NC}"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed!${NC}"
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed successfully!${NC}"
else
    echo -e "${GREEN}Docker Compose is already installed${NC}"
fi

echo ""
echo -e "${GREEN}Checking environment configuration...${NC}"

# Check if .env file exists
if [ -f ".env.supabase" ]; then
    echo -e "${YELLOW}.env.supabase file already exists${NC}"
    read -p "Do you want to regenerate secrets? (y/N): " regenerate
    if [ "$regenerate" = "y" ] || [ "$regenerate" = "Y" ]; then
        REGENERATE=true
    else
        REGENERATE=false
    fi
else
    REGENERATE=true
fi

if [ "$REGENERATE" = true ]; then
    echo -e "${GREEN}Generating secure secrets...${NC}"

    # Generate secrets
    POSTGRES_PASSWORD=$(generate_secret)
    JWT_SECRET=$(generate_secret)
    SECRET_KEY_BASE=$(generate_secret)
    LOGFLARE_API_KEY=$(generate_secret)

    # Generate JWT tokens
    ANON_KEY=$(generate_jwt "anon" "$JWT_SECRET")
    SERVICE_ROLE_KEY=$(generate_jwt "service_role" "$JWT_SECRET")

    # Ask for VPS IP or domain
    read -p "Enter your VPS IP address or domain (e.g., supabase.yourdomain.com or 192.168.1.100): " VPS_ADDRESS

    # Ask for site URL
    read -p "Enter your application URL (e.g., https://yourapp.com): " SITE_URL

    # Create .env file from template
    cp .env.supabase .env.supabase.backup 2>/dev/null || true

    cat > .env << EOF
############
# Secrets - GENERATED AUTOMATICALLY
############

POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
JWT_SECRET=${JWT_SECRET}
SECRET_KEY_BASE=${SECRET_KEY_BASE}
LOGFLARE_API_KEY=${LOGFLARE_API_KEY}
SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
ANON_KEY=${ANON_KEY}

############
# API Settings
############

PUBLIC_SUPABASE_URL=http://${VPS_ADDRESS}:8000
SITE_URL=${SITE_URL}
ADDITIONAL_REDIRECT_URLS=

############
# Database Settings
############

PGRST_DB_SCHEMAS=public,storage,graphql_public

############
# Auth Settings
############

DISABLE_SIGNUP=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
ENABLE_PHONE_SIGNUP=false
ENABLE_PHONE_AUTOCONFIRM=false
JWT_EXPIRY=3600

############
# Email Settings (SMTP) - CONFIGURE BEFORE PRODUCTION
############

SMTP_ADMIN_EMAIL=admin@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SENDER_NAME=Your App Name

MAILER_URLPATHS_INVITE=/auth/v1/verify
MAILER_URLPATHS_CONFIRMATION=/auth/v1/verify
MAILER_URLPATHS_RECOVERY=/auth/v1/verify
MAILER_URLPATHS_EMAIL_CHANGE=/auth/v1/verify

############
# Studio Settings
############

STUDIO_DEFAULT_ORGANIZATION=My Organization
STUDIO_DEFAULT_PROJECT=My Project

############
# Storage Settings
############

IMGPROXY_ENABLE_WEBP_DETECTION=true

############
# Application Environment Variables
############

VITE_SUPABASE_URL=http://${VPS_ADDRESS}:8000
VITE_SUPABASE_ANON_KEY=${ANON_KEY}
EOF

    echo -e "${GREEN}Secrets generated and saved to .env${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANT: Save these credentials securely!${NC}"
    echo -e "${YELLOW}Your Supabase URL: http://${VPS_ADDRESS}:8000${NC}"
    echo -e "${YELLOW}Your Anon Key: ${ANON_KEY}${NC}"
    echo ""

    # Update Kong configuration with generated keys
    sed -i "s/YOUR_GENERATED_KEY/${ANON_KEY}/g" supabase/kong.yml 2>/dev/null || true
fi

echo -e "${GREEN}Starting Supabase services...${NC}"

# Create necessary directories
mkdir -p supabase/functions/main

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Pull latest images
docker-compose pull

# Start services
docker-compose --env-file .env up -d

echo ""
echo -e "${GREEN}Waiting for services to start...${NC}"
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Supabase deployed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${GREEN}Access Supabase Studio at: http://${VPS_ADDRESS:-localhost}:3000${NC}"
    echo -e "${GREEN}API Gateway at: http://${VPS_ADDRESS:-localhost}:8000${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Configure your firewall to allow ports 3000 (Studio) and 8000 (API)"
    echo -e "2. Update SMTP settings in .env for email functionality"
    echo -e "3. Configure SSL/TLS with a reverse proxy (nginx/caddy)"
    echo -e "4. Update your application's .env with the Supabase URL and keys"
    echo ""
    echo -e "${YELLOW}To view logs:${NC}"
    echo -e "  docker-compose logs -f"
    echo ""
    echo -e "${YELLOW}To stop services:${NC}"
    echo -e "  docker-compose down"
    echo ""
else
    echo -e "${RED}Some services failed to start. Check logs with:${NC}"
    echo -e "  docker-compose logs"
fi
