from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import settings
from database import connect_to_mongo, close_mongo_connection
from routers import auth, contacts, chat, campaigns, templates, sheets, channels, communities, profile, settings as settings_router, status


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    logger.info("Starting WhatsHub Enterprise API")
    await connect_to_mongo()
    yield
    # Shutdown
    logger.info("Shutting down WhatsHub Enterprise API")
    await close_mongo_connection()


# Create FastAPI app
app = FastAPI(
    title="WhatsHub Enterprise API",
    description="Backend API for WhatsHub Enterprise - WhatsApp Marketing Dashboard",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(contacts.router)
app.include_router(chat.router)
app.include_router(campaigns.router)
app.include_router(templates.router)
app.include_router(sheets.router)
app.include_router(channels.router)
app.include_router(communities.router)
app.include_router(profile.router)
app.include_router(settings_router.router)
app.include_router(status.router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "WhatsHub Enterprise API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    from database import mongodb_client
    
    mongo_status = "connected" if mongodb_client else "disconnected"
    
    return {
        "status": "healthy",
        "database": mongo_status,
        "service": "WhatsHub Enterprise API"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
