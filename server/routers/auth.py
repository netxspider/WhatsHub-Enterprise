from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import RedirectResponse
from database import get_database
from models.user import UserCreate, UserLogin, User, Token
from utils.security import get_password_hash, verify_password, create_access_token
from services.auth_service import get_current_user
from datetime import datetime
from bson import ObjectId
from config import get_settings
import httpx
from urllib.parse import urlencode

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_doc = {
        "email": user_data.email,
        "name": user_data.name,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    # Insert user
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    
    return User(**user_doc)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login and get access token"""
    
    db = get_database()
    
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    return Token(access_token=access_token)


@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth login"""
    # Build Google OAuth URL manually
    if not settings.google_client_id or settings.google_client_id == "":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file"
        )
    
    params = {
        'client_id': settings.google_client_id,
        'redirect_uri': settings.google_redirect_uri,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    google_auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url=google_auth_url)



@router.get("/google/callback")
async def google_callback(code: str):
    """Handle Google OAuth callback"""
    try:
        # Exchange code for token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': settings.google_client_id,
                    'client_secret': settings.google_client_secret,
                    'redirect_uri': settings.google_redirect_uri,
                    'grant_type': 'authorization_code'
                }
            )
            token_data = token_response.json()
            
            if 'error' in token_data:
                raise HTTPException(status_code=400, detail=token_data['error'])
            
            # Get user info from Google
            user_info_response = await client.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f"Bearer {token_data['access_token']}"}
            )
            user_info = user_info_response.json()
        
        # Find or create user
        db = get_database()
        user = await db.users.find_one({"email": user_info['email']})
        
        if not user:
            # Create new user
            user_doc = {
                "email": user_info['email'],
                "name": user_info.get('name', user_info['email']),
                "hashed_password": get_password_hash(""),  # No password for OAuth users
                "created_at": datetime.utcnow(),
                "oauth_provider": "google"
            }
            result = await db.users.insert_one(user_doc)
            user_id = str(result.inserted_id)
        else:
            user_id = str(user["_id"])
        
        # Create JWT token
        access_token = create_access_token(data={"sub": user_id})
        
        # Redirect to frontend with token
        return RedirectResponse(
            url=f"http://localhost:3000/auth/callback?token={access_token}",
            status_code=302
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OAuth error: {str(e)}"
        )
