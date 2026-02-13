# Production Deployment Fixes - EngiSuite Analytics

## Issues Identified and Fixed

### 1. API Routing Issues (Critical)

#### Problem: Workflows API returning HTML instead of JSON
- **Error**: `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- **Cause**: Nginx wasn't configured to proxy `/workflows/` requests to the FastAPI backend
- **Fix**: Updated [`nginx_m2y.conf`](nginx_m2y.conf) to include proper proxy routes for all API endpoints

#### Problem: /api/auth/preferences404 error
- **Error**: `GET https://m2y.net/api/auth/preferences 404 (Not Found)`
- **Cause**: Frontend was calling `/api/auth/preferences` but backend routes are at `/auth/preferences`
- **Fix**: Updated [`frontend/shared/js/theme-manager.js`](frontend/shared/js/theme-manager.js) to use correct path `/auth/preferences`

### 2. Missing JavaScript Method

#### Problem: authService.init is not a function
- **Error**: `Uncaught TypeError: authService.init is not a function`
- **Cause**: The `AuthService` class was missing the `init()` method
- **Fix**: Added `init()` method to [`frontend/shared/js/auth.js`](frontend/shared/js/auth.js)

### 3. CDN Dependencies (Tracking Prevention)

#### Problem: External CDNs blocked by browser tracking prevention
- **Error**: `Tracking Prevention blocked access to storage for https://cdnjs.cloudflare.com/ajax/libs/font-awesome/`
- **Cause**: Browsers block some external CDNs for privacy protection
- **Fix**: 
 - Created [`package.json`](package.json) and [`tailwind.config.js`](tailwind.config.js) for Tailwind CSS build
 - Created [`frontend/shared/css/tailwind-input.css`](frontend/shared/css/tailwind-input.css) for production CSS
 - Updated [`deploy_fixes.sh`](deploy_fixes.sh) to download Font Awesome locally

### 4. Payments API405 Error

#### Problem: POST /payments/subscribe returns405
- **Error**: `POST https://m2y.net/payments/subscribe 405 (Method Not Allowed)`
- **Cause**: Nginx wasn't proxying `/payments/` routes to the backend
- **Fix**: Added `/payments/` location block in [`nginx_m2y.conf`](nginx_m2y.conf)

---

## Files Modified

| File | Changes |
|------|---------|
| `nginx_m2y.conf` | Added proxy routes for `/workflows/`, `/calculators/`, `/ai/`, `/payments/`, `/analytics/`, `/calculation-pipeline/`, `/learning-api/` |
| `frontend/shared/js/theme-manager.js` | Changed `/api/auth/preferences` to `/auth/preferences` (lines 104, 570) |
| `frontend/shared/js/auth.js` | Added missing `init()` method |
| `frontend/workflows.html` | Updated to use local Font Awesome path |
| `package.json` | Created for Tailwind CSS build |
| `tailwind.config.js` | Created for Tailwind CSS configuration |
| `frontend/shared/css/tailwind-input.css` | Created for Tailwind CSS input |
| `deploy_fixes.sh` | Created comprehensive deployment script |

---

## Deployment Instructions

### Option 1: Quick Deploy (Recommended)

1. **Commit and push all changes:**
 ```bash
 git add .
 git commit -m "Fix production deployment issues"
 git push origin main
 ```

2. **SSH into your VPS and run:**
 ```bash
 cd /root/engisuite-analytics
 git pull origin main
 chmod +x deploy_fixes.sh
 ./deploy_fixes.sh
 ```

### Option 2: Manual Deploy

1. **Update nginx configuration:**
 ```bash
 # Copy the nginx config to sites-available
 sudo cp nginx_m2y.conf /etc/nginx/sites-available/m2y.net
 
 # Test the configuration
 sudo nginx -t
 
 # Reload nginx
 sudo systemctl reload nginx
 ```

2. **Restart the backend:**
 ```bash
 # If using systemd
 sudo systemctl restart engisuite
 
 # Or manually
 pkill -f "uvicorn.*main:app"
 cd /root/engisuite-analytics/backend
 source venv/bin/activate
 nohup python -m uvicorn main:app --host 127.0.0.1 --port 8000 > /var/log/engisuite.log 2>&1 &
 ```

3. **Build Tailwind CSS (optional but recommended):**
 ```bash
 cd /root/engisuite-analytics
 npm install
 npm run build:css
 ```

---

## Verification Steps

After deploying, verify the fixes:

1. **Check API endpoints:**
 ```bash
 # Health check
 curl https://m2y.net/health
 
 # Workflows API
 curl https://m2y.net/workflows/
 
 # Auth check (should return401 without token, not404)
 curl https://m2y.net/auth/preferences
 ```

2. **Check browser console:**
 - Open https://m2y.net in your browser
 - Open Developer Tools (F12)
 - Check Console for errors
 - All API calls should return JSON, not HTML

3. **Check payments:**
 - Navigate to pricing page
 - Try selecting a plan
 - Network tab should show `/payments/subscribe` returning proper response

---

## Nginx Route Summary

The updated nginx configuration proxies these routes to FastAPI backend:

| Route | Backend Path | Purpose |
|-------|-------------|---------|
| `/auth/` | `/auth/` | Authentication endpoints |
| `/workflows/` | `/workflows/` | Engineering workflows |
| `/calculators/` | `/calculators/` | Engineering calculators |
| `/ai/` | `/ai/` | AI assistant |
| `/payments/` | `/payments/` | Payment processing |
| `/analytics/` | `/analytics/` | Data analytics |
| `/calculation-pipeline/` | `/calculation-pipeline/` | Calculation pipeline |
| `/learning-api/` | `/learning-api/` | Learning module API |
| `/api/` | (fallback) | Generic API fallback |
| `/health` | `/health` | Health check |

---

## Troubleshooting

### Backend not starting
```bash
# Check logs
tail -f /var/log/engisuite.log

# Check if port is in use
lsof -i :8000

# Check database
cd /root/engisuite-analytics/backend
source venv/bin/activate
python -c "from database import engine; print(engine.url)"
```

### Nginx errors
```bash
# Check nginx error log
tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t
```

### Database issues
```bash
# Run migrations
cd /root/engisuite-analytics/backend
source venv/bin/activate
python auth/migrate_add_preferences.py
python migrate_workflow_database.py
```

---

## Post-Deployment Checklist

- [ ] Nginx configuration updated and reloaded
- [ ] Backend service restarted
- [ ] Health check returns `{"status": "healthy"}`
- [ ] Workflows page loads without errors
- [ ] No404 errors in browser console
- [ ] Payments page works correctly
- [ ] Theme preferences save correctly
