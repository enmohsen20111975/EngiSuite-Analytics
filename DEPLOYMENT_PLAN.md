# EngiSuite Analytics Deployment Plan for m2y.net

## Overview

This document provides a comprehensive step-by-step guide to deploy the EngiSuite Analytics application to your VPS, replacing the existing smarteducation project at m2y.net.

### Current Infrastructure
- **Domain**: m2y.net
- **Old Project Location**: /root/smarteducation
- **SSL Certificates**: Let's Encrypt via Certbot
- **Backend Port**: 8000 (FastAPI)
- **Web Server**: Nginx

### New Project
- **Project Name**: EngiSuite Analytics
- **Tech Stack**: FastAPI + SQLite + Nginx
- **Frontend**: Static HTML/CSS/JS

---

## Pre-Deployment Checklist

### 1. Local Preparation
- [ ] **Test application locally** - Ensure all features work
- [ ] **Copy all project files** - Prepare for upload to VPS

### 2. VPS Preparation

- [ ] **SSH into VPS**: `ssh root@your_vps_ip`
- [ ] **Check current system resources**: `df -h` and `free -m`
- [ ] **Backup existing project**: 
  ```bash
  cp -r /root/smarteducation /root/smarteducation_backup_$(date +%Y%m%d)
  ```
- [ ] **Backup nginx config**: 
  ```bash
  cp /etc/nginx/sites-available/m2y.net /etc/nginx/sites-available/m2y.net.backup
  ```

---

## Deployment Steps

### Phase 1: Environment Setup

#### Step 1.1: Install Required Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Python 3.10+ if not present
apt install python3.10 python3.10-venv python3-pip -y

# Install SQLite development headers (required for some Python packages)
apt install libsqlite3-dev -y

# Verify installations
python3 --version
pip3 --version
```

#### Step 1.2: Create Project Directory

```bash
# Create new project directory
mkdir -p /root/engisuite-analytics
cd /root/engisuite-analytics
```

#### Step 1.3: Set Up Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

---

### Phase 2: Deploy Application Code

#### Step 2.1: Upload Project Files

**Using SCP from Local Machine (Windows PowerShell)**
```powershell
# On your local machine, run:
scp -r d:/applications/engisuite-analytics/* root@your_vps_ip:/root/engisuite-analytics/
```

**Or use SFTP client (FileZilla, WinSCP) to upload all files**

#### Step 2.2: Install Python Dependencies

```bash
cd /root/engisuite-analytics
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

# Verify uvicorn is installed
python -c "import uvicorn; print('uvicorn version:', uvicorn.__version__)"
```

---

### Phase 3: Environment File Setup

#### Step 3.1: Create .env File

**File Location**: `/root/engisuite-analytics/backend/.env`

**Copy and paste this content (REPLACE WITH YOUR ACTUAL VALUES):**

```bash
# --- Google OAuth 2.0 Settings ---
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
GOOGLE_REDIRECT_URI="https://m2y.net/auth/callback"

# --- Paymob Settings ---
PAYMOB_API_KEY="YOUR_PAYMOB_API_KEY"
PAYMOB_INTEGRATION_ID="YOUR_INTEGRATION_ID"
PAYMOB_HMAC_SECRET="YOUR_HMAC_SECRET"
PAYMOB_IFRAME_ID="YOUR_IFRAME_ID"

# --- AI Services ---
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY

# --- Application Configuration ---
SECRET_KEY="a_very_secret_random_string_for_jwt"
APP_ENV=production
DEBUG=False
WORKFLOW_DATABASE_URL=sqlite:///./workflows.db
DATABASE_URL=sqlite:///./users.db

# --- Environment ---
ENVIRONMENT=production
```

**Command to create the file:**
```bash
cat > /root/engisuite-analytics/backend/.env << 'EOF'
# --- Google OAuth 2.0 Settings ---
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
GOOGLE_REDIRECT_URI="https://m2y.net/auth/callback"

# --- Paymob Settings ---
PAYMOB_API_KEY="YOUR_PAYMOB_API_KEY"
PAYMOB_INTEGRATION_ID="YOUR_INTEGRATION_ID"
PAYMOB_HMAC_SECRET="YOUR_HMAC_SECRET"
PAYMOB_IFRAME_ID="YOUR_IFRAME_ID"

# --- AI Services ---
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY

# --- Application Configuration ---
SECRET_KEY="generate_a_secure_random_string_here"
APP_ENV=production
DEBUG=False
WORKFLOW_DATABASE_URL=sqlite:///./workflows.db
DATABASE_URL=sqlite:///./users.db

# --- Environment ---
ENVIRONMENT=production
EOF
```

---

### Phase 4: Systemd Service Setup

#### Step 4.1: Create Systemd Service for FastAPI

**File Location**: `/etc/systemd/system/engisuite.service`

**Copy and paste this command to create the file:**

```bash
cat > /etc/systemd/system/engisuite.service << 'EOF'
[Unit]
Description=EngiSuite Analytics FastAPI Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/engisuite-analytics/backend
Environment="PATH=/root/engisuite-analytics/venv/bin"
ExecStart=/root/engisuite-analytics/venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

#### Step 4.2: Enable and Start Service

```bash
# Reload systemd
systemctl daemon-reload

# Enable service to start on boot
systemctl enable engisuite

# Start the service
systemctl start engisuite

# Check status
systemctl status engisuite

# View logs
journalctl -u engisuite -f
```

---

### Phase 5: Nginx Configuration

#### Step 5.1: Create New Nginx Configuration

**File Location**: `/etc/nginx/sites-available/m2y.net`

**Copy and paste this command to create the file:**

```bash
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

    # Authentication routes - proxy to FastAPI backend
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

    # Shared static assets (must come before generic static files)
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
```

#### Step 5.2: Enable Site and Test Configuration

```bash
# Create symlink if not exists
ln -sf /etc/nginx/sites-available/m2y.net /etc/nginx/sites-enabled/

# Test nginx configuration
nginx -t

# If test passes, reload nginx
systemctl reload nginx
```

---

### Phase 6: Final Verification

#### Step 6.1: Check All Services

```bash
# Check backend service
systemctl status engisuite

# Check nginx
systemctl status nginx

# Test backend directly
curl http://127.0.0.1:8000/health

# Test through nginx
curl https://m2y.net/health
curl https://m2y.net/api/health
```

#### Step 6.2: Verify Website Access

1. Open browser and go to `https://m2y.net`
2. Test login/registration
3. Test API endpoints
4. Check all pages load correctly

---

### Phase 7: Backup Setup

#### Step 7.1: Create Backup Script

**File Location**: `/root/backup_engisuite.sh`

**Copy and paste this command to create the file:**

```bash
cat > /root/backup_engisuite.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups/engisuite"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp /root/engisuite-analytics/backend/users.db $BACKUP_DIR/users_$DATE.db
cp /root/engisuite-analytics/backend/workflows.db $BACKUP_DIR/workflows_$DATE.db

# Backup .env file
cp /root/engisuite-analytics/backend/.env $BACKUP_DIR/env_$DATE.backup

# Backup entire project (weekly)
if [ $(date +%u) -eq 7 ]; then
    tar -czf $BACKUP_DIR/engisuite_full_$DATE.tar.gz -C /root engisuite-analytics
fi

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

# Make executable
chmod +x /root/backup_engisuite.sh
```

#### Step 7.2: Schedule Daily Backups

```bash
# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup_engisuite.sh >> /var/log/engisuite_backup.log 2>&1") | crontab -
```

#### Step 7.3: Configure Firewall (if not already)

```bash
# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

# Enable firewall
ufw enable
```

---

## Rollback Plan

### Quick Rollback

If something goes wrong, revert to the old system:

```bash
# Stop new service
systemctl stop engisuite

# Restore old nginx config
cp /etc/nginx/sites-available/m2y.net.backup /etc/nginx/sites-available/m2y.net
systemctl reload nginx

# Start old service (if it was running differently)
cd /root/smarteducation
# Start your old backend however it was running
```

### Full Rollback

```bash
# Restore entire old project
rm -rf /root/smarteducation
cp -r /root/smarteducation_backup_YYYYMMDD /root/smarteducation

# Restore nginx config
cp /etc/nginx/sites-available/m2y.net.backup /etc/nginx/sites-available/m2y.net
systemctl reload nginx
```

---

## Maintenance Commands

### Service Management

```bash
# Restart application
systemctl restart engisuite

# Stop application
systemctl stop engisuite

# Start application
systemctl start engisuite

# View logs
journalctl -u engisuite -f

# Reload nginx
systemctl reload nginx
```

### Updates

```bash
# After uploading new code
cd /root/engisuite-analytics
source venv/bin/activate
pip install -r backend/requirements.txt
systemctl restart engisuite
```

### SSL Certificate Renewal

```bash
# Test renewal
certbot renew --dry-run

# Renew certificates
certbot renew

# Reload nginx after renewal
systemctl reload nginx
```

---

## Security Checklist

- [x] SECRET_KEY is set in .env
- [ ] Ensure database file is not web-accessible
- [ ] Set proper file permissions: `chmod 600 /root/engisuite-analytics/backend/.env`
- [ ] Keep SSL certificates up to date
- [ ] Regular security updates: `apt update && apt upgrade`
- [ ] Configure fail2ban for SSH protection
- [ ] Review CORS settings in production

---

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**: Backend not running - check `systemctl status engisuite`
2. **403 Forbidden**: Check file permissions on frontend directory
3. **SSL Errors**: Check certificate paths and renewal status
4. **Database Errors**: Check database file permissions and path

### Error 203/EXEC - Service Fails to Start

This error means the executable cannot be found or executed. Common causes:

1. **Virtual environment not properly set up** - uvicorn not installed
2. **Incorrect working directory** - must be in the backend folder
3. **Missing Python dependencies**

**Fix Steps:**

```bash
# Stop the failing service
systemctl stop engisuite

# Verify virtual environment exists and has uvicorn
ls -la /root/engisuite-analytics/venv/bin/
ls -la /root/engisuite-analytics/venv/bin/python

# If venv is missing or broken, recreate it
cd /root/engisuite-analytics
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

# Verify uvicorn is installed
which uvicorn
uvicorn --version

# Test the application manually first
cd /root/engisuite-analytics/backend
/root/engisuite-analytics/venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000

# If manual test works, update and restart the service
systemctl daemon-reload
systemctl restart engisuite
systemctl status engisuite
```

### Useful Commands

```bash
# Check what's using port 8000
lsof -i :8000

# Check disk space
df -h

# Check memory usage
free -m

# Check running processes
ps aux | grep python

# Test database connection
sqlite3 /root/engisuite-analytics/backend/users.db ".tables"

# View detailed service logs
journalctl -u engisuite -n 50 --no-pager

# Check if uvicorn is in venv
/root/engisuite-analytics/venv/bin/python -c "import uvicorn; print(uvicorn.__version__)"
```

---

## Quick Reference: All Files to Create

### 1. Environment File
**Location**: `/root/engisuite-analytics/backend/.env`

### 2. Systemd Service
**Location**: `/etc/systemd/system/engisuite.service`

### 3. Nginx Configuration
**Location**: `/etc/nginx/sites-available/m2y.net`

### 4. Backup Script
**Location**: `/root/backup_engisuite.sh`

---

**Document Version**: 1.1  
**Last Updated**: February 2026  
**Author**: EngiSuite Deployment Team
