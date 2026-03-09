# Google Authentication Fix

## Issues Fixed

### 1. **404 Error on `/auth/google/login`**
- **Problem**: Frontend was redirecting to `/auth/google/login` route that doesn't exist in backend
- **Solution**: Disabled server-side OAuth redirect (`USE_SERVER_REDIRECT_OAUTH = false`)
- **Result**: Google button hidden until properly configured

### 2. **Mismatched Field Names**
- **Problem**: Frontend sent `credential` but backend expected `idToken`
- **Solution**: Updated frontend to send `idToken`

### 3. **Token Response Mismatch**
- **Problem**: Frontend expected `access_token` but backend returns `token`
- **Solution**: Updated frontend to use `token` field

### 4. **Nested Response Structure**
- **Problem**: Backend returns data nested in `response.data.data`
- **Solution**: Updated frontend to handle both nested and flat response structures

## Current State

✅ **Google button is now hidden** (no 404 errors)
✅ Email/password login should work correctly
✅ Backend Google OAuth endpoint ready for when configured

## To Enable Google Sign-In

### Option 1: Client-Side Google Sign-In (Recommended)

1. **Get Google OAuth Client ID**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create/select a project
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized JavaScript origins: `http://localhost:5173`, `http://localhost:8000`
   - Add authorized redirect URIs: `http://localhost:5173`, `http://localhost:8000`

2. **Update Frontend Environment**:
   ```bash
   # frontend-react/.env
   VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
   ```

3. **Restart Frontend**:
   ```bash
   cd frontend-react
   npm run dev
   ```

### Option 2: Server-Side OAuth (More Complex)

If you want server-side redirect flow, you need to implement these backend routes:
- `GET /auth/google/login` - Redirects to Google OAuth
- `GET /auth/google/callback` - Handles Google callback

This requires:
- Installing `passport` and `passport-google-oauth20`
- Setting up session management
- Configuring OAuth secrets

## Testing

After configuring, test with:
1. Go to login page
2. Google button should appear
3. Click it to trigger Google Sign-In popup
4. Should redirect to dashboard on success

## Notes

- The backend already has POST `/api/auth/google` endpoint ready
- Backend properly handles user creation/linking with Google accounts
- Email verification is automatically set to true for Google users
