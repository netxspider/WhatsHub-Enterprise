from fastapi import APIRouter, HTTPException, status, Depends
from database import get_database
from models.template import Template, TemplateCreate, TemplateUpdate, DEMO_TEMPLATES
from models.user import User
from services.auth_service import get_current_user
from typing import List
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/templates", tags=["Templates"])


@router.get("/", response_model=List[Template])
async def get_templates(current_user: User = Depends(get_current_user)):
    """Get all templates (demo + user's custom templates)"""
    
    db = get_database()
    
    # Get user's custom templates from MongoDB
    custom_templates = await db.templates.find({"user_id": current_user.id}).to_list(length=100)
    
    # Format custom templates
    for template in custom_templates:
        template["_id"] = str(template["_id"])
    
    # Combine demo templates with custom templates
    all_templates = DEMO_TEMPLATES + custom_templates
    
    return [Template(**template) for template in all_templates]


@router.post("/", response_model=Template, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_data: TemplateCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new custom template"""
    
    db = get_database()
    
    # Create template document
    template_doc = {
        "name": template_data.name,
        "category": template_data.category,
        "content": template_data.content,
        "parameters": [param.dict() for param in template_data.parameters],
        "status": "pending",  # Custom templates start as pending
        "user_id": current_user.id,
        "created_at": datetime.utcnow()
    }
    
    result = await db.templates.insert_one(template_doc)
    template_doc["_id"] = str(result.inserted_id)
    
    return Template(**template_doc)


@router.get("/{template_id}", response_model=Template)
async def get_template(
    template_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific template"""
    
    db = get_database()
    
    # Check if it's a demo template
    demo_template = next((t for t in DEMO_TEMPLATES if t["_id"] == template_id), None)
    if demo_template:
        return Template(**demo_template)
    
    # Check if it's a custom template
    try:
        template = await db.templates.find_one({"_id": ObjectId(template_id)})
        if template:
            template["_id"] = str(template["_id"])
            return Template(**template)
    except:
        pass
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Template not found"
    )


@router.put("/{template_id}", response_model=Template)
async def update_template(
    template_id: str,
    template_data: TemplateUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a custom template"""
    
    db = get_database()
    
    # Verify template exists and user owns it
    template = await db.templates.find_one({
        "_id": ObjectId(template_id),
        "user_id": current_user.id
    })
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found or you don't have permission"
        )
    
    # Update template
    update_data = {k: v for k, v in template_data.dict(exclude_unset=True).items()}
    if "parameters" in update_data:
        update_data["parameters"] = [param.dict() if hasattr(param, 'dict') else param for param in update_data["parameters"]]
    
    await db.templates.update_one(
        {"_id": ObjectId(template_id)},
        {"$set": update_data}
    )
    
    # Get updated template
    updated = await db.templates.find_one({"_id": ObjectId(template_id)})
    updated["_id"] = str(updated["_id"])
    
    return Template(**updated)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a custom template"""
    
    db = get_database()
    
    result = await db.templates.delete_one({
        "_id": ObjectId(template_id),
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found or you don't have permission"
        )
