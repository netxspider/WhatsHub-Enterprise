from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os
import sys

# Add server directory to path
server_path = os.path.join(os.path.dirname(__file__), '..', 'server')
if server_path not in sys.path:
    sys.path.insert(0, server_path)

try:
    from routers import auth, contacts, chat, campaigns, templates, sheets, channels, communities, profile, settings as settings_router, status
except ImportError as e:
    print(f"Import error: {e}")
    # Create minimal routers if imports fail
    from fastapi import APIRouter
    auth = contacts = chat = campaigns = templates = sheets = channels = communities = profile = settings_router = status = type('Router', (), {'router': APIRouter()})()

# Create FastAPI app (no lifespan for serverless)
app = FastAPI(
    title="WhatsHub Enterprise API",
    description="Backend API for WhatsHub Enterprise - WhatsApp Marketing Dashboard",
    version="1.0.0"
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://whats-hub-enterprise.vercel.app").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(contacts.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(campaigns.router, prefix="/api")
app.include_router(templates.router, prefix="/api")
app.include_router(sheets.router, prefix="/api")
app.include_router(channels.router, prefix="/api")
app.include_router(communities.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(status.router, prefix="/api")


@app.get("/api")
@app.get("/api/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "WhatsHub Enterprise API",
        "version": "1.0.0",
        "environment": "production" if os.getenv("VERCEL") else "development"
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "WhatsHub Enterprise API",
        "vercel": bool(os.getenv("VERCEL"))
    }


# Vercel serverless handler
handler = Mangum(app, lifespan="off")
