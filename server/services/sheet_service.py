import gspread
from google.oauth2.service_account import Credentials
from config import settings
from typing import List, Dict, Optional
import logging
import os

logger = logging.getLogger(__name__)


class GoogleSheetsService:
    """Service for interacting with Google Sheets API"""
    
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize gspread client with service account"""
        try:
            if not os.path.exists(settings.google_service_account_file):
                logger.warning(f"Google service account file not found: {settings.google_service_account_file}")
                return
            
            scopes = [
                'https://www.googleapis.com/auth/spreadsheets.readonly',
                'https://www.googleapis.com/auth/drive.readonly'
            ]
            
            creds = Credentials.from_service_account_file(
                settings.google_service_account_file,
                scopes=scopes
            )
            
            self.client = gspread.authorize(creds)
            logger.info("Google Sheets client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Google Sheets client: {e}")
    
    def parse_sheet_url(self, url: str) -> Optional[str]:
        """Extract spreadsheet ID from Google Sheets URL"""
        try:
            # URL format: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit...
            if '/spreadsheets/d/' in url:
                spreadsheet_id = url.split('/spreadsheets/d/')[1].split('/')[0]
                return spreadsheet_id
            return None
        except Exception as e:
            logger.error(f"Failed to parse sheet URL: {e}")
            return None
    
    def get_sheet_data(
        self,
        sheet_url: str,
        sheet_name: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """
        Get data from Google Sheet
        
        Args:
            sheet_url: URL of the Google Sheet
            sheet_name: Name of the specific sheet/tab (optional, defaults to first sheet)
        
        Returns:
            List of dictionaries with column headers as keys
        """
        if not self.client:
            raise Exception("Google Sheets client not initialized. Please provide service account credentials.")
        
        try:
            # Parse spreadsheet ID from URL
            spreadsheet_id = self.parse_sheet_url(sheet_url)
            if not spreadsheet_id:
                # If parsing failed, assume the URL itself is the ID
                spreadsheet_id = sheet_url
            
            # Open spreadsheet
            spreadsheet = self.client.open_by_key(spreadsheet_id)
            
            # Get worksheet
            if sheet_name:
                worksheet = spreadsheet.worksheet(sheet_name)
            else:
                worksheet = spreadsheet.get_worksheet(0)  # First sheet
            
            # Get all records as list of dictionaries
            records = worksheet.get_all_records()
            
            logger.info(f"Successfully fetched {len(records)} records from sheet")
            return records
            
        except gspread.exceptions.APIError as e:
            logger.error(f"Google Sheets API error: {e}")
            raise Exception(f"Failed to access Google Sheet. Make sure it's shared with the service account.")
        except Exception as e:
            logger.error(f"Error fetching sheet data: {e}")
            raise Exception(f"Failed to fetch data from Google Sheet: {str(e)}")
    
    def get_sheet_names(self, sheet_url: str) -> List[str]:
        """Get all sheet names from a spreadsheet"""
        if not self.client:
            raise Exception("Google Sheets client not initialized")
        
        try:
            spreadsheet_id = self.parse_sheet_url(sheet_url)
            if not spreadsheet_id:
                spreadsheet_id = sheet_url
            
            spreadsheet = self.client.open_by_key(spreadsheet_id)
            worksheets = spreadsheet.worksheets()
            
            return [ws.title for ws in worksheets]
            
        except Exception as e:
            logger.error(f"Error getting sheet names: {e}")
            raise Exception(f"Failed to get sheet names: {str(e)}")


# Singleton instance
sheets_service = GoogleSheetsService()
