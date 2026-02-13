# Fixes Applied to EngiSuite Analytics

## Summary of Issues and Fixes

### Issue 1: pysql Dependency
**Status**: ✅ No Fix Needed

The `requirements.txt` does not include `pysql` or `pymysql`. The application uses SQLite which is built into Python 3, so no additional database driver is needed.

---

### Issue 2: CSS/JS Files Returning 404 (UI Coloring Issues)
**Status**: ✅ Fixed

**Root Cause**: The nginx configuration was missing the `/auth/` proxy route and the `/shared/` location wasn't properly configured.

**Fix Applied**: Updated the nginx configuration in `DEPLOYMENT_PLAN.md` to include:
1. `/auth/` location block to proxy authentication requests to the FastAPI backend
2. `try_files $uri =404;` in the `/shared/` location to properly serve static files

---

### Issue 3: Google OAuth Redirect Issue
**Status**: ✅ Fixed

**Root Cause**: The `page-init.js` was only checking localStorage for the token, not the cookie set by the Google OAuth callback.

**Fix Applied**: Updated [`frontend/shared/js/page-init.js`](frontend/shared/js/page-init.js:92) to:
1. Add a `getToken()` function that checks both localStorage and cookies
2. Automatically save the token from cookie to localStorage for future use

---

## How to Apply These Fixes on Your VPS

### Step 1: Update the Modified Files

Upload the modified `page-init.js` file to your VPS:

```bash
# From your local machine (Windows PowerShell)
scp frontend/shared/js/page-init.js root@your_vps_ip:/root/engisuite-analytics/frontend/shared/js/
```

### Step 2: Update Nginx Configuration

Run this command on your VPS to update the nginx configuration:

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
```

### Step 3: Test and Reload Nginx

```bash
# Test nginx configuration
nginx -t

# If test passes, reload nginx
systemctl reload nginx
```

### Step 4: Restart the Backend Service

```bash
systemctl restart engisuite
```

### Step 5: Verify the Fixes

1. **Test CSS Loading**: Visit `https://m2y.net` and check if the page styling looks correct
2. **Test Google OAuth**: 
   - Go to `https://m2y.net/login.html`
   - Click "Sign in with Google"
   - After successful authentication, you should be redirected to `dashboard.html`

### Step 6: Clear Browser Cache

After applying the fixes, clear your browser cache or do a hard refresh (Ctrl+Shift+R) to ensure you're loading the updated files.

---

## Quick Fix Script

Alternatively, you can run the `fix_vps.sh` script on your VPS:

```bash
# Upload the script to your VPS
scp fix_vps.sh root@your_vps_ip:/root/

# Run the script
ssh root@your_vps_ip
chmod +x /root/fix_vps.sh
/root/fix_vps.sh
```

---

## Troubleshooting

### If CSS still doesn't load:
```bash
# Check if the files exist
ls -la /root/engisuite-analytics/frontend/shared/css/

# Check nginx error logs
tail -f /var/log/nginx/error.log
```

### If Google OAuth still doesn't redirect:
```bash
# Check backend logs
journalctl -u engisuite -f

# Test the auth endpoint directly
curl https://m2y.net/auth/check
```

### If you get cookie errors:
Make sure your `GOOGLE_REDIRECT_URI` in the `.env` file matches your domain:
```
GOOGLE_REDIRECT_URI="https://m2y.net/auth/callback"
```
