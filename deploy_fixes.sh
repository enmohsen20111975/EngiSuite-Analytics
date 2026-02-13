#!/bin/bash
# EngiSuite Analytics - Production Deployment Fix Script
# Run this script on your VPS to fix all production issues

set -e

echo "=========================================="
echo "EngiSuite Analytics - Production Fix"
echo "=========================================="

# Configuration
APP_DIR="/root/engisuite-analytics"
BACKUP_DIR="/root/engisuite-backup-$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo_error "Please run as root"
    exit 1
fi

# Step 1: Backup current installation
echo_info "Creating backup at $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
cp -r "$APP_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true

# Step 2: Pull latest changes
echo_info "Pulling latest changes from Git..."
cd "$APP_DIR"
git pull origin main || echo_warn "Git pull failed, continuing with local changes"

# Step 2.5: Install Node.js dependencies and build Tailwind CSS (if Node.js is available)
if command -v node &> /dev/null; then
    echo_info "Building Tailwind CSS for production..."
    cd "$APP_DIR"
    npm install --legacy-peer-deps 2>/dev/null || echo_warn "npm install failed, skipping CSS build"
    npm run build:css 2>/dev/null || echo_warn "Tailwind CSS build failed, using CDN fallback"
else
    echo_warn "Node.js not found, skipping Tailwind CSS build. CDN will be used (not recommended for production)"
fi

# Step 2.6: Download Font Awesome for self-hosting (avoids tracking prevention issues)
echo_info "Downloading Font Awesome for self-hosting..."
FONTAWESOME_DIR="$APP_DIR/frontend/shared/vendor/fontawesome"
mkdir -p "$FONTAWESOME_DIR/css"
mkdir -p "$FONTAWESOME_DIR/webfonts"

if [ ! -f "$FONTAWESOME_DIR/css/all.min.css" ]; then
    curl -sL "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" -o "$FONTAWESOME_DIR/css/all.min.css" || echo_warn "Failed to download Font Awesome CSS"
    
    # Download essential webfonts
    for font in fa-solid-900.woff2 fa-regular-400.woff2 fa-brands-400.woff2; do
        curl -sL "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/$font" -o "$FONTAWESOME_DIR/webfonts/$font" 2>/dev/null || true
    done
    
    # Update CSS to use relative paths
    if [ -f "$FONTAWESOME_DIR/css/all.min.css" ]; then
        sed -i 's|../webfonts/|./webfonts/|g' "$FONTAWESOME_DIR/css/all.min.css" 2>/dev/null || true
    fi
    
    echo_info "Font Awesome downloaded successfully"
fi

# Step 3: Update nginx configuration
echo_info "Updating nginx configuration..."
cat > /etc/nginx/sites-available/m2y.net << 'NGINX_CONF'
# EngiSuite Analytics - Nginx Configuration for m2y.net
# Production-ready configuration with proper API routing

server {
    server_name m2y.net www.m2y.net;

    # Root directory - EngiSuite Analytics frontend
    root /root/engisuite-analytics/frontend;
    index index.html;

    # SSL certificates (existing Certbot setup)
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/m2y.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/m2y.net/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Certbot challenge
    location /.well-known/acme-challenge/ {
        allow all;
    }

    # ============================================
    # API ROUTES - Must come before static files
    # ============================================

    # Authentication routes - must use ^~ to take priority
    location ^~ /auth/ {
        proxy_pass http://127.0.0.1:8000/auth/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Workflows API routes
    location ^~ /workflows/ {
        proxy_pass http://127.0.0.1:8000/workflows/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Calculators API routes
    location ^~ /calculators/ {
        proxy_pass http://127.0.0.1:8000/calculators/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # AI API routes
    location ^~ /ai/ {
        proxy_pass http://127.0.0.1:8000/ai/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Payments API routes
    location ^~ /payments/ {
        proxy_pass http://127.0.0.1:8000/payments/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Calculation pipeline API routes
    location ^~ /calculation-pipeline/ {
        proxy_pass http://127.0.0.1:8000/calculation-pipeline/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Analytics API routes
    location ^~ /analytics/ {
        proxy_pass http://127.0.0.1:8000/analytics/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Learning API routes
    location ^~ /learning-api/ {
        proxy_pass http://127.0.0.1:8000/learning-api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Generic API routes fallback
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint - exact match
    location = /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
    }

    # ============================================
    # STATIC FILES - Come after API routes
    # ============================================

    # Shared static assets (CSS, JS, etc.)
    location ^~ /shared/ {
        alias /root/engisuite-analytics/frontend/shared/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Learning module
    location ^~ /learning/ {
        alias /root/engisuite-analytics/learning/;
        try_files $uri $uri/ /learning/index.html;
    }

    # Default - try static files first, then index.html for SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name m2y.net www.m2y.net;

    location /.well-known/acme-challenge/ {
        allow all;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}
NGINX_CONF

# Step 4: Test nginx configuration
echo_info "Testing nginx configuration..."
nginx -t || {
    echo_error "Nginx configuration test failed!"
    exit 1
}

# Step 5: Reload nginx
echo_info "Reloading nginx..."
systemctl reload nginx || systemctl restart nginx

# Step 6: Restart the backend service
echo_info "Restarting backend service..."
cd "$APP_DIR/backend"

# Check if using systemd service
if [ -f /etc/systemd/system/engisuite.service ]; then
    systemctl restart engisuite
elif [ -f /etc/systemd/system/engisuite-analytics.service ]; then
    systemctl restart engisuite-analytics
else
    echo_warn "No systemd service found, checking for running processes..."
    pkill -f "uvicorn.*main:app" || true
    sleep 2
    source venv/bin/activate 2>/dev/null || true
    nohup python -m uvicorn main:app --host 127.0.0.1 --port 8000 > /var/log/engisuite.log 2>&1 &
    echo_info "Backend started with nohup"
fi

# Step 7: Verify services are running
echo_info "Verifying services..."
sleep 3

if curl -s http://127.0.0.1:8000/health > /dev/null; then
    echo_info "Backend health check: OK"
else
    echo_error "Backend health check: FAILED"
    echo_warn "Check logs at /var/log/engisuite.log"
fi

if curl -s https://m2y.net/health > /dev/null; then
    echo_info "Frontend health check: OK"
else
    echo_warn "Frontend health check: May need verification"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Changes applied:"
echo "1. Updated nginx configuration with proper API routing"
echo "2. Added /workflows/, /calculators/, /ai/, /payments/ routes"
echo "3. Reloaded nginx and backend services"
echo ""
echo "If issues persist, check:"
echo "- Backend logs: tail -f /var/log/engisuite.log"
echo "- Nginx logs: tail -f /var/log/nginx/error.log"
echo "- Backend status: systemctl status engisuite"
echo ""
