#!/bin/bash
# Quick Fix Script for EngiSuite Analytics VPS Deployment
# Run this script on your VPS to fix the deployment issues

echo "=========================================="
echo "EngiSuite Analytics - VPS Fix Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="/root/engisuite-analytics"

# 1. Fix Nginx Configuration
echo -e "${YELLOW}Step 1: Fixing Nginx Configuration...${NC}"

cat > /etc/nginx/sites-available/m2y.net << 'EOF'
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

    # API and dynamic content - proxy to FastAPI backend
    location /api/ {
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

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
    }

    # Authentication routes - proxy to FastAPI backend (CRITICAL FOR GOOGLE OAUTH)
    location /auth/ {
        proxy_pass http://127.0.0.1:8000/auth/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Shared static assets (CSS, JS, etc.)
    location /shared/ {
        alias /root/engisuite-analytics/frontend/shared/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Learning module
    location /learning/ {
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
EOF

# Test nginx configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Nginx configuration is valid!${NC}"
    systemctl reload nginx
    echo -e "${GREEN}Nginx reloaded successfully!${NC}"
else
    echo -e "${RED}Nginx configuration has errors. Please check manually.${NC}"
    exit 1
fi

# 2. Verify file permissions
echo -e "${YELLOW}Step 2: Fixing file permissions...${NC}"
chmod -R 755 /root/engisuite-analytics/frontend
chmod -R 755 /root/engisuite-analytics/learning
chmod 644 /root/engisuite-analytics/frontend/*.html
chmod 644 /root/engisuite-analytics/frontend/shared/css/*.css
chmod 644 /root/engisuite-analytics/frontend/shared/js/*.js
echo -e "${GREEN}File permissions fixed!${NC}"

# 3. Restart the backend service
echo -e "${YELLOW}Step 3: Restarting backend service...${NC}"
systemctl restart engisuite
sleep 2
systemctl status engisuite --no-pager

# 4. Test endpoints
echo -e "${YELLOW}Step 4: Testing endpoints...${NC}"
echo "Testing health endpoint..."
curl -s http://127.0.0.1:8000/health

echo ""
echo "Testing shared CSS file..."
if [ -f "/root/engisuite-analytics/frontend/shared/css/universal-theme.css" ]; then
    echo -e "${GREEN}universal-theme.css exists${NC}"
else
    echo -e "${RED}universal-theme.css NOT FOUND${NC}"
fi

echo ""
echo "Testing auth endpoint..."
curl -s http://127.0.0.1:8000/auth/check

echo ""
echo -e "${GREEN}=========================================="
echo "Fix script completed!"
echo "==========================================${NC}"
echo ""
echo "Please test the following:"
echo "1. Visit https://m2y.net - Check if CSS loads correctly"
echo "2. Visit https://m2y.net/login.html - Try Google Sign-in"
echo "3. After login, you should be redirected to dashboard.html"
echo ""
echo "If issues persist, check the logs:"
echo "  - Backend logs: journalctl -u engisuite -f"
echo "  - Nginx logs: tail -f /var/log/nginx/error.log"
