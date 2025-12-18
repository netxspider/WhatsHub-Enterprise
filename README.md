# 🚀 WhatsHub Enterprise

> **Hackathon Prototype** - WhatsApp Marketing Dashboard with Simulated Messaging & Real Google Sheets Integration

A powerful full-stack application that simulates a WhatsApp marketing platform. Built for hackathons and demos, it features a realistic message delivery simulation powered by MongoDB while integrating with real Google Sheets for contact imports.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue)

## ✨ Features

### 📊 Dashboard
- Real-time statistics (Total Contacts, Active Chats, Campaigns)
- Interactive analytics charts (Recharts)
- Recent campaign activity feed
- Message delivery trends visualization

### 👥 Contacts Management
- Create, edit, and delete contacts
- Search and filter by tags
- Import contacts from Google Sheets
- Contact tagging and categorization

### 💬 Live Chat Interface
- WhatsApp Web-style UI
- Send text messages to contacts
- **Auto-Bot Replies**: Keyword-based automated responses
- Real-time message status updates (sent → delivered → read)
- Template message support

### 📢 Campaign Manager (The "Wow" Demo)
- Import contacts from Google Sheets (REAL integration)
- Select WhatsApp templates for bulk messaging
- **Simulated Delivery**: Artificial delays make status updates realistic
- Real-time campaign analytics
- Progress tracking per campaign

### 📝 Templates
- 5 pre-built WhatsApp templates
- Parameter filling for personalization
- Categories: Marketing, Utility, Transactional

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: React Query (@tanstack/react-query)
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with motor (async driver)
- **Validation**: Pydantic
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Passlib with bcrypt
- **Google Sheets**: gspread + google-auth

## 📂 Project Structure

```
WhatsHub-Enterprise/
├── server/                  # FastAPI Backend
│   ├── main.py             # App entry point
│   ├── config.py           # Settings
│   ├── database.py         # MongoDB connection
│   ├── models/             # Pydantic models
│   │   ├── user.py
│   │   ├── contact.py
│   │   ├── message.py
│   │   ├── campaign.py
│   │   └── template.py
│   ├── routers/            # API endpoints
│   │   ├── auth.py
│   │   ├── contacts.py
│   │   ├── chat.py
│   │   ├── campaigns.py
│   │   ├── templates.py
│   │   └── sheets.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── sheet_service.py
│   │   └── simulation_engine.py
│   └── utils/
│       └── security.py
│
├── client/                  # Next.js Frontend
│   ├── app/
│   │   ├── (dashboard)/    # Protected routes
│   │   │   ├── page.tsx    # Dashboard
│   │   │   ├── campaigns/
│   │   │   ├── contacts/
│   │   │   ├── chat/
│   │   │   └── templates/
│   │   └── login/
│   ├── components/
│   │   ├── ui/             # Shadcn components
│   │   └── providers.tsx
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   └── utils.ts
│   ├── store/              # Zustand stores
│   │   ├── auth.ts
│   │   ├── contacts.ts
│   │   └── chat.ts
│   └── types/
│       └── index.ts
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+
- **MongoDB** (local or MongoDB Atlas)
- **Google Cloud** Service Account (for Sheets integration)

### 1. Clone Repository

```bash
git clone <repository-url>
cd WhatsHub-Enterprise
```

### 2. Backend Setup

```bash
cd server

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Edit `.env` file:**
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=whatshub_enterprise
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_SERVICE_ACCOUNT_FILE=service-account.json
CORS_ORIGINS=http://localhost:3000
```

**Setup Google Sheets:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Sheets API
4. Create Service Account credentials
5. Download JSON key file
6. Save as `service-account.json` in `/server` directory

**Start Backend:**
```bash
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

## 📖 Usage Guide

### 1. **Register Account**
- Go to `http://localhost:3000/login`
- Click "Sign up" and create an account
- Login with your credentials

### 2. **Create Contacts**
- Navigate to **Contacts** page
- Click "Add Contact" and enter details
- Or import from Google Sheets

### 3. **Create a Campaign** (The Main Demo!)

1. **Prepare Google Sheet:**
   - Create a Google Sheet with columns: `Name`, `Phone`
   - Example:
     ```
     Name          | Phone
     John Doe      | 9876543210
     Jane Smith    | 9876543211
     ```
   - Share the sheet with your service account email (from service-account.json)

2. **Create Campaign:**
   - Go to **Campaigns** page
   - Click "New Campaign"
   - Enter campaign name
   - Paste Google Sheet URL
   - (Optional) Select a template
   - Click "Create Campaign"

3. **Watch the Magic:**
   - Contacts are imported automatically
   - Messages are "sent" (saved to MongoDB)
   - Status updates from `sent` → `delivered` → `read` over 30-60 seconds
   - Charts on dashboard update in real-time

### 4. **Chat with Auto-Bot**
- Go to **Chat** page
- Select a contact
- Send messages with keywords:
  - "hello", "hi" → Get a greeting
  - "price", "pricing" → Get pricing info
  - "help" → Get assistance
- Bot replies automatically after 3 seconds!

## 🎯 Key Implementation Details

### Simulation Engine

**Message Status Updates** (`services/simulation_engine.py`):
```python
# Gradually update message statuses
sent → delivered (10-15 seconds)
delivered → read (15-20 seconds, ~70% of messages)
```

**Auto-Bot Logic** (`routers/chat.py`):
- Detects keywords in user messages
- Waits 3 seconds
- Inserts "inbound" message from contact
- Creates illusion of real WhatsApp conversation

### Real Google Sheets Integration

Uses `gspread` library with Service Account authentication to:
- Fetch data from shared Google Sheets
- Parse rows into Contact objects
- Create bulk campaigns

### Authentication Flow

1. User registers → Password hashed with bcrypt
2. User logs in → JWT token generated
3. Token stored in localStorage & Zustand
4. axios interceptor adds token to all API requests
5. Backend validates token on protected routes

## 🎨 UI/UX Highlights

- **WhatsApp Green Theme**: #128C7E, #25D366
- **Modern Gradients**: Glassmorphism effects
- **Responsive Design**: Mobile + Desktop optimized
- **Real-time Charts**: Recharts with smooth animations
- **Toast Notifications**: Sonner for user feedback

## 🔐 Security

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ HTTP-only token handling
- ✅ CORS configuration
- ✅ Input validation with Pydantic
- ⚠️ **Note**: This is a prototype. For production, add:
  - Rate limiting
  - HTTPS
  - Token refresh mechanism
  - Environment variable encryption

## 🧪 Testing the Demo

**Pre-Demo Checklist:**
1. ✅ MongoDB running
2. ✅ Backend server running
3. ✅ Frontend dev server running
4. ✅ Test Google Sheet created and shared
5. ✅ Service account credentials configured

**Demo Script:**
1. Show dashboard with empty state
2. Create campaign from Google Sheet
3. Watch contacts import
4. Show messages being "sent"
5. Refresh dashboard → see status updates
6. Open chat → send message → show auto-reply
7. Show campaign analytics updating in real-time

## 🤝 Contributing

This is a hackathon prototype. Feel free to fork and enhance!

## 📄 License

MIT License - feel free to use for your projects!

## 🙌 Credits

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)

## 📞 Support

For issues or questions, please open a GitHub issue.

---

**Made for Hackathons** 🚀 **Simulate. Impress. Win.** 🏆

A modern CRM &amp; Marketing Dashboard for WhatsApp Business. Features real-time chat, bulk campaigns via Google Sheets, contact management, and analytics. Built with Next.js 14, TypeScript, and FastAPI.
