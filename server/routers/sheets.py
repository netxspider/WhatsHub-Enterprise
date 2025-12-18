from fastapi import APIRouter, HTTPException, Depends
from services.sheet_service import sheets_service
from models.user import User
from services.auth_service import get_current_user
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/sheets", tags=["Google Sheets"])


class SheetInfo(BaseModel):
    """Sheet information model"""
    sheet_url: str
    sheet_names: List[str]


@router.get("/validate")
async def validate_sheet(
    sheet_url: str,
    current_user: User = Depends(get_current_user)
):
    """Validate a Google Sheet URL and get sheet names"""
    
    try:
        sheet_names = sheets_service.get_sheet_names(sheet_url)
        
        return {
            "valid": True,
            "sheet_names": sheet_names,
            "message": "Sheet is accessible"
        }
        
    except Exception as e:
        return {
            "valid": False,
            "error": str(e),
            "message": "Failed to access sheet. Make sure it's shared with the service account."
        }


@router.get("/preview")
async def preview_sheet_data(
    sheet_url: str,
    sheet_name: str = None,
    current_user: User = Depends(get_current_user)
):
    """Preview data from a Google Sheet"""
    
    try:
        data = sheets_service.get_sheet_data(sheet_url, sheet_name)
        
        # Return first 10 rows for preview
        preview_data = data[:10] if len(data) > 10 else data
        
        return {
            "success": True,
            "total_rows": len(data),
            "preview_rows": len(preview_data),
            "data": preview_data,
            "columns": list(preview_data[0].keys()) if preview_data else []
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
