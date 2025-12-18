from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from database import get_database
from utils.security import decode_access_token
from models.user import User
from bson import ObjectId
from typing import Optional

security = HTTPBearer()


async def get_current_user(
    token: str = Depends(security)
) -> User:
    """Get the current authenticated user from JWT token"""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Get user from database
    db = get_database()
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    
    if user_doc is None:
        raise credentials_exception
    
    # Convert ObjectId to string
    user_doc["_id"] = str(user_doc["_id"])
    
    return User(**user_doc)


async def get_optional_user(
    token: Optional[str] = Depends(security)
) -> Optional[User]:
    """Get the current user if authenticated, otherwise None"""
    
    if token is None:
        return None
    
    try:
        return await get_current_user(token)
    except HTTPException:
        return None
