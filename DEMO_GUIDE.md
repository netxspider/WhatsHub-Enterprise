# WhatsHub Enterprise - Setup & Demo Guide

## Quick Setup (5 Minutes)

### 1. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create free cluster
4. Get connection string
5. Update in `server/.env`: `MONGODB_URL=mongodb+srv://...`

### 2. Backend Setup

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB URL
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd client
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

### 4. Google Sheets Setup (for Campaign Demo)

1. **Create Service Account:**
   - Go to [console.cloud.google.com](https://console.cloud.google.com/)
   - Create new project → "WhatsHub Demo"
   - Enable "Google Sheets API"
   - Create Service Account → Download JSON key
   - Save as `server/service-account.json`

2. **Prepare Demo Sheet:**
   - Create Google Sheet with columns: `Name | Phone`
   - Add 10-20 sample contacts
   - Share sheet with service account email (from JSON file)
   - Copy sheet URL

## Demo Flow (For Judges/Presentations)

### Act 1: Login & Dashboard (1 min)
1. Register new account
2. Show empty dashboard
3. Explain simulation concept

### Act 2: Campaign Creation (2 min)
1. Click "Campaigns" → "New Campaign"
2. Paste Google Sheet URL
3. Select a template
4. Click "Create"
5. **MAGIC**: Watch contacts import in real-time!

### Act 3: Live Simulation (2 min)
1. Show dashboard charts updating
2. Navigate to campaign → show delivery progress bar
3. Explain: "Status updates happen over 30-60 seconds to simulate real WhatsApp"
4. Refresh page → show read count increasing

### Act 4: Auto-Bot Chat (1 min)
1. Go to Chat
2. Select a contact
3. Type "Hello" → Watch auto-reply!
4. Type "price" → Different reply!
5. Explain keyword detection logic

### Closing: Technical Deep Dive (1 min)
- Show `simulation_engine.py` code
- Explain MongoDB schema
- Show API docs at `/docs`

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh`
- Check port 8000 is free: `lsof -i :8000`

### Frontend errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check API URL in `.env.local`

### Google Sheets import fails
- Verify service account email is in sheet permissions
- Check `service-account.json` is in `/server` directory
- Test sheet access manually in Python:
  ```python
  import gspread
  from google.oauth2.service_account import Credentials
  
  creds = Credentials.from_service_account_file('service-account.json')
  client = gspread.authorize(creds)
  sheet = client.open_by_url('YOUR_SHEET_URL')
  print(sheet.sheet1.get_all_records())
  ```

## Features Checklist

- [x] User Authentication (Register/Login)
- [x] Dashboard with Charts
- [x] Contact Management
- [x] Google Sheets Import
- [x] Campaign Creation
- [x] Message Simulation
- [x] Auto-Bot Replies
- [x] Real-time Status Updates
- [x] WhatsApp Templates
- [x] Responsive Design

## Tech Highlights for Judges

1. **Async Everything**: FastAPI + motor for non-blocking DB ops
2. **Type Safety**: Pydantic models + TypeScript
3. **State Management**: Zustand (lightweight, modern)
4. **Real Integration**: Actual Google Sheets API, not mocked
5. **Realistic UX**: Artificial delays make demo believable
6. **Modern Stack**: Next.js 14 App Router, React Server Components

## Need Help?

Check `README.md` for comprehensive documentation!
