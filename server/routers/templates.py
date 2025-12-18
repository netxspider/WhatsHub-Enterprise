from fastapi import APIRouter, HTTPException, status, Depends
from database import get_database
from models.template import Template, DEMO_TEMPLATES
from models.user import User
from services.auth_service import get_current_user
from typing import List

router = APIRouter(prefix="/templates", tags=["Templates"])


@router.get("/", response_model=List[Template])
async def get_templates(current_user: User = Depends(get_current_user)):
    """Get all approved templates"""
    
    # Return hardcoded demo templates
    return [Template(**template) for template in DEMO_TEMPLATES]


@router.get("/{template_id}", response_model=Template)
async def get_template(
    template_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific template"""
    
    template = next((t for t in DEMO_TEMPLATES if t["_id"] == template_id), None)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return Template(**template)
