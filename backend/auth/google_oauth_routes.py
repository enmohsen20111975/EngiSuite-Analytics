"""
Google OAuth 2.0 Authentication Routes for FastAPI
Direct implementation without Firebase or Supabase
"""

import json
import urllib.parse
import urllib.request
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from datetime import datetime, timedelta, timezone
import secrets
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import get_db
from auth.models import User

# Load environment variables
load_dotenv()

# Configuration - Google OAuth Credentials (MUST be set in environment variables)
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://127.0.0.1:8000/auth/callback")

# Validate required credentials
if not CLIENT_ID or not CLIENT_SECRET:
    raise ValueError("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables")
SCOPES = "openid email profile"

# Create router
router = APIRouter(prefix="/auth", tags=["Authentication"])

def _build_redirect_uri(request: Request) -> str:
    """Build a redirect URI that matches the current host/port."""
    parsed = urllib.parse.urlparse(REDIRECT_URI) if REDIRECT_URI else None
    host = request.url.hostname
    scheme = request.url.scheme
    port = request.url.port

    if parsed and parsed.hostname == host:
        return REDIRECT_URI

    if port and not ((scheme == "http" and port == 80) or (scheme == "https" and port == 443)):
        return f"{scheme}://{host}:{port}/auth/callback"

    return f"{scheme}://{host}/auth/callback"

def store_user(user_info: dict, db: Session):
    """Store or update user information in database.

    Creates a new user on first Google sign-in, or updates existing user
    profile data on subsequent logins. Tracks login count and last login time.
    """
    existing_user = db.query(User).filter(
        (User.google_id == user_info["id"]) | (User.email == user_info["email"])
    ).first()

    if existing_user:
        # Update profile data from Google
        existing_user.google_id = user_info["id"]
        existing_user.email = user_info["email"]
        existing_user.name = user_info.get("name")
        existing_user.picture = user_info.get("picture")
        existing_user.given_name = user_info.get("given_name")
        existing_user.family_name = user_info.get("family_name")
        existing_user.locale = user_info.get("locale")
        # Track login activity
        existing_user.last_login_at = datetime.now(timezone.utc)
        existing_user.login_count = (existing_user.login_count or 0) + 1
        db.commit()
        db.refresh(existing_user)
        return existing_user
    else:
        # Create new user on first sign-in
        new_user = User(
            google_id=user_info["id"],
            email=user_info["email"],
            name=user_info.get("name"),
            picture=user_info.get("picture"),
            given_name=user_info.get("given_name"),
            family_name=user_info.get("family_name"),
            locale=user_info.get("locale"),
            last_login_at=datetime.now(timezone.utc),
            login_count=1,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

@router.get("/google/login")
async def google_login(request: Request):
    """Redirect user to Google's OAuth consent screen"""
    # Generate state parameter for CSRF protection
    state = secrets.token_urlsafe(32)
    redirect_uri = _build_redirect_uri(request)

    redirect_target = request.query_params.get("redirect")
    if redirect_target and not redirect_target.startswith("/"):
        redirect_target = None
    
    # Build authorization URL
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": SCOPES,
        "state": state,
        "access_type": "online",
        "include_granted_scopes": "true",
        "prompt": "select_account"
    }
    
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    
    # Create response with redirect
    response = RedirectResponse(url=auth_url, status_code=302)
    response.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        max_age=3600,
        path="/"
    )
    if redirect_target:
        response.set_cookie(
            key="post_login_redirect",
            value=redirect_target,
            httponly=True,
            max_age=600,
            path="/"
        )
    
    return response

@router.get("/callback")
async def google_callback(request: Request, code: str = None, state: str = None, error: str = None, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    
    # Check for errors
    if error:
        return RedirectResponse(url=f"/login.html?oauth_error={error}", status_code=302)
    
    # Verify state parameter
    state_cookie = request.cookies.get("oauth_state")
    if not state_cookie or state != state_cookie:
        return RedirectResponse(url="/login.html?oauth_error=invalid_state", status_code=302)

    redirect_uri = _build_redirect_uri(request)
    redirect_target = request.cookies.get("post_login_redirect")
    if redirect_target and not redirect_target.startswith("/"):
        redirect_target = None
    
    # Exchange code for tokens
    token_params = {
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }
    
    token_headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        # Send token exchange request
        token_req = urllib.request.Request(
            "https://oauth2.googleapis.com/token",
            data=urllib.parse.urlencode(token_params).encode("utf-8"),
            headers=token_headers,
            method="POST"
        )
        
        with urllib.request.urlopen(token_req) as token_res:
            token_data = json.loads(token_res.read())
        
        # Get user info from Google API
        user_info_req = urllib.request.Request(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        
        with urllib.request.urlopen(user_info_req) as user_info_res:
            user_info = json.loads(user_info_res.read())
        
        # Store user info and create session
        user = store_user(user_info, db)
        
        # Create access token
        from auth.router import create_access_token
        access_token_expires = timedelta(minutes=60 * 24 * 7)  # 7 days
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        # Set token cookie and redirect to target
        response = RedirectResponse(url=redirect_target or "/dashboard.html?oauth_success=true", status_code=302)
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=False,
            max_age=86400 * 7,  # 7 days
            path="/",
            samesite="lax"
        )
        response.delete_cookie(key="oauth_state", path="/")
        response.delete_cookie(key="post_login_redirect", path="/")
        
        return response
        
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return RedirectResponse(url="/login.html?oauth_error=authentication_failed", status_code=302)

@router.get("/check")
async def check_auth_status(request: Request, db: Session = Depends(get_db)):
    """Check if user is authenticated"""
    # Check for bearer token
    auth_header = request.headers.get("Authorization", "")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        try:
            from auth.router import _get_current_user
            user = await _get_current_user(token, db)
            if user:
                return JSONResponse(content={
                    "authenticated": True,
                    "user": {
                        "email": user.email,
                        "name": user.name,
                        "picture": user.picture
                    }
                })
        except Exception as e:
            print(f"Token validation error: {e}")
    
    # Check for cookie token
    token_cookie = request.cookies.get("access_token")
    if token_cookie:
        try:
            from auth.router import _get_current_user
            user = await _get_current_user(token_cookie, db)
            if user:
                return JSONResponse(content={
                    "authenticated": True,
                    "user": {
                        "email": user.email,
                        "name": user.name,
                        "picture": user.picture
                    }
                })
        except Exception as e:
            print(f"Cookie token validation error: {e}")
    
    return JSONResponse(content={"authenticated": False})
